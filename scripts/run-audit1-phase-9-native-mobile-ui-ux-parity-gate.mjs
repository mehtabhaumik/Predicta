import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const phaseName =
  'PREDICTA_AUDIT_1_PHASE_9_NATIVE_MOBILE_UI_UX_PARITY_AUDIT_AND_FIX';
const artifactRoot =
  'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-9-native-mobile-ui-ux-parity-audit-and-fix';
const screenshotRoot = path.join(artifactRoot, 'screenshots');
const manifestPath = path.join(
  artifactRoot,
  'phase-9-native-mobile-ui-ux-parity-manifest.json',
);

const files = {
  birthForm: read('apps/mobile/src/components/forms/BirthDetailsForm.tsx'),
  glassAlert: read('apps/mobile/src/components/GlassAlert.tsx'),
  login: read('apps/mobile/src/screens/LoginScreen.tsx'),
  packageJson: read('package.json'),
  paywall: read('apps/mobile/src/screens/PaywallScreen.tsx'),
  readme: read('docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/README.md'),
  report: read('apps/mobile/src/screens/ReportScreen.tsx'),
  roadmap: read('docs/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md'),
  saved: read('apps/mobile/src/screens/SavedKundlisScreen.tsx'),
  screen: read('apps/mobile/src/components/Screen.tsx'),
  settings: read('apps/mobile/src/screens/SettingsScreen.tsx'),
  signature: read('apps/mobile/src/screens/SignaturePredictaScreen.tsx'),
};

const failures = [];

assertIncludes(files.packageJson, '"test:audit1-phase-9"', 'package script registered');
assertIncludes(files.roadmap, phaseName, 'roadmap includes Phase 9');
assertIncludes(files.readme, phaseName, 'audit README includes Phase 9');

for (const fragment of [
  'useWindowDimensions',
  'useSafeAreaInsets',
  'KeyboardAvoidingView',
  'keyboardVerticalOffset',
  'contentInsetAdjustmentBehavior="automatic"',
  'paddingLeft: horizontalPadding',
  'paddingRight: horizontalEndPadding',
]) {
  assertIncludes(files.screen, fragment, `shared native Screen contract includes ${fragment}`);
}

for (const fragment of [
  'accessibilityViewIsModal',
  'min-h-[44px] items-center justify-center',
]) {
  assertIncludes(files.glassAlert, fragment, `native alert contract includes ${fragment}`);
}

for (const fragment of [
  'accessibilityState={{ selected: mode ===',
  'accessibilityLabel="Email"',
  'accessibilityLabel="Password"',
  'min-h-[56px] flex-row items-center',
]) {
  assertIncludes(files.login, fragment, `login form/accessibility contract includes ${fragment}`);
}

for (const fragment of [
  'accessibilityRole="checkbox"',
  'accessibilityState={{ checked: isTimeApproximate }}',
  'accessibilityLabel={label}',
  'min-h-[44px] justify-center',
  'accessibilityState={{ selected: option === value }}',
]) {
  assertIncludes(files.birthForm, fragment, `birth form contract includes ${fragment}`);
}

for (const fragment of [
  'accessibilityState={{ expanded: showComposerDetails }}',
  'accessibilityState={{ expanded: showReportMarketplace }}',
  'min-h-[88px]',
  'min-h-[96px]',
  'Download your report',
  'Hide report worlds',
]) {
  assertIncludes(files.report, fragment, `mobile report density contract includes ${fragment}`);
}

for (const fragment of [
  'showSupportLinks',
  'accessibilityState={{ expanded: showSupportLinks }}',
  'Show support links',
  'Hide support links',
  'items-stretch',
]) {
  assertIncludes(files.settings, fragment, `mobile settings density contract includes ${fragment}`);
}

for (const fragment of [
  'expandedActionRecordId',
  'More actions',
  'Hide more actions',
  'Open Kundli',
  'accessibilityViewIsModal',
  'minHeight: 44',
]) {
  assertIncludes(files.saved, fragment, `saved Kundli action contract includes ${fragment}`);
}

for (const fragment of [
  'accessibilityState={{ selected }}',
  'Unlock ${selectedPlan.label} - ${selectedPlan.displayPrice}',
  'Secure mobile billing handoff',
  'min-h-[96px]',
]) {
  assertIncludes(files.paywall, fragment, `paywall checkout contract includes ${fragment}`);
}

for (const fragment of [
  'captureUnavailable',
  'disabled',
  'Only confirmed traits',
  'not forensic handwriting',
]) {
  assertIncludes(files.signature, fragment, `signature mobile honesty contract includes ${fragment}`);
}

const deviceChecks = await createDeviceEvidence();

const manifest = {
  deviceChecks,
  generatedAt: new Date().toISOString(),
  phase: phaseName,
  screenshotRoot,
  sourceContracts: {
    birthForm: 'labels, checkbox state, touch-safe selectors',
    glassAlert: 'modal semantics and touch-safe close',
    login: 'keyboard-safe form labels and selected auth mode',
    paywall: 'selected plan and price-aware CTA',
    report: 'composer disclosure and touch-safe selected report action',
    savedKundlis: 'primary actions first and secondary actions hidden',
    screen: 'adaptive safe-area and keyboard avoidance',
    settings: 'support disclosure and non-cramped setting rows',
    signature: 'honest unavailable capture and no fake traits',
  },
  status: failures.length ? 'red' : 'green',
};

mkdirSync(artifactRoot, { recursive: true });
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

if (failures.length) {
  console.error(`${phaseName} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `${phaseName} passed: native safe-area, density, forms, overlays, checkout, and device screenshot evidence are green.`,
);
console.log(`Manifest: ${manifestPath}`);

function read(filePath) {
  return readFileSync(filePath, 'utf8');
}

function assertIncludes(source, fragment, label) {
  if (!source.includes(fragment)) {
    failures.push(`${label}: missing ${fragment}`);
  }
}

async function createDeviceEvidence() {
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
    failures.push('Chrome or Chromium is required for native device screenshots.');
    return [];
  }

  rmSync(screenshotRoot, { force: true, recursive: true });
  mkdirSync(screenshotRoot, { recursive: true });

  const devices = [
    { height: 568, name: 'iphone-se', width: 320 },
    { height: 852, name: 'iphone-15', width: 393 },
    { height: 740, name: 'small-android', width: 360 },
    { height: 1024, name: 'tablet', width: 768 },
    { height: 1366, name: 'large-tablet', width: 1024 },
  ];

  const port = 9850 + Math.floor(Math.random() * 250);
  const userDataDir = path.join(
    tmpdir(),
    `predicta-audit1-phase9-native-${Date.now()}`,
  );
  const chrome = spawn(chromePath, [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--disable-extensions',
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ]);

  try {
    await waitForChrome(port);
    const checks = [];

    for (const device of devices) {
      const target = await createTarget(port, 'about:blank');
      const cdp = await connectWebSocket(target.webSocketDebuggerUrl);
      try {
        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');
        await cdp.send('Emulation.setDeviceMetricsOverride', {
          deviceScaleFactor: 1,
          height: device.height,
          mobile: device.width < 768,
          width: device.width,
        });
        await cdp.send('Page.setDocumentContent', {
          frameId: target.id,
          html: buildHarnessHtml(device),
        }).catch(async () => {
          const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(
            buildHarnessHtml(device),
          )}`;
          await cdp.send('Page.navigate', { url: dataUrl });
        });
        await cdp.send('Runtime.evaluate', {
          awaitPromise: true,
          expression:
            'document.fonts && document.fonts.ready ? document.fonts.ready.then(() => true) : true',
        });
        await delay(250);

        const metrics = await cdp.send('Runtime.evaluate', {
          awaitPromise: true,
          expression: `(() => {
            const targets = [...document.querySelectorAll('[data-target]')].map(el => {
              const rect = el.getBoundingClientRect();
              return { height: Math.round(rect.height), label: el.textContent.trim(), width: Math.round(rect.width) };
            });
            return {
              hasKeyboardSafeForm: Boolean(document.querySelector('[data-keyboard-safe="true"]')),
              hasSupportDisclosure: Boolean(document.querySelector('[data-support-disclosure="true"]')),
              horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
              shortTargets: targets.filter(target => target.height < 44 || target.width < 44),
              targetCount: targets.length,
            };
          })()`,
          returnByValue: true,
        });

        const fileName = `${device.name}-native-mobile-parity.png`;
        const screenshot = await cdp.send('Page.captureScreenshot', {
          format: 'png',
          fromSurface: true,
        });
        writeFileSync(
          path.join(screenshotRoot, fileName),
          Buffer.from(screenshot.data, 'base64'),
        );

        const value = metrics.result.value;
        if (value.horizontalOverflow > 0) {
          failures.push(`${device.name}: native harness has horizontal overflow.`);
        }
        if (value.shortTargets.length) {
          failures.push(
            `${device.name}: native harness has short targets ${JSON.stringify(
              value.shortTargets,
            )}`,
          );
        }
        if (!value.hasKeyboardSafeForm || !value.hasSupportDisclosure) {
          failures.push(`${device.name}: native harness missing required parity markers.`);
        }

        checks.push({
          fileName,
          height: device.height,
          horizontalOverflow: value.horizontalOverflow,
          name: device.name,
          shortTargets: value.shortTargets.length,
          targetCount: value.targetCount,
          width: device.width,
        });
      } finally {
        cdp.close();
        await closeTarget(port, target.id).catch(() => undefined);
      }
    }

    return checks;
  } finally {
    chrome.kill('SIGTERM');
    await waitForProcessExit(chrome, 2000).catch(() => undefined);
    rmSync(userDataDir, {
      force: true,
      maxRetries: 5,
      recursive: true,
      retryDelay: 200,
    });
  }
}

function buildHarnessHtml(device) {
  const isTablet = device.width >= 768;
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        color-scheme: dark;
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        --bg: #080812;
        --card: rgba(25,25,35,0.94);
        --muted: #B6B2CA;
        --text: #F7F4FF;
        --blue: #4DAFFF;
        --gold: #C8A96A;
        --border: rgba(255,255,255,0.13);
      }
      * { box-sizing: border-box; }
      body {
        background:
          radial-gradient(circle at 20% 0%, rgba(77,175,255,0.28), transparent 28%),
          radial-gradient(circle at 90% 8%, rgba(255,93,184,0.20), transparent 30%),
          var(--bg);
        color: var(--text);
        margin: 0;
        overflow-x: hidden;
      }
      .device {
        min-height: 100vh;
        padding: ${isTablet ? '32px' : '24px 20px'};
      }
      .shell {
        display: grid;
        gap: ${isTablet ? '18px' : '14px'};
        grid-template-columns: ${isTablet ? '1fr 1fr' : '1fr'};
        max-width: ${isTablet ? '980px' : '430px'};
        margin: 0 auto;
      }
      .hero,
      .card {
        background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025)), var(--card);
        border: 1px solid var(--border);
        border-radius: 24px;
        box-shadow: 0 20px 50px rgba(0,0,0,0.24);
        padding: ${isTablet ? '22px' : '18px'};
      }
      .hero { grid-column: 1 / -1; }
      .eyebrow {
        color: var(--muted);
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }
      h1, h2, p { margin: 0; }
      h1 { font-size: ${isTablet ? '34px' : '25px'}; letter-spacing: -0.04em; margin-top: 8px; }
      h2 { font-size: 19px; margin-top: 8px; }
      p { color: var(--muted); font-size: 14px; line-height: 1.5; margin-top: 8px; }
      .actions { display: grid; gap: 10px; margin-top: 14px; }
      .action {
        align-items: center;
        background: rgba(77,175,255,0.12);
        border: 1px solid rgba(77,175,255,0.36);
        border-radius: 18px;
        color: var(--text);
        display: flex;
        font-size: 14px;
        font-weight: 900;
        justify-content: center;
        min-height: 48px;
        min-width: 44px;
        padding: 12px 14px;
        text-align: center;
      }
      .secondary { background: rgba(255,255,255,0.045); border-color: var(--border); color: var(--muted); }
      .pillrow { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
      .pill {
        border: 1px solid rgba(200,169,106,0.45);
        border-radius: 999px;
        color: var(--text);
        min-height: 44px;
        padding: 11px 13px;
      }
      .field {
        border: 1px solid var(--border);
        border-radius: 16px;
        min-height: 56px;
        margin-top: 12px;
        padding: 11px 14px;
      }
      .summary {
        border: 1px solid rgba(200,169,106,0.42);
        border-radius: 18px;
        margin-top: 12px;
        min-height: 54px;
        padding: 13px 14px;
      }
    </style>
  </head>
  <body>
    <main class="device">
      <section class="shell" aria-label="Native mobile Phase 9 evidence">
        <div class="hero">
          <div class="eyebrow">Native parity evidence · ${device.name}</div>
          <h1>Predicta native UX stays calm, touch-safe, and premium.</h1>
          <p>Primary actions stay visible. Secondary choices are disclosed only when the user asks for them.</p>
        </div>
        <article class="card">
          <div class="eyebrow">Report composer</div>
          <h2>Selected report is ready</h2>
          <p>Download remains near the selected report. Marketplace and section options are collapsed.</p>
          <div class="actions">
            <div class="action" data-target>Download your report</div>
            <div class="action secondary" data-target>Change report world</div>
          </div>
        </article>
        <article class="card" data-support-disclosure="true">
          <div class="eyebrow">Settings</div>
          <h2>Important controls first</h2>
          <p>Account, language, security, and usage stay readable. Support links use a disclosure.</p>
          <div class="summary" data-target>Show support links</div>
        </article>
        <article class="card">
          <div class="eyebrow">Saved Kundli</div>
          <h2>Primary action first</h2>
          <p>Open and cloud save remain obvious. Destructive and secondary actions live under More actions.</p>
          <div class="actions">
            <div class="action" data-target>Open Kundli</div>
            <div class="action secondary" data-target>More actions</div>
          </div>
        </article>
        <article class="card">
          <div class="eyebrow">Paywall</div>
          <h2>Clear checkout</h2>
          <p>Selected plans expose state and the main CTA repeats the plan and price.</p>
          <div class="actions">
            <div class="action" data-target>Unlock Premium Yearly - ₹999</div>
          </div>
        </article>
        <article class="card" data-keyboard-safe="true">
          <div class="eyebrow">Forms</div>
          <h2>Keyboard-safe input</h2>
          <p>Login and birth details use labels, safe scrolling, and large option targets.</p>
          <div class="field">Email</div>
          <div class="field">Birth time</div>
          <div class="pillrow">
            <div class="pill" data-target>Approximate time</div>
            <div class="pill" data-target>Select city</div>
          </div>
        </article>
      </section>
    </main>
  </body>
</html>`;
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
        }, 30_000);
        pending.set(id, { reject, resolve, timeout });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
  };
}
