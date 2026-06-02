import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { assertAuditablePredictaPage } from './lib/predicta-audit-page-readiness.mjs';

const phaseName =
  'PREDICTA_AUDIT_1_PHASE_7F_CROSS_PLATFORM_VISUAL_PARITY_AND_INTELLIGENCE_UI_PATTERN';
const baseUrl = process.env.PREDICTA_AUDIT_BASE_URL ?? 'http://127.0.0.1:3009';
const auditRoot = 'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX';
const phaseRoot = join(
  auditRoot,
  'phase-7f-cross-platform-visual-parity-intelligence-pattern',
);
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
  { label: 'vedic', marker: 'vedic', path: '/dashboard/vedic' },
  { label: 'kp', marker: 'kp', path: '/dashboard/kp' },
  { label: 'jaimini', marker: 'jaimini', path: '/dashboard/jaimini' },
  { label: 'numerology', marker: 'numerology', path: '/dashboard/numerology' },
  { label: 'signature', marker: 'signature', path: '/dashboard/signature' },
  { label: 'life-atlas', marker: 'life-atlas', path: '/dashboard/report' },
];

const viewports = [
  { height: 1100, name: 'desktop', width: 1440 },
  { height: 1112, name: 'tablet', width: 834 },
  { height: 844, name: 'mobile', width: 390 },
];

const sourceFiles = {
  contract: readFileSync(
    'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-7f-cross-platform-visual-parity-intelligence-pattern/cross-platform-intelligence-pattern-contract.md',
    'utf8',
  ),
  globals: readFileSync('apps/web/app/globals.css', 'utf8'),
  mobileRhythm: readFileSync('apps/mobile/src/components/IntelligenceRhythmCard.tsx', 'utf8'),
  packageJson: readFileSync('package.json', 'utf8'),
  pdf: readFileSync('packages/pdf/src/index.ts', 'utf8'),
  sharedPattern: readFileSync('packages/astrology/src/predictaIntelligenceUiPattern.ts', 'utf8'),
  webDossier: readFileSync('apps/web/components/WebDossierPreview.tsx', 'utf8'),
  webFrame: readFileSync('apps/web/components/PredictaWorldFrame.tsx', 'utf8'),
};

const mobileScreens = [
  'apps/mobile/src/components/VedicIntelligencePanel.tsx',
  'apps/mobile/src/components/KpPredictaPanel.tsx',
  'apps/mobile/src/screens/JaiminiPredictaScreen.tsx',
  'apps/mobile/src/screens/NumerologyPredictaScreen.tsx',
  'apps/mobile/src/screens/SignaturePredictaScreen.tsx',
  'apps/mobile/src/screens/ReportScreen.tsx',
];

const failures = [];
const checks = [];

for (const phrase of [
  'Prediction first',
  'Evidence second',
  'Action and guidance third',
  'Safety and limits last',
  'PREDICTA_SCHOOL_INTELLIGENCE_PATTERN',
  'forbidden',
  'startsWith',
]) {
  assertIncludes(sourceFiles.sharedPattern, phrase, `shared pattern includes ${phrase}`);
}

for (const school of ['VEDIC', 'KP', 'JAIMINI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS']) {
  assertIncludes(sourceFiles.sharedPattern, `${school}:`, `shared pattern includes ${school}`);
}

for (const phrase of [
  'data-audit1-phase7f-intelligence-pattern',
  'PREDICTA_INTELLIGENCE_UI_RHYTHM',
  'getPredictaSchoolIntelligencePattern',
  'predicta-intelligence-pattern',
]) {
  assertIncludes(sourceFiles.webFrame + sourceFiles.webDossier + sourceFiles.globals, phrase, `web includes ${phrase}`);
}

for (const file of mobileScreens) {
  const source = readFileSync(file, 'utf8');
  assertIncludes(source, 'IntelligenceRhythmCard', `${file} uses IntelligenceRhythmCard`);
}

for (const phrase of [
  'PREDICTA READING FLOW',
  'getPredictaSchoolIntelligencePattern',
  'PREDICTA_INTELLIGENCE_UI_RHYTHM',
]) {
  assertIncludes(sourceFiles.mobileRhythm, phrase, `mobile rhythm includes ${phrase}`);
}

for (const phrase of [
  'KP Event Verdict and Prediction',
  'What Jaimini is predicting',
  'Your Number Signature',
  'What your signature is reflecting',
  'Predicta Life Atlas:',
  'Vedic prediction',
]) {
  assertIncludes(sourceFiles.pdf, phrase, `PDF keeps prediction-first report content: ${phrase}`);
}

for (const banned of [
  'internal system document',
  'toolkit for the user',
  'how to read this report',
]) {
  if (sourceFiles.pdf.toLowerCase().includes(banned)) {
    failures.push(`PDF source contains banned user-facing phrase: ${banned}`);
  }
}

assertIncludes(
  sourceFiles.packageJson,
  '"test:audit1-phase-7f": "node scripts/run-audit1-phase-7f-cross-platform-visual-parity-intelligence-gate.mjs"',
  'package exposes Phase 7F gate',
);

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for Phase 7F visual parity gate.');
}

mkdirSync(screenshotRoot, { recursive: true });

const port = 9900 + Math.floor(Math.random() * 300);
const userDataDir = join(tmpdir(), `predicta-audit1-phase7f-chrome-${Date.now()}`);
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
        const metrics = await evaluatePatternParity(cdp, route);
        const screenshot = await cdp.send('Page.captureScreenshot', {
          captureBeyondViewport: false,
          format: 'png',
          fromSurface: true,
        });
        const fileName = `${viewport.name}-${route.label}-intelligence-pattern.png`;
        writeFileSync(join(screenshotRoot, fileName), Buffer.from(screenshot.data, 'base64'));

        checks.push({
          fileName,
          finalUrl: readiness.finalUrl,
          route: route.path,
          viewport: viewport.name,
          viewportWidth: viewport.width,
          ...metrics.summary,
        });

        if (metrics.summary.horizontalOverflow > 0) {
          failures.push(`${viewport.name} ${route.path}: page is ${metrics.summary.horizontalOverflow}px wider than viewport.`);
        }
        if (!metrics.summary.hasPattern) {
          failures.push(`${viewport.name} ${route.path}: missing Phase 7F intelligence pattern marker ${route.marker}.`);
        }
        if (metrics.summary.patternStepCount < 4) {
          failures.push(`${viewport.name} ${route.path}: intelligence pattern must expose four rhythm steps.`);
        }
        if (!metrics.summary.hasPredictionFirst || !metrics.summary.hasEvidenceSecond || !metrics.summary.hasActionThird || !metrics.summary.hasSafetyLast) {
          failures.push(`${viewport.name} ${route.path}: rhythm labels are incomplete.`);
        }
        if (metrics.summary.clippedText > 0) {
          failures.push(`${viewport.name} ${route.path}: clips ${metrics.summary.clippedText} visible text nodes.`);
        }
        for (const item of metrics.wideElements) {
          failures.push(`${viewport.name} ${route.path}: ${item.selector} extends beyond viewport (${item.left}..${item.right}).`);
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
  sourceChecks: {
    mobileScreens,
    sharedPattern: 'packages/astrology/src/predictaIntelligenceUiPattern.ts',
    webFrame: 'apps/web/components/PredictaWorldFrame.tsx',
  },
  status: failures.length ? 'failed' : 'green',
};

writeFileSync(
  join(phaseRoot, 'phase-7f-cross-platform-visual-parity-intelligence-manifest.json'),
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

console.log(`${phaseName} passed: web/mobile/PDF/report intelligence rhythm, screenshots, school boundaries, and overflow checks are green.`);

function assertIncludes(source, phrase, label) {
  if (!source.includes(phrase)) {
    failures.push(label);
  }
}

async function evaluatePatternParity(cdp, route) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const route = ${JSON.stringify(route)};
      const viewportWidth = document.documentElement.clientWidth;
      const body = document.body;
      const root = document.documentElement;
      const wideElements = [];
      const clippedText = [];
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

      function directText(element) {
        return [...element.childNodes]
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent.trim())
          .filter(Boolean)
          .join(' ');
      }

      for (const element of [...document.body.querySelectorAll('*')]) {
        if (!isVisible(element)) continue;
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        const overflowX = style.overflowX;
        const isScrollRegion = ['auto', 'scroll'].includes(overflowX);
        if (!isScrollRegion && rect.width > 2 && (rect.left < -1 || rect.right > viewportWidth + 1)) {
          wideElements.push({
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            selector: selectorFor(element),
          });
        }
        const text = directText(element);
        if (text.length >= 3 && element.scrollWidth > element.clientWidth + 2 && !['auto', 'scroll'].includes(overflowX)) {
          clippedText.push({
            selector: selectorFor(element),
            text,
          });
        }
      }

      const pattern = document.querySelector('[data-audit1-phase7f-intelligence-pattern="' + route.marker + '"]') ||
        document.querySelector('[data-audit1-phase7f-intelligence-pattern]');
      const patternText = pattern ? pattern.textContent : '';
      const patternSteps = pattern ? pattern.querySelectorAll('.predicta-intelligence-step').length : 0;

      return {
        summary: {
          clippedText: clippedText.length,
          hasActionThird: /Action and guidance third/i.test(patternText),
          hasEvidenceSecond: /Evidence second/i.test(patternText),
          hasPattern: Boolean(pattern),
          hasPredictionFirst: /Prediction first/i.test(patternText),
          hasSafetyLast: /Safety and limits last/i.test(patternText),
          horizontalOverflow: Math.max(0, Math.ceil(Math.max(root.scrollWidth, body.scrollWidth) - viewportWidth)),
          patternStepCount: patternSteps,
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
  await delay(800);
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
