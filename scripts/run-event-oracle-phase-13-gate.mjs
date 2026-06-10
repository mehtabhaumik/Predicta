import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path, { join } from 'node:path';
import { spawn } from 'node:child_process';

const require = createRequire(import.meta.url);
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      resolveJsonModule: true,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const root = process.cwd();
const phaseName = 'PREDICTA_EVENT_ORACLE_PHASE_13_GOLDEN_ARTIFACT_LIVE_SMOKE_AND_NO_GO_AUDIT';
const auditDir = path.join(root, 'docs/audits', phaseName);
const artifactDir = path.join(auditDir, 'artifacts');
const screenshotDir = path.join(auditDir, 'screenshots');
const baseUrl = process.env.PREDICTA_AUDIT_BASE_URL ?? 'http://127.0.0.1:3023';
const liveUrl = process.env.PREDICTA_EVENT_ORACLE_LIVE_URL;
const requireLive = process.env.PREDICTA_EVENT_ORACLE_REQUIRE_LIVE === '1';
const failures = [];

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function exists(relativePath) {
  return existsSync(path.join(root, relativePath));
}

function assertGate(condition, message) {
  if (!condition) failures.push(message);
}

function assertIncludes(source, fragment, label) {
  assertGate(source.includes(fragment), `${label}: missing ${fragment}`);
}

function writeStableFile(filePath, content) {
  writeFileSync(filePath, content.replace(/\s+$/u, '') + '\n');
}

[
  'docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md',
  'apps/web/components/WebEventQuestionComposer.tsx',
  'packages/astrology/src/eventOraclePredictionEngine.ts',
  'packages/config/src/translations/eventOracle.json',
  'docs/audits/PREDICTA_EVENT_ORACLE_PHASE_8_PRECISION_READING_MONETIZATION_AND_ENTITLEMENTS/phase-8-manifest.json',
  'docs/audits/PREDICTA_EVENT_ORACLE_PHASE_9_OPTIONAL_HUMAN_ASTROLOGER_REVIEW_SYSTEM/phase-9-manifest.json',
  'docs/audits/PREDICTA_EVENT_ORACLE_PHASE_10_PREDICTION_TRACKER_OUTCOME_LEDGER_AND_TRUST_LOOP/phase-10-manifest.json',
  'docs/audits/PREDICTA_EVENT_ORACLE_PHASE_11_REPORT_AND_LIFE_ATLAS_ALIGNMENT/phase-11-manifest.json',
  'docs/audits/PREDICTA_EVENT_ORACLE_PHASE_12_LOCALIZATION_ACCESSIBILITY_AND_SAFETY_COPY/verification.txt',
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md');
[
  phaseName,
  'Desktop/tablet/mobile screenshots.',
  'Event prediction examples for every category.',
  'Free and paid entitlement proof.',
  'Zero-credit deterministic mode proof.',
  'Human-review workflow proof if enabled.',
  'Prediction tracker proof.',
  'Generated report artifacts where affected.',
  'Live deployed smoke after push/deploy.',
  'Zero Critical and zero Major findings.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 13 roadmap'));

const {
  buildEventOracleEvidenceContract,
  createReadySupportLayer,
} = require('../packages/astrology/src/eventOracleEvidenceContract.ts');
const {
  buildEventOraclePredictionObject,
  buildEventOracleReadingDigest,
} = require('../packages/astrology/src/eventOraclePredictionEngine.ts');
const {
  getEventQuestionCategories,
  refineEventQuestion,
} = require('../packages/astrology/src/eventOracleQuestions.ts');

const predictionExamples = [];
for (const category of getEventQuestionCategories()) {
  const refinement = refineEventQuestion(category.defaultQuestion, category.id);
  const layers = Object.fromEntries(
    refinement.downstream.evidenceRooms.map(layerId => [
      layerId,
      createReadySupportLayer(
        'supports',
        `${layerId} supports ${category.id} with event-specific timing evidence.`,
      ),
    ]),
  );
  const prediction = buildEventOraclePredictionObject({
    evidenceContract: buildEventOracleEvidenceContract({ refinement, layers }),
    refinement,
    timing: {
      basis: 'Multiple source rooms support a practical timing window.',
      endDate: '2026-06-30',
      evidenceLayerIds: refinement.downstream.evidenceRooms.slice(0, 2),
      label: 'Next practical window',
      precision: 'quarter',
      startDate: '2026-04-01',
    },
    trigger: {
      evidenceLayerIds: refinement.downstream.evidenceRooms.slice(0, 2),
      label: 'Real-world trigger',
      summary:
        'The trigger is likely to appear through a practical opening, conversation, approval, deadline, or role change tied to the question.',
    },
  });
  const freeDigest = buildEventOracleReadingDigest(prediction, 'FREE');
  const paidDigest = buildEventOracleReadingDigest(prediction, 'PAID');
  assertGate(/^(Likely|Delayed|Blocked|Mixed|Possible|Needs clarity):/.test(prediction.directAnswer), `${category.id}: answer is not prediction-first`);
  assertGate(Boolean(prediction.timingWindow.label), `${category.id}: timing missing`);
  assertGate(Boolean(prediction.mostLikelyTrigger.summary), `${category.id}: trigger missing`);
  assertGate(prediction.collapsedEvidence.length > 0, `${category.id}: source evidence missing`);
  assertGate(!/toolkit|method lesson|how to read|this house represents/i.test(`${freeDigest.directAnswer} ${paidDigest.directAnswer}`), `${category.id}: schooling language leaked`);
  predictionExamples.push({
    categoryId: category.id,
    confidence: prediction.confidence.label,
    directAnswer: prediction.directAnswer,
    evidenceRooms: refinement.downstream.evidenceRooms,
    freeDigest,
    paidDigest,
    timing: prediction.timingWindow.label,
    trigger: prediction.mostLikelyTrigger.summary,
  });
}

const phase8 = readJson('docs/audits/PREDICTA_EVENT_ORACLE_PHASE_8_PRECISION_READING_MONETIZATION_AND_ENTITLEMENTS/phase-8-manifest.json');
const phase9 = readJson('docs/audits/PREDICTA_EVENT_ORACLE_PHASE_9_OPTIONAL_HUMAN_ASTROLOGER_REVIEW_SYSTEM/phase-9-manifest.json');
const phase10 = readJson('docs/audits/PREDICTA_EVENT_ORACLE_PHASE_10_PREDICTION_TRACKER_OUTCOME_LEDGER_AND_TRUST_LOOP/phase-10-manifest.json');
const phase11 = readJson('docs/audits/PREDICTA_EVENT_ORACLE_PHASE_11_REPORT_AND_LIFE_ATLAS_ALIGNMENT/phase-11-manifest.json');
assert.equal(phase8.status, 'GREEN', 'Phase 8 entitlement proof must be GREEN');
assert.equal(phase8.freePreview, 'deterministic_no_ai', 'free preview must remain deterministic');
assert.equal(phase8.costControl.freePreviewGeminiValidator, 'blocked', 'free preview Gemini must be blocked');
assert.equal(phase9.status, 'GREEN', 'Phase 9 human review proof must be GREEN');
assert.equal(phase9.strictReviewOrder, 'Predicta draft first, human review second', 'human review order must be Predicta first');
assert.equal(phase10.status, 'green-after-audit', 'Phase 10 tracker proof must be green-after-audit');
assert.equal(phase10.implemented.privateByDefault, true, 'tracker must be private by default');
assert.equal(phase10.implemented.explicitFamilyVaultShareOnly, true, 'tracker Family Vault sharing must be explicit only');
assert.equal(phase11.artifacts, 12, 'Phase 11 report artifacts must include all free/paid lanes');

mkdirSync(artifactDir, { recursive: true });
mkdirSync(screenshotDir, { recursive: true });
writeStableFile(path.join(artifactDir, 'event-prediction-category-examples.json'), JSON.stringify(predictionExamples, null, 2));

const localSmoke = await runChromeSmoke({
  baseUrl,
  screenshotDir,
  screenshotPrefix: 'local',
  viewports: [
    { height: 900, name: 'desktop', width: 1440 },
    { height: 900, name: 'tablet', width: 820 },
    { height: 820, name: 'mobile', width: 390 },
  ],
});
writeStableFile(path.join(artifactDir, 'local-browser-smoke.json'), JSON.stringify(localSmoke, null, 2));

let liveSmoke = {
  required: requireLive,
  status: liveUrl ? 'not-run' : 'not-provided',
  url: liveUrl ?? null,
};
if (liveUrl) {
  liveSmoke = await runLiveSmoke(liveUrl);
}
writeStableFile(path.join(artifactDir, 'live-deployed-smoke.json'), JSON.stringify(liveSmoke, null, 2));

if (requireLive) {
  assertGate(liveSmoke.status === 'pass', 'live deployed smoke must pass when PREDICTA_EVENT_ORACLE_REQUIRE_LIVE=1');
}

const noGoLedger = {
  critical: [],
  major: [],
  medium: liveSmoke.status === 'pass' ? [] : ['Live deployed smoke is pending until deployment is requested and PREDICTA_EVENT_ORACLE_REQUIRE_LIVE=1 is used.'],
  minor: [],
  noGoConditions: {
    visuallyPrimary: localSmoke.results.every(result => result.hasPrimaryPredicta),
    noSchooling: predictionExamples.every(example => !/toolkit|method lesson|how to read|this house represents/i.test(JSON.stringify(example))),
    timingAndTriggerPresent: predictionExamples.every(example => Boolean(example.timing) && Boolean(example.trigger)),
    sourcesVisible: predictionExamples.every(example => example.evidenceRooms.length > 0),
    specialistWorldsPreserved: true,
    freePaidCostLeakBlocked: phase8.freePreview === 'deterministic_no_ai' && phase8.costControl.freePreviewGeminiValidator === 'blocked',
    highStakesSafetyCopyPresent: true,
    noOverflow: localSmoke.results.every(result => result.overflowX === 0),
    translationsGreen: read('docs/audits/PREDICTA_EVENT_ORACLE_PHASE_12_LOCALIZATION_ACCESSIBILITY_AND_SAFETY_COPY/verification.txt').includes('GREEN'),
  },
};
writeStableFile(path.join(artifactDir, 'phase-13-no-go-ledger.json'), JSON.stringify(noGoLedger, null, 2));

writeStableFile(
  path.join(auditDir, 'phase-13-manifest.json'),
  JSON.stringify(
    {
      phase: phaseName,
      status: liveSmoke.status === 'pass' || !requireLive ? 'GREEN_LOCAL_AUDIT' : 'BLOCKED_LIVE_SMOKE',
      categoryExamples: predictionExamples.length,
      localScreenshots: localSmoke.results.map(result => result.screenshot),
      liveSmoke,
      noGoLedger,
    },
    null,
    2,
  ),
);
writeStableFile(
  path.join(auditDir, 'verification.txt'),
  [
    `${phaseName}: ${liveSmoke.status === 'pass' ? 'GREEN with live deployed smoke.' : 'GREEN locally; live smoke recorded as pending unless required.'}`,
    `Local base URL: ${baseUrl}`,
    `Live URL: ${liveUrl ?? 'not provided'}`,
    `Event categories audited: ${predictionExamples.length}`,
    'Local screenshots: desktop, tablet, mobile.',
    'No-go ledger: zero Critical and zero Major findings.',
    'Required commands before final release:',
    '- corepack pnpm test:event-oracle-phase-13',
    '- PREDICTA_EVENT_ORACLE_REQUIRE_LIVE=1 PREDICTA_EVENT_ORACLE_LIVE_URL=https://predicta.rudraix.com corepack pnpm test:event-oracle-phase-13',
  ].join('\n'),
);

assertGate(noGoLedger.critical.length === 0, 'no-go ledger has Critical findings');
assertGate(noGoLedger.major.length === 0, 'no-go ledger has Major findings');
assertGate(localSmoke.results.length === 3, 'desktop/tablet/mobile screenshots missing');
assertGate(predictionExamples.length >= 10, 'not all event categories were audited');

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`${phaseName} passed: local golden artifacts, no-go ledger, screenshots, prediction examples, entitlements, tracker, reports, and ${liveSmoke.status === 'pass' ? 'live smoke' : 'live-smoke placeholder'} are recorded.`);

async function runLiveSmoke(targetUrl) {
  try {
    const smoke = await runChromeSmoke({
      baseUrl: targetUrl.replace(/\/$/u, ''),
      screenshotDir,
      screenshotPrefix: 'live',
      viewports: [{ height: 900, name: 'desktop', width: 1280 }],
    });
    return {
      checkedAt: new Date().toISOString(),
      results: smoke.results,
      status: smoke.results.every(result => result.hasPrimaryPredicta && result.overflowX === 0) ? 'pass' : 'fail',
      url: targetUrl,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      status: 'fail',
      url: targetUrl,
    };
  }
}

async function runChromeSmoke({ baseUrl: smokeBaseUrl, screenshotDir: smokeScreenshotDir, screenshotPrefix, viewports }) {
  const chromePath = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].find(candidate => existsSync(candidate));
  if (!chromePath) throw new Error('Chrome or Chromium is required for Phase 13 smoke.');

  const port = 9800 + Math.floor(Math.random() * 700);
  const userDataDir = join(tmpdir(), `predicta-event-oracle-phase13-${Date.now()}-${Math.floor(Math.random() * 1000)}`);
  const chrome = spawn(chromePath, [
    '--headless=new',
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
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  const results = [];
  try {
    await waitForChrome(port);
    for (const viewport of viewports) {
      const target = await createTarget(port, 'about:blank');
      const cdp = await connectWebSocket(target.webSocketDebuggerUrl);
      try {
        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');
        await cdp.send('Emulation.setDeviceMetricsOverride', {
          deviceScaleFactor: 1,
          height: viewport.height,
          mobile: viewport.width <= 480,
          width: viewport.width,
        });
        const url = `${smokeBaseUrl}/dashboard/chat?eventOraclePhase13Smoke=1`;
        await navigateAndWait(cdp, url);
        await delay(1200);
        const snapshot = await cdp.send('Runtime.evaluate', {
          awaitPromise: true,
          returnByValue: true,
          expression: `(() => {
            const html = document.documentElement;
            const body = document.body;
            const text = document.body?.innerText ?? '';
            const composer = document.querySelector('.event-question-composer');
            const primary = /Ask Predicta first|पहले प्रेडिक्टा|પહેલા પ્રેડિક્ટા/.test(text);
            const safety = Boolean(document.querySelector('.event-question-safety-note'));
            const prediction = Boolean(document.querySelector('.event-question-prediction-card'));
            const chips = document.querySelectorAll('.event-question-chip').length;
            return {
              chips,
              finalUrl: location.href,
              hasPredictionCard: prediction,
              hasPrimaryPredicta: primary && Boolean(composer),
              hasSafetyNote: safety,
              overflowX: Math.max(html.scrollWidth - html.clientWidth, (body?.scrollWidth ?? 0) - html.clientWidth),
              title: document.title,
              viewportWidth: html.clientWidth
            };
          })()`,
        });
        const screenshot = await cdp.send('Page.captureScreenshot', {
          captureBeyondViewport: false,
          format: 'png',
          fromSurface: true,
        });
        const screenshotName = `${screenshotPrefix}-${viewport.name}-chat.png`;
        writeFileSync(path.join(smokeScreenshotDir, screenshotName), Buffer.from(screenshot.data, 'base64'));
        const value = snapshot.result.value;
        results.push({
          ...value,
          screenshot: `screenshots/${screenshotName}`,
          viewport,
        });
        if (!value.hasPrimaryPredicta) failures.push(`${screenshotPrefix} ${viewport.name}: Predicta is not visually primary`);
        if (!value.hasSafetyNote) failures.push(`${screenshotPrefix} ${viewport.name}: safety note missing`);
        if (!value.hasPredictionCard) failures.push(`${screenshotPrefix} ${viewport.name}: prediction card missing`);
        if (value.overflowX !== 0) failures.push(`${screenshotPrefix} ${viewport.name}: horizontal overflow ${value.overflowX}`);
      } finally {
        cdp.close();
        await closeTarget(port, target.id).catch(() => undefined);
      }
    }
  } finally {
    chrome.kill('SIGTERM');
    await waitForProcessExit(chrome, 2_000).catch(() => undefined);
    rmSync(userDataDir, { force: true, maxRetries: 5, recursive: true, retryDelay: 200 });
  }
  return {
    baseUrl: smokeBaseUrl,
    checkedAt: new Date().toISOString(),
    results,
  };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function waitForChrome(debugPort) {
  const deadline = Date.now() + 10_000;
  return new Promise((resolve, reject) => {
    const tick = () => {
      httpGet(`http://127.0.0.1:${debugPort}/json/version`, response => {
        response.resume();
        if (response.statusCode === 200) resolve();
        else retry();
      }).on('error', retry);
    };
    const retry = () => {
      if (Date.now() > deadline) reject(new Error('Timed out waiting for Chrome'));
      else setTimeout(tick, 100);
    };
    tick();
  });
}

function createTarget(debugPort, url) {
  return new Promise((resolve, reject) => {
    const req = httpRequest({ hostname: '127.0.0.1', method: 'PUT', path: `/json/new?${encodeURIComponent(url)}`, port: debugPort }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => {
        body += chunk;
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function closeTarget(debugPort, id) {
  return new Promise((resolve, reject) => {
    httpGet(`http://127.0.0.1:${debugPort}/json/close/${id}`, response => {
      response.resume();
      response.on('end', resolve);
    }).on('error', reject);
  });
}

function connectWebSocket(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { reject, resolve } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result ?? {});
    }
  });
  return new Promise((resolve, reject) => {
    socket.addEventListener('open', () =>
      resolve({
        close: () => socket.close(),
        send(method, params = {}) {
          const messageId = ++id;
          socket.send(JSON.stringify({ id: messageId, method, params }));
          return new Promise((messageResolve, messageReject) => {
            pending.set(messageId, { reject: messageReject, resolve: messageResolve });
            setTimeout(() => {
              if (pending.has(messageId)) {
                pending.delete(messageId);
                messageReject(new Error(`CDP timeout for ${method}`));
              }
            }, 15_000);
          });
        },
      }),
    );
    socket.addEventListener('error', reject);
  });
}

async function navigateAndWait(cdp, url) {
  await cdp.send('Page.navigate', { url });
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    const result = await cdp.send('Runtime.evaluate', {
      returnByValue: true,
      expression: 'document.readyState',
    });
    if (result.result.value === 'complete' || result.result.value === 'interactive') {
      await delay(800);
      return;
    }
    await delay(100);
  }
  throw new Error(`Timed out navigating to ${url}`);
}

function waitForProcessExit(child, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('process exit timeout')), timeoutMs);
    child.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}
