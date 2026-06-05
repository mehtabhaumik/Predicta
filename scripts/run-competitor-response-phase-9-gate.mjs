import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { assertAuditablePredictaPage } from './lib/predicta-audit-page-readiness.mjs';

const phaseName =
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_9_GOLDEN_ARTIFACT_COMPETITOR_NO_GO_REAUDIT';
const priorPhaseName = 'PREDICTA_COMPETITOR_RESPONSE_PHASE_8_RERUN_ALL_REPORT_FINAL_PHASES';
const baseUrl = process.env.PREDICTA_AUDIT_BASE_URL ?? 'http://127.0.0.1:3009';
const auditRoot = join('docs', 'audits', phaseName);
const screenshotRoot = join(auditRoot, 'screenshots');
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

const failures = [];
const issueLedger = {
  critical: [],
  major: [],
  medium: [],
  minor: [],
};

const viewports = [
  { height: 1100, name: 'desktop', width: 1440 },
  { height: 1112, name: 'tablet', width: 834 },
  { height: 844, name: 'mobile', width: 390 },
  { height: 740, name: 'narrow-mobile', width: 360 },
];

const routes = [
  {
    label: 'home-positioning',
    path: '/',
    requiredText: /evidence-backed|Predicta|astrology|guidance/i,
  },
  {
    label: 'dashboard-positioning',
    path: '/dashboard',
    requiredText: /evidence-backed|Ask Predicta|Kundli|Reports|specialist/i,
  },
  {
    label: 'report-marketplace',
    path: '/dashboard/report',
    requiredText: /Pick the report|Download your report|Premium adds|What you will learn/i,
  },
  {
    label: 'vedic-boundary',
    path: '/dashboard/vedic',
    requiredText: /Vedic|Kundli|Dosh|Shrap|Yog|Lal Kitab|prediction/i,
  },
  {
    label: 'kp-boundary',
    path: '/dashboard/kp',
    requiredText: /KP|event|answer|proof|timing/i,
  },
  {
    label: 'jaimini-boundary',
    path: '/dashboard/jaimini',
    requiredText: /Jaimini|soul|karaka|destiny|role/i,
  },
  {
    label: 'numerology-boundary',
    path: '/dashboard/numerology',
    requiredText: /Numerology|number|cycle|name/i,
  },
  {
    label: 'signature-boundary',
    path: '/dashboard/signature',
    requiredText: /Signature|trait|confirmed|upload|draw/i,
  },
  {
    label: 'pricing-value',
    path: '/pricing',
    requiredText: /pricing|premium|pass|report|AI/i,
  },
  {
    label: 'redeem-cost-control',
    path: '/dashboard/redeem-pass',
    requiredText: /Private access|pass|Redeem|Kundli/i,
  },
];

function read(file) {
  return readFileSync(file, 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function addIssue(severity, message) {
  issueLedger[severity].push(message);
  if (severity === 'critical' || severity === 'major') {
    failures.push(`${severity.toUpperCase()}: ${message}`);
  }
}

function assertGate(condition, severity, message) {
  if (!condition) {
    addIssue(severity, message);
  }
}

function assertIncludes(source, fragment, severity, label) {
  assertGate(source.includes(fragment), severity, `${label}: missing ${fragment}`);
}

function assertNotIncludes(source, fragment, severity, label) {
  assertGate(!source.includes(fragment), severity, `${label}: must not include ${fragment}`);
}

const priorManifest = readJson(
  join('docs', 'audits', priorPhaseName, 'phase-8-rerun-all-report-final-phases-manifest.json'),
);
assertGate(priorManifest.status === 'GREEN', 'critical', 'Phase 8 rerun manifest must be GREEN before Phase 9.');

const roadmap = read('docs/PREDICTA_COMPETITOR_RESPONSE_POSITIONING_AND_REPORT_SUPREMACY_STRICT_PHASES.md');
[
  phaseName,
  'App positioning',
  'Specialist-room clarity',
  'Report marketplace UX',
  'Report preview truthfulness',
  'Predicta chat intelligence',
  'Free vs paid value',
  'Generated free and paid report artifacts',
  'PDF layout and premium feel',
  'School boundaries',
  'Local-memory-first AI cost control',
  'Translations and hidden UI copy',
  'Web/mobile parity',
  'Zero Critical issues.',
  'Zero Major issues.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'critical', 'Phase 9 roadmap'));

const competitorReportContract = read('packages/pdf/src/competitorReportContract.ts');
[
  'AskSoma',
  'YastroTalk',
  'Nebula',
  'prediction-first opening',
  'emotional usefulness',
  'evidence-backed confidence',
  'timing/current relevance',
  'direct practical guidance',
  'free value',
  'paid depth',
  'no fear/fluff/per-minute-pressure tone',
  'no psychic/advisor confusion',
  'no method mixing',
].forEach(fragment => assertIncludes(competitorReportContract, fragment, 'critical', 'competitor report contract'));

const competitorCopy = read('packages/config/src/translations/competitorResponse.json');
[
  'evidence-backed',
  'no per-minute pressure',
  'AskSoma',
  'YastroTalk',
  'Nebula',
].forEach(fragment => assertIncludes(competitorCopy, fragment, 'major', 'app positioning copy'));

const memory = read('packages/config/src/predictaMemory.ts');
[
  'competitorResponseRule',
  'generatedReportContext',
  'reportSectionMemory',
  'localMemoryFirstRule',
  'AskSoma, YastroTalk, and Nebula',
  'no fear-selling, no psychic confusion, and no per-minute pressure',
].forEach(fragment => assertIncludes(memory, fragment, 'critical', 'Predicta intelligence memory'));

const aiContext = read('packages/ai/src/contextBuilder.ts');
[
  'PREDICTA_APP_MEMORY_DIGEST',
  'PREDICTA_COMPETITOR_RESPONSE_CONTEXT_SUPREMACY_MEMORY',
  'generatedReportContext',
  'reportSectionMemory',
  'findPredictaReportSectionMemory',
].forEach(fragment => assertIncludes(aiContext, fragment, 'critical', 'AI context builder'));

const mobileAiContext = read('apps/mobile/src/services/ai/contextBuilder.ts');
[
  'PREDICTA_APP_MEMORY_DIGEST',
  'PREDICTA_COMPETITOR_RESPONSE_CONTEXT_SUPREMACY_MEMORY',
  'generatedReportContext',
  'reportSectionMemory',
].forEach(fragment => assertIncludes(mobileAiContext, fragment, 'critical', 'mobile AI context builder'));

const reportPreview = read('apps/web/components/WebDossierPreview.tsx');
[
  'data-competitor-response-phase5-value-preview',
  'data-report-final-phase10-preview="compact"',
  'localizedSelectedReport.userWillLearn',
  'localizedSelectedReport.premiumAdds',
  'buildGeneratedReportMemoryContext',
  'Signature report download is blocked until a confirmed signature sample is available.',
].forEach(fragment => assertIncludes(reportPreview, fragment, 'critical', 'report marketplace/preview truth'));

const mobileReport = read('apps/mobile/src/screens/ReportScreen.tsx');
[
  'testID="report-final-phase10-preview"',
  'product.userWillLearn',
  'product.premiumAdds',
  'buildGeneratedReportMemoryContext',
  'Signature reports require a confirmed signature sample.',
].forEach(fragment => assertIncludes(mobileReport, fragment, 'critical', 'mobile report marketplace/preview truth'));

const architecture = read('packages/pdf/src/reportArchitecture.ts');
[
  'competitorResponseContract',
  'Life Atlas is the only approved synthesis lane',
  'Schooling the user instead of answering the user',
  'Free report as hollow teaser',
  'Paid report as page-count padding',
].forEach(fragment => assertIncludes(architecture, fragment, 'critical', 'PDF report architecture'));
assertNotIncludes(architecture, "case 'NADI'", 'critical', 'PDF report architecture');

const noGoLedger = readJson(
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT/final-report-no-go-ledger.json',
);
assertGate(noGoLedger.issueLedger?.critical === 0, 'critical', 'Final report no-go ledger must have zero Critical issues.');
assertGate(noGoLedger.issueLedger?.major === 0, 'critical', 'Final report no-go ledger must have zero Major issues.');

const goldenMatrix = readJson(
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT/final-report-golden-matrix.json',
);
assertGate(goldenMatrix.matrix?.length === 12, 'critical', 'Final report golden matrix must contain 12 free/premium cases.');
assertGate(
  !goldenMatrix.matrix?.some(item => item.lane === 'NADI' || item.reportFocus === 'NADI'),
  'critical',
  'Nadi must not be restored as a final report lane.',
);

const phase8Manifest = readJson(
  'docs/audits/PREDICTA_COMPETITOR_RESPONSE_PHASE_8_RERUN_ALL_REPORT_FINAL_PHASES/phase-8-rerun-all-report-final-phases-manifest.json',
);
assertGate(phase8Manifest.issueLedger?.critical === 0, 'critical', 'Phase 8 issue ledger must have zero Critical issues.');
assertGate(phase8Manifest.issueLedger?.major === 0, 'critical', 'Phase 8 issue ledger must have zero Major issues.');
assertGate(phase8Manifest.goldenMatrixCases === 12, 'major', 'Phase 8 manifest must record 12 golden matrix cases.');

const phase6Manifest = readJson(
  'docs/audits/PREDICTA_COMPETITOR_RESPONSE_PHASE_6_FREE_VS_PAID_VALUE_AND_COST_CONTROL_ALIGNMENT/phase-6-manifest.json',
);
assertGate(phase6Manifest.status === 'GREEN', 'critical', 'Phase 6 cost-control manifest must remain GREEN.');
const serverLedger = read('packages/monetization/src/serverEntitlementLedger.ts');
[
  'FREE_AI_QUESTION_LIFETIME_LIMIT = 3',
  'DAY_PASS_LIMITS.questionsPerPass',
  'DAY_PASS_LIMITS.deepCallsPerPass',
  'DAY_PASS_LIMITS.pdfsPerPass',
].forEach(fragment => assertIncludes(serverLedger, fragment, 'critical', 'AI/report cost control'));
const webCostGuardrails = read('apps/web/lib/web-pass-cost-guardrails.ts');
[
  'FREE_LIFETIME_LIMITS',
  'questionsTotal: 3',
  'deepReadingsTotal: 0',
].forEach(fragment => assertIncludes(webCostGuardrails, fragment, 'critical', 'web free/paid cost control'));

const packageJson = readJson('package.json');
[
  'test:global-translation-coverage',
  'test:translation-trust',
  'test:localization-architecture',
  'test:competitor-response-phase-8',
  'test:pdf-golden',
].forEach(script => assertGate(Boolean(packageJson.scripts?.[script]), 'major', `package.json missing ${script}`));

[
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_4_VEDIC_REPORT_REBUILD/phase-4-vedic-report-rebuild-manifest.json',
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_5_KP_REPORT_REBUILD/phase-5-kp-report-rebuild-manifest.json',
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_6_JAIMINI_REPORT_REBUILD/phase-6-jaimini-report-rebuild-manifest.json',
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_7_NUMEROLOGY_REPORT_REBUILD/phase-7-numerology-report-rebuild-manifest.json',
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_8_SIGNATURE_REPORT_REBUILD/phase-8-signature-report-rebuild-manifest.json',
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_9_LIFE_ATLAS_FLAGSHIP_REBUILD/phase-9-life-atlas-flagship-rebuild-manifest.json',
  'docs/audits/PREDICTA_COMPETITOR_RESPONSE_PHASE_8_RERUN_ALL_REPORT_FINAL_PHASES/phase-8-rerun-all-report-final-phases-manifest.json',
].forEach(file => {
  assertGate(existsSync(file), 'critical', `missing artifact ${file}`);
  if (existsSync(file)) {
    assertGate(readJson(file).status === 'GREEN', 'critical', `${file} must be GREEN.`);
  }
});

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for Phase 9 competitor no-go screenshot audit.');
}

await assertServerReady(baseUrl);
mkdirSync(screenshotRoot, { recursive: true });

const port = 10_900 + Math.floor(Math.random() * 300);
const userDataDir = join(tmpdir(), `predicta-competitor-phase9-chrome-${Date.now()}`);
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

const routeChecks = [];

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
          mobile: viewport.name.includes('mobile'),
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
        const metrics = await evaluatePage(cdp, route.requiredText);
        const screenshot = await cdp.send('Page.captureScreenshot', {
          captureBeyondViewport: false,
          format: 'png',
          fromSurface: true,
        });
        const fileName = `${viewport.name}-${route.label}.png`;
        writeFileSync(join(screenshotRoot, fileName), Buffer.from(screenshot.data, 'base64'));

        routeChecks.push({
          fileName,
          finalUrl: readiness.finalUrl,
          route: route.path,
          viewport: viewport.name,
          viewportWidth: viewport.width,
          ...metrics.summary,
        });

        if (!metrics.summary.hasRequiredText) {
          addIssue('major', `${viewport.name} ${route.path}: missing required competitor-response content.`);
        }
        if (metrics.summary.horizontalOverflow > 0) {
          addIssue('major', `${viewport.name} ${route.path}: page is ${metrics.summary.horizontalOverflow}px wider than viewport.`);
        }
        if (metrics.summary.clippedText > 0) {
          addIssue('major', `${viewport.name} ${route.path}: clips ${metrics.summary.clippedText} visible text nodes.`);
        }
        for (const item of metrics.wideElements) {
          addIssue('major', `${viewport.name} ${route.path}: ${item.selector} extends beyond viewport (${item.left}..${item.right}).`);
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

const status = issueLedger.critical.length || issueLedger.major.length ? 'FAILED' : 'GREEN';
const manifest = {
  baseUrl,
  finalReportLanes: ['VEDIC', 'KP', 'JAIMINI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS'],
  generatedAt: new Date().toISOString(),
  issueCounts: {
    critical: issueLedger.critical.length,
    major: issueLedger.major.length,
    medium: issueLedger.medium.length,
    minor: issueLedger.minor.length,
  },
  nadiFinalReportLane: false,
  phase: phaseName,
  routeChecks,
  screenshotRoot,
  status,
};

writeFileSync(join(auditRoot, 'phase-9-competitor-no-go-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(join(auditRoot, 'competitor-no-go-issue-ledger.json'), `${JSON.stringify(issueLedger, null, 2)}\n`);
writeFileSync(
  join(auditRoot, 'verification.txt'),
  `${[
    `${phaseName}: ${status === 'GREEN' ? 'PASS' : 'FAIL'}`,
    '- Phase 8 rerun manifest checked.',
    '- Report final golden matrix and no-go ledger checked.',
    '- App positioning, specialist clarity, report UX, preview truth, memory, cost control, translations, web/mobile parity, and generated artifacts checked.',
    `- Browser route checks: ${routeChecks.length}.`,
    `- Critical issues: ${issueLedger.critical.length}.`,
    `- Major issues: ${issueLedger.major.length}.`,
  ].join('\n')}\n`,
);
writeFileSync(
  join(auditRoot, 'golden-artifact-competitor-no-go-reaudit.md'),
  `${[
    `# ${phaseName}`,
    '',
    '## Verdict',
    '',
    status === 'GREEN'
      ? 'GREEN: zero Critical and zero Major issues remain after the competitor-response no-go audit.'
      : 'RED: Critical or Major issues remain.',
    '',
    '## Audit Scope',
    '',
    '- App positioning.',
    '- Specialist-room clarity.',
    '- Report marketplace UX and preview truthfulness.',
    '- Predicta chat intelligence and local-memory-first behavior.',
    '- Free vs paid value and AI/report cost controls.',
    '- Generated free and paid report artifacts.',
    '- PDF layout contract and premium report gates.',
    '- School boundaries and no active Nadi report lane.',
    '- Translation/source coverage gate availability.',
    '- Desktop, tablet, mobile, and narrow-mobile browser screenshots.',
    '',
    '## Issue Ledger',
    '',
    `- Critical: ${issueLedger.critical.length}`,
    `- Major: ${issueLedger.major.length}`,
    `- Medium: ${issueLedger.medium.length}`,
    `- Minor: ${issueLedger.minor.length}`,
    '',
    issueLedger.critical.length || issueLedger.major.length
      ? [...issueLedger.critical, ...issueLedger.major].map(issue => `- ${issue}`).join('\n')
      : '- No Critical or Major issues found.',
  ].join('\n')}\n`,
);

console.log(JSON.stringify(manifest, null, 2));

if (status !== 'GREEN') {
  console.error(`${phaseName} failed:`);
  for (const issue of [...issueLedger.critical, ...issueLedger.major]) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log(`${phaseName} passed: final competitor no-go audit is GREEN.`);

async function assertServerReady(url) {
  try {
    await getText(url);
  } catch (error) {
    throw new Error(
      `Phase 9 requires a running web server at ${url}. Start the production build on port 3009 before running this gate. ${error.message}`,
    );
  }
}

async function evaluatePage(cdp, requiredText) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const viewportWidth = document.documentElement.clientWidth;
      const body = document.body;
      const root = document.documentElement;
      const wideElements = [];
      const clippedText = [];
      const ignoredTags = new Set(['SCRIPT', 'STYLE', 'META', 'LINK', 'TITLE', 'SVG', 'PATH']);
      const required = new RegExp(${JSON.stringify(requiredText.source)}, ${JSON.stringify(requiredText.flags)});

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

        const text = directText(element);
        if (text.length < 6 || style.textOverflow === 'ellipsis' || isIntentionalScrollRegion(style)) {
          continue;
        }

        if (Math.ceil(element.scrollWidth) > Math.ceil(element.clientWidth) + 4) {
          clippedText.push(selectorFor(element));
        }
      }

      return {
        summary: {
          clippedText: clippedText.length,
          hasRequiredText: required.test(document.body.textContent || ''),
          horizontalOverflow: Math.max(
            0,
            Math.ceil(Math.max(root.scrollWidth, body.scrollWidth) - viewportWidth),
          ),
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
    const req = httpRequest(
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
    req.on('error', reject);
    req.end();
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
