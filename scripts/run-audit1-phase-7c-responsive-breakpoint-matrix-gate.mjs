import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import path, { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertAuditablePredictaPage } from './lib/predicta-audit-page-readiness.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const phaseName = 'PREDICTA_AUDIT_1_PHASE_7C_RESPONSIVE_BREAKPOINT_MATRIX_AND_LAYOUT_CONTRACT';
const baseUrl = process.env.PREDICTA_AUDIT_BASE_URL ?? 'http://127.0.0.1:3009';
const auditRoot = join(
  repoRoot,
  'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-7c-responsive-breakpoint-matrix-layout-contract',
);
const screenshotRoot = join(auditRoot, 'screenshots');
const manifestPath = join(auditRoot, 'phase-7c-responsive-breakpoint-matrix-manifest.json');
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
  { height: 568, mobile: true, name: 'mobile-320', width: 320 },
  { height: 740, mobile: true, name: 'mobile-360', width: 360 },
  { height: 844, mobile: true, name: 'mobile-390', width: 390 },
  { height: 932, mobile: true, name: 'mobile-430', width: 430 },
  { height: 320, mobile: true, name: 'mobile-landscape-568', width: 568 },
  { height: 1024, mobile: false, name: 'tablet-768', width: 768 },
  { height: 1194, mobile: false, name: 'tablet-834', width: 834 },
  { height: 768, mobile: false, name: 'tablet-landscape-1024', width: 1024 },
  { height: 800, mobile: false, name: 'laptop-1280', width: 1280 },
  { height: 900, mobile: false, name: 'desktop-1440', width: 1440 },
  { height: 1117, mobile: false, name: 'desktop-1728', width: 1728 },
  { height: 1080, mobile: false, name: 'ultrawide-1920', width: 1920 },
];

const routeMatrix = [
  { expected: /Predicta|Kundli|Holistic/i, label: 'public-home', path: '/' },
  { expected: /Safety|clear boundaries|not fatalistic/i, label: 'public-safety', path: '/safety' },
  { expected: /Founder|Predicta|mission/i, label: 'public-founder-about', path: '/founder' },
  { expected: /Premium|pricing|report/i, label: 'public-pricing', path: '/pricing' },
  { expected: /Checkout|payment|pass|Razorpay/i, label: 'public-checkout', path: '/checkout' },
  {
    expected: /Sign in|Continue with Google|email/i,
    label: 'login-auth-dialog',
    path: '/',
    setup: 'openAuthDialog',
  },
  { expected: /Dashboard|Kundli|Predicta/i, label: 'dashboard-home', path: '/dashboard' },
  { expected: /Kundli|birth/i, label: 'dashboard-kundli', path: '/dashboard/kundli' },
  { expected: /Vedic|Parashari|report/i, label: 'dashboard-vedic', path: '/dashboard/vedic' },
  { expected: /KP|event|question/i, label: 'dashboard-kp', path: '/dashboard/kp' },
  { expected: /Nadi|karmic|story/i, label: 'dashboard-nadi', path: '/dashboard/nadi' },
  { expected: /Numerology|number|cycle/i, label: 'dashboard-numerology', path: '/dashboard/numerology' },
  { expected: /Signature|traits|privacy/i, label: 'dashboard-signature', path: '/dashboard/signature' },
  { expected: /report|Vedic|Life Atlas/i, label: 'dashboard-reports', path: '/dashboard/report' },
  {
    expected: /Life Atlas|synthesis|Signature privacy/i,
    label: 'dashboard-life-atlas',
    path: '/dashboard/report',
    setup: 'selectLifeAtlas',
  },
  { expected: /Family|relationship|Kundli/i, label: 'dashboard-family', path: '/dashboard/family' },
  { expected: /Settings|account|language/i, label: 'dashboard-settings', path: '/dashboard/settings' },
  { expected: /Account|sign in|profile/i, label: 'dashboard-account', path: '/dashboard/account' },
  {
    expected: /Drawer primitive|Empty state|Selected report/i,
    label: 'primitive-states-harness',
    path: 'harness:primitiveStates',
    setup: 'primitiveHarness',
  },
];

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

function assertIncludes(source, label, required) {
  for (const item of required) {
    assert.ok(source.includes(item), `${label} must include ${item}`);
  }
}

function routeToFileName(routeLabel) {
  return routeLabel.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

function buildPrimitiveHarness() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${phaseName}</title>
  <style>${read('apps/web/app/globals.css')}</style>
</head>
<body>
  <main class="predicta-page-shell predicta-section-stack">
    <section class="predicta-panel">
      <p class="section-title">Responsive state harness</p>
      <h1>Modals, drawers, dropdowns, tabs, tables, empty, loading, success, and error states</h1>
      <p>This page exists only for the Phase 7C screenshot matrix.</p>
    </section>
    <section class="predicta-card">
      <details class="info-drawer" open>
        <summary><span>Dropdown drawer</span><strong>Open</strong></summary>
        <p>Drawer content stays inside the same responsive gutter and never forces horizontal scrolling.</p>
      </details>
    </section>
    <nav class="predicta-tabs">
      <button class="predicta-button predicta-button--secondary is-selected">Vedic</button>
      <button class="predicta-button predicta-button--secondary">KP</button>
      <button class="predicta-button predicta-button--secondary">Life Atlas</button>
    </nav>
    <section class="predicta-table">
      <table>
        <thead><tr><th>State</th><th>Responsive behavior</th></tr></thead>
        <tbody>
          <tr><td>Table</td><td>Rows preserve reading order without escaping the viewport.</td></tr>
          <tr><td>Tabs</td><td>Touch targets remain reachable on mobile portrait and landscape.</td></tr>
        </tbody>
      </table>
    </section>
    <section class="predicta-empty-state">
      <strong>Empty state</strong>
      <p>No content yet, but the next action is visible and full-width on mobile.</p>
      <button class="predicta-button predicta-button--primary">Create Kundli</button>
    </section>
    <section class="predicta-loading-state">
      <strong>Loading state</strong>
      <p>Loading states keep space stable so cards do not jump.</p>
    </section>
    <section class="predicta-state-banner is-success"><strong>Success state</strong><p>The user can see what happened without hunting.</p></section>
    <section class="predicta-state-banner is-error"><strong>Error state</strong><p>The user knows what failed and what to do next.</p></section>
    <section class="predicta-modal">
      <h2>Modal primitive</h2>
      <p>Dialog content is centered and readable without edge collision.</p>
      <div class="predicta-action-row">
        <button class="predicta-button predicta-button--primary">Confirm</button>
        <button class="predicta-button predicta-button--secondary">Cancel</button>
      </div>
    </section>
    <aside class="predicta-drawer" style="position: relative; left: auto; right: auto; bottom: auto; max-height: none;">
      <strong>Drawer primitive</strong>
      <p>Bottom-sheet sizing uses safe-area rhythm and remains scrollable only when needed.</p>
    </aside>
    <aside class="predicta-sticky-action predicta-sticky-cta" style="position: relative; left: auto; transform: none; width: 100%;">
      <span>Selected report · 12 sections</span>
      <button class="predicta-button predicta-button--primary">Download</button>
    </aside>
  </main>
</body>
</html>`;
}

const pkg = JSON.parse(read('package.json'));
const roadmapSource = read('docs/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md');
const readmeSource = read('docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/README.md');
const tokenSource = read('packages/ui-tokens/src/index.ts');
const globalsSource = read('apps/web/app/globals.css');
const layoutContractSource = read(
  'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-7c-responsive-breakpoint-matrix-layout-contract/responsive-layout-contract.md',
);

assert.equal(
  pkg.scripts['test:audit1-phase-7c'],
  'node scripts/run-audit1-phase-7c-responsive-breakpoint-matrix-gate.mjs',
);
assertIncludes(roadmapSource, 'roadmap Phase 7C', [
  'PREDICTA_AUDIT_1_PHASE_7C_RESPONSIVE_BREAKPOINT_MATRIX_AND_LAYOUT_CONTRACT',
  'test:audit1-phase-7c',
]);
assertIncludes(readmeSource, 'audit README Phase 7C', [
  'PREDICTA_AUDIT_1_PHASE_7C_RESPONSIVE_BREAKPOINT_MATRIX_AND_LAYOUT_CONTRACT',
  'phase-7c-responsive-breakpoint-matrix-layout-contract',
]);
assertIncludes(tokenSource, 'breakpoint token contract', [
  'mobile320',
  'mobile360',
  'mobile390',
  'mobile430',
  'landscape568',
  'tablet768',
  'tablet834',
  'laptop1024',
  'desktop1280',
  'desktop1440',
  'ultrawide1728',
]);
assertIncludes(layoutContractSource, 'responsive layout contract', [
  'Public Shell',
  'Dashboard Shell',
  'Report Composer',
  'Specialist Rooms',
  'Charts and Kundli Surfaces',
  'Primitive State Surfaces',
]);
assertIncludes(globalsSource, 'responsive token aliases', [
  '--predicta-space-page',
  '--predicta-space-page-mobile',
  '--predicta-max-content',
  '--predicta-max-dashboard',
]);

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for the Phase 7C responsive matrix.');
}

mkdirSync(screenshotRoot, { recursive: true });

const sourceMetrics = {
  gridTemplateDeclarations: countMatches(globalsSource, /grid-template(?:-columns)?\s*:/g),
  maxWidthDeclarations: countMatches(globalsSource, /max-width\s*:/g),
  mediaQueries: countMatches(globalsSource, /@media\b/g),
  uniqueMediaExpressions: [
    ...new Set([...globalsSource.matchAll(/@media\s*([^{]+)/g)].map(match => match[1].trim())),
  ].sort(),
};

const port = 10_900 + Math.floor(Math.random() * 300);
const userDataDir = join(tmpdir(), `predicta-audit1-phase7c-chrome-${Date.now()}`);
const harnessPath = join(userDataDir, 'responsive-state-harness.html');
mkdirSync(userDataDir, { recursive: true });
writeFileSync(harnessPath, buildPrimitiveHarness());

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
    const viewportDir = join(screenshotRoot, viewport.name);
    mkdirSync(viewportDir, { recursive: true });

    for (const route of routeMatrix) {
      const page = await createTarget(port, 'about:blank');
      const cdp = await connectWebSocket(page.webSocketDebuggerUrl);

      try {
        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');
        await cdp.send('Emulation.setDeviceMetricsOverride', {
          deviceScaleFactor: 1,
          height: viewport.height,
          mobile: viewport.mobile,
          width: viewport.width,
        });

        const targetUrl =
          route.path === 'harness:primitiveStates'
            ? `file://${harnessPath}`
            : `${baseUrl}${route.path}`;
        await navigateAndWait(cdp, targetUrl);
        await waitForFonts(cdp);

        if (route.path !== 'harness:primitiveStates') {
          await assertAuditablePredictaPage(cdp, {
            route: route.path,
            url: targetUrl,
          });
        }

        await applyScenario(cdp, route.setup);
        const metrics = await evaluateResponsiveRoute(cdp, route);
        const screenshot = await cdp.send('Page.captureScreenshot', {
          captureBeyondViewport: false,
          format: 'jpeg',
          fromSurface: true,
          quality: 66,
        });
        const fileName = `${routeToFileName(route.label)}.jpg`;
        writeFileSync(join(viewportDir, fileName), Buffer.from(screenshot.data, 'base64'));

        const { visibleText, ...summaryForManifest } = metrics.summary;
        checks.push({
          failureDetails: metrics.failures.slice(0, 12),
          fileName: `${viewport.name}/${fileName}`,
          route: route.label,
          viewport: viewport.name,
          viewportHeight: viewport.height,
          viewportWidth: viewport.width,
          ...summaryForManifest,
          visibleTextSample: visibleText.slice(0, 220),
        });

        if (!route.expected.test(metrics.summary.visibleText)) {
          failures.push(`${viewport.name} ${route.label}: expected route/state text was not visible.`);
        }

        if (metrics.summary.horizontalOverflow > 4) {
          failures.push(`${viewport.name} ${route.label}: page is ${metrics.summary.horizontalOverflow}px wider than viewport.`);
        }

        if (metrics.summary.clippedText > 0) {
          failures.push(`${viewport.name} ${route.label}: clips ${metrics.summary.clippedText} text nodes.`);
        }

        if (metrics.summary.wideElements > 0) {
          failures.push(`${viewport.name} ${route.label}: has ${metrics.summary.wideElements} elements escaping the viewport.`);
        }

        if (metrics.summary.edgeCollisions > 0) {
          failures.push(`${viewport.name} ${route.label}: has ${metrics.summary.edgeCollisions} edge collisions.`);
        }

        if (metrics.summary.shortTouchTargets > 0) {
          failures.push(`${viewport.name} ${route.label}: has ${metrics.summary.shortTouchTargets} tappable targets below 44px.`);
        }

        if (metrics.summary.invisibleCtas > 0) {
          failures.push(`${viewport.name} ${route.label}: has ${metrics.summary.invisibleCtas} hidden or unreadable CTAs.`);
        }

        if (metrics.summary.stickyProblems > 0) {
          failures.push(`${viewport.name} ${route.label}: has ${metrics.summary.stickyProblems} sticky/fixed elements breaking viewport safety.`);
        }

        for (const item of metrics.failures.slice(0, 8)) {
          failures.push(`${viewport.name} ${route.label}: ${item}`);
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
  routeCount: routeMatrix.length,
  screenshotRoot: path.relative(repoRoot, screenshotRoot),
  sourceMetrics,
  status: failures.length ? 'failed' : 'green',
  totalChecks: checks.length,
  viewportCount: viewports.length,
  viewports,
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

console.log(`${phaseName} passed: ${checks.length} route/breakpoint screenshots, overflow metrics, touch targets, sticky safety, and layout contract are green.`);

function countMatches(source, pattern) {
  return source.match(pattern)?.length ?? 0;
}

async function applyScenario(cdp, setup) {
  if (!setup) {
    return;
  }

  const expression =
    setup === 'openAuthDialog'
      ? `(() => {
          const candidates = [...document.querySelectorAll('button, a')];
          const trigger = candidates.find(element => /sign in/i.test(element.textContent || ''));
          if (trigger) trigger.click();
          return Boolean(trigger);
        })()`
      : setup === 'selectLifeAtlas'
        ? `(() => {
            const candidates = [...document.querySelectorAll('button')];
            const trigger = candidates.find(element => /life atlas/i.test(element.textContent || ''));
            if (trigger) trigger.click();
            const marketplace = document.querySelector('.report-marketplace-selector');
            if (marketplace && !marketplace.open) marketplace.open = true;
            document.querySelector('#report-lane-life-atlas')?.scrollIntoView({ block: 'center' });
            return Boolean(document.querySelector('#report-lane-life-atlas'));
          })()`
        : 'true';

  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression,
  });
  await delay(500);
}

async function evaluateResponsiveRoute(cdp, route) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const route = ${JSON.stringify({ label: route.label })};
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      const root = document.documentElement;
      const body = document.body;
      const clippedText = [];
      const wideElements = [];
      const edgeCollisions = [];
      const shortTouchTargets = [];
      const invisibleCtas = [];
      const stickyProblems = [];
      const failures = [];
      const ignoredTags = new Set(['SCRIPT', 'STYLE', 'META', 'LINK', 'TITLE', 'SVG', 'PATH']);

      function selectorFor(element) {
        if (element.id) return '#' + element.id;
        if (element.getAttribute('aria-label')) return element.tagName.toLowerCase() + '[aria-label="' + element.getAttribute('aria-label') + '"]';
        const classes = [...element.classList].slice(0, 4).join('.');
        return element.tagName.toLowerCase() + (classes ? '.' + classes : '');
      }

      function isScreenReaderOnly(element) {
        return element.classList.contains('sr-only') || Boolean(element.closest('.sr-only'));
      }

      function isVisuallyHidden(style) {
        return style.clipPath !== 'none' || style.clip !== 'auto';
      }

      function isVisible(element) {
        const style = window.getComputedStyle(element);
        if (
          ignoredTags.has(element.tagName) ||
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          Number(style.opacity) === 0 ||
          element.getAttribute('aria-hidden') === 'true'
        ) return false;
        if (isScreenReaderOnly(element) || isVisuallyHidden(style)) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }

      function isIntentionalScrollRegion(style) {
        return ['auto', 'scroll'].includes(style.overflowX) ||
          ['auto', 'scroll'].includes(style.overflowY) ||
          ['auto', 'scroll'].includes(style.overflow);
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
        const offscreenIntentional =
          style.position === 'fixed' &&
          (rect.left >= viewportWidth || rect.right <= 0) &&
          style.transform !== 'none';

        if (!offscreenIntentional && rect.right > viewportWidth + 3 && !isIntentionalScrollRegion(style)) {
          wideElements.push(selector + ' right ' + Math.round(rect.right));
        }

        if (!offscreenIntentional && rect.left < -3 && !isIntentionalScrollRegion(style)) {
          wideElements.push(selector + ' left ' + Math.round(rect.left));
        }

        if (
          viewportWidth <= 430 &&
          element.matches('section, article, form, nav, aside, .glass-panel, .predicta-card, .predicta-panel') &&
          !isIntentionalScrollRegion(style) &&
          (rect.left < -1 || rect.right > viewportWidth + 1)
        ) {
          edgeCollisions.push(selector);
        }

        if (
          element.matches(
            'button, input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]):not([type="file"]), select, textarea, [role="button"], .button, .predicta-button, .report-product-card',
          )
        ) {
          if (Math.round(rect.height) < 44) {
            shortTouchTargets.push(selector + ' height ' + Math.round(rect.height));
          }

          const text = (element.textContent || element.getAttribute('aria-label') || element.getAttribute('placeholder') || '').trim();
          if (text && (rect.right <= 0 || rect.left >= viewportWidth)) {
            invisibleCtas.push(selector);
          }
        }

        if (['sticky', 'fixed'].includes(style.position)) {
          const tooTall = style.position === 'fixed' && viewportWidth <= 430 && rect.height > viewportHeight * 0.72;
          const offscreen =
            rect.right > viewportWidth + 3 ||
            rect.left < -3 ||
            (style.position === 'fixed' && (rect.bottom < 0 || rect.top > viewportHeight));
          if (tooTall || offscreen) {
            stickyProblems.push(selector);
          }
        }

        if (!isLeafTextSurface(element)) continue;
        const text = (element.textContent || '').replace(/\\s+/g, ' ').trim();
        if (text.length < 6) continue;
        if (style.textOverflow === 'ellipsis') continue;
        if (isIntentionalScrollRegion(style)) continue;

        if (Math.ceil(element.scrollWidth) > Math.ceil(element.clientWidth) + 4) {
          clippedText.push(selector);
        }
      }

      const visibleText = document.body.innerText.replace(/\\s+/g, ' ').slice(0, 12000);
      const primaryActions = [...document.querySelectorAll('button, a')]
        .filter(isVisible)
        .filter(element => /(download|start|sign in|ask|create|continue|report|checkout|save|confirm|open)/i.test(element.textContent || element.getAttribute('aria-label') || ''));

      if (!primaryActions.length) {
        failures.push(route.label + ' has no visible action-oriented CTA.');
      }

      return {
        failures: [
          ...wideElements.slice(0, 4).map(item => 'wide element ' + item),
          ...shortTouchTargets.slice(0, 4).map(item => 'short target ' + item),
          ...edgeCollisions.slice(0, 4).map(item => 'edge collision ' + item),
          ...invisibleCtas.slice(0, 4).map(item => 'invisible CTA ' + item),
          ...stickyProblems.slice(0, 4).map(item => 'sticky problem ' + item),
          ...failures,
        ].slice(0, 20),
        summary: {
          clippedText: clippedText.length,
          edgeCollisions: edgeCollisions.length,
          horizontalOverflow: Math.max(0, Math.ceil(Math.max(root.scrollWidth, body.scrollWidth) - viewportWidth)),
          invisibleCtas: invisibleCtas.length,
          shortTouchTargets: shortTouchTargets.length,
          stickyProblems: stickyProblems.length,
          visibleText,
          wideElements: wideElements.length,
        },
      };
    })()`,
    returnByValue: true,
  });

  return response.result.value;
}

async function waitForFonts(cdp) {
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression:
      'document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 4000))]) : true',
  });
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
