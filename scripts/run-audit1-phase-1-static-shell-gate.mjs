import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { assertPredictaAuditServerReady } from './assert-predicta-audit-server-ready.mjs';
import { assertAuditablePredictaPage } from './lib/predicta-audit-page-readiness.mjs';

const phaseName = 'PREDICTA_AUDIT_1_PHASE_1_STATIC_ASSET_AND_APP_SHELL_RECOVERY';
const baseUrl = process.env.PREDICTA_AUDIT_BASE_URL ?? 'http://127.0.0.1:3009';
const auditRoot = 'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX';
const phaseRoot = join(auditRoot, 'phase-1-static-asset-app-shell-recovery');
const screenshotRoot = join(phaseRoot, 'screenshots');
const chromePath =
  process.env.CHROME_PATH ??
  [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].find(candidate => existsSync(candidate));

const routes = [
  { label: 'landing', path: '/' },
  { label: 'dashboard', path: '/dashboard' },
  { label: 'report', path: '/dashboard/report' },
  { label: 'kp', path: '/dashboard/kp' },
  { label: 'nadi', path: '/dashboard/nadi' },
  { label: 'numerology', path: '/dashboard/numerology' },
  { label: 'signature', path: '/dashboard/signature' },
  { label: 'settings', path: '/dashboard/settings' },
  { label: 'account', path: '/dashboard/account' },
  { label: 'family', path: '/dashboard/family' },
];

const viewports = [
  { height: 900, name: 'desktop', width: 1440 },
  { height: 844, name: 'mobile', width: 390 },
];

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for Phase 1 shell gate.');
}

mkdirSync(screenshotRoot, { recursive: true });

const preflight = await assertPredictaAuditServerReady(baseUrl);
const port = 9700 + Math.floor(Math.random() * 300);
const userDataDir = join(tmpdir(), `predicta-audit1-phase1-chrome-${Date.now()}`);
const chrome = spawn(chromePath, [
  '--headless',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  '--disable-gpu',
  '--disable-extensions',
  '--disable-dev-shm-usage',
  '--hide-scrollbars',
  '--no-sandbox',
  '--no-first-run',
  '--no-default-browser-check',
  'about:blank',
], {
  stdio: ['ignore', 'ignore', 'pipe'],
});

const routeResults = [];
const failures = [];

try {
  await waitForChrome(port);

  for (const viewport of viewports) {
    for (const route of routes) {
      const url = `${baseUrl}${route.path}`;
      const page = await createTarget(port, 'about:blank');
      const cdp = await connectWebSocket(page.webSocketDebuggerUrl);
      const browserErrors = [];

      try {
        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');
        cdp.on('Runtime.exceptionThrown', event => {
          browserErrors.push(event.exceptionDetails?.text ?? 'Browser exception');
        });
        cdp.on('Runtime.consoleAPICalled', event => {
          const text = event.args?.map(arg => arg.value ?? arg.description ?? '').join(' ');
          if (/ChunkLoadError|Application error|TypeError|ReferenceError|SyntaxError/i.test(text || '')) {
            browserErrors.push(text);
          }
        });

        await cdp.send('Emulation.setDeviceMetricsOverride', {
          deviceScaleFactor: 1,
          height: viewport.height,
          mobile: viewport.name === 'mobile',
          width: viewport.width,
        });
        await navigateAndWait(cdp, url);
        await cdp.send('Runtime.evaluate', {
          awaitPromise: true,
          expression:
            'document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 4000))]) : true',
        });

        const readiness = await assertAuditablePredictaPage(cdp, {
          route: route.path,
          url,
        });

        const screenshot = await cdp.send('Page.captureScreenshot', {
          captureBeyondViewport: false,
          format: 'png',
          fromSurface: true,
        });
        const fileName = `${viewport.name}-${route.label}.png`;
        writeFileSync(join(screenshotRoot, fileName), Buffer.from(screenshot.data, 'base64'));

        if (browserErrors.length) {
          failures.push(`${viewport.name} ${route.path}: ${browserErrors.slice(0, 3).join(' | ')}`);
        }

        routeResults.push({
          fileName,
          finalUrl: readiness.finalUrl,
          httpStatus: readiness.httpStatus,
          loadedStyleSheets: readiness.loadedStyleSheets,
          nextScripts: readiness.nextScripts,
          route: route.path,
          title: readiness.title,
          viewport: viewport.name,
        });
      } finally {
        cdp.close();
        await closeTarget(port, page.id).catch(() => undefined);
      }
    }
  }
} finally {
  chrome.kill('SIGTERM');
  await waitForProcessExit(chrome, 2_000).catch(() => undefined);
  rmSync(userDataDir, {
    force: true,
    maxRetries: 5,
    recursive: true,
    retryDelay: 200,
  });
}

const manifest = {
  assetChecks: preflight.assetChecks,
  baseUrl: preflight.baseUrl,
  generatedAt: new Date().toISOString(),
  phase: phaseName,
  routeChecks: preflight.routeChecks,
  routeResults,
  screenshotRoot,
  status: failures.length ? 'failed' : 'green',
};

writeFileSync(join(phaseRoot, 'phase-1-static-shell-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest, null, 2));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName} passed: canonical server, assets, app shell, and screenshots are healthy.`);

async function waitForChrome(debugPort) {
  for (let attempt = 0; attempt < 160; attempt += 1) {
    try {
      await getJson(`http://127.0.0.1:${debugPort}/json/version`);
      return;
    } catch {
      await delay(250);
    }
  }

  throw new Error('Chrome did not expose a debugging endpoint in time.');
}

async function createTarget(debugPort, url) {
  return requestJson({
    method: 'PUT',
    url: `http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(url)}`,
  });
}

async function closeTarget(debugPort, id) {
  return getText(`http://127.0.0.1:${debugPort}/json/close/${id}`);
}

async function navigateAndWait(cdp, url) {
  await cdp.send('Page.navigate', { url });
  await cdp
    .send('Runtime.evaluate', {
      awaitPromise: true,
      expression: `new Promise(resolve => {
        const done = () => document.readyState === 'complete' || document.readyState === 'interactive';
        if (done()) {
          resolve(true);
          return;
        }
        const timer = setInterval(() => {
          if (done()) {
            clearInterval(timer);
            resolve(true);
          }
        }, 100);
        setTimeout(() => {
          clearInterval(timer);
          resolve(false);
        }, 12000);
      })`,
    })
    .catch(() => undefined);
  await delay(700);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForProcessExit(process, timeoutMs) {
  return new Promise(resolve => {
    if (process.exitCode !== null) {
      resolve();
      return;
    }
    const timeout = setTimeout(resolve, timeoutMs);
    process.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    httpGet(url, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => {
        body += chunk;
      });
      response.on('end', () => {
        if ((response.statusCode ?? 500) >= 400) {
          reject(new Error(`HTTP ${response.statusCode}: ${body}`));
          return;
        }
        resolve(JSON.parse(body));
      });
    }).on('error', reject);
  });
}

function getText(url) {
  return new Promise((resolve, reject) => {
    httpGet(url, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => {
        body += chunk;
      });
      response.on('end', () => {
        if ((response.statusCode ?? 500) >= 400) {
          reject(new Error(`HTTP ${response.statusCode}: ${body}`));
          return;
        }
        resolve(body);
      });
    }).on('error', reject);
  });
}

function requestJson({ method, url }) {
  const target = new URL(url);
  return new Promise((resolve, reject) => {
    const request = httpRequest(
      {
        hostname: target.hostname,
        method,
        path: `${target.pathname}${target.search}`,
        port: target.port,
      },
      response => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', chunk => {
          body += chunk;
        });
        response.on('end', () => {
          if ((response.statusCode ?? 500) >= 400) {
            reject(new Error(`HTTP ${response.statusCode}: ${body}`));
            return;
          }
          resolve(JSON.parse(body));
        });
      },
    );
    request.on('error', reject);
    request.end();
  });
}

async function connectWebSocket(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let nextId = 1;
  const pending = new Map();
  const listeners = new Map();

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('WebSocket connection timed out.'));
    }, 10_000);
    socket.addEventListener(
      'open',
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
    socket.addEventListener(
      'error',
      () => {
        clearTimeout(timeout);
        reject(new Error('WebSocket connection failed.'));
      },
      { once: true },
    );
  });

  socket.addEventListener('message', event => {
    const message = JSON.parse(String(event.data));
    if (message.id && pending.has(message.id)) {
      const { reject, resolve, timeout } = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(timeout);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result ?? {});
      return;
    }

    if (message.method && listeners.has(message.method)) {
      for (const listener of listeners.get(message.method)) {
        listener(message.params ?? {});
      }
    }
  });

  socket.addEventListener('close', () => {
    const error = new Error('WebSocket closed before Chrome replied.');
    for (const { reject, timeout } of pending.values()) {
      clearTimeout(timeout);
      reject(error);
    }
    pending.clear();
  });

  return {
    close() {
      socket.close();
    },
    on(method, listener) {
      const current = listeners.get(method) ?? [];
      current.push(listener);
      listeners.set(method, current);
    },
    send(method, params = {}) {
      const id = nextId;
      nextId += 1;
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`Timed out waiting for ${method}`));
        }, 45_000);
        pending.set(id, { reject, resolve, timeout });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
  };
}
