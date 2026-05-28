import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { assertAuditablePredictaPage } from './lib/predicta-audit-page-readiness.mjs';

const baseUrl = process.env.PREDICTA_PERSONAL_SPACE_BASE_URL ?? 'http://127.0.0.1:3009';
const artifactRoot =
  'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/personal-space-audit';
const manifestPath = path.join(artifactRoot, 'ui-personal-space-manifest.json');
const minSiblingGap = 8;
const minBoundaryGap = 6;
const routes = [
  '/',
  '/checkout',
  '/feedback',
  '/dashboard',
  '/dashboard/kundli',
  '/dashboard/charts',
  '/dashboard/report',
  '/dashboard/kp',
  '/dashboard/nadi',
  '/dashboard/numerology',
  '/dashboard/signature',
  '/dashboard/account',
  '/dashboard/settings',
];
const viewports = [
  { height: 1000, name: 'desktop', width: 1440 },
  { height: 1112, name: 'tablet', width: 834 },
  { height: 844, name: 'mobile', width: 390 },
  { height: 740, name: 'narrow-mobile', width: 360 },
];

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

if (!chromePath) {
  console.error('Chrome or Chromium is required for the UI personal-space audit.');
  process.exit(1);
}

const failures = [];
const checks = [];
const port = 9700 + Math.floor(Math.random() * 250);
const userDataDir = path.join(tmpdir(), `predicta-ui-personal-space-${Date.now()}`);
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
]);

try {
  await waitForChrome(port);

  for (const viewport of viewports) {
    for (const route of routes) {
      const target = await createTarget(port, 'about:blank');
      const cdp = await connectWebSocket(target.webSocketDebuggerUrl);
      try {
        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');
        await cdp.send('Emulation.setDeviceMetricsOverride', {
          deviceScaleFactor: 1,
          height: viewport.height,
          mobile: viewport.name.includes('mobile'),
          width: viewport.width,
        });
        await navigateAndWait(cdp, `${baseUrl}${route}`);
        await cdp.send('Runtime.evaluate', {
          awaitPromise: true,
          expression:
            'document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 4000))]) : true',
        });
        await assertAuditablePredictaPage(cdp, { route, url: `${baseUrl}${route}` });

        const result = await evaluatePersonalSpace(cdp);
        checks.push({
          boundaryIssues: result.boundaryIssues.length,
          route,
          siblingIssues: result.siblingIssues.length,
          viewport: viewport.name,
          viewportWidth: viewport.width,
        });

        for (const issue of result.siblingIssues.slice(0, 10)) {
          failures.push(
            `${viewport.name} ${route}: ${issue.parent} has ${issue.gap}px ${issue.axis} gap between ${issue.first} and ${issue.second}.`,
          );
        }
        for (const issue of result.boundaryIssues.slice(0, 10)) {
          failures.push(
            `${viewport.name} ${route}: ${issue.child} is ${issue.side} ${issue.gap}px from ${issue.parent} boundary.`,
          );
        }
      } finally {
        cdp.close();
        await closeTarget(port, target.id).catch(() => undefined);
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

mkdirSync(artifactRoot, { recursive: true });
writeFileSync(
  manifestPath,
  `${JSON.stringify(
    {
      baseUrl,
      generatedAt: new Date().toISOString(),
      minBoundaryGap,
      minSiblingGap,
      routeChecks: checks,
      sampleFailures: failures.slice(0, 40),
      status: failures.length ? 'red' : 'green',
      totalBoundaryIssues: checks.reduce((sum, check) => sum + check.boundaryIssues, 0),
      totalChecks: checks.length,
      totalSiblingIssues: checks.reduce((sum, check) => sum + check.siblingIssues, 0),
    },
    null,
    2,
  )}\n`,
);

console.table(checks);

if (failures.length) {
  console.error('UI personal-space audit failed:');
  for (const failure of failures.slice(0, 80)) {
    console.error(`- ${failure}`);
  }
  console.error(`Manifest: ${manifestPath}`);
  process.exit(1);
}

console.log(
  `UI personal-space audit passed: ${checks.length} route and viewport checks. Manifest: ${manifestPath}`,
);
process.exit(0);

async function evaluatePersonalSpace(cdp) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const minSiblingGap = ${minSiblingGap};
      const minBoundaryGap = ${minBoundaryGap};
      const siblingIssues = [];
      const boundaryIssues = [];
      const controlSelector = [
        'button',
        'a.button',
        '[role="button"]',
        'input',
        'select',
        'textarea',
        'summary',
        '.predicta-button',
        '.predicta-pill',
        '.predicta-badge',
        '.language-options button',
        '.chart-language-selector button',
        '.report-language-options button',
        '.report-school-subnav button',
        '.dossier-mode-switch button',
        '.planet-chip-row > *',
        '.drilldown-actions > *',
        '.gochar-range-toggle button',
        '.gochar-radar-legend button',
        '.kp-event-row button',
        '.kp-question-mode-row button',
        '.kp-question-preset-grid button',
        '.auth-mode-tabs button',
        '.toggle-control'
      ].join(',');
      const boundaryParentSelector = [
        '.language-options',
        '.chart-language-selector > div',
        '.dossier-mode-switch',
        '.report-language-options',
        '.planet-chip-row',
        '.drilldown-actions',
        '.auth-mode-tabs',
        '.gochar-range-toggle',
        '.gochar-radar-legend',
        '.kp-question-mode-row'
      ].join(',');

      function selectorFor(element) {
        if (element.id) return '#' + element.id;
        const classes = [...element.classList].filter(Boolean).slice(0, 3).join('.');
        return element.tagName.toLowerCase() + (classes ? '.' + classes : '');
      }

      function isVisible(element) {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity) > 0 &&
          element.getAttribute('aria-hidden') !== 'true' &&
          rect.width > 0 &&
          rect.height > 0;
      }

      function boxFor(element) {
        const rect = element.getBoundingClientRect();
        return {
          bottom: Math.round(rect.bottom),
          height: Math.round(rect.height),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          width: Math.round(rect.width),
        };
      }

      function hasVisualBoundary(element) {
        const style = window.getComputedStyle(element);
        const backgroundVisible =
          style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
          style.backgroundColor !== 'transparent';
        const borderVisible = ['Top', 'Right', 'Bottom', 'Left'].some(side => {
          const width = Number.parseFloat(style['border' + side + 'Width'] || '0');
          return width > 0 && style['border' + side + 'Style'] !== 'none';
        });
        return backgroundVisible || borderVisible;
      }

      function overlap(aStart, aEnd, bStart, bEnd) {
        return Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
      }

      const controlsByParent = new Map();
      for (const element of document.querySelectorAll(controlSelector)) {
        if (!isVisible(element)) continue;
        const parent = element.parentElement;
        if (!parent || !isVisible(parent)) continue;
        if (!controlsByParent.has(parent)) controlsByParent.set(parent, []);
        controlsByParent.get(parent).push(element);
      }

      for (const [parent, controls] of controlsByParent.entries()) {
        if (controls.length < 2) continue;
        const parentSelector = selectorFor(parent);
        const boxes = controls.map(element => ({ box: boxFor(element), selector: selectorFor(element) }));

        for (let i = 0; i < boxes.length; i += 1) {
          for (let j = i + 1; j < boxes.length; j += 1) {
            const first = boxes[i];
            const second = boxes[j];
            const verticalOverlap = overlap(first.box.top, first.box.bottom, second.box.top, second.box.bottom);
            const horizontalOverlap = overlap(first.box.left, first.box.right, second.box.left, second.box.right);
            const horizontalGap = Math.max(second.box.left - first.box.right, first.box.left - second.box.right);
            const verticalGap = Math.max(second.box.top - first.box.bottom, first.box.top - second.box.bottom);

            if (verticalOverlap > 6 && horizontalGap >= 0 && horizontalGap < minSiblingGap) {
              siblingIssues.push({
                axis: 'horizontal',
                first: first.selector,
                gap: horizontalGap,
                parent: parentSelector,
                second: second.selector,
              });
            }

            if (horizontalOverlap > 6 && verticalGap >= 0 && verticalGap < minSiblingGap) {
              siblingIssues.push({
                axis: 'vertical',
                first: first.selector,
                gap: verticalGap,
                parent: parentSelector,
                second: second.selector,
              });
            }
          }
        }
      }

      for (const parent of document.querySelectorAll(boundaryParentSelector)) {
        if (!isVisible(parent)) continue;
        if (!hasVisualBoundary(parent)) continue;
        const parentBox = boxFor(parent);
        const children = [...parent.children].filter(isVisible);
        for (const child of children) {
          const childBox = boxFor(child);
          const isFullWidth = childBox.width >= parentBox.width - (minBoundaryGap * 2);
          const gaps = [
            { gap: childBox.left - parentBox.left, side: 'left' },
            { gap: parentBox.right - childBox.right, side: 'right' },
            { gap: childBox.top - parentBox.top, side: 'top' },
            { gap: parentBox.bottom - childBox.bottom, side: 'bottom' },
          ];
          for (const item of gaps) {
            if (isFullWidth && (item.side === 'left' || item.side === 'right')) continue;
            if (item.gap >= 0 && item.gap < minBoundaryGap) {
              boundaryIssues.push({
                child: selectorFor(child),
                gap: item.gap,
                parent: selectorFor(parent),
                side: item.side,
              });
            }
          }
        }
      }

      return {
        boundaryIssues: boundaryIssues.slice(0, 80),
        siblingIssues: siblingIssues.slice(0, 80),
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
  await delay(650);
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
