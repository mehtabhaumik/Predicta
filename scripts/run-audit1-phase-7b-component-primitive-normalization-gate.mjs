import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import path, { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const phaseName = 'PREDICTA_AUDIT_1_PHASE_7B_COMPONENT_PRIMITIVE_NORMALIZATION';
const auditRoot = join(
  repoRoot,
  'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-7b-component-primitive-normalization',
);
const screenshotRoot = join(auditRoot, 'screenshots');
const manifestPath = join(auditRoot, 'phase-7b-component-primitive-normalization-manifest.json');
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

const requiredPrimitiveExports = [
  'PredictaButton',
  'PredictaCard',
  'PredictaPanel',
  'PredictaPill',
  'PredictaBadge',
  'PredictaInput',
  'PredictaSelect',
  'PredictaTabs',
  'PredictaModal',
  'PredictaDrawer',
  'PredictaTable',
  'PredictaEmptyState',
  'PredictaStateBanner',
  'PredictaStickyAction',
];
const requiredPrimitiveClasses = [
  '.predicta-button',
  '.predicta-card',
  '.predicta-panel',
  '.predicta-pill',
  '.predicta-badge',
  '.predicta-input',
  '.predicta-select',
  '.predicta-tabs',
  '.predicta-modal',
  '.predicta-drawer',
  '.predicta-table',
  '.predicta-empty-state',
  '.predicta-state-banner',
  '.predicta-sticky-action',
];
const requiredStates = [
  'disabled',
  'loading',
  'focus',
  'hover',
  'active',
  'selected',
  'error',
];
const viewports = [
  { height: 1000, name: 'desktop', width: 1440 },
  { height: 1100, name: 'tablet', width: 834 },
  { height: 940, name: 'mobile', width: 390 },
];

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

function assertIncludes(source, label, required) {
  for (const item of required) {
    assert.ok(source.includes(item), `${label} must include ${item}`);
  }
}

function buildHarness(globalsSource) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${phaseName}</title>
  <style>${globalsSource}</style>
</head>
<body>
  <main class="predicta-page-shell predicta-component-audit-board">
    <section class="predicta-panel" data-primitive="PredictaPanel">
      <p class="section-title">Phase 7B primitive matrix</p>
      <h1>Shared Predicta interaction system</h1>
      <p>Every user-touchable primitive below must resize, wrap, focus, disable, and recover consistently.</p>
    </section>
    <section class="predicta-card" data-primitive="PredictaCard">
      <h2>Buttons and states</h2>
      <div class="predicta-action-row">
        <button class="predicta-button predicta-button--primary" data-primitive="PredictaButton">Primary action</button>
        <button class="predicta-button predicta-button--secondary is-hover">Hover state</button>
        <button class="predicta-button predicta-button--ghost is-focus">Focus state</button>
        <button class="predicta-button predicta-button--secondary is-active">Active state</button>
        <button class="predicta-button predicta-button--primary is-selected">Selected state</button>
        <button class="predicta-button predicta-button--secondary is-loading" data-state="loading">Loading state</button>
        <button class="predicta-button predicta-button--danger is-error" data-state="error">Error action</button>
        <button class="predicta-button predicta-button--secondary" disabled data-state="disabled">Disabled state</button>
      </div>
    </section>
    <section class="predicta-card">
      <h2>Labels, forms, and tabs</h2>
      <div class="predicta-action-row">
        <span class="predicta-pill" data-primitive="PredictaPill">Default pill wraps safely</span>
        <span class="predicta-pill is-selected" data-state="selected">Selected pill</span>
        <span class="predicta-badge" data-primitive="PredictaBadge">Premium badge</span>
      </div>
      <form class="predicta-form">
        <input class="predicta-input" data-primitive="PredictaInput" placeholder="Predicta input">
        <input class="predicta-input is-error" data-state="error" value="Input error state">
        <select class="predicta-select" data-primitive="PredictaSelect">
          <option>Vedic report lane</option>
        </select>
      </form>
      <nav class="predicta-tabs" data-primitive="PredictaTabs">
        <button class="predicta-button predicta-button--secondary is-selected">Vedic</button>
        <button class="predicta-button predicta-button--secondary">KP</button>
        <button class="predicta-button predicta-button--secondary">Nadi</button>
        <button class="predicta-button predicta-button--secondary">Life Atlas</button>
      </nav>
    </section>
    <section class="predicta-empty-state" data-primitive="PredictaEmptyState">
      <strong>Empty state</strong>
      <p>Use this when a workflow has no content yet, with the next action visible.</p>
      <button class="predicta-button predicta-button--primary">Start now</button>
    </section>
    <section class="predicta-state-banner is-info" data-primitive="PredictaStateBanner">
      <strong>Info banner</strong>
      <p>Readable, calm, and not visually improvised.</p>
    </section>
    <section class="predicta-state-banner is-success">
      <strong>Success banner</strong>
      <p>Confirms action without forcing the user to hunt.</p>
    </section>
    <section class="predicta-state-banner is-warning">
      <strong>Warning banner</strong>
      <p>Warns without breaking trust or contrast.</p>
    </section>
    <section class="predicta-state-banner is-error">
      <strong>Error banner</strong>
      <p>Explains what happened and keeps the next action clear.</p>
    </section>
    <section class="predicta-table" data-primitive="PredictaTable">
      <table>
        <thead><tr><th>Primitive</th><th>Contract</th></tr></thead>
        <tbody>
          <tr><td>PredictaTable</td><td>Readable rows with no overflow.</td></tr>
          <tr><td>PredictaModal</td><td>Centered decision surface.</td></tr>
        </tbody>
      </table>
    </section>
    <section class="predicta-modal" data-primitive="PredictaModal">
      <h2>Modal primitive</h2>
      <p>Decision copy stays compact and the actions remain reachable.</p>
      <div class="predicta-action-row">
        <button class="predicta-button predicta-button--primary">Confirm</button>
        <button class="predicta-button predicta-button--secondary">Cancel</button>
      </div>
    </section>
    <aside class="predicta-drawer" data-primitive="PredictaDrawer">
      <strong>Drawer primitive</strong>
      <p>Bottom sheets and mobile drawers share one radius, shadow, and safe-area rhythm.</p>
    </aside>
    <aside class="predicta-sticky-action predicta-sticky-cta" data-primitive="PredictaStickyAction">
      <span>Selected report · 12 sections</span>
      <button class="predicta-button predicta-button--primary">Download</button>
    </aside>
  </main>
</body>
</html>`;
}

const packageSource = read('package.json');
const primitiveSource = read('apps/web/components/ui/DesignSystemPrimitives.tsx');
const globalsSource = read('apps/web/app/globals.css');
const tokenSource = read('packages/ui-tokens/src/index.ts');
const worldFrameSource = read('apps/web/components/PredictaWorldFrame.tsx');
const dossierSource = read('apps/web/components/WebDossierPreview.tsx');
const signatureSource = read('apps/web/components/WebSignatureAnalysisInputFlow.tsx');
const roadmapSource = read('docs/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md');
const readmeSource = read('docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/README.md');

assertIncludes(primitiveSource, 'DesignSystemPrimitives exports', requiredPrimitiveExports);
assertIncludes(globalsSource, 'globals primitive CSS classes', requiredPrimitiveClasses);
assertIncludes(tokenSource, 'primitive token class registry', [
  'button:',
  'panel:',
  'pill:',
  'badge:',
  'input:',
  'select:',
  'drawer:',
  'stateBanner:',
  'stickyAction:',
]);
assertIncludes(worldFrameSource, 'specialist world primary primitive usage', [
  'PredictaButton',
  'PredictaPanel',
  'PredictaBadge',
]);
assertIncludes(dossierSource, 'report composer primary primitive usage', ['PredictaButton']);
assertIncludes(signatureSource, 'signature primary primitive usage', ['PredictaButton']);
assertIncludes(globalsSource, 'primitive tappable target rule', [
  'min-height: var(--predicta-touch-target)',
  '.predicta-button.is-loading',
  '.predicta-button.is-selected',
  '.predicta-button.is-error',
  '.predicta-input.is-error',
  '.predicta-state-banner.is-error',
]);
assertIncludes(packageSource, 'Phase 7B package script', [
  '"test:audit1-phase-7b": "node scripts/run-audit1-phase-7b-component-primitive-normalization-gate.mjs"',
]);
assertIncludes(roadmapSource, 'roadmap Phase 7B command', [
  'PREDICTA_AUDIT_1_PHASE_7B_COMPONENT_PRIMITIVE_NORMALIZATION',
  'test:audit1-phase-7b',
]);
assertIncludes(readmeSource, 'audit readme Phase 7B evidence', [
  'PREDICTA_AUDIT_1_PHASE_7B_COMPONENT_PRIMITIVE_NORMALIZATION',
  'phase-7b-component-primitive-normalization',
]);

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for Phase 7B component primitive screenshots.');
}

mkdirSync(screenshotRoot, { recursive: true });

const port = 10_400 + Math.floor(Math.random() * 300);
const userDataDir = join(tmpdir(), `predicta-audit1-phase7b-chrome-${Date.now()}`);
const harnessPath = join(userDataDir, 'component-state-matrix.html');
mkdirSync(userDataDir, { recursive: true });
writeFileSync(harnessPath, buildHarness(globalsSource));
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
const checks = [];

try {
  await waitForChrome(port);

  for (const viewport of viewports) {
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
      await navigateAndWait(cdp, pathToFileURL(harnessPath).href);

      const metrics = await evaluateHarness(cdp);
      const screenshot = await cdp.send('Page.captureScreenshot', {
        captureBeyondViewport: true,
        format: 'png',
        fromSurface: true,
      });
      const fileName = `${viewport.name}-primitive-state-matrix.png`;
      writeFileSync(join(screenshotRoot, fileName), Buffer.from(screenshot.data, 'base64'));

      checks.push({
        fileName,
        viewport: viewport.name,
        viewportWidth: viewport.width,
        ...metrics.summary,
      });

      if (metrics.summary.horizontalOverflow > 0) {
        failures.push(`${viewport.name}: primitive matrix overflows horizontally by ${metrics.summary.horizontalOverflow}px.`);
      }

      if (metrics.summary.missingPrimitiveCount > 0) {
        failures.push(`${viewport.name}: ${metrics.summary.missingPrimitiveCount} required primitives are missing from harness.`);
      }

      if (metrics.summary.missingStateCount > 0) {
        failures.push(`${viewport.name}: ${metrics.summary.missingStateCount} required states are missing from harness.`);
      }

      for (const item of metrics.shortTargets) {
        failures.push(`${viewport.name}: ${item.selector} is ${item.height}px tall; tappable targets must be at least 44px.`);
      }

      for (const item of metrics.wideElements) {
        failures.push(`${viewport.name}: ${item.selector} extends outside viewport (${item.left}..${item.right}).`);
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
  checks,
  generatedAt: new Date().toISOString(),
  harness: 'temporary HTML matrix generated during the Phase 7B gate run',
  phase: phaseName,
  requiredPrimitiveExports,
  requiredStates,
  screenshotRoot: path.relative(repoRoot, screenshotRoot),
  status: failures.length ? 'failed' : 'green',
};

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest, null, 2));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName} passed: shared primitives, state matrix, touch targets, and screenshots are green.`);

async function evaluateHarness(cdp) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const requiredPrimitives = ${JSON.stringify(requiredPrimitiveExports)};
      const requiredStates = ${JSON.stringify(requiredStates)};
      const viewportWidth = document.documentElement.clientWidth;
      const root = document.documentElement;
      const body = document.body;
      const wideElements = [];
      const shortTargets = [];

      function selectorFor(element) {
        if (element.dataset.primitive) return '[data-primitive="' + element.dataset.primitive + '"]';
        if (element.dataset.state) return '[data-state="' + element.dataset.state + '"]';
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

      for (const element of document.querySelectorAll('body *')) {
        if (!isVisible(element)) continue;
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const intentionallyScrollable = ['auto', 'scroll'].includes(style.overflowX) || ['auto', 'scroll'].includes(style.overflow);

        if (rect.right > viewportWidth + 3 && !intentionallyScrollable) {
          wideElements.push({
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            selector: selectorFor(element),
          });
        }

        if (
          (element.matches('button, a, input, select, [role="button"], [role="link"]')) &&
          Math.round(rect.height) < 44
        ) {
          shortTargets.push({
            height: Math.round(rect.height),
            selector: selectorFor(element),
          });
        }
      }

      const missingPrimitives = requiredPrimitives.filter(name => {
        return !document.querySelector('[data-primitive="' + name + '"]');
      });
      const stateMatchers = {
        active: '.is-active',
        disabled: ':disabled, .is-disabled',
        error: '.is-error, [data-state="error"]',
        focus: '.is-focus',
        hover: '.is-hover',
        loading: '.is-loading, [data-state="loading"]',
        selected: '.is-selected',
      };
      const missingStates = requiredStates.filter(state => {
        return !document.querySelector(stateMatchers[state]);
      });

      return {
        summary: {
          horizontalOverflow: Math.max(0, Math.ceil(Math.max(root.scrollWidth, body.scrollWidth) - viewportWidth)),
          missingPrimitiveCount: missingPrimitives.length,
          missingStateCount: missingStates.length,
          primitiveCount: document.querySelectorAll('[data-primitive]').length,
          shortTargetCount: shortTargets.length,
          wideElementCount: wideElements.length,
        },
        shortTargets: shortTargets.slice(0, 12),
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
  await delay(500);
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

    socket.onopen = () => {
      resolve({
        close: () => socket.close(),
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
      }
    };
  });
}
