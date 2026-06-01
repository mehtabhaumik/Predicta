import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { assertAuditablePredictaPage } from './lib/predicta-audit-page-readiness.mjs';

const phaseName = 'PREDICTA_JAIMINI_PHASE_4_WEB_JAIMINI_ROOM_CLEAN_UI_REBUILD';
const baseUrl = process.env.PREDICTA_AUDIT_BASE_URL ?? 'http://127.0.0.1:3009';
const phaseRoot = 'docs/audits/PREDICTA_JAIMINI_PHASE_4_WEB_JAIMINI_ROOM_CLEAN_UI_REBUILD';
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

const sourceChecks = [
  ['apps/web/components/WebJaiminiPredictaPanel.tsx', 'getJaiminiLocalizationCopy'],
  ['apps/web/components/WebJaiminiPredictaPanel.tsx', 'copy.destinyRoleTitle'],
  ['apps/web/components/WebJaiminiPredictaPanel.tsx', 'jaimini-soul-compass-card'],
  ['apps/web/components/WebJaiminiPredictaPanel.tsx', 'copy.karakaCouncilEyebrow'],
  ['apps/web/components/WebJaiminiPredictaPanel.tsx', 'copy.downloadCta'],
  ['apps/web/components/WebJaiminiPredictaPanel.tsx', 'jaimini-technical-drawer'],
  ['apps/web/components/WebJaiminiPredictaPanel.tsx', 'composeJaiminiInterpretation'],
  ['apps/web/app/globals.css', '.jaimini-room-hero'],
  ['apps/web/app/globals.css', '.jaimini-reading-grid'],
  ['apps/web/app/globals.css', '@media (max-width: 680px)'],
];

const failures = [];
for (const [file, fragment] of sourceChecks) {
  if (!readFileSync(file, 'utf8').includes(fragment)) {
    failures.push(`${file} is missing ${fragment}`);
  }
}

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for Jaimini Phase 4 screenshots.');
}

mkdirSync(screenshotRoot, { recursive: true });

const port = 10_200 + Math.floor(Math.random() * 400);
const userDataDir = join(tmpdir(), `predicta-jaimini-phase4-chrome-${Date.now()}`);
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
      await navigateAndWait(cdp, `${baseUrl}/dashboard/jaimini`);
      await cdp.send('Runtime.evaluate', {
        awaitPromise: true,
        expression:
          'document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 4000))]) : true',
      });

      const readiness = await assertAuditablePredictaPage(cdp, {
        route: '/dashboard/jaimini',
        url: `${baseUrl}/dashboard/jaimini`,
      });
      const metrics = await evaluateJaiminiRoom(cdp);
      const screenshot = await cdp.send('Page.captureScreenshot', {
        captureBeyondViewport: false,
        format: 'png',
        fromSurface: true,
      });
      const fileName = `${viewport.name}-jaimini-room.png`;
      writeFileSync(join(screenshotRoot, fileName), Buffer.from(screenshot.data, 'base64'));

      checks.push({
        fileName,
        finalUrl: readiness.finalUrl,
        viewport: viewport.name,
        viewportWidth: viewport.width,
        ...metrics.summary,
      });

      if (!metrics.summary.hasExactHeroTitle) {
        failures.push(`${viewport.name}: exact Phase 4 hero title is missing.`);
      }

      if (!metrics.summary.hasSoulCompass) {
        failures.push(`${viewport.name}: soul compass card is missing.`);
      }

      if (!metrics.summary.hasKarakaCouncilPreview) {
        failures.push(`${viewport.name}: karaka council preview is missing.`);
      }

      if (!metrics.summary.hasRequiredCards) {
        failures.push(`${viewport.name}: one or more required Jaimini reading cards are missing.`);
      }

      if (!metrics.summary.hasPrimaryAskAndSecondaryReport) {
        failures.push(`${viewport.name}: Ask must be primary and report must be secondary.`);
      }

      if (!metrics.summary.technicalDrawerCollapsed) {
        failures.push(`${viewport.name}: technical evidence drawer must be collapsed by default.`);
      }

      if (metrics.summary.horizontalOverflow > 0) {
        failures.push(`${viewport.name}: page is ${metrics.summary.horizontalOverflow}px wider than viewport.`);
      }

      if (metrics.summary.clippedText > 0) {
        failures.push(`${viewport.name}: ${metrics.summary.clippedText} visible text nodes are clipped.`);
      }

      if (metrics.summary.cardCollisionCount > 0) {
        failures.push(`${viewport.name}: ${metrics.summary.cardCollisionCount} Jaimini cards collide.`);
      }

      if (metrics.summary.tightActionGaps > 0) {
        failures.push(`${viewport.name}: Jaimini CTAs are cramped.`);
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

writeFileSync(join(phaseRoot, 'phase-4-web-room-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest, null, 2));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName} passed: Jaimini web room screenshots, CTA discipline, progressive disclosure, and responsive layout are green.`);

async function evaluateJaiminiRoom(cdp) {
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

      const title = document.querySelector('.jaimini-room-hero h1')?.textContent?.trim() ?? '';
      const hero = document.querySelector('.jaimini-room-hero');
      const heroButtons = hero ? [...hero.querySelectorAll('a, button')].filter(isVisible) : [];
      const askButton = heroButtons.find(button =>
        /Ask Jaimini Predicta/i.test(button.textContent || '') &&
        button.classList.contains('predicta-button--primary')
      );
      const reportButton = heroButtons.find(button =>
        /Download Jaimini Report/i.test(button.textContent || '') &&
        button.classList.contains('predicta-button--secondary')
      );
      const details = document.querySelector('.jaimini-technical-drawer');
      const cards = [...document.querySelectorAll('.jaimini-reading-card, .jaimini-karaka-preview-card, .jaimini-premium-summary')]
        .filter(isVisible);
      const cardCollisionCount = countCollisions(cards);
      const tightActionGaps = countTightGaps(heroButtons);
      const requiredCardSelectors = [
        '#jaimini-soul-role',
        '#jaimini-visible-identity',
        '#jaimini-career-dharma',
        '#jaimini-relationship-mirror',
        '#jaimini-destiny-chapter',
        '#jaimini-focus-now',
      ];

      return {
        summary: {
          cardCollisionCount,
          clippedText: clippedText.length,
          hasExactHeroTitle: title === 'Your destiny role is being prepared from your chart',
          hasKarakaCouncilPreview: Boolean(document.querySelector('.jaimini-karaka-preview-card')),
          hasPrimaryAskAndSecondaryReport: Boolean(askButton && reportButton),
          hasRequiredCards: requiredCardSelectors.every(selector => Boolean(document.querySelector(selector))),
          hasSoulCompass: Boolean(document.querySelector('.jaimini-soul-compass-card')),
          horizontalOverflow: Math.max(
            0,
            Math.ceil(Math.max(root.scrollWidth, body.scrollWidth) - viewportWidth),
          ),
          technicalDrawerCollapsed: Boolean(details && !details.open),
          tightActionGaps,
        },
        wideElements: wideElements.slice(0, 12),
      };

      function countCollisions(elements) {
        let collisions = 0;
        const rects = elements.map(element => element.getBoundingClientRect());
        for (let i = 0; i < rects.length; i += 1) {
          for (let j = i + 1; j < rects.length; j += 1) {
            const a = rects[i];
            const b = rects[j];
            const overlapX = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
            const overlapY = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
            if (overlapX > 2 && overlapY > 2) collisions += 1;
          }
        }
        return collisions;
      }

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
