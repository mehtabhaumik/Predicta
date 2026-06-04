import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { assertAuditablePredictaPage } from './lib/predicta-audit-page-readiness.mjs';

const phaseName = 'PREDICTA_KUNDLI_KARMA_PHASE_8_WEB_VEDIC_APP_SURFACE';
const baseUrl = process.env.PREDICTA_AUDIT_BASE_URL ?? 'http://127.0.0.1:3009';
const phaseRoot = `docs/audits/${phaseName}`;
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

const viewports = [
  { height: 1100, name: 'desktop', width: 1440 },
  { height: 1112, name: 'tablet', width: 834 },
  { height: 844, name: 'mobile', width: 390 },
  { height: 740, name: 'narrow-mobile', width: 360 },
];

const sourceFiles = {
  css: readFileSync('apps/web/app/globals.css', 'utf8'),
  kundliKarmaTranslations: readFileSync('packages/config/src/translations/kundliKarma.json', 'utf8'),
  packageJson: readFileSync('package.json', 'utf8'),
  panel: readFileSync('apps/web/components/WebVedicIntelligencePanel.tsx', 'utf8'),
  roadmap: readFileSync('docs/PREDICTA_KUNDLI_KARMA_INTELLIGENCE_STRICT_PHASES.md', 'utf8'),
};

const failures = [];
const checks = [];

for (const fragment of [
  phaseName,
  'Add a calm Kundli Karma section to the Vedic world.',
  'Show only top 3 active conditions upfront.',
  '`Dosh`',
  '`Shrap`',
  '`Yog`',
  '`Lal Kitab`',
  'Add local-memory CTA payloads for each visible item.',
]) {
  assertIncludes(sourceFiles.roadmap, fragment, `roadmap includes ${fragment}`);
}

for (const fragment of [
  'composeKundliKarmaSnapshot',
  'getKundliKarmaCopy',
  'KundliKarmaWebSurface',
  'const copy = getKundliKarmaCopy(language)',
  'const moduleGroups = getKundliKarmaModuleGroups(copy)',
  'copy.snapshotMetaTitle',
  'copy.groupDoshTitle',
  'copy.groupShrapTitle',
  'copy.groupYogTitle',
  'copy.groupLalKitabTitle',
  'topThreeActiveConditions',
  'aria-label={copy.topThreeAriaLabel}',
  'aria-label={copy.categoryAriaLabel}',
  'data-local-memory-cta="kundli-karma"',
  'data-kundli-karma-rule-id',
  'data-kundli-karma-item-id',
  'data-kundli-karma-generated-by',
  'copy.askWhyCta',
  'copy.downloadDetailedReportCta',
  'copy.premiumLockedBody',
  'copy.noMajorAlertsTitle',
  'copy.calculationPendingTitle',
  'copy.kundliNeededTitle',
  '<KundliKarmaEvidenceList',
  'buildPredictaChatHref',
  "school: 'PARASHARI'",
  'selectedLanguage: options.language',
]) {
  assertIncludes(sourceFiles.panel, fragment, `web panel includes ${fragment}`);
}

for (const fragment of [
  '"surfaceTitle"',
  '"snapshotMetaTitle"',
  '"askWhyCta"',
  '"downloadDetailedReportCta"',
  '"groupDoshTitle"',
  '"groupShrapTitle"',
  '"groupYogTitle"',
  '"groupLalKitabTitle"',
  '"remedyCategoryFreeKarmaDharmaAction"',
]) {
  assertIncludes(sourceFiles.kundliKarmaTranslations, fragment, `Kundli Karma translations include ${fragment}`);
}

for (const fragment of [
  '.kundli-karma-panel',
  '.kundli-karma-top-grid',
  '.kundli-karma-module-grid',
  '.kundli-karma-actions',
  '.kundli-karma-evidence-list',
  'overflow-wrap: anywhere',
  'min-width: 0',
  'min-height: var(--predicta-touch-target)',
  '@media (max-width: 820px)',
  '@media (max-width: 640px)',
]) {
  assertIncludes(sourceFiles.css, fragment, `CSS includes ${fragment}`);
}

assertIncludes(
  sourceFiles.packageJson,
  '"test:kundli-karma-phase-8": "node scripts/run-kundli-karma-phase-8-web-vedic-surface-gate.mjs"',
  'package exposes Phase 8 gate',
);

for (const banned of [
  /you are cursed/i,
  /cursed/i,
  /must buy/i,
  /only premium can save/i,
  /will destroy/i,
]) {
  assert.ok(!banned.test(sourceFiles.panel), `web panel contains banned fear phrase ${banned}`);
}

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for Kundli Karma Phase 8 screenshots.');
}

mkdirSync(screenshotRoot, { recursive: true });

const port = 10_700 + Math.floor(Math.random() * 400);
const userDataDir = join(tmpdir(), `predicta-kundli-karma-phase8-chrome-${Date.now()}`);
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
    const page = await createTarget(port, 'about:blank');
    const cdp = await connectWebSocket(page.webSocketDebuggerUrl);

    try {
      await cdp.send('Page.enable');
      await cdp.send('Runtime.enable');
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        deviceScaleFactor: 1,
        height: viewport.height,
        mobile: viewport.width < 700,
        width: viewport.width,
      });
      await navigateAndWait(cdp, `${baseUrl}/dashboard/vedic`);
      await cdp.send('Runtime.evaluate', {
        awaitPromise: true,
        expression:
          'document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 4000))]) : true',
      });

      const readiness = await assertAuditablePredictaPage(cdp, {
        route: '/dashboard/vedic',
        url: `${baseUrl}/dashboard/vedic`,
      });
      const metrics = await evaluateKundliKarmaSurface(cdp);
      const screenshot = await cdp.send('Page.captureScreenshot', {
        captureBeyondViewport: false,
        format: 'png',
        fromSurface: true,
      });
      const fileName = `${viewport.name}-vedic-kundli-karma.png`;
      writeFileSync(join(screenshotRoot, fileName), Buffer.from(screenshot.data, 'base64'));

      checks.push({
        fileName,
        finalUrl: readiness.finalUrl,
        viewport: viewport.name,
        viewportWidth: viewport.width,
        ...metrics.summary,
      });

      if (!metrics.summary.hasPanel) {
        failures.push(`${viewport.name}: Kundli Karma panel is missing.`);
      }
      if (!metrics.summary.hasSnapshotTitle) {
        failures.push(`${viewport.name}: Kundli Karma Snapshot title is missing.`);
      }
      if (!metrics.summary.hasAllModuleCards) {
        failures.push(`${viewport.name}: Dosh/Shrap/Yog/Lal Kitab cards are incomplete.`);
      }
      if (!metrics.summary.hasMissingKundliState && !metrics.summary.hasTopThreeCards) {
        failures.push(`${viewport.name}: neither missing-Kundli state nor top-three cards are visible.`);
      }
      if (!metrics.summary.hasLocalMemoryPayloadStatic) {
        failures.push(`${viewport.name}: local-memory CTA payload markers are missing from source.`);
      }
      if (metrics.summary.horizontalOverflow > 0) {
        failures.push(`${viewport.name}: page is ${metrics.summary.horizontalOverflow}px wider than viewport.`);
      }
      if (metrics.summary.clippedText > 0) {
        failures.push(`${viewport.name}: ${metrics.summary.clippedText} visible text nodes are clipped.`);
      }
      if (metrics.summary.tightActionGaps > 0) {
        failures.push(`${viewport.name}: ${metrics.summary.tightActionGaps} Kundli Karma CTAs are cramped.`);
      }
      for (const item of metrics.wideElements) {
        failures.push(`${viewport.name}: ${item.selector} extends beyond viewport (${item.left}..${item.right}).`);
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
  baseUrl,
  checks,
  generatedAt: new Date().toISOString(),
  phase: phaseName,
  screenshotRoot,
  status: failures.length ? 'failed' : 'green',
};

mkdirSync(phaseRoot, { recursive: true });
writeFileSync(join(phaseRoot, 'phase-8-web-vedic-surface-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(
  join(phaseRoot, 'verification.txt'),
  [
    `${phaseName}: ${failures.length ? 'FAILED' : 'PASS'}`,
    '- web Vedic room consumes composeKundliKarmaSnapshot from @pridicta/astrology',
    '- calm top-three snapshot, Dosh/Shrap/Yog/Lal Kitab cards, expanders, remedies, premium lock, and missing states are source-locked through dedicated translations',
    '- desktop/tablet/mobile/narrow-mobile screenshots are captured by the gate',
    '- overflow, clipped text, CTA spacing, and category visibility are audited',
    '',
  ].join('\n'),
);
console.log(JSON.stringify(manifest, null, 2));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName} passed: web Vedic Kundli Karma surface is compact, deterministic, responsive, and progressive.`);

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), `${label}: missing ${fragment}`);
}

async function evaluateKundliKarmaSurface(cdp) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
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

      const panel = document.querySelector('.kundli-karma-panel');
      const moduleTexts = [...document.querySelectorAll('.kundli-karma-module-card summary strong')]
        .filter(isVisible)
        .map(element => element.textContent?.trim());
      const actionButtons = [...document.querySelectorAll('.kundli-karma-actions a, .kundli-karma-actions button')]
        .filter(isVisible);

      return {
        summary: {
          clippedText: clippedText.length,
          hasAllModuleCards: ['Dosh', 'Shrap', 'Yog', 'Lal Kitab'].every(label => moduleTexts.includes(label)),
          hasLocalMemoryPayloadStatic: ${JSON.stringify(sourceFiles.panel.includes('data-local-memory-cta="kundli-karma"') && sourceFiles.panel.includes('data-kundli-karma-rule-id'))},
          hasMissingKundliState: Boolean([...document.querySelectorAll('.kundli-karma-empty strong')].some(element => /Kundli needed|No major Kundli Karma alerts|Calculation pending/i.test(element.textContent || ''))),
          hasPanel: Boolean(panel),
          hasSnapshotTitle: Boolean([...document.querySelectorAll('*')].some(element => isVisible(element) && /Kundli Karma Snapshot/i.test(element.textContent || ''))),
          hasTopThreeCards: document.querySelectorAll('.kundli-karma-condition-card[data-kundli-karma-rule-id][data-kundli-karma-item-id]').length > 0,
          horizontalOverflow: Math.max(
            0,
            Math.ceil(Math.max(root.scrollWidth, body.scrollWidth) - viewportWidth),
          ),
          tightActionGaps: countTightGaps(actionButtons),
        },
        wideElements: wideElements.slice(0, 12),
      };

      function countTightGaps(elements) {
        let tight = 0;
        const rects = elements.map(element => element.getBoundingClientRect());
        for (let i = 0; i < rects.length; i += 1) {
          for (let j = i + 1; j < rects.length; j += 1) {
            const a = rects[i];
            const b = rects[j];
            const verticalGap = Math.max(0, Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom));
            const horizontalGap = Math.max(0, Math.max(a.left, b.left) - Math.min(a.right, b.right));
            const sameRow = Math.abs(a.top - b.top) < 12;
            const stacked = Math.abs(a.left - b.left) < 12;
            if ((sameRow && horizontalGap > 0 && horizontalGap < 10) || (stacked && verticalGap > 0 && verticalGap < 10)) {
              tight += 1;
            }
          }
        }
        return tight;
      }
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
