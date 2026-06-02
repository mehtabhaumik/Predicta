import { existsSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { assertAuditablePredictaPage } from './lib/predicta-audit-page-readiness.mjs';

const phaseName = 'PREDICTA_AUDIT_1_PHASE_6_SPECIALIST_ROOM_VISUAL_IDENTITY_AND_PROGRESSIVE_DISCLOSURE';
const baseUrl = process.env.PREDICTA_AUDIT_BASE_URL ?? 'http://127.0.0.1:3009';
const auditRoot = 'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX';
const phaseRoot = join(auditRoot, 'phase-6-specialist-room-visual-identity-progressive-disclosure');
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
  { interaction: 'vedic', label: 'vedic', path: '/dashboard/vedic', primaryText: /Build Vedic report|Create report/i },
  { interaction: 'kp', label: 'kp', path: '/dashboard/kp', primaryText: /Build KP report/i },
  { interaction: 'jaimini', label: 'jaimini', path: '/dashboard/jaimini', primaryText: /Build Jaimini report|Download Jaimini/i },
  { interaction: 'numerology', label: 'numerology', path: '/dashboard/numerology', primaryText: /Build Numerology report/i },
  { interaction: 'signature', label: 'signature', path: '/dashboard/signature', primaryText: /Build Signature report/i },
];

const viewports = [
  { height: 1100, name: 'desktop', width: 1440 },
  { height: 1112, name: 'tablet', width: 834 },
  { height: 844, name: 'mobile', width: 390 },
];

const sourceFailures = [];
const sourceChecks = [
  ['apps/web/components/PredictaWorldFrame.tsx', 'predicta-world-hero-interaction'],
  ['apps/web/components/PredictaWorldFrame.tsx', 'predicta-world-proof-disclosure'],
  ['apps/web/app/dashboard/vedic/page.tsx', 'data-audit1-phase6-hero-interaction="vedic"'],
  ['apps/web/components/WebKpPredictaPanel.tsx', 'data-audit1-phase6-hero-interaction="kp"'],
  ['apps/web/components/WebJaiminiPredictaPanel.tsx', 'data-audit1-phase6-hero-interaction="jaimini"'],
  ['apps/web/components/WebNumerologyPredictaPanel.tsx', 'data-audit1-phase6-hero-interaction="numerology"'],
  ['apps/web/components/WebSignatureAnalysisInputFlow.tsx', 'data-audit1-phase6-hero-interaction="signature"'],
  ['apps/web/app/globals.css', '.specialist-hero-interaction'],
  ['apps/web/app/globals.css', '.predicta-world-proof-disclosure:not([open]) .predicta-world-proof-grid'],
];

for (const [file, fragment] of sourceChecks) {
  const source = readFileSync(file, 'utf8');
  if (!source.includes(fragment)) {
    sourceFailures.push(`${file} is missing ${fragment}`);
  }
}

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for Phase 6 specialist-room gate.');
}

mkdirSync(screenshotRoot, { recursive: true });

const port = 9900 + Math.floor(Math.random() * 300);
const userDataDir = join(tmpdir(), `predicta-audit1-phase6-chrome-${Date.now()}`);
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
const failures = [...sourceFailures];

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
        const metrics = await evaluateSpecialistRoom(cdp, route);
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

        if (metrics.summary.horizontalOverflow > 0) {
          failures.push(`${viewport.name} ${route.path}: page is ${metrics.summary.horizontalOverflow}px wider than viewport.`);
        }

        if (metrics.summary.clippedText > 0) {
          failures.push(`${viewport.name} ${route.path}: clips ${metrics.summary.clippedText} text nodes.`);
        }

        if (!metrics.summary.hasUniqueHeroInteraction) {
          failures.push(`${viewport.name} ${route.path}: missing unique hero interaction for ${route.interaction}.`);
        }

        if (!metrics.summary.hasCollapsedProof) {
          failures.push(`${viewport.name} ${route.path}: proof/method cards are not collapsed by default.`);
        }

        if (!metrics.summary.hasSinglePrimaryHeroCta) {
          failures.push(`${viewport.name} ${route.path}: hero must expose exactly one primary CTA.`);
        }

        if (!metrics.summary.hasSecondaryChatEntry) {
          failures.push(`${viewport.name} ${route.path}: Predicta chat entry is missing or dominant instead of secondary.`);
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
  status: failures.length ? 'failed' : 'green',
};

writeFileSync(join(phaseRoot, 'phase-6-specialist-room-identity-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest, null, 2));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName} passed: specialist room identities, progressive proof disclosure, primary CTA discipline, and screenshots are green.`);

async function evaluateSpecialistRoom(cdp, route) {
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

      const hero = document.querySelector('.predicta-world-hero');
      const heroButtons = hero ? [...hero.querySelectorAll('.button, .predicta-button, button, a')].filter(isVisible) : [];
      function isPrimaryButton(element) {
        return element.classList.contains('primary') || element.classList.contains('predicta-button--primary');
      }
      function isSecondaryButton(element) {
        return element.classList.contains('secondary') || element.classList.contains('predicta-button--secondary');
      }
      const primaryButtons = heroButtons.filter(element => {
        const text = (element.textContent || '').replace(/\\s+/g, ' ').trim();
        return isPrimaryButton(element) && primaryPattern.test(text);
      });
      const dominantChatButtons = heroButtons.filter(element => {
        const text = (element.textContent || '').replace(/\\s+/g, ' ').trim();
        return isPrimaryButton(element) && /chat|Predicta chat|Chat with/i.test(text);
      });
      const secondaryChatButtons = heroButtons.filter(element => {
        const text = (element.textContent || '').replace(/\\s+/g, ' ').trim();
        return isSecondaryButton(element) && /chat|Predicta chat|Chat with/i.test(text);
      });
      const proofDisclosure = document.querySelector('.predicta-world-proof-disclosure');
      const proofGrid = document.querySelector('.predicta-world-proof-disclosure .predicta-world-proof-grid');

      return {
        summary: {
          clippedText: clippedText.length,
          hasCollapsedProof: Boolean(
            proofDisclosure &&
            !proofDisclosure.open &&
            (!proofGrid || window.getComputedStyle(proofGrid).display === 'none')
          ),
          hasSecondaryChatEntry: secondaryChatButtons.length >= 1 && dominantChatButtons.length === 0,
          hasSinglePrimaryHeroCta: primaryButtons.length === 1,
          hasUniqueHeroInteraction: Boolean(document.querySelector('[data-audit1-phase6-hero-interaction="' + route.interaction + '"]')),
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
