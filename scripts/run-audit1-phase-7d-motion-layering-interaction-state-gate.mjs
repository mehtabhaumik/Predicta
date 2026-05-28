import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import path, { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const phaseName = 'PREDICTA_AUDIT_1_PHASE_7D_MOTION_LAYERING_AND_INTERACTION_STATE_SYSTEM';
const auditRoot = join(
  repoRoot,
  'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-7d-motion-layering-interaction-state-system',
);
const screenshotRoot = join(auditRoot, 'screenshots');
const manifestPath = join(auditRoot, 'phase-7d-motion-layering-interaction-state-manifest.json');
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
  { height: 1000, mobile: false, name: 'desktop', width: 1440 },
  { height: 1100, mobile: false, name: 'tablet', width: 834 },
  { height: 940, mobile: true, name: 'mobile', width: 390 },
];
const motionModes = [
  { media: 'no-preference', name: 'normal' },
  { media: 'reduce', name: 'reduced' },
];
const requiredMotionTokens = [
  'instantMs',
  'fastMs',
  'standardMs',
  'revealMs',
  'scanMs',
  'ambientMs',
  'easeOut',
  'easeInOut',
];
const requiredCssContracts = [
  '--predicta-motion-instant',
  '--predicta-motion-standard',
  '--predicta-motion-reveal',
  '--predicta-motion-scan',
  '--predicta-motion-ambient',
  '--predicta-ease-out',
  '--predicta-ease-in-out',
  '--predicta-z-critical',
  '.predicta-motion-reveal',
  '.predicta-feedback-target',
  '.predicta-progress-scan',
  '.predicta-overlay-backdrop',
  '.predicta-overlay-panel',
  '@media (prefers-reduced-motion: reduce)',
];
const requiredLayers = [
  'modal',
  'drawer',
  'dropdown',
  'sticky-cta',
  'chat',
  'signature-scan',
  'report-composer',
  'payment-state',
];
const forbiddenRawZIndexPattern = /z-index\s*:\s*(?:10000|10001|10002|1000|1100|1200|1201|1400|110)\b/;

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
  <main class="predicta-page-shell predicta-section-stack predicta-component-audit-board">
    <section class="predicta-panel predicta-motion-reveal" data-layer="report-composer">
      <p class="section-title">Motion and layering contract</p>
      <h1>Report composer action state</h1>
      <p>Reveal motion is tokenized, readable, and never required to understand the page.</p>
      <div class="predicta-action-row">
        <button class="predicta-button predicta-button--primary predicta-feedback-target" data-keyboard="first">Download report</button>
        <button class="predicta-button predicta-button--secondary predicta-feedback-target is-hover" data-keyboard="second">Change report</button>
        <button class="predicta-button predicta-button--ghost predicta-feedback-target is-active">Active feedback</button>
      </div>
    </section>

    <section class="predicta-card predicta-progress-scan" data-layer="signature-scan">
      <h2>Signature scan progress</h2>
      <p>Progress motion uses one scan primitive and resolves safely under reduced motion.</p>
    </section>

    <section class="predicta-card" data-layer="payment-state">
      <h2>Payment state</h2>
      <p>Payment readiness stays visible below the selected report without jumping layers.</p>
      <button class="predicta-button predicta-button--primary predicta-feedback-target">Continue checkout</button>
    </section>

    <details class="predicta-card" data-layer="dropdown" open>
      <summary class="predicta-feedback-target">Dropdown proof surface</summary>
      <p>Dropdown content stays inside the page rhythm and below overlay layers.</p>
    </details>

    <aside class="predicta-drawer" data-layer="drawer">
      <strong>Drawer proof</strong>
      <p>Drawers share the overlay rhythm and stay above page content.</p>
    </aside>

    <aside class="predicta-sticky-action predicta-sticky-cta" data-layer="sticky-cta">
      <span>Full Kundli selected</span>
      <button class="predicta-button predicta-button--primary predicta-feedback-target">Download</button>
    </aside>

    <section class="predicta-card" data-layer="chat">
      <h2>Chat action state</h2>
      <p>Chat stays readable while overlays, sticky CTAs, and drawers layer predictably.</p>
      <button class="predicta-button predicta-button--secondary predicta-feedback-target">Ask Predicta</button>
    </section>

    <section class="predicta-overlay-backdrop" data-layer="modal" role="dialog" aria-modal="true">
      <div class="predicta-overlay-panel">
        <p class="section-title">Overlay proof</p>
        <h2>Download your report</h2>
        <p>The modal sits above sticky CTAs, drawers, dropdowns, payment, signature, and chat surfaces.</p>
        <div class="predicta-action-row">
          <button class="predicta-button predicta-button--primary predicta-feedback-target" data-keyboard="modal-primary">Download</button>
          <button class="predicta-button predicta-button--secondary predicta-feedback-target" data-keyboard="modal-cancel">Cancel</button>
        </div>
      </div>
    </section>
  </main>
</body>
</html>`;
}

const packageSource = read('package.json');
const tokenSource = read('packages/ui-tokens/src/index.ts');
const globalsSource = read('apps/web/app/globals.css');
const roadmapSource = read('docs/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md');
const readmeSource = read('docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/README.md');
const contractSource = read(
  'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-7d-motion-layering-interaction-state-system/motion-layering-contract.md',
);

assertIncludes(packageSource, 'Phase 7D package script', [
  '"test:audit1-phase-7d": "node scripts/run-audit1-phase-7d-motion-layering-interaction-state-gate.mjs"',
]);
assertIncludes(tokenSource, 'motion token contract', requiredMotionTokens.map(token => `${token}:`));
assertIncludes(tokenSource, 'z-index token contract', ['sticky:', 'overlay:', 'modal:', 'toast:', 'critical:']);
assertIncludes(globalsSource, 'motion and layering CSS contract', requiredCssContracts);
assertIncludes(roadmapSource, 'roadmap Phase 7D command', [phaseName, 'test:audit1-phase-7d']);
assertIncludes(readmeSource, 'audit README Phase 7D evidence', [
  phaseName,
  'phase-7d-motion-layering-interaction-state-system',
]);
assertIncludes(contractSource, 'motion layering contract doc', [
  'Reveal Motion',
  'Feedback Motion',
  'Progress Motion',
  'Overlay And Z-Index Contract',
  'Reduced Motion Contract',
  'Keyboard Contract',
]);
assert.ok(
  !forbiddenRawZIndexPattern.test(globalsSource),
  'Forbidden global raw z-index values must be replaced with z-index tokens.',
);

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for Phase 7D motion and layering screenshots.');
}

mkdirSync(screenshotRoot, { recursive: true });

const port = 11_200 + Math.floor(Math.random() * 300);
const userDataDir = join(tmpdir(), `predicta-audit1-phase7d-chrome-${Date.now()}`);
const harnessPath = join(userDataDir, 'motion-layering-state-harness.html');
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
    for (const mode of motionModes) {
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
        await cdp.send('Emulation.setEmulatedMedia', {
          features: [{ name: 'prefers-reduced-motion', value: mode.media }],
        });
        await navigateAndWait(cdp, pathToFileURL(harnessPath).href);

        const metrics = await evaluateHarness(cdp, mode);
        const screenshot = await cdp.send('Page.captureScreenshot', {
          captureBeyondViewport: true,
          format: 'png',
          fromSurface: true,
        });
        const fileName = `${viewport.name}-${mode.name}-motion-layering-state.png`;
        writeFileSync(join(screenshotRoot, fileName), Buffer.from(screenshot.data, 'base64'));

        await cdp.send('Runtime.evaluate', {
          expression: `document.querySelector('[data-keyboard="first"]').focus()`,
        });
        await cdp.send('Input.dispatchKeyEvent', {
          code: 'Tab',
          key: 'Tab',
          nativeVirtualKeyCode: 9,
          type: 'keyDown',
          windowsVirtualKeyCode: 9,
        });
        await cdp.send('Input.dispatchKeyEvent', {
          code: 'Tab',
          key: 'Tab',
          nativeVirtualKeyCode: 9,
          type: 'keyUp',
          windowsVirtualKeyCode: 9,
        });
        await delay(120);
        const keyboardMetrics = await evaluateKeyboardFocus(cdp);
        const keyboardScreenshot = await cdp.send('Page.captureScreenshot', {
          captureBeyondViewport: true,
          format: 'png',
          fromSurface: true,
        });
        const keyboardFileName = `${viewport.name}-${mode.name}-keyboard-focus.png`;
        writeFileSync(join(screenshotRoot, keyboardFileName), Buffer.from(keyboardScreenshot.data, 'base64'));

        checks.push({
          fileName,
          keyboardFileName,
          mode: mode.name,
          viewport: viewport.name,
          viewportWidth: viewport.width,
          ...metrics.summary,
          ...keyboardMetrics,
        });

        if (metrics.summary.horizontalOverflow > 0) {
          failures.push(`${viewport.name}/${mode.name}: motion harness overflows horizontally by ${metrics.summary.horizontalOverflow}px.`);
        }
        if (metrics.summary.missingLayerCount > 0) {
          failures.push(`${viewport.name}/${mode.name}: ${metrics.summary.missingLayerCount} required layer surfaces are missing.`);
        }
        if (metrics.summary.shortTargetCount > 0) {
          failures.push(`${viewport.name}/${mode.name}: ${metrics.summary.shortTargetCount} touch targets are below 44px.`);
        }
        if (!metrics.summary.overlayAboveSticky || !metrics.summary.panelAboveBackdrop) {
          failures.push(`${viewport.name}/${mode.name}: overlay, modal panel, sticky CTA, and drawer z-index order is not safe.`);
        }
        if (mode.name === 'normal' && !metrics.summary.normalMotionActive) {
          failures.push(`${viewport.name}/${mode.name}: reveal/progress/feedback motion is not active.`);
        }
        if (mode.name === 'reduced' && !metrics.summary.reducedMotionSafe) {
          failures.push(`${viewport.name}/${mode.name}: reduced-motion override is not safe.`);
        }
        if (!keyboardMetrics.focusMoved || !keyboardMetrics.focusVisible) {
          failures.push(`${viewport.name}/${mode.name}: keyboard focus did not move visibly through actionable controls.`);
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
  checks,
  generatedAt: new Date().toISOString(),
  harness: 'temporary HTML matrix generated during the Phase 7D gate run',
  phase: phaseName,
  requiredCssContracts,
  requiredLayers,
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

console.log(`${phaseName} passed: motion tokens, z-index layering, reduced motion, keyboard proof, and screenshots are green.`);

async function evaluateHarness(cdp, mode) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const requiredLayers = ${JSON.stringify(requiredLayers)};
      const viewportWidth = document.documentElement.clientWidth;
      const root = document.documentElement;
      const body = document.body;
      const shortTargets = [];

      function numericTimeList(value) {
        return value.split(',').map(item => {
          const text = item.trim();
          if (text.endsWith('ms')) return Number.parseFloat(text) / 1000;
          if (text.endsWith('s')) return Number.parseFloat(text);
          return 0;
        });
      }

      function maxTime(value) {
        return Math.max(0, ...numericTimeList(value));
      }

      function zIndexOf(selector) {
        const element = document.querySelector(selector);
        if (!element) return null;
        const parsed = Number.parseInt(window.getComputedStyle(element).zIndex, 10);
        return Number.isFinite(parsed) ? parsed : 0;
      }

      function isVisible(element) {
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }

      for (const element of document.querySelectorAll('button, a, input, select, [role="button"], summary')) {
        if (!isVisible(element)) continue;
        const rect = element.getBoundingClientRect();
        if (Math.round(rect.height) < 44) {
          shortTargets.push({
            height: Math.round(rect.height),
            text: (element.textContent || element.getAttribute('aria-label') || element.tagName).trim(),
          });
        }
      }

      const reveal = window.getComputedStyle(document.querySelector('.predicta-motion-reveal'));
      const feedback = window.getComputedStyle(document.querySelector('.predicta-feedback-target'));
      const scanAfter = window.getComputedStyle(document.querySelector('.predicta-progress-scan'), '::after');
      const backdropZ = zIndexOf('.predicta-overlay-backdrop');
      const panelZ = zIndexOf('.predicta-overlay-panel');
      const stickyZ = zIndexOf('.predicta-sticky-action');
      const drawerZ = zIndexOf('.predicta-drawer');
      const missingLayers = requiredLayers.filter(layer => !document.querySelector('[data-layer="' + layer + '"]'));
      const revealDuration = maxTime(reveal.animationDuration);
      const feedbackDuration = maxTime(feedback.transitionDuration);
      const scanDuration = maxTime(scanAfter.animationDuration);
      const scanAnimationName = scanAfter.animationName;
      const normalMotionActive = revealDuration >= 0.2 && feedbackDuration >= 0.1 && scanAnimationName !== 'none' && scanDuration >= 1;
      const reducedMotionSafe = revealDuration <= 0.09 && feedbackDuration <= 0.09 && (scanAnimationName === 'none' || scanDuration <= 0.09);

      return {
        summary: {
          drawerZ,
          feedbackDuration,
          horizontalOverflow: Math.max(0, Math.ceil(Math.max(root.scrollWidth, body.scrollWidth) - viewportWidth)),
          missingLayerCount: missingLayers.length,
          mode: ${JSON.stringify(mode.name)},
          normalMotionActive,
          overlayAboveSticky: backdropZ > stickyZ && backdropZ >= drawerZ,
          panelAboveBackdrop: panelZ > backdropZ,
          reducedMotionSafe,
          revealDuration,
          scanAnimationName,
          scanDuration,
          shortTargetCount: shortTargets.length,
        },
        shortTargets: shortTargets.slice(0, 12),
      };
    })()`,
    returnByValue: true,
  });

  return response.result.value;
}

async function evaluateKeyboardFocus(cdp) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const active = document.activeElement;
      const activeText = (active?.textContent || active?.getAttribute('aria-label') || active?.tagName || '').trim();
      const style = active ? window.getComputedStyle(active) : null;
      const focusMoved = activeText && activeText !== 'Download report';
      const focusVisible = Boolean(style) && style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth || '0') > 0;
      return { activeText, focusMoved: Boolean(focusMoved), focusVisible };
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
    socket.onclose = () => {
      for (const entry of pending.values()) {
        entry.reject(new Error('WebSocket closed before response'));
      }
      pending.clear();
    };
  });
}
