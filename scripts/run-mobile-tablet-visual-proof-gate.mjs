import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const baseUrl = process.env.PREDICTA_VISUAL_BASE_URL ?? 'http://127.0.0.1:3009';
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
  '/',
  '/dashboard',
  '/dashboard/kundli',
  '/dashboard/charts',
  '/dashboard/report',
  '/dashboard/saved-kundlis',
  '/dashboard/chat',
  '/dashboard/kp',
  '/dashboard/nadi',
  '/dashboard/numerology',
  '/dashboard/signature',
];

const viewports = [
  { height: 1100, name: 'desktop', width: 1440 },
  { height: 1112, name: 'tablet', width: 834 },
  { height: 844, name: 'mobile', width: 390 },
];

const outputDir =
  process.env.PREDICTA_VISUAL_OUTPUT_DIR ??
  join(tmpdir(), `predicta-visual-proof-${Date.now()}`);

if (!chromePath) {
  console.error('Chrome or Chromium is required for the visual proof gate.');
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });

const port = 9300 + Math.floor(Math.random() * 400);
const userDataDir = join(tmpdir(), `predicta-chrome-${Date.now()}`);
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

const failures = [];
const summary = [];

try {
  await waitForChrome(port);

    for (const viewport of viewports) {
    for (const route of routes) {
      // Open a blank target and perform one controlled navigation per route.
      // Double-loading the same URL through /json/new and Page.navigate can
      // create false visual-gate failures on otherwise healthy pages.
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
        await navigateAndWait(cdp, `${baseUrl}${route}`);
        await cdp.send('Runtime.evaluate', {
          expression:
            'document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 4000))]) : true',
          awaitPromise: true,
        });

        const metrics = await evaluateMetrics(cdp);
        const screenshot = await cdp.send('Page.captureScreenshot', {
          captureBeyondViewport: false,
          format: 'png',
          fromSurface: true,
        });
        const fileName = `${viewport.name}-${routeToFileName(route)}.png`;
        writeFileSync(join(outputDir, fileName), Buffer.from(screenshot.data, 'base64'));

        const result = {
          clippedText: metrics.clippedText.length,
          fileName,
          horizontalOverflow: metrics.horizontalOverflow,
          route,
          viewport: viewport.name,
          viewportWidth: viewport.width,
          wideElements: metrics.wideElements.length,
        };
        summary.push(result);

        if (metrics.horizontalOverflow > 4) {
          failures.push(
            `${viewport.name} ${route}: page is ${metrics.horizontalOverflow}px wider than viewport.`,
          );
        }

        for (const item of metrics.wideElements.slice(0, 5)) {
          failures.push(
            `${viewport.name} ${route}: ${item.selector} extends beyond viewport (${item.left}..${item.right}).`,
          );
        }

        for (const item of metrics.clippedText.slice(0, 5)) {
          failures.push(
            `${viewport.name} ${route}: ${item.selector} appears clipped (${item.text}).`,
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

console.log(`Visual proof screenshots: ${outputDir}`);
console.table(summary);

if (failures.length) {
  console.error('Mobile/tablet visual proof gate failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Mobile/tablet visual proof gate passed: ${summary.length} route and viewport checks.`,
);
process.exit(0);

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

async function evaluateMetrics(cdp) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const viewportWidth = document.documentElement.clientWidth;
      const body = document.body;
      const root = document.documentElement;
      const clippedText = [];
      const wideElements = [];
      const ignoredTags = new Set(['SCRIPT', 'STYLE', 'META', 'LINK', 'TITLE']);

      function selectorFor(element) {
        if (element.id) return '#' + element.id;
        const classes = [...element.classList].slice(0, 3).join('.');
        return element.tagName.toLowerCase() + (classes ? '.' + classes : '');
      }

      function isScreenReaderOnly(element) {
        return element.classList.contains('sr-only') || element.closest('.sr-only');
      }

      function isVisuallyHidden(style) {
        return style.clipPath !== 'none' || style.clip !== 'auto';
      }

      function isIntentionalScrollRegion(style) {
        return ['auto', 'scroll'].includes(style.overflowX) ||
          ['auto', 'scroll'].includes(style.overflowY) ||
          ['auto', 'scroll'].includes(style.overflow);
      }

      for (const element of document.querySelectorAll('body *')) {
        if (ignoredTags.has(element.tagName)) continue;
        const style = window.getComputedStyle(element);
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          Number(style.opacity) === 0 ||
          element.getAttribute('aria-hidden') === 'true'
        ) {
          continue;
        }
        if (isScreenReaderOnly(element) || isVisuallyHidden(style)) continue;

        const rect = element.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;

        const position = style.position;
        const transform = style.transform;
        const offscreenDrawer =
          position === 'fixed' &&
          transform &&
          transform !== 'none' &&
          (rect.left >= viewportWidth || rect.right <= 0);
        if (offscreenDrawer) continue;

        if (rect.right > viewportWidth + 2 || rect.left < -2) {
          wideElements.push({
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            selector: selectorFor(element),
          });
        }

        const text = (element.textContent || '').replace(/\\s+/g, ' ').trim();
        const canClip =
          text.length > 8 &&
          !['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'SUMMARY'].includes(element.tagName);
        const hasScrollableTextOverflow =
          canClip &&
          !isIntentionalScrollRegion(style) &&
          style.overflow !== 'visible' &&
          (element.scrollWidth > element.clientWidth + 2 ||
            element.scrollHeight > element.clientHeight + 2);

        if (hasScrollableTextOverflow) {
          clippedText.push({
            selector: selectorFor(element),
            text: text.slice(0, 80),
          });
        }
      }

      return {
        clippedText: clippedText.slice(0, 20),
        horizontalOverflow: Math.max(
          0,
          Math.ceil(Math.max(root.scrollWidth, body.scrollWidth) - viewportWidth),
        ),
        wideElements: wideElements.slice(0, 20),
      };
    })()`,
    returnByValue: true,
  });

  return response.result.value;
}

function routeToFileName(route) {
  return route === '/'
    ? 'landing'
    : route.replace(/^\//, '').replace(/\//g, '-');
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
  const waiters = new Map();

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

    if (message.method && waiters.has(message.method)) {
      const { resolve, timeout } = waiters.get(message.method);
      waiters.delete(message.method);
      clearTimeout(timeout);
      resolve(message.params ?? {});
    }
  });

  socket.addEventListener('close', () => {
    const error = new Error('WebSocket closed before Chrome replied.');
    for (const { reject, timeout } of pending.values()) {
      clearTimeout(timeout);
      reject(error);
    }
    pending.clear();
    for (const { reject, timeout } of waiters.values()) {
      clearTimeout(timeout);
      reject(error);
    }
    waiters.clear();
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
    waitFor(method, timeoutMs = 20_000) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          waiters.delete(method);
          reject(new Error(`Timed out waiting for ${method}`));
        }, timeoutMs);
        waiters.set(method, { reject, resolve, timeout });
      });
    },
  };
}
