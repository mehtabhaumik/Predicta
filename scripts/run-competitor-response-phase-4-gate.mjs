import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { assertAuditablePredictaPage } from './lib/predicta-audit-page-readiness.mjs';

const phaseName =
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_4_APP_SURFACE_PREDICTION_FIRST_UX_REBUILD';
const priorPhaseName =
  'PREDICTA_COMPETITOR_RESPONSE_PHASE_3_PREDICTA_INTELLIGENCE_CONTEXT_AND_LOCAL_MEMORY_SUPREMACY';
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

const routes = [
  {
    label: 'vedic',
    marker: '[data-app-revival-phase5-evidence-room="vedic"]',
    path: '/dashboard/vedic',
    primaryText: /Ask for my main Vedic guidance|Ask Predicta/i,
  },
  {
    label: 'kp',
    marker: '[data-app-revival-phase5-evidence-room="kp"]',
    path: '/dashboard/kp',
    primaryText: /Ask my KP event question|Ask Predicta/i,
  },
  {
    label: 'jaimini',
    marker: '[data-app-revival-phase5-evidence-room="jaimini"]',
    path: '/dashboard/jaimini',
    primaryText: /Ask about my destiny direction|Ask Predicta/i,
  },
  {
    label: 'numerology',
    marker: '[data-app-revival-phase5-evidence-room="numerology"]',
    path: '/dashboard/numerology',
    primaryText: /Ask what my numbers say now|Ask Predicta/i,
  },
  {
    label: 'signature',
    marker: '[data-app-revival-phase5-evidence-room="signature"]',
    path: '/dashboard/signature',
    primaryText: /Ask about my confirmed signature traits|Ask Predicta/i,
  },
  {
    label: 'report-composer',
    marker: '[data-phase13-first-screen-primary-action="true"]',
    path: '/dashboard/report',
    primaryText: /Download your report|Build/i,
  },
];

const viewports = [
  { height: 1100, name: 'desktop', width: 1440 },
  { height: 1112, name: 'tablet', width: 834 },
  { height: 844, name: 'mobile', width: 390 },
  { height: 740, name: 'narrow-mobile', width: 360 },
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

function assertIncludes(file, fragment, label = file) {
  const source = read(file);
  assertGate(source.includes(fragment), `${label}: missing ${fragment}`);
}

const priorManifest = readJson(
  join('docs', 'audits', priorPhaseName, 'phase-3-manifest.json'),
);
assertGate(priorManifest.status === 'GREEN', 'Phase 3 manifest must be GREEN before Phase 4.');

const roadmap = read(
  'docs/PREDICTA_COMPETITOR_RESPONSE_POSITIONING_AND_REPORT_SUPREMACY_STRICT_PHASES.md',
);
[
  phaseName,
  'Vedic overview and Kundli Karma cards',
  'KP question flow and answer preview',
  'Jaimini overview',
  'Numerology dashboard',
  'Signature scan/trait confirmation',
  'Life Atlas preview',
  'Start with prediction/guidance',
  'Show evidence underneath',
].forEach(fragment => {
  assertGate(roadmap.includes(fragment), `Phase 4 roadmap: missing ${fragment}`);
});

[
  ['apps/web/components/PredictaWorldFrame.tsx', 'primaryGuidance'],
  ['apps/web/components/PredictaWorldFrame.tsx', 'data-competitor-response-phase4-primary-guidance'],
  ['apps/web/components/PredictaWorldFrame.tsx', "t('Open evidence')"],
  ['apps/web/components/WebEvidenceRoomEntry.tsx', 'data-app-revival-phase5-evidence-room={room}'],
  ['apps/web/components/WebEvidenceRoomEntry.tsx', 'className="evidence-room-entry-actions"'],
  ['apps/web/components/WebVedicIntelligencePanel.tsx', 'data-competitor-response-phase4-answer-first="kundli-karma"'],
  ['apps/web/components/WebKpPredictaPanel.tsx', 'data-competitor-response-phase4-answer-first="kp"'],
  ['apps/web/components/WebKpPredictaPanel.tsx', 'title: focusMeaning.whatItSays'],
  ['apps/web/components/WebJaiminiPredictaPanel.tsx', 'data-competitor-response-phase4-primary-guidance="jaimini"'],
  ['apps/web/components/WebNumerologyPredictaPanel.tsx', 'data-competitor-response-phase4-answer-first="numerology"'],
  ['apps/web/components/WebSignatureAnalysisInputFlow.tsx', 'primaryGuidance'],
  ['apps/web/components/WebDossierPreview.tsx', 'data-competitor-response-phase4-answer-first="life-atlas"'],
  ['apps/web/components/WebGocharSynopsisCard.tsx', 'data-competitor-response-phase4-answer-first="gochar"'],
  ['apps/web/app/globals.css', '.predicta-world-primary-guidance'],
  ['apps/web/app/globals.css', '.predicta-world-phase4-guidance'],
  ['apps/web/app/globals.css', '.school-answer-first'],
  ['apps/mobile/src/screens/KpPredictaScreen.tsx', 'Get the answer before the KP proof.'],
  ['apps/mobile/src/screens/JaiminiPredictaScreen.tsx', 'mobileStartHereTitle'],
  ['apps/mobile/src/screens/NumerologyPredictaScreen.tsx', 'WHAT THIS MEANS NOW'],
  ['apps/mobile/src/screens/SignaturePredictaScreen.tsx', 'Confirm visible traits before any reading.'],
].forEach(([file, fragment]) => assertIncludes(file, fragment));

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for Phase 4 app-surface screenshot audit.');
}

await assertServerReady(baseUrl);
mkdirSync(screenshotRoot, { recursive: true });

const port = 10_200 + Math.floor(Math.random() * 300);
const userDataDir = join(tmpdir(), `predicta-competitor-phase4-chrome-${Date.now()}`);
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
          mobile: viewport.name.includes('mobile'),
          width: viewport.width,
        });
        await navigateAndWait(cdp, url);
        await cdp.send('Runtime.evaluate', {
          awaitPromise: true,
          expression:
            'document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 4000))]) : true',
        });
        if (route.scrollSelector) {
          await cdp.send('Runtime.evaluate', {
            expression: `document.querySelector(${JSON.stringify(route.scrollSelector)})?.scrollIntoView({ block: 'center' });`,
          });
          await delay(300);
        }

        const readiness = await assertAuditablePredictaPage(cdp, {
          route: route.path,
          url,
        });
        const metrics = await evaluateRoute(cdp, route);
        const screenshot = await cdp.send('Page.captureScreenshot', {
          captureBeyondViewport: false,
          format: 'png',
          fromSurface: true,
        });
        const fileName = `${viewport.name}-${route.label}.png`;
        writeFileSync(join(screenshotRoot, fileName), Buffer.from(screenshot.data, 'base64'));

        checks.push({
          fileName,
          finalUrl: readiness.finalUrl,
          route: route.path,
          viewport: viewport.name,
          viewportWidth: viewport.width,
          ...metrics.summary,
        });

        if (!metrics.summary.markerVisible) {
          failures.push(`${viewport.name} ${route.path}: prediction-first marker is missing or hidden.`);
        }
        if (!metrics.summary.hasPrimaryAction) {
          failures.push(`${viewport.name} ${route.path}: clear primary action is missing near the touched surface.`);
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

writeFileSync(join(auditRoot, 'phase-4-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(
  join(auditRoot, 'verification.txt'),
  [
    'corepack pnpm test:competitor-response-phase-4',
    'corepack pnpm --filter @pridicta/web typecheck',
    'corepack pnpm --filter @pridicta/mobile typecheck',
    'corepack pnpm build:web',
    'git diff --check',
  ].join('\n') + '\n',
);
writeFileSync(
  join(auditRoot, 'app-surface-prediction-first-ux-audit.md'),
  [
    `# ${phaseName}`,
    '',
    `Status: ${failures.length ? 'RED' : 'GREEN'}`,
    '',
    '## Audit Scope',
    '',
    '- Vedic overview and Kundli Karma answer-first surface.',
    '- KP question flow and answer preview.',
    '- Jaimini overview.',
    '- Numerology dashboard.',
    '- Signature scan/trait confirmation.',
    '- Life Atlas preview on the reports marketplace.',
    '- Current Gochar timing card.',
    '',
    '## Strict Result',
    '',
    failures.length
      ? failures.map(failure => `- ${failure}`).join('\n')
      : '- All touched routes expose prediction/guidance before evidence, keep proof underneath, preserve primary actions, and pass screenshot overflow/clipping checks across desktop, tablet, mobile, and narrow mobile.',
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

console.log(`${phaseName} passed: app surfaces are prediction-first, action-visible, and screenshot-audited.`);

async function assertServerReady(url) {
  try {
    await getText(url);
  } catch (error) {
    throw new Error(
      `Phase 4 requires a running web server at ${url}. Start the production build on port 3009 before running this gate. ${error.message}`,
    );
  }
}

async function evaluateRoute(cdp, route) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const route = ${JSON.stringify(route)};
      const primaryPattern = new RegExp(${JSON.stringify(route.primaryText.source)}, ${JSON.stringify(route.primaryText.flags)});
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

      const marker = document.querySelector(route.marker);
      const markerScope = marker?.closest('.predicta-world-hero, .school-explain-box, .glass-panel, .report-school-lane, .card-content, .kundli-karma-panel') ?? document;
      const actions = [...markerScope.querySelectorAll('.button, .predicta-button, button, a')]
        .filter(isVisible)
        .filter(element => primaryPattern.test((element.textContent || '').replace(/\\s+/g, ' ').trim()));

      return {
        summary: {
          clippedText: clippedText.length,
          hasPrimaryAction: actions.length >= 1,
          horizontalOverflow: Math.max(
            0,
            Math.ceil(Math.max(root.scrollWidth, body.scrollWidth) - viewportWidth),
          ),
          markerVisible: Boolean(marker && isVisible(marker)),
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
