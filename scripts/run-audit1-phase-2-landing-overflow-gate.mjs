import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { assertAuditablePredictaPage } from './lib/predicta-audit-page-readiness.mjs';

const phaseName = 'PREDICTA_AUDIT_1_PHASE_2_LANDING_MOBILE_HERO_AND_CHART_OVERFLOW_LOCK';
const baseUrl = process.env.PREDICTA_AUDIT_BASE_URL ?? 'http://127.0.0.1:3009';
const artifactSet = process.env.PREDICTA_AUDIT_PHASE2_ARTIFACT_SET ?? 'after';
const auditRoot = 'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX';
const phaseRoot = join(auditRoot, 'phase-2-landing-mobile-hero-overflow-lock');
const screenshotRoot = join(phaseRoot, artifactSet, 'screenshots');
const cssPath = 'apps/web/app/globals.css';
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

const viewports = [
  { height: 812, name: 'mobile-320', width: 320 },
  { height: 812, name: 'mobile-360', width: 360 },
  { height: 844, name: 'mobile-390', width: 390 },
  { height: 932, name: 'mobile-430', width: 430 },
  { height: 1024, name: 'tablet-768', width: 768 },
  { height: 1112, name: 'tablet-834', width: 834 },
  { height: 900, name: 'laptop-1024', width: 1024 },
  { height: 1100, name: 'desktop-1440', width: 1440 },
];

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for Phase 2 landing overflow gate.');
}

mkdirSync(screenshotRoot, { recursive: true });
assertNoHtmlBodyOverflowHide();

const port = 9800 + Math.floor(Math.random() * 300);
const userDataDir = join(tmpdir(), `predicta-audit1-phase2-chrome-${Date.now()}`);
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
    const url = `${baseUrl}/`;
    const page = await createTarget(port, 'about:blank');
    const cdp = await connectWebSocket(page.webSocketDebuggerUrl);

    try {
      await cdp.send('Page.enable');
      await cdp.send('Runtime.enable');
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        deviceScaleFactor: 1,
        height: viewport.height,
        mobile: viewport.width <= 430,
        width: viewport.width,
      });
      await navigateAndWait(cdp, url);
      await cdp.send('Runtime.evaluate', {
        awaitPromise: true,
        expression:
          'document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 4000))]) : true',
      });

      await assertAuditablePredictaPage(cdp, {
        route: '/',
        url,
      });

      const metrics = await evaluateLanding(cdp);
      const screenshot = await cdp.send('Page.captureScreenshot', {
        captureBeyondViewport: false,
        format: 'png',
        fromSurface: true,
      });
      const fileName = `${viewport.name}-landing.png`;
      writeFileSync(join(screenshotRoot, fileName), Buffer.from(screenshot.data, 'base64'));

      checks.push({
        ...metrics.summary,
        fileName,
        viewport: viewport.name,
        viewportHeight: viewport.height,
        viewportWidth: viewport.width,
      });

      if (metrics.summary.horizontalOverflow > 0) {
        failures.push(
          `${viewport.name}: landing page is ${metrics.summary.horizontalOverflow}px wider than viewport.`,
        );
      }

      if (!metrics.summary.ctaAboveFold) {
        failures.push(`${viewport.name}: landing primary CTA is not visible and usable above the fold.`);
      }

      if (metrics.summary.blockingOverlayVisible) {
        failures.push(`${viewport.name}: intro/dialog overlay is covering the landing first impression.`);
      }

      if (viewport.width <= 430 && !metrics.summary.mobileDensityMode) {
        failures.push(`${viewport.name}: hero chart mobile density mode is not active.`);
      }

      for (const item of metrics.viewportSpills) {
        failures.push(
          `${viewport.name}: ${item.selector} leaks outside viewport (${item.left}..${item.right}).`,
        );
      }

      for (const item of metrics.boardSpills) {
        failures.push(
          `${viewport.name}: ${item.selector} leaks outside hero chart board (${item.left}..${item.right}).`,
        );
      }
    } finally {
      cdp.close();
      await closeTarget(port, page.id).catch(() => undefined);
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
  artifactSet,
  baseUrl,
  checks,
  generatedAt: new Date().toISOString(),
  phase: phaseName,
  screenshotRoot,
  status: failures.length ? 'failed' : 'green',
};

writeFileSync(
  join(phaseRoot, `phase-2-landing-overflow-${artifactSet}-manifest.json`),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(JSON.stringify(manifest, null, 2));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName} passed: landing hero overflow and chart containment are green.`);

function assertNoHtmlBodyOverflowHide() {
  const css = readFileSync(cssPath, 'utf8');
  const forbidden = /(?:^|\n)\s*(?:html|body|html\s*,\s*body)\s*\{[^}]*overflow-x\s*:\s*hidden/ims;
  if (forbidden.test(css)) {
    throw new Error('Phase 2 cannot use html/body overflow-x:hidden as the landing overflow fix.');
  }
}

async function evaluateLanding(cdp) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const viewportWidth = document.documentElement.clientWidth;
      const body = document.body;
      const root = document.documentElement;
      const board = document.querySelector('.hero-kundli-board[data-chart-presentation="landing"]');
      const cta = document.querySelector('.hero-actions a, .hero-actions button');
      const viewportSpills = [];
      const boardSpills = [];
      const targetSelectors = [
        '.hero-section',
        '.web-header',
        '.brand-lockup',
        '.brand-lockup strong',
        '.brand-lockup small',
        '.mobile-menu',
        '.mobile-menu-button',
        '.hero-copy',
        '.hero-actions',
        '.hero-visual.kundli-hero-visual',
        '.hero-kundli-board',
        '.hero-chart-label',
        '.hero-sign-meta',
        '.hero-sign-number',
        '.hero-sign-symbol',
        '.hero-chart-planet-stack',
        '.hero-chart-planet-stack .planet-glyph',
        '.hero-chart-planet-stack .planet-glyph-mark',
        '.hero-chart-planet-stack .planet-glyph-copy',
      ];

      function selectorFor(element) {
        if (element.id) return '#' + element.id;
        const classes = [...element.classList].slice(0, 4).join('.');
        return element.tagName.toLowerCase() + (classes ? '.' + classes : '');
      }

      function isVisible(element) {
        const style = window.getComputedStyle(element);
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          Number(style.opacity) === 0 ||
          element.getAttribute('aria-hidden') === 'true'
        ) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }

      for (const selector of targetSelectors) {
        for (const element of document.querySelectorAll(selector)) {
          if (!isVisible(element)) continue;
          const rect = element.getBoundingClientRect();
          if (rect.left < -1 || rect.right > viewportWidth + 1) {
            viewportSpills.push({
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              selector: selectorFor(element),
            });
          }
        }
      }

      const boardRect = board?.getBoundingClientRect();
      if (boardRect) {
        const containedSelectors = [
          '.hero-chart-label',
          '.hero-sign-meta',
          '.hero-sign-number',
          '.hero-sign-symbol',
          '.hero-chart-planet-stack',
          '.hero-chart-planet-stack .planet-glyph',
          '.hero-chart-planet-stack .planet-glyph-mark',
          '.hero-chart-planet-stack .planet-glyph-copy',
        ];

        for (const selector of containedSelectors) {
          for (const element of board.querySelectorAll(selector)) {
            if (!isVisible(element)) continue;
            const rect = element.getBoundingClientRect();
            if (
              rect.left < boardRect.left - 1 ||
              rect.right > boardRect.right + 1 ||
              rect.top < boardRect.top - 1 ||
              rect.bottom > boardRect.bottom + 1
            ) {
              boardSpills.push({
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                selector: selectorFor(element),
              });
            }
          }
        }
      }

      const signNames = [...document.querySelectorAll('.hero-kundli-board .hero-sign-name')];
      const planetDegrees = [...document.querySelectorAll('.hero-kundli-board .planet-glyph-copy em')];
      const mobileDensityMode =
        board?.getAttribute('data-chart-presentation') === 'landing' &&
        signNames.every(element => window.getComputedStyle(element).display === 'none') &&
        planetDegrees.every(element => window.getComputedStyle(element).display === 'none');
      const ctaRect = cta?.getBoundingClientRect();
      const ctaCenterX = ctaRect ? ctaRect.left + ctaRect.width / 2 : 0;
      const ctaCenterY = ctaRect ? ctaRect.top + ctaRect.height / 2 : 0;
      const ctaHit = ctaRect ? document.elementFromPoint(ctaCenterX, ctaCenterY) : null;
      const ctaUncovered = Boolean(cta && ctaHit && (cta === ctaHit || cta.contains(ctaHit) || ctaHit.closest('.hero-actions')));
      const blockingOverlayVisible = Boolean(
        [...document.querySelectorAll('.intro-overlay, [role="dialog"]')].some(element => {
          if (!isVisible(element)) return false;
          if (element.closest('.mobile-menu-panel')) return false;
          const rect = element.getBoundingClientRect();
          return rect.width > viewportWidth * 0.4 && rect.height > window.innerHeight * 0.4;
        }),
      );

      return {
        boardSpills: boardSpills.slice(0, 20),
        summary: {
          boardWidth: boardRect ? Math.round(boardRect.width) : 0,
          blockingOverlayVisible,
          ctaAboveFold: Boolean(
            ctaRect &&
            ctaRect.top >= 0 &&
            ctaRect.top < window.innerHeight &&
            ctaRect.bottom <= window.innerHeight &&
            ctaUncovered &&
            !blockingOverlayVisible
          ),
          horizontalOverflow: Math.max(
            0,
            Math.ceil(Math.max(root.scrollWidth, body.scrollWidth) - viewportWidth),
          ),
          mobileDensityMode,
        },
        viewportSpills: viewportSpills.slice(0, 20),
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
