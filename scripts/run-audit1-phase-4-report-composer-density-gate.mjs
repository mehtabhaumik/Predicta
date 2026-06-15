import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { assertAuditablePredictaPage } from './lib/predicta-audit-page-readiness.mjs';

const phaseName = 'PREDICTA_AUDIT_1_PHASE_4_REPORT_COMPOSER_ACTION_DENSITY_REBUILD';
const baseUrl = process.env.PREDICTA_AUDIT_BASE_URL ?? 'http://127.0.0.1:3009';
const auditRoot = 'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX';
const phaseRoot = join(auditRoot, 'phase-4-report-composer-action-density-rebuild');
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

const viewports = [
  { firstScreenButtonLimit: 10, height: 1100, name: 'desktop', width: 1440 },
  { firstScreenButtonLimit: 8, height: 1112, name: 'tablet', width: 834 },
  { firstScreenButtonLimit: 8, height: 844, name: 'mobile', width: 390 },
];

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for Phase 4 report composer gate.');
}

mkdirSync(screenshotRoot, { recursive: true });

const port = 9900 + Math.floor(Math.random() * 300);
const userDataDir = join(tmpdir(), `predicta-audit1-phase4-chrome-${Date.now()}`);
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
    const url = `${baseUrl}/dashboard/report`;
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
        route: '/dashboard/report',
        url,
      });
      const metrics = await evaluateReportComposer(cdp, viewport);
      const screenshot = await cdp.send('Page.captureScreenshot', {
        captureBeyondViewport: false,
        format: 'png',
        fromSurface: true,
      });
      const fileName = `${viewport.name}-report-composer.png`;
      writeFileSync(join(screenshotRoot, fileName), Buffer.from(screenshot.data, 'base64'));

      checks.push({
        fileName,
        finalUrl: readiness.finalUrl,
        viewport: viewport.name,
        viewportWidth: viewport.width,
        ...metrics.summary,
      });

      if (metrics.summary.horizontalOverflow > 0) {
        failures.push(`${viewport.name}: report page is ${metrics.summary.horizontalOverflow}px wider than viewport.`);
      }

      if (metrics.summary.visibleButtons > 42) {
        failures.push(`${viewport.name}: report page exposes too many visible actions (${metrics.summary.visibleButtons}/42).`);
      }

      if (metrics.summary.firstScreenButtons > viewport.firstScreenButtonLimit) {
        failures.push(
          `${viewport.name}: first screen exposes too many report actions (${metrics.summary.firstScreenButtons}/${viewport.firstScreenButtonLimit}).`,
        );
      }

      if (metrics.summary.visibleFormControls > 0) {
        failures.push(`${viewport.name}: report composer still leaves visible form controls in the density path (${metrics.summary.visibleFormControls}/0).`);
      }

      if (metrics.summary.firstScreenFormControls > 0) {
        failures.push(`${viewport.name}: first screen exposes form controls (${metrics.summary.firstScreenFormControls}/0).`);
      }

      if (!metrics.summary.hasPrimaryInlineComposer) {
        failures.push(`${viewport.name}: selected report composer is missing from the first report surface.`);
      }

      if (!metrics.summary.hasInlineComposerDirectlyAfterSelectedCard) {
        failures.push(`${viewport.name}: selected report action panel is not directly under the selected card.`);
      }

      if (!metrics.summary.isMarketplaceDrawerHidden) {
        failures.push(`${viewport.name}: closed report marketplace drawer still paints hidden report cards.`);
      }

      if (!metrics.summary.isVedicCustomizationHidden) {
        failures.push(`${viewport.name}: closed Vedic customization drawer still paints section controls.`);
      }

      if (metrics.summary.hasSchoolSubnav && viewport.name === 'mobile') {
        if (!metrics.summary.hasStackedSchoolTabs) {
          failures.push('mobile: report school tabs are not stacked full-width links.');
        }
      } else if (metrics.summary.hasSchoolSubnav && !metrics.summary.hasHorizontalSchoolTabs) {
        failures.push(`${viewport.name}: report school tabs are not a horizontal navigation row.`);
      }

      for (const item of metrics.wideElements) {
        failures.push(`${viewport.name}: ${item.selector} extends beyond viewport (${item.left}..${item.right}).`);
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
  baseUrl,
  checks,
  generatedAt: new Date().toISOString(),
  phase: phaseName,
  screenshotRoot,
  status: failures.length ? 'failed' : 'green',
};

writeFileSync(join(phaseRoot, 'phase-4-report-composer-density-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest, null, 2));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName} passed: report composer density, CTA placement, school tabs, and Vedic customization are green.`);

async function evaluateReportComposer(cdp, viewport) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const viewport = ${JSON.stringify(viewport)};
      const viewportWidth = document.documentElement.clientWidth;
      const body = document.body;
      const root = document.documentElement;
      const wideElements = [];
      const ignoredTags = new Set(['SCRIPT', 'STYLE', 'META', 'LINK', 'TITLE', 'SVG', 'PATH']);

      function selectorFor(element) {
        if (element.id) return '#' + element.id;
        const classes = [...element.classList].slice(0, 4).join('.');
        return element.tagName.toLowerCase() + (classes ? '.' + classes : '');
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

      function visibleControls(selector) {
        return [...document.querySelectorAll(selector)].filter(isVisible);
      }

      function isIntentionalScrollRegion(style) {
        return ['auto', 'scroll'].includes(style.overflowX) ||
          ['auto', 'scroll'].includes(style.overflowY) ||
          ['auto', 'scroll'].includes(style.overflow);
      }

      for (const element of document.querySelectorAll('body *')) {
        if (!isVisible(element)) continue;
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        if (rect.right > viewportWidth + 3 && !isIntentionalScrollRegion(style)) {
          wideElements.push({
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            selector: selectorFor(element),
          });
        }
      }

      const buttons = visibleControls('button, a.button, [role="button"]');
      const formControls = [...document.querySelectorAll('input, select, textarea')];
      const visibleFormControls = formControls.filter(isVisible);
      const primaryComposer =
        document.querySelector('[data-phase13-report-composer-contract="primary"]') ||
        document.querySelector('.report-selected-choice .report-inline-composer.primary');
      const selectedCard = document.querySelector('.report-selected-product-card');
      const selectedChoice = document.querySelector('.report-selected-choice');
      const schoolSubnav = document.querySelector('.report-school-subnav');
      const subnavButtons = schoolSubnav ? [...schoolSubnav.querySelectorAll('button, a')].filter(isVisible) : [];
      const subnavStyle = schoolSubnav ? window.getComputedStyle(schoolSubnav) : null;
      const firstSubnavButton = subnavButtons[0];
      const firstSubnavButtonStyle = firstSubnavButton ? window.getComputedStyle(firstSubnavButton) : null;
      const hiddenMarketplace = document.querySelector('.report-marketplace-selector:not([open]) .report-marketplace-expanded');
      const hiddenCustomization = document.querySelector('.report-inline-customize:not([open]) .report-builder-section-grid');

      return {
        summary: {
          firstScreenButtons: buttons.filter(element => element.getBoundingClientRect().top < window.innerHeight).length,
          firstScreenFormControls: visibleFormControls.filter(element => element.getBoundingClientRect().top < window.innerHeight).length,
          formControls: formControls.length,
          visibleFormControls: visibleFormControls.length,
          hasHorizontalSchoolTabs: Boolean(
            schoolSubnav &&
            subnavStyle &&
            ['grid', 'flex'].includes(subnavStyle.display) &&
            subnavButtons.length >= 6 &&
            subnavButtons.every(button => button.getBoundingClientRect().width < viewportWidth * 0.55)
          ),
          hasInlineComposerDirectlyAfterSelectedCard: Boolean(
            selectedCard &&
            primaryComposer &&
            selectedChoice &&
            selectedChoice.contains(selectedCard) &&
            selectedChoice.contains(primaryComposer) &&
            (selectedCard.compareDocumentPosition(primaryComposer) & Node.DOCUMENT_POSITION_FOLLOWING)
          ),
          hasPrimaryInlineComposer: Boolean(primaryComposer),
          hasSchoolSubnav: Boolean(schoolSubnav),
          hasStackedSchoolTabs: Boolean(
            schoolSubnav &&
            subnavStyle &&
            subnavStyle.display === 'grid' &&
            subnavStyle.gridTemplateColumns.split(' ').length === 1 &&
            firstSubnavButton &&
            firstSubnavButtonStyle &&
            firstSubnavButtonStyle.width !== 'auto' &&
            firstSubnavButton.getBoundingClientRect().width >= viewportWidth - 80
          ),
          horizontalOverflow: Math.max(
            0,
            Math.ceil(Math.max(root.scrollWidth, body.scrollWidth) - viewportWidth),
          ),
          isMarketplaceDrawerHidden: !hiddenMarketplace || window.getComputedStyle(hiddenMarketplace).display === 'none',
          isVedicCustomizationHidden: !hiddenCustomization || window.getComputedStyle(hiddenCustomization).display === 'none',
          visibleButtons: buttons.length,
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
