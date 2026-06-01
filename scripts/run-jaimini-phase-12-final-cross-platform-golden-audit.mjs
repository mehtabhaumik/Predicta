import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { assertAuditablePredictaPage } from './lib/predicta-audit-page-readiness.mjs';

const repoRoot = process.cwd();
const phaseName = 'PREDICTA_JAIMINI_PHASE_12_FINAL_CROSS_PLATFORM_GOLDEN_AUDIT';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);
const webScreenshotRoot = path.join(auditRoot, 'web-screenshots');
const mobileScreenshotRoot = path.join(auditRoot, 'mobile-screenshots');
const baseUrl = process.env.PREDICTA_AUDIT_BASE_URL ?? 'http://127.0.0.1:3009';
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

const staleActiveNadiPattern =
  /\b(Nadi Predicta|Nadi Reports|Nadi report|Nadi reading|Nadi Method|Nadi world|Nadi story|palm-leaf manuscript access)\b/i;

const webShots = [
  {
    assertions: ['Jaimini', 'KP', 'Numerology', 'Signature'],
    fileName: 'web-dashboard-navigation.png',
    id: 'dashboard-navigation',
    route: '/dashboard',
  },
  {
    assertions: ['JAIMINI PREDICTA', 'Soul', 'Ask Jaimini'],
    fileName: 'web-jaimini-room.png',
    id: 'jaimini-room',
    route: '/dashboard/jaimini',
  },
  {
    assertions: ['Jaimini', 'Predicta'],
    fileName: 'web-jaimini-chat.png',
    id: 'jaimini-chat',
    route: '/dashboard/jaimini/chat',
  },
  {
    assertions: ['Choose your report world', 'Jaimini Reports', 'Download your report'],
    fileName: 'web-report-marketplace.png',
    id: 'report-marketplace',
    route: '/dashboard/report?focus=JAIMINI&mode=PREMIUM',
  },
  {
    assertions: ['Life Atlas', 'Jaimini', 'Download your report'],
    fileName: 'web-life-atlas-composer.png',
    id: 'life-atlas-composer',
    route: '/dashboard/report?focus=LIFE_ATLAS&mode=PREMIUM',
  },
];

const mobileShots = [
  {
    assertions: ['Jaimini', 'Dashboard'],
    fileName: 'mobile-navigation.png',
    id: 'mobile-navigation',
    openMobileMenu: true,
    route: '/dashboard',
  },
  {
    assertions: ['JAIMINI PREDICTA', 'Ask Jaimini'],
    fileName: 'mobile-jaimini-room.png',
    id: 'mobile-jaimini-room',
    route: '/dashboard/jaimini',
  },
  {
    assertions: ['Jaimini Reports', 'Download your report'],
    fileName: 'mobile-report-selection.png',
    id: 'mobile-report-selection',
    route: '/dashboard/report?focus=JAIMINI&mode=PREMIUM',
  },
  {
    assertions: ['Jaimini', 'Predicta'],
    fileName: 'mobile-chat-handoff.png',
    id: 'mobile-chat-handoff',
    route: '/dashboard/jaimini/chat',
  },
];

const failures = [];
const checks = [];

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function requireFile(relativePath, minBytes = 1) {
  const fullPath = path.join(repoRoot, relativePath);
  assert.ok(existsSync(fullPath), `${relativePath} exists`);
  assert.ok(statSync(fullPath).size >= minBytes, `${relativePath} has at least ${minBytes} bytes`);
  return fullPath;
}

function requireIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), label);
  checks.push(label);
}

function requireNotIncludes(source, fragment, label) {
  assert.ok(!source.includes(fragment), label);
  checks.push(label);
}

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for the Phase 12 golden audit screenshots.');
}

mkdirSync(webScreenshotRoot, { recursive: true });
mkdirSync(mobileScreenshotRoot, { recursive: true });

const roadmap = read('docs/PREDICTA_JAIMINI_REPLACES_NADI_STRICT_ROADMAP.md');
for (const fragment of [
  phaseName,
  'web screenshots:',
  'mobile screenshots:',
  'PDF artifacts:',
  'no stale user-facing Nadi copy',
  'no Jaimini hardcoded translation drift',
  'no overflow',
  'no clipped text',
  'no cramped CTAs',
  'no broken report download',
  'no route crash',
]) {
  requireIncludes(roadmap, fragment, `roadmap locks final audit requirement: ${fragment}`);
}

const sourceContracts = [
  ['apps/web/app/dashboard/jaimini/page.tsx', 'WebJaiminiPredictaPanel'],
  ['apps/web/app/dashboard/jaimini/chat/page.tsx', "school: 'JAIMINI'"],
  ['apps/web/components/WebJaiminiPredictaPanel.tsx', 'getJaiminiLocalizationCopy'],
  ['apps/web/components/WebJaiminiPredictaPanel.tsx', 'composeJaiminiInterpretation'],
  ['apps/mobile/src/screens/JaiminiPredictaScreen.tsx', 'getJaiminiLocalizationCopy'],
  ['apps/mobile/src/screens/JaiminiPredictaScreen.tsx', "predictaSchool: 'JAIMINI'"],
  ['apps/mobile/src/screens/ReportScreen.tsx', "getOneTimeProduct('JAIMINI_REPORT')"],
  ['packages/config/src/pricing.ts', "id: 'JAIMINI'"],
  ['packages/config/src/pricing.ts', "JAIMINI_REPORT: 'pridicta_jaimini_report'"],
  ['packages/config/src/predictaMemory.ts', 'Nadi was replaced by Jaimini'],
  ['backend/astro_api/report_ai_pipeline.py', '"jaimini": ReportQAPolicy()'],
  ['backend/astro_api/red_team_evals.py', 'fake-manuscript-claim'],
];

for (const [file, fragment] of sourceContracts) {
  requireIncludes(read(file), fragment, `${file} includes ${fragment}`);
}

for (const [file, fragment] of [
  ['apps/web/components/WebJaiminiPredictaPanel.tsx', 'Nadi Predicta'],
  ['apps/mobile/src/screens/JaiminiPredictaScreen.tsx', 'Nadi Predicta'],
  ['packages/config/src/translations/jaimini.json', 'Nadi'],
]) {
  requireNotIncludes(read(file), fragment, `${file} excludes stale ${fragment}`);
}

auditReportArtifacts(
  'docs/audits/PREDICTA_JAIMINI_PHASE_7_JAIMINI_REPORTS_FREE_AND_PREMIUM',
  ['jaimini-free', 'jaimini-premium'],
);
auditReportArtifacts(
  'docs/audits/PREDICTA_JAIMINI_PHASE_8_LIFE_ATLAS_JAIMINI_EVIDENCE_LAYER',
  ['life-atlas-jaimini-free', 'life-atlas-jaimini-premium'],
);

await assertServerAvailable();

const runtimeChecks = [];
const port = 11_400 + Math.floor(Math.random() * 400);
const userDataDir = path.join(tmpdir(), `predicta-jaimini-phase12-chrome-${Date.now()}`);
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
  for (const shot of webShots) {
    runtimeChecks.push(
      await captureAndAuditRoute({
        debugPort: port,
        outputRoot: webScreenshotRoot,
        shot,
        viewport: { height: 1100, mobile: false, name: 'desktop', width: 1440 },
      }),
    );
  }
  for (const shot of mobileShots) {
    runtimeChecks.push(
      await captureAndAuditRoute({
        debugPort: port,
        outputRoot: mobileScreenshotRoot,
        shot,
        viewport: { height: 844, mobile: true, name: 'mobile', width: 390 },
      }),
    );
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

await smokeDownloadReport('docs/audits/PREDICTA_JAIMINI_PHASE_7_JAIMINI_REPORTS_FREE_AND_PREMIUM/artifacts/predicta-jaimini-free-payload.json');
await smokeDownloadReport('docs/audits/PREDICTA_JAIMINI_PHASE_8_LIFE_ATLAS_JAIMINI_EVIDENCE_LAYER/artifacts/predicta-life-atlas-jaimini-free-payload.json');

if (failures.length) {
  console.error(`${phaseName} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

const manifest = {
  baseUrl,
  generatedAt: new Date().toISOString(),
  phase: phaseName,
  runtimeChecks,
  status: 'green',
  webScreenshots: webShots.map(shot => path.relative(auditRoot, path.join(webScreenshotRoot, shot.fileName))),
  mobileScreenshots: mobileShots.map(shot => path.relative(auditRoot, path.join(mobileScreenshotRoot, shot.fileName))),
};

writeFileSync(path.join(auditRoot, 'phase-12-golden-audit-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    `${phaseName}: GREEN`,
    `baseUrl: ${baseUrl}`,
    `checks: ${checks.length}`,
    `runtimeChecks: ${runtimeChecks.length}`,
    '',
    ...checks.map(check => `- ${check}`),
    '',
  ].join('\n'),
);

console.log(JSON.stringify(manifest, null, 2));
console.log(`${phaseName} passed: final web, mobile-width, report, Life Atlas, localization, route, and PDF download audit is green.`);

function auditReportArtifacts(phaseDir, requiredIds) {
  const manifest = readJson(path.join(phaseDir, 'artifact-manifest.json'));
  assert.deepEqual(
    manifest.artifacts.map(item => item.id).sort(),
    [...requiredIds].sort(),
    `${phaseDir} has required artifact IDs`,
  );
  checks.push(`${phaseDir} has required artifact IDs`);

  for (const artifact of manifest.artifacts) {
    requireFile(path.join(phaseDir, artifact.pdf), 1_000_000);
    requireFile(path.join(phaseDir, artifact.payload), 500);
    requireFile(path.join(phaseDir, artifact.text), 500);
    assert.ok(artifact.pageCount >= (artifact.mode === 'PREMIUM' ? 10 : 7), `${artifact.id} has substantial pages`);
    const text = read(path.join(phaseDir, artifact.text));
    assert.match(text, /Jaimini/, `${artifact.id} includes Jaimini text`);
    assert.doesNotMatch(text, staleActiveNadiPattern, `${artifact.id} excludes active Nadi/palm-leaf copy`);
    for (const preview of artifact.previews) {
      requireFile(path.join(phaseDir, preview), 1_000);
    }
    checks.push(`${artifact.id} PDF, payload, text, and previews are audited`);
  }
}

async function assertServerAvailable() {
  const response = await getText(baseUrl);
  assert.match(response, /Predicta/i, `${baseUrl} returns Predicta content`);
  checks.push(`${baseUrl} returns Predicta content`);
}

async function captureAndAuditRoute({ debugPort, outputRoot, shot, viewport }) {
  const page = await createTarget(debugPort, 'about:blank');
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
    await navigateAndWait(cdp, `${baseUrl}${shot.route}`);
    if (shot.openMobileMenu) {
      await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const button = [...document.querySelectorAll('button')].find(item =>
            item.classList.contains('dashboard-menu-toggle') ||
            /menu/i.test(item.getAttribute('aria-label') || '')
          );
          if (!button) return false;
          button.click();
          return true;
        })()`,
        returnByValue: true,
      });
      await delay(350);
    }
    await cdp.send('Runtime.evaluate', {
      awaitPromise: true,
      expression:
        'document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 4000))]) : true',
    });
    const readiness = await assertAuditablePredictaPage(cdp, {
      route: shot.route.split('?')[0],
      url: `${baseUrl}${shot.route}`,
    });
    const metrics = await evaluateRoute(cdp);
    const screenshot = await cdp.send('Page.captureScreenshot', {
      captureBeyondViewport: false,
      format: 'png',
      fromSurface: true,
    });
    writeFileSync(path.join(outputRoot, shot.fileName), Buffer.from(screenshot.data, 'base64'));

    const bodyTextForAssertion = metrics.bodyText.toLocaleLowerCase();
    for (const assertion of shot.assertions) {
      if (!bodyTextForAssertion.includes(assertion.toLocaleLowerCase())) {
        failures.push(`${viewport.name} ${shot.id}: missing visible copy "${assertion}"`);
      }
    }
    if (staleActiveNadiPattern.test(metrics.bodyText)) {
      failures.push(`${viewport.name} ${shot.id}: stale active Nadi/palm-leaf copy is visible`);
    }
    if (metrics.horizontalOverflow > 0) {
      failures.push(`${viewport.name} ${shot.id}: ${metrics.horizontalOverflow}px horizontal overflow`);
    }
    if (metrics.clippedText.length) {
      failures.push(`${viewport.name} ${shot.id}: clipped text ${metrics.clippedText.map(item => item.selector).join(', ')}`);
    }
    if (metrics.tightActionGaps > 0) {
      const pairs = metrics.tightActionGapPairs
        .map(pair => `${pair.a} <-> ${pair.b} (${pair.gap}px)`)
        .join(', ');
      failures.push(`${viewport.name} ${shot.id}: ${metrics.tightActionGaps} cramped CTA gap(s): ${pairs}`);
    }
    checks.push(`${viewport.name} ${shot.id} route rendered without overflow, clipped text, cramped CTAs, or route crash`);

    return {
      clippedText: metrics.clippedText.length,
      fileName: shot.fileName,
      finalUrl: readiness.finalUrl,
      horizontalOverflow: metrics.horizontalOverflow,
      id: shot.id,
      route: shot.route,
      tightActionGaps: metrics.tightActionGaps,
      viewport: viewport.name,
    };
  } finally {
    cdp.close();
    await closeTarget(debugPort, page.id).catch(() => undefined);
  }
}

async function smokeDownloadReport(payloadPath) {
  const payload = JSON.parse(read(payloadPath));
  const response = await postJson(`${baseUrl}/api/report/pdf`, payload);
  const contentType = response.headers['content-type'] ?? '';
  assert.equal(response.statusCode, 200, `${payloadPath} report download status is 200`);
  assert.match(contentType, /application\/pdf/, `${payloadPath} report download returns PDF`);
  assert.ok(response.body.length > 1_000_000, `${payloadPath} report download returns substantial PDF bytes`);
  checks.push(`${payloadPath} report download smoke returned a substantial PDF`);
}

async function evaluateRoute(cdp) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(() => {
      const viewportWidth = document.documentElement.clientWidth;
      const body = document.body;
      const root = document.documentElement;
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
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          Number(style.opacity) === 0 ||
          element.getAttribute('aria-hidden') === 'true'
        ) return false;
        if (element.classList.contains('sr-only') || element.closest('.sr-only')) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }

      function isIntentionalScrollRegion(style) {
        return ['auto', 'scroll'].includes(style.overflowX) ||
          ['auto', 'scroll'].includes(style.overflowY) ||
          ['auto', 'scroll'].includes(style.overflow);
      }

      const actions = [...document.querySelectorAll('button, a.button, [role="button"]')].filter(isVisible);
      let tightActionGaps = 0;
      const tightActionGapPairs = [];
      for (let i = 0; i < actions.length; i += 1) {
        const a = actions[i].getBoundingClientRect();
        for (let j = i + 1; j < actions.length; j += 1) {
          const b = actions[j].getBoundingClientRect();
          const verticalOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
          const horizontalGap = Math.max(0, Math.max(a.left, b.left) - Math.min(a.right, b.right));
          if (verticalOverlap > 12 && horizontalGap > 0 && horizontalGap < 8) {
            tightActionGaps += 1;
            tightActionGapPairs.push({
              a: selectorFor(actions[i]),
              b: selectorFor(actions[j]),
              gap: Math.round(horizontalGap * 10) / 10,
            });
          }
        }
      }

      for (const element of document.querySelectorAll('body *')) {
        if (ignoredTags.has(element.tagName) || !isVisible(element)) continue;
        const style = window.getComputedStyle(element);
        const text = (element.textContent || '').trim().replace(/\\s+/g, ' ');
        if (
          text.length > 8 &&
          element.children.length === 0 &&
          !isIntentionalScrollRegion(style) &&
          style.overflow !== 'visible' &&
          (element.scrollWidth > element.clientWidth + 3 || element.scrollHeight > element.clientHeight + 3)
        ) {
          clippedText.push({ selector: selectorFor(element), text: text.slice(0, 80) });
        }
      }

      return {
        bodyText: body.innerText || '',
        clippedText: clippedText.slice(0, 8),
        horizontalOverflow: Math.max(0, Math.ceil(Math.max(root.scrollWidth, body.scrollWidth) - viewportWidth)),
        tightActionGaps,
        tightActionGapPairs: tightActionGapPairs.slice(0, 8),
      };
    })()`,
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
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `new Promise(resolve => {
      const done = () => document.readyState === 'complete' || document.readyState === 'interactive';
      if (done()) return resolve(true);
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
  }).catch(() => undefined);
  await delay(700);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForProcessExit(process, timeoutMs) {
  return new Promise(resolve => {
    if (process.exitCode !== null) return resolve();
    const timeout = setTimeout(resolve, timeoutMs);
    process.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

async function connectWebSocket(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  let nextId = 1;

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Timed out connecting to ${url}`)), 10_000);
    socket.addEventListener('open', () => {
      clearTimeout(timeout);
      resolve();
    }, { once: true });
    socket.addEventListener('error', event => {
      clearTimeout(timeout);
      reject(new Error(`Chrome DevTools websocket failed: ${event.message ?? 'unknown error'}`));
    }, { once: true });
  });

  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { reject, resolve } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) {
      reject(new Error(`${message.error.message}${message.error.data ? `: ${message.error.data}` : ''}`));
      return;
    }
    resolve(message.result ?? {});
  });

  socket.addEventListener('close', () => {
    for (const { reject } of pending.values()) {
      reject(new Error('Chrome DevTools websocket closed before the command completed.'));
    }
    pending.clear();
  });

  return {
    close() {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    },
    send(method, params = {}) {
      if (socket.readyState !== WebSocket.OPEN) {
        return Promise.reject(new Error(`Chrome DevTools websocket is not open for ${method}.`));
      }
      const id = nextId;
      nextId += 1;
      const payload = JSON.stringify({ id, method, params });
      return new Promise((resolve, reject) => {
        pending.set(id, { reject, resolve });
        socket.send(payload);
      });
    },
  };
}

function getJson(url) {
  return getText(url).then(text => JSON.parse(text));
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
    const req = httpRequest(url, { method }, response => {
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
    });
    req.on('error', reject);
    req.end();
  });
}

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = httpRequest(url, {
      headers: {
        'content-length': Buffer.byteLength(body),
        'content-type': 'application/json',
      },
      method: 'POST',
    }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(Buffer.from(chunk)));
      response.on('end', () => {
        resolve({
          body: Buffer.concat(chunks),
          headers: response.headers,
          statusCode: response.statusCode ?? 0,
        });
      });
    });
    req.on('error', reject);
    req.end(body);
  });
}
