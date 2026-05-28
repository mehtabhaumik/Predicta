import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { assertAuditablePredictaPage } from './lib/predicta-audit-page-readiness.mjs';

const phaseName = 'PREDICTA_AUDIT_1_PHASE_3_SAFETY_ACCOUNT_AND_TRUST_SURFACE_REPAIR';
const baseUrl = process.env.PREDICTA_AUDIT_BASE_URL ?? 'http://127.0.0.1:3009';
const auditRoot = 'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX';
const phaseRoot = join(auditRoot, 'phase-3-safety-account-trust-surface-repair');
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
  { label: 'account', path: '/dashboard/account', trustSurface: 'account' },
  { label: 'settings', path: '/dashboard/settings', trustSurface: 'settings' },
  { label: 'safety', path: '/safety', trustSurface: 'safety' },
  { label: 'legal', path: '/legal', trustSurface: 'public-trust' },
  { label: 'feedback', path: '/feedback', trustSurface: 'public-trust' },
  { label: 'pricing', path: '/pricing', trustSurface: 'public-trust' },
  { label: 'checkout', path: '/checkout', trustSurface: 'public-trust' },
];

const viewports = [
  { height: 1100, name: 'desktop', width: 1440 },
  { height: 1112, name: 'tablet', width: 834 },
  { height: 844, name: 'mobile', width: 390 },
];

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for Phase 3 trust-surface gate.');
}

mkdirSync(screenshotRoot, { recursive: true });

const port = 9900 + Math.floor(Math.random() * 300);
const userDataDir = join(tmpdir(), `predicta-audit1-phase3-chrome-${Date.now()}`);
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

const checks = [];
const failures = [];

try {
  await waitForChrome(port);

  for (const viewport of viewports) {
    for (const route of routes) {
      const url = `${baseUrl}${route.path}`;
      const page = await createTarget(port, 'about:blank');
      const cdp = await connectWebSocket(page.webSocketDebuggerUrl);

      try {
        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');
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
        const metrics = await evaluateTrustSurface(cdp, route);
        const screenshot = await cdp.send('Page.captureScreenshot', {
          captureBeyondViewport: false,
          format: 'png',
          fromSurface: true,
        });
        const fileName = `${viewport.name}-${route.label}.png`;
        writeFileSync(join(screenshotRoot, fileName), Buffer.from(screenshot.data, 'base64'));

        checks.push({
          fileName,
          finalPath: new URL(readiness.finalUrl).pathname,
          finalUrl: readiness.finalUrl,
          route: route.path,
          trustSurface: route.trustSurface,
          viewport: viewport.name,
          viewportWidth: viewport.width,
          ...metrics.summary,
        });

        if (route.path === '/dashboard/account' && new URL(readiness.finalUrl).pathname !== '/dashboard/account') {
          failures.push(`${viewport.name} ${route.path}: account route redirected to ${readiness.finalUrl}.`);
        }

        if (metrics.summary.horizontalOverflow > 0) {
          failures.push(`${viewport.name} ${route.path}: page is ${metrics.summary.horizontalOverflow}px wider than viewport.`);
        }

        if (route.trustSurface === 'account' && !metrics.summary.hasAccountState) {
          failures.push(`${viewport.name} ${route.path}: missing branded signed-in/signed-out account state.`);
        }

        if (route.trustSurface === 'settings' && !metrics.summary.hasSettingsEmptyState) {
          failures.push(`${viewport.name} ${route.path}: missing settings/account empty or continuity state.`);
        }

        if (route.trustSurface === 'safety') {
          if (!metrics.summary.hasFounderPromise) {
            failures.push(`${viewport.name} ${route.path}: missing founder promise trust section.`);
          }
          if (metrics.summary.founderTextClipped) {
            failures.push(`${viewport.name} ${route.path}: founder text is clipped or truncated.`);
          }
        }

        for (const item of metrics.wideElements) {
          failures.push(`${viewport.name} ${route.path}: ${item.selector} extends beyond viewport (${item.left}..${item.right}).`);
        }

        for (const item of metrics.clippedText) {
          failures.push(
            `${viewport.name} ${route.path}: ${item.selector} clips text "${item.text}" (${item.scrollWidth} > ${item.clientWidth}).`,
          );
        }
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
  baseUrl,
  checks,
  generatedAt: new Date().toISOString(),
  phase: phaseName,
  screenshotRoot,
  status: failures.length ? 'failed' : 'green',
};

writeFileSync(join(phaseRoot, 'phase-3-trust-surfaces-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest, null, 2));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName} passed: trust surfaces, account state, and safety clipping are green.`);

async function evaluateTrustSurface(cdp, route) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const route = ${JSON.stringify(route)};
      const viewportWidth = document.documentElement.clientWidth;
      const body = document.body;
      const root = document.documentElement;
      const clippedText = [];
      const wideElements = [];
      const ignoredTags = new Set(['SCRIPT', 'STYLE', 'META', 'LINK', 'TITLE', 'SVG', 'PATH']);
      const visibleText = (document.body?.innerText || '').replace(/\\s+/g, ' ').trim();

      function selectorFor(element) {
        if (element.id) return '#' + element.id;
        const classes = [...element.classList].slice(0, 4).join('.');
        return element.tagName.toLowerCase() + (classes ? '.' + classes : '');
      }

      function isIntentionalScrollRegion(style) {
        return ['auto', 'scroll'].includes(style.overflowX) ||
          ['auto', 'scroll'].includes(style.overflowY) ||
          ['auto', 'scroll'].includes(style.overflow);
      }

      function isVisible(element) {
        const style = window.getComputedStyle(element);
        if (
          ignoredTags.has(element.tagName) ||
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          Number(style.opacity) === 0 ||
          element.getAttribute('aria-hidden') === 'true' ||
          element.classList.contains('sr-only') ||
          Boolean(element.closest('.sr-only'))
        ) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }

      function directText(element) {
        return [...element.childNodes]
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent)
          .join(' ')
          .replace(/\\s+/g, ' ')
          .trim();
      }

      function isLeafTextSurface(element) {
        if (['INPUT', 'TEXTAREA', 'SELECT', 'CANVAS'].includes(element.tagName)) return false;
        return element.children.length === 0 || directText(element).length > 0;
      }

      for (const element of document.querySelectorAll('body *')) {
        if (!isVisible(element)) continue;
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const selector = selectorFor(element);
        const offscreenDrawer =
          style.position === 'fixed' &&
          (rect.left >= viewportWidth || rect.right <= 0) &&
          style.transform !== 'none';

        if (!offscreenDrawer && rect.right > viewportWidth + 3 && !isIntentionalScrollRegion(style)) {
          wideElements.push({
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            selector,
          });
        }

        if (!isLeafTextSurface(element)) continue;
        const text = (element.textContent || '').replace(/\\s+/g, ' ').trim();
        if (text.length < 6) continue;
        if (style.textOverflow === 'ellipsis') continue;
        if (isIntentionalScrollRegion(style)) continue;

        const scrollWidth = Math.ceil(element.scrollWidth);
        const clientWidth = Math.ceil(element.clientWidth);
        if (scrollWidth > clientWidth + 4) {
          clippedText.push({
            clientWidth,
            scrollWidth,
            selector,
            text: text.slice(0, 80),
          });
        }
      }

      const founderNodes = [...document.querySelectorAll('body *')]
        .filter(element => isVisible(element) && /Bhaumik Mehta|FOUNDER PROMISE|Founder promise/i.test(element.textContent || ''));
      const founderTextClipped = founderNodes.some(element => {
        const style = window.getComputedStyle(element);
        if (style.textOverflow === 'ellipsis') return true;
        return Math.ceil(element.scrollWidth) > Math.ceil(element.clientWidth) + 4;
      });

      return {
        clippedText: clippedText.slice(0, 12),
        summary: {
          founderTextClipped,
          hasAccountState: /current account|guest mode|account ready|not signed in|sign in|signed in/i.test(visibleText),
          hasFounderPromise: /founder promise|Bhaumik Mehta/i.test(visibleText),
          hasSettingsEmptyState: /guest mode|not signed in|saved|account continuity|language/i.test(visibleText),
          horizontalOverflow: Math.max(
            0,
            Math.ceil(Math.max(root.scrollWidth, body.scrollWidth) - viewportWidth),
          ),
        },
        wideElements: wideElements.slice(0, 12),
      };
    })()`,
    returnByValue: true,
  });

  return response.result.value;
}

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
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const request = httpRequest(
      {
        hostname: parsed.hostname,
        method,
        path: `${parsed.pathname}${parsed.search}`,
        port: parsed.port,
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

function connectWebSocket(webSocketDebuggerUrl) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketDebuggerUrl);
    let id = 0;
    const pending = new Map();
    const listeners = new Map();

    socket.onopen = () => {
      resolve({
        close: () => socket.close(),
        on(method, handler) {
          if (!listeners.has(method)) {
            listeners.set(method, new Set());
          }
          listeners.get(method).add(handler);
        },
        send(method, params = {}) {
          const messageId = ++id;
          socket.send(JSON.stringify({ id: messageId, method, params }));
          return new Promise((resolveMessage, rejectMessage) => {
            pending.set(messageId, { reject: rejectMessage, resolve: resolveMessage });
          });
        },
      });
    };

    socket.onerror = event => reject(event.error ?? new Error('WebSocket failed'));
    socket.onmessage = event => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        const entry = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) {
          entry.reject(new Error(message.error.message));
        } else {
          entry.resolve(message.result ?? {});
        }
        return;
      }

      if (message.method && listeners.has(message.method)) {
        for (const listener of listeners.get(message.method)) {
          listener(message.params ?? {});
        }
      }
    };
  });
}
