import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { assertAuditablePredictaPage } from './lib/predicta-audit-page-readiness.mjs';

const phaseName =
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_5_REPORT_PREVIEW_AND_CTA_VALUE_ALIGNMENT';
const priorPhaseName =
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_4_APP_SURFACE_PREDICTION_FIRST_UX_REBUILD';
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

const viewports = [
  { height: 1100, name: 'desktop', width: 1440 },
  { height: 1112, name: 'tablet', width: 834 },
  { height: 844, name: 'mobile', width: 390 },
  { height: 740, name: 'narrow-mobile', width: 360 },
];

const productIds = [
  'KUNDLI',
  'VEDIC',
  'KP',
  'JAIMINI',
  'CAREER',
  'MARRIAGE',
  'WEALTH',
  'SADESATI',
  'DASHA',
  'COMPATIBILITY',
  'LIFE_ATLAS',
  'NUMEROLOGY',
  'SIGNATURE',
  'REMEDIES',
];

const failures = [];

function read(file) {
  return readFileSync(file, 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function assertGate(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function assertIncludes(source, fragment, label) {
  assertGate(source.includes(fragment), `${label}: missing ${fragment}`);
}

const priorManifest = readJson(
  join('docs', 'audits', priorPhaseName, 'phase-4-manifest.json'),
);
assertGate(priorManifest.status === 'GREEN', 'Phase 4 manifest must be GREEN before Phase 5.');

const roadmap = read(
  'docs/PREDICTA_COMPETITOR_RESPONSE_POSITIONING_AND_REPORT_SUPREMACY_STRICT_PHASES.md',
);
[
  phaseName,
  'Report marketplace lane copy',
  'Inline selected-report action panel',
  'Vedic report builder copy',
  'Report inclusion summaries',
  'Premium upsell copy',
  'Download dialog copy',
  'Mobile stacked report tabs/links',
  'User never has to scroll to find the download CTA',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 5 roadmap'));

const pricing = read('packages/config/src/pricing.ts');
[
  'userWillLearn: string',
  'premiumAdds: string',
  'You will learn',
  'Premium adds',
].forEach(fragment => assertIncludes(pricing, fragment, 'pricing value contract'));

for (const productId of productIds) {
  const blockStart = pricing.indexOf(`    id: '${productId}',`);
  assertGate(blockStart !== -1, `pricing product ${productId} must exist`);
  if (blockStart === -1) {
    continue;
  }
  const nextId = productIds
    .map(id => pricing.indexOf(`    id: '${id}',`, blockStart + 1))
    .filter(index => index !== -1)
    .sort((a, b) => a - b)[0];
  const block = pricing.slice(blockStart, nextId ?? pricing.indexOf('];', blockStart));
  assertIncludes(block, 'userWillLearn:', `${productId} value contract`);
  assertIncludes(block, 'premiumAdds:', `${productId} value contract`);
}

const web = read('apps/web/components/WebDossierPreview.tsx');
[
  'localizedSelectedReport.userWillLearn',
  'localizedSelectedReport.premiumAdds',
  'localizedProduct.userWillLearn',
  'data-competitor-response-phase5-value-preview',
  'data-competitor-response-phase5-vedic-builder="value-first"',
  'What you will learn',
  'Premium adds',
  'deeper prediction, evidence, timing, contradictions, and practical guidance',
  'renderInlineReportComposer(product)',
  'renderInlineReportComposer(selectedReport,',
  'builderCopy.previewSelected',
].forEach(fragment => assertIncludes(web, fragment, 'web report value alignment'));

const css = read('apps/web/app/globals.css');
[
  '.report-value-alignment-bridge',
  '.report-premium-value-row',
].forEach(fragment => assertIncludes(css, fragment, 'web Phase 5 CSS'));

const mobile = read('apps/mobile/src/screens/ReportScreen.tsx');
[
  'product.userWillLearn',
  'product.premiumAdds',
  'accessibilityLabel="Report value preview"',
  'testID="report-final-phase10-preview"',
  'WHAT YOU WILL LEARN',
  'PREMIUM ADDS',
  'Predicta chooses the sections that answer this report question first',
  'renderInlineReportComposer(product)',
].forEach(fragment => assertIncludes(mobile, fragment, 'mobile report value alignment'));

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for Phase 5 report preview screenshot audit.');
}

await assertServerReady(baseUrl);
mkdirSync(screenshotRoot, { recursive: true });

const port = 10_500 + Math.floor(Math.random() * 300);
const userDataDir = join(tmpdir(), `predicta-competitor-phase5-chrome-${Date.now()}`);
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

const checks = [];

try {
  await waitForChrome(port);

  for (const viewport of viewports) {
    const route = '/dashboard/report';
    const url = `${baseUrl}${route}`;
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
        route,
        url,
      });
      const metrics = await evaluateReportPage(cdp);
      const screenshot = await cdp.send('Page.captureScreenshot', {
        captureBeyondViewport: false,
        format: 'png',
        fromSurface: true,
      });
      const fileName = `${viewport.name}-report-preview-value.png`;
      writeFileSync(join(screenshotRoot, fileName), Buffer.from(screenshot.data, 'base64'));

      checks.push({
        fileName,
        finalUrl: readiness.finalUrl,
        route,
        viewport: viewport.name,
        viewportWidth: viewport.width,
        ...metrics.summary,
      });

      if (!metrics.summary.hasFirstScreenDownloadCta) {
        failures.push(`${viewport.name} ${route}: first selected report panel lacks visible Download your report CTA.`);
      }
      if (!metrics.summary.hasValuePreview) {
        failures.push(`${viewport.name} ${route}: selected report panel lacks Phase 5 value preview.`);
      }
      if (!metrics.summary.hasPremiumAdds) {
        failures.push(`${viewport.name} ${route}: selected report panel lacks Premium adds value copy.`);
      }
      if (metrics.summary.horizontalOverflow > 0) {
        failures.push(`${viewport.name} ${route}: page is ${metrics.summary.horizontalOverflow}px wider than viewport.`);
      }
      if (metrics.summary.clippedText > 0) {
        failures.push(`${viewport.name} ${route}: clips ${metrics.summary.clippedText} visible text nodes.`);
      }
      for (const item of metrics.wideElements) {
        failures.push(`${viewport.name} ${route}: ${item.selector} extends beyond viewport (${item.left}..${item.right}).`);
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
  status: failures.length ? 'FAILED' : 'GREEN',
};

writeFileSync(join(auditRoot, 'phase-5-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(
  join(auditRoot, 'verification.txt'),
  [
    'corepack pnpm test:competitor-response-phase-5',
    'corepack pnpm --filter @pridicta/config typecheck',
    'corepack pnpm --filter @pridicta/web typecheck',
    'corepack pnpm --filter @pridicta/mobile typecheck',
    'corepack pnpm build:web',
    'git diff --check',
  ].join('\n') + '\n',
);
writeFileSync(
  join(auditRoot, 'report-preview-cta-value-alignment-audit.md'),
  [
    `# ${phaseName}`,
    '',
    `Status: ${failures.length ? 'RED' : 'GREEN'}`,
    '',
    '## Audit Scope',
    '',
    '- Report marketplace lane copy.',
    '- Inline selected-report composer.',
    '- Vedic builder value copy.',
    '- Free vs Premium value summaries.',
    '- Download dialog copy.',
    '- Mobile stacked report selection and preview card.',
    '',
    '## Strict Result',
    '',
    failures.length
      ? failures.map(failure => `- ${failure}`).join('\n')
      : '- All report preview and CTA surfaces lead with what the user will learn, keep Premium value explicit, preserve inline download access, and pass screenshot overflow/clipping checks across desktop, tablet, mobile, and narrow mobile.',
  ].join('\n') + '\n',
);

console.log(JSON.stringify(manifest, null, 2));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName} passed: report previews and CTAs are value-aligned and screenshot-audited.`);

async function assertServerReady(url) {
  try {
    await getText(url);
  } catch (error) {
    throw new Error(
      `Phase 5 requires a running web server at ${url}. Start the production build on port 3009 before running this gate. ${error.message}`,
    );
  }
}

async function evaluateReportPage(cdp) {
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

      const composer = document.querySelector('.report-selected-choice .report-inline-composer');
      const visibleText = (composer?.textContent || '').replace(/\\s+/g, ' ');
      const cta = composer ? [...composer.querySelectorAll('button, a')].find(element => {
        return isVisible(element) && /Download your report/i.test(element.textContent || '');
      }) : null;

      return {
        summary: {
          clippedText: clippedText.length,
          hasFirstScreenDownloadCta: Boolean(cta),
          hasPremiumAdds: /Premium adds/i.test(visibleText),
          hasValuePreview: Boolean(
            composer &&
            composer.querySelector('[data-competitor-response-phase5-value-preview]') &&
            /What you will learn/i.test(visibleText)
          ),
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
