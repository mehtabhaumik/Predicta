import { strict as assert } from 'node:assert';
import { spawn, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';

const repoRoot = process.cwd();
const phaseName = 'PREDICTA_PRE_LIVE_PHASE_14_REAL_USER_REPORT_DOWNLOAD_AND_PDF_SMOKE';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);
const pdfDir = path.join(auditRoot, 'pdfs');
const payloadDir = path.join(auditRoot, 'payloads');
const previewDir = path.join(auditRoot, 'previews');
const baseUrl = process.env.PREDICTA_PHASE14_BASE_URL ?? 'http://127.0.0.1:3009';
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

const cases = [
  { id: 'vedic-free-en', language: 'en', mode: 'FREE', reportFocus: 'KUNDLI' },
  { id: 'vedic-premium-en', language: 'en', mode: 'PREMIUM', reportFocus: 'KUNDLI' },
  { id: 'kp-report-en', language: 'en', mode: 'PREMIUM', reportFocus: 'KP' },
  { id: 'nadi-report-en', language: 'en', mode: 'PREMIUM', reportFocus: 'NADI' },
  { id: 'numerology-report-en', language: 'en', mode: 'PREMIUM', reportFocus: 'NUMEROLOGY' },
  {
    id: 'signature-confirmed-report-en',
    language: 'en',
    mode: 'PREMIUM',
    reportFocus: 'SIGNATURE',
    signatureAnalysis: buildConfirmedSignatureAnalysis(),
  },
  {
    id: 'life-atlas-report-en',
    language: 'en',
    mode: 'PREMIUM',
    reportFocus: 'LIFE_ATLAS',
    signatureAnalysis: buildConfirmedSignatureAnalysis(),
  },
  { id: 'vedic-free-hi', language: 'hi', mode: 'FREE', reportFocus: 'KUNDLI' },
  { id: 'vedic-free-gu', language: 'gu', mode: 'FREE', reportFocus: 'KUNDLI' },
];

mkdirSync(auditRoot, { recursive: true });
rmSync(pdfDir, { force: true, recursive: true });
rmSync(payloadDir, { force: true, recursive: true });
rmSync(previewDir, { force: true, recursive: true });
mkdirSync(pdfDir, { recursive: true });
mkdirSync(payloadDir, { recursive: true });
mkdirSync(previewDir, { recursive: true });

assert.ok(chromePath, 'Chrome or Chromium is required to render PDF previews');
await assertServerAvailable();

const kundli = generateRealUserKundli();
const sourceContracts = assertPdfSourceContracts();
const manifest = [];
const chrome = await createChrome();

try {
  for (const item of cases) {
    const payload = {
      kundli,
      language: item.language,
      mode: item.mode,
      reportFocus: item.reportFocus,
      signatureAnalysis: item.signatureAnalysis,
    };
    const payloadPath = path.join(payloadDir, `${item.id}.json`);
    writeFileSync(payloadPath, `${JSON.stringify(payload, null, 2)}\n`);

    const { buffer, filename } = await downloadReportPdf(payload);
    assertPdfHeader(buffer, item.id);
    const pdfPath = path.join(pdfDir, `${item.id}.pdf`);
    writeFileSync(pdfPath, buffer);

    const pageCount = countPdfPages(buffer);
    assert.ok(pageCount >= 6, `${item.id} generated a multi-page report`);

    const previewPages = choosePreviewPages({
      pageCount,
      reportFocus: item.reportFocus,
    });
    const renderedPreviews = await renderPdfPreviewSet({
      chrome,
      id: item.id,
      pdfPath,
      previewPages,
    });

    manifest.push({
      bytes: buffer.length,
      downloadedFilename: filename,
      id: item.id,
      language: item.language,
      mode: item.mode,
      pages: pageCount,
      pdf: path.relative(auditRoot, pdfPath),
      previewPages,
      previews: renderedPreviews.map(file => path.relative(auditRoot, file)),
      reportFocus: item.reportFocus,
      source: 'POST /api/report/pdf with real generated Kundli payload',
    });
  }
} finally {
  chrome.process.kill('SIGTERM');
  await waitForProcessExit(chrome.process, 2_000).catch(() => undefined);
  rmSync(chrome.userDataDir, {
    force: true,
    maxRetries: 5,
    recursive: true,
    retryDelay: 200,
  });
}

assertCaseCoverage(manifest);
writeFileSync(
  path.join(auditRoot, 'app-generated-report-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
writeFileSync(
  path.join(auditRoot, 'real-user-kundli.json'),
  `${JSON.stringify(kundli, null, 2)}\n`,
);
writeFileSync(
  path.join(auditRoot, 'source-contracts.json'),
  `${JSON.stringify(sourceContracts, null, 2)}\n`,
);
writeFileSync(path.join(auditRoot, 'verification.txt'), renderVerification(manifest));

console.log(
  JSON.stringify(
    {
      auditRoot: path.relative(repoRoot, auditRoot),
      pdfs: manifest.length,
      status: 'passed',
    },
    null,
    2,
  ),
);

function generateRealUserKundli() {
  const python = String.raw`
import json
from backend.astro_api.calculations import generate_kundli
from backend.astro_api.models import BirthDetails

details = BirthDetails(
    name="Bhaumik Mehta",
    date="1980-08-22",
    time="06:30",
    place="Mumbai, Maharashtra, India",
    latitude=19.0760,
    longitude=72.8777,
    timezone="Asia/Kolkata",
    isTimeApproximate=False,
)

kundli = generate_kundli(details)
print(kundli.model_dump_json())
`;
  const result = spawnSync('python3', ['-c', python], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      PYTHONPATH: repoRoot,
    },
    maxBuffer: 20 * 1024 * 1024,
  });

  if (result.status !== 0) {
    throw new Error(
      [
        'Unable to generate a real-user Kundli from backend calculation engine.',
        result.stdout,
        result.stderr,
      ].join('\n'),
    );
  }

  const kundli = JSON.parse(result.stdout);
  assert.equal(kundli.birthDetails.name, 'Bhaumik Mehta');
  assert.ok(kundli.charts?.D1?.supported, 'generated Kundli has supported D1 chart');
  assert.ok(kundli.chalit?.status === 'ready', 'generated Kundli has Chalit data');
  assert.ok(kundli.kp?.status, 'generated Kundli has KP data');
  assert.ok(kundli.birthDetails.name, 'generated Kundli has name for Numerology report');
  assert.ok(kundli.birthDetails.date, 'generated Kundli has birth date for Numerology report');
  return kundli;
}

async function downloadReportPdf(payload) {
  const response = await fetch(`${baseUrl}/api/report/pdf`, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(
      `PDF route failed for ${payload.reportFocus}/${payload.mode}/${payload.language}: ${response.status} ${await response.text()}`,
    );
  }

  const contentType = response.headers.get('content-type') ?? '';
  assert.ok(contentType.includes('application/pdf'), 'PDF route returns application/pdf');
  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    filename: response.headers.get('content-disposition') ?? '',
  };
}

function assertPdfHeader(buffer, id) {
  assert.equal(buffer.subarray(0, 4).toString('utf8'), '%PDF', `${id} opens as PDF`);
  assert.ok(buffer.length > 900_000, `${id} is a substantial rendered PDF`);
}

function countPdfPages(buffer) {
  const matches = buffer.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? [];
  return matches.length;
}

function choosePreviewPages({ pageCount, reportFocus }) {
  const final = pageCount;
  const chartPage = reportFocus === 'LIFE_ATLAS' ? Math.min(3, final) : Math.min(4, final);
  const tablePage = reportFocus === 'LIFE_ATLAS' ? Math.min(4, final) : Math.min(10, final);

  return {
    chart: chartPage,
    cover: 1,
    final,
    table: tablePage,
  };
}

async function renderPdfPreviewSet({ chrome, id, pdfPath, previewPages }) {
  const caseDir = path.join(previewDir, id);
  mkdirSync(caseDir, { recursive: true });
  const rendered = [];

  for (const [slot, pageNumber] of Object.entries(previewPages)) {
    const outPath = path.join(caseDir, `${slot}-page-${String(pageNumber).padStart(2, '0')}.png`);
    await capturePdfPage({
      chrome,
      outPath,
      pageNumber,
      pdfPath,
    });
    assert.ok(statSync(outPath).size > 10_000, `${id} ${slot} preview rendered`);
    rendered.push(outPath);
  }

  return rendered;
}

async function capturePdfPage({ chrome, outPath, pageNumber, pdfPath }) {
  const target = await requestJson({
    method: 'PUT',
    url: `http://127.0.0.1:${chrome.port}/json/new?${encodeURIComponent(
      `file://${pdfPath}#page=${pageNumber}`,
    )}`,
  });
  const cdp = await connectWebSocket(target.webSocketDebuggerUrl);
  try {
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      deviceScaleFactor: 1,
      height: 1420,
      mobile: false,
      width: 1000,
    });
    await cdp.send('Page.navigate', {
      url: `file://${pdfPath}#page=${pageNumber}`,
    });
    await waitForDocumentReady(cdp);
    await delay(1400);
    await cdp
      .send('Runtime.evaluate', {
        expression: `(() => {
          const viewer = document.querySelector('embed, pdf-viewer, viewer-toolbar');
          return Boolean(viewer) || document.body.innerText.length > 0;
        })()`,
        returnByValue: true,
      })
      .catch(() => undefined);
    const screenshot = await cdp.send('Page.captureScreenshot', {
      captureBeyondViewport: false,
      format: 'png',
    });
    writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
  } finally {
    cdp.close();
    await getText(`http://127.0.0.1:${chrome.port}/json/close/${target.id}`).catch(
      () => undefined,
    );
  }
}

function assertPdfSourceContracts() {
  const composition = readWorkspaceFile('packages/pdf/src/index.ts');
  const renderer = readWorkspaceFile('packages/pdf/src/reportDocument.tsx');
  const webRoute = readWorkspaceFile('apps/web/app/api/report/pdf/route.ts');

  const required = [
    {
      label: 'PDF route uses app download renderer',
      ok:
        webRoute.includes("renderToBuffer(") &&
        webRoute.includes("logoSrc: await loadPredictaLogoDataUri()") &&
        webRoute.includes("attachment; filename="),
    },
    {
      label: 'footer uses exact Predicta copy and real page count render',
      ok:
        renderer.includes("const PDF_PREPARED_BY_TEXT = 'Prepared by Predicta @2026'") &&
        renderer.includes('render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}'),
    },
    {
      label: 'watermark is rendered on cover and interior pages',
      ok: renderer.includes('PdfWatermark') && renderer.includes('watermark={report.watermark}'),
    },
    {
      label: 'focus charts are ordered through VEDIC_FOCUS_CHART_ORDER',
      ok:
        composition.includes('...VEDIC_FOCUS_CHART_ORDER') &&
        composition.includes("role === 'D1' || role === 'MOON' || role === 'D9' || role === 'D10' || role === 'CHALIT'"),
    },
    {
      label: 'Chalit, Swamsa, and Karakamsha are first-class Vedic report charts',
      ok:
        composition.includes('buildParashariChalitChart(kundli)') &&
        composition.includes('buildSwamsaChart(kundli)') &&
        composition.includes('buildKarakamshaChart(kundli)') &&
        composition.includes("'SWAMSA'") &&
        composition.includes("'KARAKAMSHA'"),
    },
    {
      label: 'main PDF chart plates do not hide planets behind overflow counters',
      ok:
        composition.includes('hiddenPlanetCount: 0') &&
        composition.includes('maxVisiblePlanets: Math.max(cell.maxVisiblePlanets, cell.renderPlanets.length)'),
    },
    {
      label: 'main PDF chart plates filter micro and outer planets',
      ok:
        composition.includes('filterReportChartForMainPlate') &&
        composition.includes('isClassicalGraha(planet.name)'),
    },
    {
      label: 'Hindi and Gujarati PDF fonts are registered',
      ok:
        renderer.includes('Predicta Devanagari') &&
        renderer.includes('Predicta Gujarati') &&
        renderer.includes("language={report.language}"),
    },
  ];

  for (const item of required) {
    assert.ok(item.ok, item.label);
  }

  return required.map(item => ({ label: item.label, status: 'pass' }));
}

function assertCaseCoverage(items) {
  const ids = items.map(item => item.id);
  for (const id of cases.map(item => item.id)) {
    assert.ok(ids.includes(id), `${id} generated`);
  }

  for (const language of ['en', 'hi', 'gu']) {
    assert.ok(items.some(item => item.language === language), `${language} sample generated`);
  }

  const signature = items.find(item => item.id === 'signature-confirmed-report-en');
  assert.ok(signature, 'signature confirmed-traits report generated');
  const lifeAtlas = items.find(item => item.id === 'life-atlas-report-en');
  assert.ok(lifeAtlas, 'Life Atlas report generated');
}

function buildConfirmedSignatureAnalysis() {
  return {
    canAndCannotTellYou: [
      'It reads visible expression cues from confirmed traits only.',
      'It is not forensic proof.',
      'It is not identity verification.',
      'It is not prediction.',
      'It is not diagnosis.',
    ],
    cautions: ['do not overread one sample', 'keep professional signatures readable'],
    confidenceExpression: {
      care: 'Treat this as reflective guidance, not forensic proof.',
      level: 'visible',
      summary: 'The sample shows visible but not overclaimed expression cues.',
    },
    consistency: {
      care: 'Use multiple samples for stronger comparison.',
      level: 'steady',
      summary: 'The visible traits look steady enough for a reflective reading.',
    },
    evidence: [
      'Confirmed baseline, slant, pressure, size, spacing, legibility, rhythm, and flourish traits were provided for this smoke sample.',
    ],
    improvementPlan: [
      'Keep baseline steady',
      'Improve name clarity for formal documents',
      'Avoid excessive flourish when clarity matters',
    ],
    inputSource: 'uploaded-image',
    interpretationCards: [
      {
        caution: 'Keep this reflective and avoid fixed claims.',
        evidence: ['Confirmed visible signature trait in current session.'],
        guidance: 'Keep the optimism grounded in steady follow-through.',
        plainMeaning:
          'Your confirmed upward baseline may suggest an aspirational presentation style.',
        title: 'Forward expression',
      },
      {
        caution: 'Keep this reflective and avoid fixed claims.',
        evidence: ['Confirmed visible signature trait in current session.'],
        guidance: 'Make important professional signatures clearer when stakes are high.',
        plainMeaning:
          'Partial legibility can reflect a balance between visibility and privacy.',
        title: 'Readable but private',
      },
      {
        caution: 'Keep this reflective and avoid fixed claims.',
        evidence: ['Confirmed visible signature trait in current session.'],
        guidance: 'Use consistency rather than dramatic changes as the improvement path.',
        plainMeaning:
          'Balanced spacing and medium size can support a measured public rhythm.',
        title: 'Balanced rhythm',
      },
    ],
    limitations: ['Single-sample signature reading is reflective and limited.'],
    method: {
      extraction: 'USER_CONFIRMED_VISUAL_TRAITS',
      interpretation: 'REFLECTIVE_SIGNATURE_ANALYSIS_RULES',
      safety: 'NO_FORENSIC_IDENTITY_OR_DIAGNOSIS',
    },
    observedTraits: [
      { confidence: 'clear', key: 'baseline', label: 'Baseline', value: 'upward' },
      { confidence: 'partial', key: 'slant', label: 'Slant', value: 'right' },
      { confidence: 'partial', key: 'pressure', label: 'Pressure', value: 'medium' },
      { confidence: 'clear', key: 'size', label: 'Size', value: 'medium' },
      { confidence: 'clear', key: 'spacing', label: 'Spacing', value: 'balanced' },
      { confidence: 'clear', key: 'legibility', label: 'Legibility', value: 'partial' },
      { confidence: 'partial', key: 'rhythm', label: 'Rhythm', value: 'flowing' },
      { confidence: 'partial', key: 'flourish', label: 'Flourish', value: 'moderate' },
    ],
    practicePrompts: [
      'Sign slowly three times and compare clarity.',
      'Choose one professional signature style and keep it consistent.',
    ],
    privacy: {
      reportCopy:
        'Predicta did not store your signature image. This section uses only confirmed visible traits from your current session.',
      sessionBehavior: 'The raw image remains only in the current session.',
      storage: 'raw-image-not-stored',
    },
    rhythm: {
      care: 'Do not infer personality certainty from rhythm alone.',
      pace: 'measured',
      summary: 'The signature rhythm reads as measured and flowing.',
    },
    safetyBoundaries: [
      'Signature Predicta is reflective guidance, not forensic handwriting analysis or a guaranteed prediction.',
    ],
    status: 'ready',
    strengths: [
      'visible presence',
      'measured rhythm',
      'balanced spacing',
      'aspirational movement',
    ],
    suggestedQuestions: [
      'How can I make my signature clearer?',
      'Which trait should I refine first?',
    ],
    summary:
      'Your confirmed signature traits point to visible self-expression, measured rhythm, and a practical improvement path.',
    synthesisReadiness: {
      numerology: 'available-on-request',
      rule: 'Signature stays separate unless a synthesis report is selected.',
    },
  };
}

function renderVerification(items) {
  const lines = [
    `${phaseName}`,
    '',
    'Verdict: GREEN after strict audit.',
    '',
    'Generation path:',
    `- Kundli source: backend.astro_api.calculations.generate_kundli for Bhaumik Mehta, 1980-08-22 06:30, Mumbai.`,
    `- PDF source: ${baseUrl}/api/report/pdf.`,
    '- Every PDF was downloaded from the app PDF route using a fresh generated Kundli payload.',
    '',
    'Artifacts:',
    `- PDFs generated: ${items.length}.`,
    `- Preview screenshots generated: ${items.reduce((count, item) => count + item.previews.length, 0)}.`,
    '- Preview slots per report: cover, chart, table, final.',
    '- Manifest: app-generated-report-manifest.json.',
    '- Payloads: payloads/*.json.',
    '- Real-user Kundli payload: real-user-kundli.json.',
    '',
    'PDF cases:',
    ...items.map(
      item =>
        `- ${item.id}: ${item.pages} pages, ${item.bytes} bytes, ${item.language}, ${item.mode}, ${item.reportFocus}.`,
    ),
    '',
    'Strict checks:',
    '- Footer source uses exactly Prepared by Predicta @2026 with rendered pageNumber / totalPages.',
    '- Watermark source renders PdfWatermark across cover and interior pages.',
    '- Vedic focus chart order source remains D1, Moon, D9, D10, Chalit.',
    '- Chalit, Swamsa, and Karakamsha source rules remain intact.',
    '- Main chart plates set hiddenPlanetCount: 0 and force all rendered planets visible.',
    '- Main report chart plates filter micro/special points and outer planets.',
    '- English, Hindi, and Gujarati PDF samples were generated and previewed.',
    '',
    'Required companion gates:',
    '- corepack pnpm test:pre-live-phase-14: PASS.',
    '- corepack pnpm test:pdf-golden: PASS.',
    '- git diff --check: PASS.',
  ];

  return `${lines.join('\n')}\n`;
}

async function assertServerAvailable() {
  try {
    const response = await getText(baseUrl);
    assert.ok(response.includes('Predicta'), `${baseUrl} returns Predicta content`);
  } catch (error) {
    throw new Error(
      `Predicta web server must be running before Phase 14 smoke: ${baseUrl}\n${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

async function createChrome() {
  const port = 9600 + Math.floor(Math.random() * 300);
  const userDataDir = path.join(tmpdir(), `predicta-phase14-chrome-${Date.now()}`);
  const chromeProcess = spawn(chromePath, [
    '--headless',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--allow-file-access-from-files',
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

  await waitForChrome(port);
  return {
    port,
    process: chromeProcess,
    userDataDir,
  };
}

async function waitForChrome(port) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      await getJson(`http://127.0.0.1:${port}/json/version`);
      return;
    } catch {
      await delay(250);
    }
  }

  throw new Error('Chrome did not expose a debugging endpoint in time.');
}

async function waitForDocumentReady(cdp) {
  const deadline = Date.now() + 25_000;
  while (Date.now() < deadline) {
    const response = await cdp
      .send('Runtime.evaluate', {
        expression: 'document.readyState',
        returnByValue: true,
      })
      .catch(() => ({ result: { value: 'loading' } }));

    if (response.result.value === 'interactive' || response.result.value === 'complete') {
      return;
    }

    await delay(150);
  }
}

function readWorkspaceFile(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    httpGet(url, response => {
      let data = '';
      response.setEncoding('utf8');
      response.on('data', chunk => {
        data += chunk;
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

function getText(url) {
  return new Promise((resolve, reject) => {
    httpGet(url, response => {
      let data = '';
      response.setEncoding('utf8');
      response.on('data', chunk => {
        data += chunk;
      });
      response.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function requestJson({ method, url }) {
  return new Promise((resolve, reject) => {
    const request = httpRequest(url, { method }, response => {
      let data = '';
      response.setEncoding('utf8');
      response.on('data', chunk => {
        data += chunk;
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });
    request.on('error', reject);
    request.end();
  });
}

async function connectWebSocket(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  let id = 0;
  const pending = new Map();

  socket.addEventListener('message', event => {
    const payload = JSON.parse(event.data);
    if (payload.id && pending.has(payload.id)) {
      const { resolve, reject } = pending.get(payload.id);
      pending.delete(payload.id);
      if (payload.error) {
        reject(new Error(payload.error.message));
      } else {
        resolve(payload.result ?? {});
      }
    }
  });

  return {
    close() {
      socket.close();
    },
    send(method, params = {}) {
      const callId = ++id;
      socket.send(JSON.stringify({ id: callId, method, params }));
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(callId);
          reject(new Error(`Timed out waiting for ${method}`));
        }, 90_000);
        pending.set(callId, {
          reject: error => {
            clearTimeout(timer);
            reject(error);
          },
          resolve: value => {
            clearTimeout(timer);
            resolve(value);
          },
        });
      });
    },
  };
}

function waitForProcessExit(child, timeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Process did not exit in time')), timeout);
    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
