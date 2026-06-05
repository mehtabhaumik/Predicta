import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { assertAuditablePredictaPage } from './lib/predicta-audit-page-readiness.mjs';

const phaseName =
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_6_FREE_VS_PAID_VALUE_AND_COST_CONTROL_ALIGNMENT';
const priorPhaseName =
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_5_REPORT_PREVIEW_AND_CTA_VALUE_ALIGNMENT';
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
const routes = [
  {
    label: 'report',
    path: '/dashboard/report',
    requiredText: /Premium adds|Download your report|starter|AI|report/i,
  },
  {
    label: 'redeem-pass',
    path: '/dashboard/redeem-pass',
    requiredText: /Private access starts here|pass email|Redeem/i,
  },
  {
    label: 'admin',
    path: '/dashboard/admin',
    requiredText: /Owner tools are not available here|protected owner environment/i,
  },
];
const viewports = [
  { height: 1100, name: 'desktop', width: 1440 },
  { height: 844, name: 'mobile', width: 390 },
];

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

function assertNotIncludes(source, fragment, label) {
  assertGate(!source.includes(fragment), `${label}: must not include ${fragment}`);
}

const priorManifest = readJson(
  join('docs', 'audits', priorPhaseName, 'phase-5-manifest.json'),
);
assertGate(priorManifest.status === 'GREEN', 'Phase 5 manifest must be GREEN before Phase 6.');

const monetizationFinal = readJson(
  join(
    'docs',
    'audits',
    'PREDICTA_MONETIZATION_PHASE_12_FINAL_PROFIT_SAFETY_RELEASE_AUDIT',
    'phase-12-final-profit-safety-manifest.json',
  ),
);
assertGate(
  monetizationFinal.status === 'GREEN',
  'Monetization final profit/safety manifest must be GREEN before Phase 6.',
);

const roadmap = read(
  'docs/PREDICTA_COMPETITOR_RESPONSE_POSITIONING_AND_REPORT_SUPREMACY_STRICT_PHASES.md',
);
[
  phaseName,
  'Free AI credit behavior',
  'Zero-credit deterministic mode',
  'Free report generation path',
  'Paid report generation path',
  'Report pack/pass inclusions',
  'Family Vault sharing and comparison costs',
  'Chat upsell when credits are exhausted',
  'Free users get deterministic value without hidden AI spend',
  'Predicta tells users when they are nearing limits',
  'Pass/coupon/report inclusions are clear to users and admins',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 6 roadmap'));

const sharedGuestLimits = read('packages/config/src/guestAccessLimits.ts');
const mobileGuestLimits = read('apps/mobile/src/config/guestAccessLimits.ts');
const backendAccess = read('backend/astro_api/access_authority.py');
[
  'questionsTotal: 3',
  'deepReadingsTotal: 0',
  'questionsTotal: 8',
  'questionsTotal: 12',
  'questionsTotal: 15',
  'questionsTotal: 25',
  'durationDays: 14',
  'durationDays: 30',
  'durationDays: 90',
].forEach(fragment => {
  assertIncludes(sharedGuestLimits, fragment, 'shared guest pass limits');
  assertIncludes(mobileGuestLimits, fragment, 'mobile guest pass limits');
});
[
  '"questionsTotal": 3',
  '"deepReadingsTotal": 0',
  '"questionsTotal": 8',
  '"questionsTotal": 12',
  '"questionsTotal": 15',
  '"questionsTotal": 25',
  '"durationDays": 14',
  '"durationDays": 30',
  '"durationDays": 90',
].forEach(fragment => assertIncludes(backendAccess, fragment, 'backend guest pass limits'));
[
  'questionsTotal: 50',
  'questionsTotal: 60',
  'questionsTotal: 120',
  '"questionsTotal": 50',
  '"questionsTotal": 60',
  '"questionsTotal": 120',
].forEach(fragment => {
  assertNotIncludes(sharedGuestLimits, fragment, 'shared guest pass limits');
  assertNotIncludes(mobileGuestLimits, fragment, 'mobile guest pass limits');
  assertNotIncludes(backendAccess, fragment, 'backend guest pass limits');
});

const sharedUsage = read('packages/config/src/usageLimits.ts');
const mobileUsage = read('apps/mobile/src/config/usageLimits.ts');
for (const source of [sharedUsage, mobileUsage]) {
  assertIncludes(source, 'questionsPerPass: 5', 'day pass limits');
  assertIncludes(source, 'deepCallsPerPass: 1', 'day pass limits');
  assertIncludes(source, 'pdfsPerPass: 1', 'day pass limits');
  assertNotIncludes(source, 'questionsPerPass: 10', 'day pass limits');
  assertNotIncludes(source, 'deepCallsPerPass: 3', 'day pass limits');
}

const serverLedger = read('packages/monetization/src/serverEntitlementLedger.ts');
[
  "import { DAY_PASS_LIMITS } from '@pridicta/config/usageLimits';",
  'deepCallsRemaining: DAY_PASS_LIMITS.deepCallsPerPass',
  'pdfsRemaining: DAY_PASS_LIMITS.pdfsPerPass',
  'questionsRemaining: DAY_PASS_LIMITS.questionsPerPass',
  'DAY_PASS_LIMITS.durationHours',
  'FREE_AI_QUESTION_LIFETIME_LIMIT = 3',
].forEach(fragment => assertIncludes(serverLedger, fragment, 'server entitlement ledger'));
[
  'questionsRemaining: 10',
  'deepCallsRemaining: 2',
  '24 * 60 * 60 * 1000',
].forEach(fragment => assertNotIncludes(serverLedger, fragment, 'server entitlement ledger'));

const webGuardrails = read('apps/web/lib/web-pass-cost-guardrails.ts');
[
  'FREE_LIFETIME_LIMITS',
  'questionsTotal: 3',
  'deepReadingsTotal: 0',
  'Free AI starter balance',
  'deterministic guidance still work without AI credit',
].forEach(fragment => assertIncludes(webGuardrails, fragment, 'web cost guardrails'));
[
  'FREE_DAILY_LIMITS',
  'dateKey',
  'left today',
  'Today’s free guidance',
  'resets tomorrow',
].forEach(fragment => assertNotIncludes(webGuardrails, fragment, 'web cost guardrails'));

const monetizationTranslations = read('packages/config/src/translations/monetization.json');
const uiTranslations = read('packages/config/src/translations/ui.json');
[
  'starter AI questions left',
  'lifetime-limited',
  'deterministic guidance stays available',
].forEach(fragment => assertIncludes(monetizationTranslations, fragment, 'monetization translations'));
[
  'lifetime-limited',
  'deterministic guidance stays available',
].forEach(fragment => assertIncludes(uiTranslations, fragment, 'UI translations'));
[
  'guidance questions left today',
  'free guidance resets tomorrow',
  'Your free guidance resets tomorrow',
].forEach(fragment => {
  assertNotIncludes(monetizationTranslations, fragment, 'monetization translations');
  assertNotIncludes(uiTranslations, fragment, 'UI translations');
});

const adminPanel = read('apps/web/components/WebAdminGuestPassPanel.tsx');
[
  'Selected pass offering',
  'Coupon offerings',
  'AI questions',
  'deep readings',
  'premium PDFs',
  'without unlimited model usage',
].forEach(fragment => assertIncludes(adminPanel, fragment, 'admin coupon inclusions'));

const dashboardShell = read('apps/web/components/DashboardShell.tsx');
[
  'Predicta can still help with deterministic charts and reports if AI balance runs low.',
  'AI, ${deepRemaining} deep, ${pdfRemaining} PDFs remaining',
  'Manage pass',
].forEach(fragment => assertIncludes(dashboardShell, fragment, 'dashboard pass banner'));

const reportPage = read('apps/web/components/WebDossierPreview.tsx');
[
  'localizedSelectedReport.premiumAdds',
  'hasDetailedReportAccess',
  'getMonetizationReportRequirementCopy',
  'selectedReportCreditLabel',
].forEach(fragment => assertIncludes(reportPage, fragment, 'report paid/free entitlement surface'));

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for Phase 6 cost-control screenshot audit.');
}

await assertServerReady(baseUrl);
mkdirSync(screenshotRoot, { recursive: true });

const port = 10_800 + Math.floor(Math.random() * 300);
const userDataDir = join(tmpdir(), `predicta-competitor-phase6-chrome-${Date.now()}`);
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
        const metrics = await evaluatePage(cdp, route.requiredText);
        const screenshot = await cdp.send('Page.captureScreenshot', {
          captureBeyondViewport: false,
          format: 'png',
          fromSurface: true,
        });
        const fileName = `${viewport.name}-${route.label}-cost-control.png`;
        writeFileSync(join(screenshotRoot, fileName), Buffer.from(screenshot.data, 'base64'));

        checks.push({
          fileName,
          finalUrl: readiness.finalUrl,
          route: route.path,
          viewport: viewport.name,
          viewportWidth: viewport.width,
          ...metrics.summary,
        });

        if (!metrics.summary.hasRequiredText) {
          failures.push(`${viewport.name} ${route.path}: missing required cost/value inclusion copy.`);
        }
        if (metrics.summary.horizontalOverflow > 0) {
          failures.push(`${viewport.name} ${route.path}: page is ${metrics.summary.horizontalOverflow}px wider than viewport.`);
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
  status: failures.length ? 'FAILED' : 'GREEN',
};

writeFileSync(join(auditRoot, 'phase-6-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(
  join(auditRoot, 'verification.txt'),
  [
    'corepack pnpm test:competitor-response-phase-6',
    'corepack pnpm --filter @pridicta/config typecheck',
    'corepack pnpm --filter @pridicta/monetization typecheck',
    'corepack pnpm --filter @pridicta/access typecheck',
    'corepack pnpm --filter @pridicta/web typecheck',
    'corepack pnpm --filter @pridicta/mobile typecheck',
    'python3 -m pytest backend/tests/test_astro_api.py -q',
    'corepack pnpm test:monetization-phase-2',
    'corepack pnpm test:monetization-phase-12',
    'corepack pnpm build:web',
    'git diff --check',
  ].join('\n') + '\n',
);
writeFileSync(
  join(auditRoot, 'free-vs-paid-cost-control-audit.md'),
  [
    `# ${phaseName}`,
    '',
    `Status: ${failures.length ? 'RED' : 'GREEN'}`,
    '',
    '## What Was Locked',
    '',
    '- Free starter AI remains lifetime-limited and deterministic guidance stays available after AI exhaustion.',
    '- Day Pass is bounded to 5 AI questions, 1 deep call, and 1 premium PDF.',
    '- Private passes/coupons are reduced across shared config, mobile config, and backend authority.',
    '- Admin coupon UI and user redeem/report surfaces show inclusions clearly.',
    '- Paid report depth remains entitlement-aware and does not imply unlimited AI usage.',
    '',
    '## Strict Result',
    '',
    failures.length
      ? failures.map(failure => `- ${failure}`).join('\n')
      : '- All Phase 6 cost-control, pass inclusion, free-vs-paid value, and runtime responsive checks passed.',
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

console.log(`${phaseName} passed: free value, paid depth, and AI cost controls are aligned.`);

async function assertServerReady(url) {
  try {
    await getText(url);
  } catch (error) {
    throw new Error(
      `Phase 6 requires a running web server at ${url}. Start the production build on port 3009 before running this gate. ${error.message}`,
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
