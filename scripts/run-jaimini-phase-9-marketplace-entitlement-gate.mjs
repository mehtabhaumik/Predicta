import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const phaseName = 'PREDICTA_JAIMINI_PHASE_9_REPORT_MARKETPLACE_PRICING_ENTITLEMENT_AND_PACKS';
const phaseRoot = `docs/audits/${phaseName}`;
const screenshotRoot = join(phaseRoot, 'screenshots');
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

const failures = [];
const sourceChecks = [
  ['docs/PREDICTA_JAIMINI_REPLACES_NADI_STRICT_ROADMAP.md', phaseName],
  ['packages/config/src/pricing.ts', "JAIMINI_REPORT: 'pridicta_jaimini_report'"],
  ['packages/config/src/pricing.ts', "label: 'Jaimini Report Credit'"],
  ['packages/config/src/pricing.ts', "id: 'JAIMINI_REPORT'"],
  ['packages/config/src/pricing.ts', "school: 'JAIMINI'"],
  ['packages/types/src/subscription.ts', "| 'JAIMINI_REPORT'"],
  ['packages/monetization/src/entitlementService.ts', 'hasJaiminiReportCredit'],
  ['packages/monetization/src/entitlementService.ts', 'hasReportPdfCredit'],
  ['packages/monetization/src/entitlementService.ts', 'consumeReportPdfCreditFromState'],
  ['packages/monetization/src/entitlementService.ts', "String(item.productType) === 'NADI_REPORT'"],
  ['apps/mobile/src/services/subscription/entitlementService.ts', 'hasJaiminiReportCredit'],
  ['apps/mobile/src/services/billing/mockBillingProvider.ts', "product.id === 'JAIMINI_REPORT'"],
  ['apps/mobile/src/store/useAppStore.ts', 'hasReportPdfCredit'],
  ['apps/mobile/src/store/useAppStore.ts', 'consumeReportPdfCredit'],
  ['apps/mobile/src/screens/ReportScreen.tsx', "getOneTimeProduct('JAIMINI_REPORT')"],
  ['apps/mobile/src/screens/PaywallScreen.tsx', 'Question and report packs'],
  ['apps/mobile/__tests__/entitlementService.test.ts', 'keeps Jaimini report credit scoped to Jaimini reports'],
  ['apps/web/components/WebDossierPreview.tsx', 'hasReportPdfCredit('],
  ['apps/web/components/WebDossierPreview.tsx', "getOneTimeProduct('JAIMINI_REPORT')"],
  ['apps/web/app/dashboard/premium/page.tsx', 'JAIMINI_REPORT'],
  ['apps/web/app/pricing/page.tsx', 'JAIMINI_REPORT'],
  ['package.json', '"test:jaimini-phase-9": "node scripts/run-jaimini-phase-9-marketplace-entitlement-gate.mjs"'],
];

for (const [file, fragment] of sourceChecks) {
  assertIncludes(read(file), fragment, `${file} includes ${fragment}`);
}

const pricing = read('packages/config/src/pricing.ts');
assertNotIncludes(pricing, "| 'NADI'", 'active report marketplace pricing type excludes NADI id');
assertNotIncludes(pricing, "school: 'NADI'", 'active report marketplace pricing type excludes NADI school');

const webReport = read('apps/web/components/WebDossierPreview.tsx');
assertNotIncludes(webReport, 'jaiminiReportPending', 'web report no longer blocks Jaimini as pending');
assertNotIncludes(
  webReport,
  'Jaimini report generation unlocks after',
  'web report no longer shows stale Jaimini pending message',
);

for (const file of [
  'apps/web/app/checkout/page.tsx',
  'apps/web/app/pricing/page.tsx',
  'apps/web/app/dashboard/premium/page.tsx',
]) {
  assertNotIncludes(read(file), 'Nadi', `${file} does not mention Nadi`);
  assertNotIncludes(read(file), 'NADI', `${file} does not mention NADI`);
}

const runtimeChecks = await captureRuntimeEvidence();
const manifest = {
  baseUrl,
  generatedAt: new Date().toISOString(),
  phase: phaseName,
  runtimeChecks,
  screenshotRoot,
  sourceChecks: sourceChecks.map(([file, fragment]) => ({ file, fragment })),
  status: failures.length ? 'failed' : 'green',
};

mkdirSync(phaseRoot, { recursive: true });
writeFileSync(join(phaseRoot, 'phase-9-marketplace-entitlement-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(join(phaseRoot, 'verification.txt'), renderVerification(manifest));

console.log(JSON.stringify(manifest, null, 2));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName} passed: Jaimini marketplace, pricing, entitlement, and web/mobile pack access are green.`);

function read(file) {
  return readFileSync(file, 'utf8');
}

function assertIncludes(source, fragment, label) {
  try {
    assert.ok(source.includes(fragment), label);
  } catch {
    failures.push(label);
  }
}

function assertNotIncludes(source, fragment, label) {
  try {
    assert.ok(!source.includes(fragment), label);
  } catch {
    failures.push(label);
  }
}

async function captureRuntimeEvidence() {
  if (!chromePath) {
    throw new Error('Chrome or Chromium is required for Jaimini Phase 9 report marketplace screenshots.');
  }

  await assertServerReady(`${baseUrl}/pricing`);
  mkdirSync(screenshotRoot, { recursive: true });

  const port = 10_700 + Math.floor(Math.random() * 300);
  const userDataDir = join(tmpdir(), `predicta-jaimini-phase9-chrome-${Date.now()}`);
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
    for (const route of [
      {
        assertions: ['Jaimini Report Credit', 'One-time purchases'],
        fileName: 'pricing-jaimini-report-credit.png',
        id: 'pricing',
        url: `${baseUrl}/pricing`,
      },
      {
        assertions: ['Jaimini Report Credit', 'Secure checkout'],
        fileName: 'checkout-jaimini-report-credit.png',
        id: 'checkout',
        url: `${baseUrl}/checkout?productId=pridicta_jaimini_report`,
      },
      {
        assertions: ['Jaimini', 'Life Atlas'],
        fileName: 'report-marketplace-jaimini.png',
        id: 'report-marketplace',
        url: `${baseUrl}/dashboard/report?focus=JAIMINI&mode=PREMIUM`,
      },
    ]) {
      const page = await createTarget(port, 'about:blank');
      const cdp = await connectWebSocket(page.webSocketDebuggerUrl);

      try {
        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');
        await cdp.send('Emulation.setDeviceMetricsOverride', {
          deviceScaleFactor: 1,
          height: 1000,
          mobile: false,
          width: 1440,
        });
        await navigateAndWait(cdp, route.url);
        const metrics = await evaluatePage(cdp);
        const screenshot = await cdp.send('Page.captureScreenshot', {
          captureBeyondViewport: false,
          format: 'png',
          fromSurface: true,
        });
        writeFileSync(join(screenshotRoot, route.fileName), Buffer.from(screenshot.data, 'base64'));

        for (const assertion of route.assertions) {
          if (!metrics.bodyText.includes(assertion)) {
            failures.push(`${route.id}: missing visible copy "${assertion}".`);
          }
        }

        if (/Nadi|NADI/.test(metrics.bodyText)) {
          failures.push(`${route.id}: active user-facing surface still mentions Nadi.`);
        }

        if (/Application error|Unhandled Runtime Error|This page could not be found/i.test(metrics.bodyText)) {
          failures.push(`${route.id}: route rendered an error state.`);
        }

        if (metrics.horizontalOverflow > 0) {
          failures.push(`${route.id}: page has ${metrics.horizontalOverflow}px horizontal overflow.`);
        }

        checks.push({
          fileName: route.fileName,
          hasJaimini: metrics.bodyText.includes('Jaimini'),
          horizontalOverflow: metrics.horizontalOverflow,
          id: route.id,
          url: route.url,
        });
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

  return checks;
}

async function evaluatePage(cdp) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const viewportWidth = document.documentElement.clientWidth;
      const bodyText = document.body.innerText.replace(/\\s+/g, ' ').trim();
      return {
        bodyText,
        horizontalOverflow: Math.max(
          0,
          Math.ceil(Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - viewportWidth),
        ),
      };
    })()`,
    returnByValue: true,
  });

  return response.result.value;
}

function renderVerification(manifest) {
  return [
    `${phaseName} verification`,
    '',
    `Status: ${manifest.status}`,
    `Base URL: ${manifest.baseUrl}`,
    '',
    'Runtime screenshots:',
    ...manifest.runtimeChecks.map(
      check => `- ${check.id}: ${check.fileName} (${check.url})`,
    ),
    '',
    'Source locks:',
    ...manifest.sourceChecks.map(check => `- ${check.file}: ${check.fragment}`),
    '',
  ].join('\n');
}

async function assertServerReady(url) {
  try {
    await getText(url);
  } catch (error) {
    throw new Error(
      `Jaimini Phase 9 runtime smoke requires the web app running at ${baseUrl}. Start it with PORT=3009 HOSTNAME=127.0.0.1 corepack pnpm --filter @pridicta/web exec next start. ${error instanceof Error ? error.message : ''}`,
    );
  }
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
  });
}
