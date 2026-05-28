import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assertAuditablePredictaPage } from './lib/predicta-audit-page-readiness.mjs';

const phaseName = 'PREDICTA_AUDIT_1_PHASE_8_OVERLAY_FORM_AND_ACCESSIBILITY_GATE';
const baseUrl = process.env.PREDICTA_AUDIT_BASE_URL ?? 'http://127.0.0.1:3009';
const phaseRoot = join(
  'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX',
  'phase-8-overlay-form-accessibility-gate',
);
const screenshotRoot = join(phaseRoot, 'screenshots');
const manifestPath = join(phaseRoot, 'phase-8-overlay-form-accessibility-manifest.json');
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
  { label: 'report', path: '/dashboard/report' },
  { label: 'signature', path: '/dashboard/signature?signatureAudit=ready' },
  { label: 'account', path: '/dashboard/account' },
  { label: 'checkout', path: '/checkout?productId=pridicta_premium_pdf' },
  { label: 'feedback', path: '/feedback' },
];

const viewports = [
  { height: 1100, mobile: false, name: 'desktop', width: 1440 },
  { height: 1112, mobile: false, name: 'tablet', width: 834 },
  { height: 844, mobile: true, name: 'mobile', width: 390 },
];

const failures = [];
const checks = [];

function read(relativePath) {
  return readFileSync(relativePath, 'utf8');
}

function assertIncludes(source, required, label) {
  for (const item of required) {
    assert.ok(source.includes(item), `${label} must include ${item}`);
  }
}

const sources = {
  authDialog: read('apps/web/components/AuthDialog.tsx'),
  destructiveDialog: read('apps/web/components/BrandedDestructiveDialog.tsx'),
  dossier: read('apps/web/components/WebDossierPreview.tsx'),
  focusTrap: read('apps/web/lib/use-dialog-focus-trap.ts'),
  globals: read('apps/web/app/globals.css'),
  languageSelector: read('apps/web/components/WebLanguageSelector.tsx'),
  mobilePaywall: read('apps/mobile/src/screens/PaywallScreen.tsx'),
  mobileReport: read('apps/mobile/src/screens/ReportScreen.tsx'),
  mobileSettings: read('apps/mobile/src/screens/SettingsScreen.tsx'),
  packageJson: read('package.json'),
  readme: read('docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/README.md'),
  roadmap: read('docs/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md'),
  savedKundlis: read('apps/web/components/WebSavedKundlis.tsx'),
  timeline: read('apps/web/components/WebLifeTimelinePanel.tsx'),
  contract: read(
    'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-8-overlay-form-accessibility-gate/overlay-form-accessibility-contract.md',
  ),
};

assertIncludes(sources.packageJson, [
  '"test:audit1-phase-8": "node scripts/run-audit1-phase-8-overlay-form-accessibility-gate.mjs"',
], 'package Phase 8 script');
assertIncludes(sources.roadmap, [phaseName, 'test:audit1-phase-8'], 'Phase 8 roadmap');
assertIncludes(sources.readme, [
  phaseName,
  'phase-8-overlay-form-accessibility-gate',
  'overlay-form-accessibility-contract.md',
], 'Phase 8 README');
assertIncludes(sources.contract, [
  'Focus Trap Contract',
  'Scroll And Layer Contract',
  'Selector And Disclosure Contract',
  'Form Contract',
  'Cross-Platform Touch Contract',
  'Evidence Contract',
], 'Phase 8 contract');
assertIncludes(sources.focusTrap, [
  'previousFocus',
  "event.key === 'Escape'",
  "event.key !== 'Tab'",
  'document.body.style.overflow',
  'previousBodyOverflow',
], 'shared dialog focus trap');

for (const [label, source] of [
  ['auth dialog', sources.authDialog],
  ['destructive dialog', sources.destructiveDialog],
  ['saved Kundli preview dialog', sources.savedKundlis],
  ['life timeline help dialog', sources.timeline],
]) {
  assertIncludes(source, [
    'useDialogFocusTrap',
    'aria-modal="true"',
    'role="dialog"',
  ], label);
}

assertIncludes(sources.dossier, [
  'useDialogFocusTrap',
  'downloadDialogRef',
  'downloadDialogPrimaryRef',
  'aria-describedby="report-download-dialog-body"',
  'aria-modal="true"',
  'role="dialog"',
  'cancelDownloadDialog',
], 'report download dialog');
assertIncludes(sources.languageSelector, [
  'role="radiogroup"',
  'role="radio"',
  'aria-checked',
  'ArrowRight',
  'ArrowLeft',
  "event.key === 'Home'",
  "event.key === 'End'",
], 'language selector keyboard contract');
assertIncludes(sources.mobileReport, [
  'accessibilityRole="checkbox"',
  'accessibilityState={{',
  'selected: builderMode',
  'selected: option.code === reportLanguage',
], 'mobile report selected/checked states');
assertIncludes(sources.mobileSettings, [
  'accessibilityState={{ selected:',
  'min-h-[44px]',
], 'mobile settings language touch target');
assertIncludes(sources.mobilePaywall, [
  'min-h-[44px] items-center justify-center',
], 'mobile paywall secondary action touch target');

for (const requiredCss of [
  '.language-options button',
  'min-height: var(--predicta-touch-target);',
  '.info-help-button',
  'height: var(--predicta-touch-target);',
  '.chat-reply-action',
  '.chat-star-button',
  '.chat-utility-menu summary',
]) {
  assert.ok(sources.globals.includes(requiredCss), `global CSS must include ${requiredCss}`);
}

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for Phase 8 overlay/form accessibility gate.');
}

mkdirSync(screenshotRoot, { recursive: true });

const port = 10_600 + Math.floor(Math.random() * 300);
const userDataDir = join(tmpdir(), `predicta-audit1-phase8-chrome-${Date.now()}`);
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

try {
  await waitForChrome(port);

  for (const viewport of viewports) {
    for (const route of routes) {
      const url = `${baseUrl}${route.path}`;
      console.log(`Auditing ${viewport.name} ${route.path}`);
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
        await navigateAndWait(cdp, url);
        await cdp.send('Runtime.evaluate', {
          awaitPromise: true,
          expression:
            'document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 4000))]) : true',
        });

        const readiness = await assertAuditablePredictaPage(cdp, {
          route: route.path.split('?')[0],
          url,
        });
        const metrics = await evaluateAccessibility(cdp);
        const keyboard = await evaluateLanguageKeyboard(cdp);
        const screenshot = await cdp.send('Page.captureScreenshot', {
          captureBeyondViewport: false,
          format: 'png',
          fromSurface: true,
        });
        const fileName = `${viewport.name}-${route.label}-overlay-form-accessibility.png`;
        writeFileSync(join(screenshotRoot, fileName), Buffer.from(screenshot.data, 'base64'));

        checks.push({
          fileName,
          finalUrl: readiness.finalUrl,
          route: route.path,
          viewport: viewport.name,
          viewportWidth: viewport.width,
          ...metrics.summary,
          languageKeyboardChecked: keyboard.checked,
        });

        if (metrics.summary.horizontalOverflow > 0) {
          failures.push(`${viewport.name} ${route.path}: horizontal overflow of ${metrics.summary.horizontalOverflow}px.`);
        }
        if (metrics.summary.smallTargets.length) {
          failures.push(`${viewport.name} ${route.path}: touch targets below 44px: ${formatSamples(metrics.summary.smallTargets)}.`);
        }
        if (metrics.summary.unnamedControls.length) {
          failures.push(`${viewport.name} ${route.path}: form controls missing accessible names: ${formatSamples(metrics.summary.unnamedControls)}.`);
        }
        if (metrics.summary.badDialogs.length) {
          failures.push(`${viewport.name} ${route.path}: visible dialogs fail ARIA contract: ${formatSamples(metrics.summary.badDialogs)}.`);
        }
        if (metrics.summary.languageGroups > 0 && !keyboard.passed) {
          failures.push(`${viewport.name} ${route.path}: language selector keyboard contract failed (${keyboard.reason}).`);
        }
      } finally {
        await cdp.close();
        await closeTarget(port, page.id).catch(() => undefined);
      }
    }
  }
} finally {
  chrome.kill('SIGTERM');
  await new Promise(resolve => setTimeout(resolve, 500));
  rmSync(userDataDir, {
    force: true,
    maxRetries: 5,
    recursive: true,
    retryDelay: 200,
  });
}

const manifest = {
  checks,
  failures,
  generatedAt: new Date().toISOString(),
  phaseName,
  routes,
  viewports,
};
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

if (failures.length) {
  console.error(failures.map(failure => `- ${failure}`).join('\n'));
  throw new Error(`${phaseName} failed with ${failures.length} finding(s).`);
}

console.log(`${phaseName} passed.`);
console.log(`Manifest: ${manifestPath}`);

function formatSamples(samples) {
  return samples
    .slice(0, 6)
    .map(sample => `${sample.label} (${Math.round(sample.width)}x${Math.round(sample.height)})`)
    .join(', ');
}

async function evaluateAccessibility(cdp) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `Promise.resolve((() => {
      const visible = element => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity) > 0 &&
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom >= 0 &&
          rect.right >= 0 &&
          rect.top <= window.innerHeight &&
          rect.left <= window.innerWidth;
      };
      const labelFor = element => {
        const id = element.id;
        const labelledBy = element.getAttribute('aria-labelledby');
        const name = element.getAttribute('aria-label') ||
          element.getAttribute('title') ||
          element.getAttribute('placeholder') ||
          (id ? document.querySelector(\`label[for="\${CSS.escape(id)}"]\`)?.innerText : '') ||
          (labelledBy ? document.getElementById(labelledBy)?.innerText : '') ||
          element.closest('label')?.innerText ||
          element.innerText ||
          element.textContent ||
          element.getAttribute('role') ||
          element.tagName;
        return String(name || '').replace(/\\s+/g, ' ').trim();
      };
      const controls = [...document.querySelectorAll('button, a[href], input, select, textarea, summary, [role="button"], [role="checkbox"], [role="radio"]')]
        .filter(visible)
        .filter(element => !element.matches('[aria-hidden="true"] *'));
      const smallTargets = controls
        .filter(element => !element.hasAttribute('disabled') && element.getAttribute('aria-disabled') !== 'true')
        .map(element => {
          const rect = element.getBoundingClientRect();
          return {
            height: rect.height,
            label: labelFor(element).slice(0, 80) || element.tagName,
            tag: element.tagName.toLowerCase(),
            width: rect.width,
          };
        })
        .filter(item => item.width < 44 || item.height < 44);
      const unnamedControls = [...document.querySelectorAll('input, select, textarea')]
        .filter(visible)
        .map(element => ({
          height: element.getBoundingClientRect().height,
          label: labelFor(element),
          tag: element.tagName.toLowerCase(),
          width: element.getBoundingClientRect().width,
        }))
        .filter(item => !item.label || /^(input|select|textarea)$/i.test(item.label));
      const badDialogs = [...document.querySelectorAll('[role="dialog"]')]
        .filter(visible)
        .map(element => {
          const labelledBy = element.getAttribute('aria-labelledby');
          const hasLabel =
            Boolean(element.getAttribute('aria-label')) ||
            Boolean(labelledBy && document.getElementById(labelledBy)?.innerText.trim());
          const rect = element.getBoundingClientRect();
          return {
            height: rect.height,
            label: labelFor(element).slice(0, 80) || 'dialog',
            modal: element.getAttribute('aria-modal'),
            width: rect.width,
            valid: element.getAttribute('aria-modal') === 'true' && hasLabel,
          };
        })
        .filter(item => !item.valid);
      const focusProbe = controls[0];
      const hasVisibleFocusStyle = [...document.styleSheets].some(sheet => {
        try {
          return [...sheet.cssRules].some(rule => String(rule.cssText || '').includes(':focus-visible'));
        } catch {
          return false;
        }
      }) || Boolean(focusProbe);
      return {
        summary: {
          badDialogs,
          controlCount: controls.length,
          hasVisibleFocusStyle,
          horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
          languageGroups: document.querySelectorAll('.language-options[role="radiogroup"]').length,
          smallTargets,
          unnamedControls,
        },
      };
    })())`,
    returnByValue: true,
  });

  return response.result.value;
}

async function evaluateLanguageKeyboard(cdp) {
  const beforeResponse = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `Promise.resolve((() => {
      const isVisible = element => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom >= 0 &&
          rect.right >= 0 &&
          rect.top <= window.innerHeight &&
          rect.left <= window.innerWidth;
      };
      const group = [...document.querySelectorAll('.language-options[role="radiogroup"]')]
        .find(isVisible);
      if (!group) {
        return { checked: false, passed: true, reason: 'no language selector on route' };
      }
      const active = group.querySelector('[role="radio"][aria-checked="true"]');
      const radios = [...group.querySelectorAll('[role="radio"]')];
      if (!active || radios.length < 2) {
        return { checked: true, passed: false, reason: 'missing active radio options' };
      }
      active.focus();
      return { before: active.textContent.trim(), checked: true, ready: true };
    })())`,
    returnByValue: true,
  });
  const before = beforeResponse.result.value;

  if (!before.ready) {
    return before;
  }

  await cdp.send('Input.dispatchKeyEvent', {
    code: 'ArrowRight',
    key: 'ArrowRight',
    type: 'keyDown',
    windowsVirtualKeyCode: 39,
  });
  await cdp.send('Input.dispatchKeyEvent', {
    code: 'ArrowRight',
    key: 'ArrowRight',
    type: 'keyUp',
    windowsVirtualKeyCode: 39,
  });
  await new Promise(resolve => setTimeout(resolve, 80));

  const afterResponse = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `Promise.resolve((() => {
      const isVisible = element => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          rect.width > 0 &&
          rect.height > 0 &&
          rect.bottom >= 0 &&
          rect.right >= 0 &&
          rect.top <= window.innerHeight &&
          rect.left <= window.innerWidth;
      };
      const group = [...document.querySelectorAll('.language-options[role="radiogroup"]')]
        .find(isVisible);
      const after = group.querySelector('[role="radio"][aria-checked="true"]')?.textContent.trim();
      const focusedRole = document.activeElement?.getAttribute('role');
      return {
        after,
        before: ${JSON.stringify(before.before)},
        checked: true,
        focusedRole,
        passed: Boolean(after && after !== ${JSON.stringify(before.before)} && focusedRole === 'radio'),
        reason: after === ${JSON.stringify(before.before)} ? 'ArrowRight did not change selection' : 'ok',
      };
    })())`,
    returnByValue: true,
  });

  return afterResponse.result.value;
}

async function navigateAndWait(cdp, url) {
  const lifecyclePromise = new Promise(resolve => {
    const listener = event => {
      if (event.name === 'networkIdle' || event.name === 'load') {
        cdp.off('Page.lifecycleEvent', listener);
        resolve();
      }
    };
    cdp.on('Page.lifecycleEvent', listener);
  });

  await cdp.send('Page.setLifecycleEventsEnabled', { enabled: true });
  await cdp.send('Page.navigate', { url });
  await Promise.race([lifecyclePromise, new Promise(resolve => setTimeout(resolve, 7000))]);
}

async function waitForChrome(debugPort) {
  const started = Date.now();

  while (Date.now() - started < 15_000) {
    try {
      await httpJson(`http://127.0.0.1:${debugPort}/json/version`);
      return;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }

  throw new Error('Timed out waiting for headless Chrome.');
}

async function createTarget(debugPort, url) {
  return httpJson(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(url)}`, {
    method: 'PUT',
  });
}

async function closeTarget(debugPort, targetId) {
  if (!targetId) {
    return undefined;
  }

  return httpJson(`http://127.0.0.1:${debugPort}/json/close/${encodeURIComponent(targetId)}`);
}

function httpJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const request = httpRequest(url, { method: options.method ?? 'GET' }, response => {
      let body = '';

      response.setEncoding('utf8');
      response.on('data', chunk => {
        body += chunk;
      });
      response.on('end', () => {
        if (!response.statusCode || response.statusCode >= 400) {
          reject(new Error(`HTTP ${response.statusCode}: ${body}`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on('error', reject);
    request.end();
  });
}

function connectWebSocket(webSocketDebuggerUrl) {
  const socket = new WebSocket(webSocketDebuggerUrl);
  let nextId = 1;
  const pending = new Map();
  const listeners = new Map();

  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);

    if (message.id && pending.has(message.id)) {
      const { reject, resolve } = pending.get(message.id);
      pending.delete(message.id);

      if (message.error) {
        reject(new Error(message.error.message));
      } else {
        resolve(message.result ?? {});
      }
      return;
    }

    if (message.method && listeners.has(message.method)) {
      for (const listener of listeners.get(message.method)) {
        listener(message.params ?? {});
      }
    }
  });

  return new Promise((resolve, reject) => {
    socket.addEventListener('open', () => {
      resolve({
        close() {
          socket.close();
        },
        off(method, listener) {
          const set = listeners.get(method);
          if (set) {
            set.delete(listener);
          }
        },
        on(method, listener) {
          if (!listeners.has(method)) {
            listeners.set(method, new Set());
          }
          listeners.get(method).add(listener);
        },
        send(method, params = {}) {
          const id = nextId++;
          socket.send(JSON.stringify({ id, method, params }));
          return new Promise((resolveSend, rejectSend) => {
            const timer = setTimeout(() => {
              pending.delete(id);
              rejectSend(new Error(`CDP command timed out: ${method}`));
            }, 15_000);

            pending.set(id, {
              reject(error) {
                clearTimeout(timer);
                rejectSend(error);
              },
              resolve(value) {
                clearTimeout(timer);
                resolveSend(value);
              },
            });
          });
        },
      });
    });
    socket.addEventListener('error', reject);
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
      response.on('end', () => resolve(body));
      response.on('error', reject);
    }).on('error', reject);
  });
}
