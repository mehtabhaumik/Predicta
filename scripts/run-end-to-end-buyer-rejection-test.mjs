import { existsSync, rmSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

const baseUrl = process.env.PREDICTA_BUYER_BASE_URL ?? 'http://127.0.0.1:3009';
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

const publicRoutes = ['/', '/pricing', '/safety', '/founder', '/legal', '/feedback'];
const dashboardRoutes = [
  '/dashboard',
  '/dashboard/kundli',
  '/dashboard/charts',
  '/dashboard/report',
  '/dashboard/saved-kundlis',
  '/dashboard/chat',
  '/dashboard/kp',
  '/dashboard/nadi',
  '/dashboard/redeem-pass',
];
const routes = [...publicRoutes, ...dashboardRoutes];
const viewports = [
  { height: 1000, name: 'desktop', width: 1440 },
  { height: 1112, name: 'tablet', width: 834 },
  { height: 844, name: 'mobile', width: 390 },
];
const sourceContracts = [
  {
    file: 'apps/web/components/WebKundliChart.tsx',
    label: 'chart houses are real controls, not label-only targets',
    mustContain: [
      '<button',
      'aria-label={cell.ariaLabel}',
      'aria-pressed={activeCell?.house === cell.house}',
      'onClick={() => selectHouse(cell.house)}',
      'onFocus={() => setHoveredHouse(cell.house)}',
      'onMouseEnter={() => setHoveredHouse(cell.house)}',
      'buildChartAskHref({',
      'selectedHouse: house',
    ],
  },
  {
    file: 'packages/astrology/src/chartStressSuite.ts',
    label: 'golden chart and tight-house stress fixtures exist',
    mustContain: [
      'Bhaumik D1 planets stay in expected houses',
      'Bhaumik D1 signs stay in expected houses',
      '...[2, 6, 8, 11, 12].map(house',
      'assertSevenPlanetHouseStress(house)',
    ],
  },
  {
    file: 'apps/web/components/BrandedDestructiveDialog.tsx',
    label: 'destructive actions use branded confirmation',
    mustContain: ['role="dialog"', 'aria-modal="true"', 'confirmLabel', 'cancelLabel'],
  },
  {
    file: 'apps/web/components/WebDossierPreview.tsx',
    label: 'report page keeps depth, selection, and PDF actions explicit',
    mustContain: [
      'builderMode',
      'visibleSections',
      'selectedSectionKeys',
      'everythingIncludesTitle',
      'premiumAccessTitle',
      'printReport()',
    ],
  },
  {
    file: 'apps/web/components/WebPridictaChat.tsx',
    label: 'Predicta chat recovers Kundli and sanitizes internal wording',
    mustContain: [
      'resolveWebKundliForContext',
      'recoverActiveKundli',
      'Dashboard Header context loaded',
      'I picked this up from your dashboard.',
    ],
  },
];
const bannedVisiblePhrases = [
  'fake chart',
  'fake manuscript',
  'not yet calculated',
  'not yet included',
  'backend',
  'frontend',
  'debug',
  'Dashboard Header context loaded',
];
const sourceBannedPatterns = [
  {
    filePattern: /^apps\/web\/(app|components|lib)\//,
    phrases: ['window.confirm(', 'confirm(', 'alert('],
  },
];

if (!chromePath) {
  console.error('Chrome or Chromium is required for the buyer rejection gate.');
  process.exit(1);
}

const failures = [];
const warnings = [];
const routeSummary = [];
const port = 9500 + Math.floor(Math.random() * 300);
const userDataDir = join(tmpdir(), `predicta-buyer-chrome-${Date.now()}`);
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
  await assertServerAvailable();
  runSourceContracts();
  await waitForChrome(port);

  for (const viewport of viewports) {
    for (const route of routes) {
      const page = await createTarget(port, `${baseUrl}${route}`);
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

        const consoleMessages = [];
        cdp.on('Runtime.consoleAPICalled', event => {
          const text = event.args?.map(arg => arg.value ?? arg.description ?? '').join(' ');
          if (text) {
            consoleMessages.push(text);
          }
        });
        cdp.on('Runtime.exceptionThrown', event => {
          consoleMessages.push(event.exceptionDetails?.text ?? 'Browser exception');
        });

        await navigateAndWait(cdp, `${baseUrl}${route}`);
        await cdp.send('Runtime.evaluate', {
          expression:
            'document.fonts && document.fonts.ready ? document.fonts.ready.then(() => true) : true',
          awaitPromise: true,
        });

        const metrics = await evaluateBuyerMetrics(cdp);
        const label = `${viewport.name} ${route}`;
        routeSummary.push({
          buttons: metrics.visibleButtons,
          clipped: metrics.clippedText.length,
          forms: metrics.formControls,
          links: metrics.internalLinks.length,
          route,
          textLength: metrics.textLength,
          viewport: viewport.name,
          wide: metrics.wideElements.length,
        });

        if (!metrics.title || metrics.title === 'Predicta') {
          warnings.push(`${label}: page title is generic.`);
        }

        if (metrics.textLength < 120) {
          failures.push(`${label}: page looks too empty to earn user trust.`);
        }

        if (metrics.horizontalOverflow > 4) {
          failures.push(`${label}: page is ${metrics.horizontalOverflow}px wider than viewport.`);
        }

        for (const item of metrics.wideElements.slice(0, 4)) {
          failures.push(`${label}: ${item.selector} extends beyond viewport (${item.left}..${item.right}).`);
        }

        for (const item of metrics.clippedText.slice(0, 4)) {
          failures.push(`${label}: ${item.selector} appears clipped (${item.text}).`);
        }

        for (const item of metrics.unlabeledInteractive.slice(0, 6)) {
          failures.push(`${label}: interactive element lacks a usable label (${item.selector}).`);
        }

        for (const phrase of bannedVisiblePhrases) {
          if (metrics.visibleTextLower.includes(phrase.toLowerCase())) {
            failures.push(`${label}: visible copy contains trust-killing phrase "${phrase}".`);
          }
        }

        if (route === '/dashboard/charts' && metrics.visibleButtons > 48) {
          failures.push(`${label}: charts page still exposes too many visible actions (${metrics.visibleButtons}).`);
        }

        if (route === '/dashboard/report' && metrics.visibleButtons > 42) {
          failures.push(`${label}: report page still exposes too many visible actions (${metrics.visibleButtons}).`);
        }

        if (route === '/dashboard/kundli' && metrics.chartHouseButtons && metrics.chartHouseButtons !== 12) {
          failures.push(`${label}: Kundli chart exposes ${metrics.chartHouseButtons} house controls instead of 12.`);
        }

        const severeConsole = consoleMessages.filter(message =>
          /hydration failed|uncaught|typeerror|referenceerror|syntaxerror/i.test(message),
        );
        for (const message of severeConsole.slice(0, 4)) {
          failures.push(`${label}: browser console shows ${message}`);
        }
      } finally {
        cdp.close();
        await closeTarget(port, page.id).catch(() => undefined);
      }
    }
  }

  await crawlInternalLinks();
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

console.table(routeSummary);

if (warnings.length) {
  console.warn('Buyer rejection warnings:');
  for (const warning of warnings.slice(0, 20)) {
    console.warn(`- ${warning}`);
  }
}

if (failures.length) {
  console.error('End-to-end buyer rejection test failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`End-to-end buyer rejection test passed: ${routeSummary.length} live route checks plus source and link gates.`);

async function assertServerAvailable() {
  try {
    const response = await getText(baseUrl);
    if (!response.includes('Predicta')) {
      failures.push(`${baseUrl} did not return Predicta content.`);
    }
  } catch (error) {
    console.error(`Predicta must be running before this gate: ${baseUrl}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function runSourceContracts() {
  for (const contract of sourceContracts) {
    const source = readFileSync(join(process.cwd(), contract.file), 'utf8');
    for (const fragment of contract.mustContain) {
      if (!source.includes(fragment)) {
        failures.push(`${contract.label}: missing "${fragment}" in ${contract.file}.`);
      }
    }
  }

  const sourceFiles = [
    'apps/web/components/WebKundliChart.tsx',
    'apps/web/components/BrandedDestructiveDialog.tsx',
    'apps/web/components/WebSavedKundlis.tsx',
    'apps/web/components/WebDossierPreview.tsx',
    'apps/web/components/WebPridictaChat.tsx',
    'apps/web/lib/web-chat-export.ts',
  ];

  for (const file of sourceFiles) {
    const source = readFileSync(join(process.cwd(), file), 'utf8');
    for (const rule of sourceBannedPatterns) {
      if (!rule.filePattern.test(file)) {
        continue;
      }

      for (const phrase of rule.phrases) {
        if (source.includes(phrase)) {
          failures.push(`${file}: source still uses browser-native destructive or disruptive prompt "${phrase}".`);
        }
      }
    }
  }
}

async function crawlInternalLinks() {
  const seen = new Set();

  for (const route of routes) {
    const html = await getText(`${baseUrl}${route}`);
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)]
      .map(match => match[1])
      .filter(href => href.startsWith('/') && !href.startsWith('/_next') && !href.startsWith('/api/'));

    for (const href of hrefs) {
      const path = href.split('#')[0].split('?')[0] || '/';
      if (!path || seen.has(path)) {
        continue;
      }

      seen.add(path);
      const status = await getStatus(`${baseUrl}${path}`);
      if (status >= 400) {
        failures.push(`Internal link ${path} returned HTTP ${status}.`);
      }
    }
  }
}

async function waitForChrome(debugPort) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
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
  const loadEvent = cdp.waitFor('Page.loadEventFired', 20_000);
  await cdp.send('Page.navigate', { url });
  await loadEvent.catch(() => undefined);
  await delay(700);
}

async function evaluateBuyerMetrics(cdp) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const viewportWidth = document.documentElement.clientWidth;
      const body = document.body;
      const root = document.documentElement;
      const visibleText = body.innerText || '';
      const clippedText = [];
      const wideElements = [];
      const unlabeledInteractive = [];
      const ignoredTags = new Set(['SCRIPT', 'STYLE', 'META', 'LINK', 'TITLE']);

      function selectorFor(element) {
        if (element.id) return '#' + element.id;
        const classes = [...element.classList].slice(0, 3).join('.');
        return element.tagName.toLowerCase() + (classes ? '.' + classes : '');
      }

      function isScreenReaderOnly(element) {
        return element.classList.contains('sr-only') || element.closest('.sr-only');
      }

      function isVisuallyHidden(style) {
        return style.clipPath !== 'none' || style.clip !== 'auto';
      }

      function isIntentionalScrollRegion(style) {
        return ['auto', 'scroll'].includes(style.overflowX) ||
          ['auto', 'scroll'].includes(style.overflowY) ||
          ['auto', 'scroll'].includes(style.overflow);
      }

      function isCompactControlSurface(element) {
        return (
          element.matches('button, a, input, select, textarea, [role="button"], .button, .status-pill, .chart-legend-item, .north-planet, .planet-glyph, .language-pill') ||
          Boolean(element.closest('button, a, .button, .status-pill, .chart-legend-item, .north-planet, .planet-glyph, .language-pill'))
        );
      }

      function isVisible(element) {
        const style = window.getComputedStyle(element);
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          Number(style.opacity) === 0 ||
          element.getAttribute('aria-hidden') === 'true'
        ) return false;
        if (isScreenReaderOnly(element) || isVisuallyHidden(style)) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      }

      for (const element of document.querySelectorAll('body *')) {
        if (ignoredTags.has(element.tagName) || !isVisible(element)) continue;
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        const selector = selectorFor(element);
        const offscreenDrawer =
          style.position === 'fixed' &&
          (rect.left >= viewportWidth || rect.right <= 0) &&
          style.transform !== 'none';

        if (!offscreenDrawer && rect.right > viewportWidth + 3 && !isIntentionalScrollRegion(style)) {
          wideElements.push({
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            selector,
          });
        }

        const text = (element.textContent || '').trim().replace(/\\s+/g, ' ');
        if (
          text.length >= 8 &&
          element.children.length === 0 &&
          isCompactControlSurface(element) &&
          (element.scrollWidth > element.clientWidth + 3 || element.scrollHeight > element.clientHeight + 3) &&
          !isIntentionalScrollRegion(style)
        ) {
          clippedText.push({
            selector,
            text: text.slice(0, 60),
          });
        }
      }

      for (const element of document.querySelectorAll('button, a[href], input, select, textarea, [role="button"]')) {
        if (!isVisible(element)) continue;
        const wrappingLabel = element.closest('label')?.textContent;
        const labelledBy = element.getAttribute('aria-labelledby');
        const labelledByText = labelledBy
          ? labelledBy.split(/\\s+/).map(id => document.getElementById(id)?.textContent ?? '').join(' ')
          : '';
        const label = [
          element.getAttribute('aria-label'),
          element.getAttribute('title'),
          wrappingLabel,
          labelledByText,
          element.textContent,
          element.value,
          element.getAttribute('placeholder'),
        ].filter(Boolean).join(' ').trim();
        if (!label) {
          unlabeledInteractive.push({ selector: selectorFor(element) });
        }
      }

      const internalLinks = [...document.querySelectorAll('a[href]')]
        .map(anchor => anchor.getAttribute('href'))
        .filter(href => href && href.startsWith('/') && !href.startsWith('/_next') && !href.startsWith('/api/'));

      return {
        chartHouseButtons: document.querySelectorAll('.north-house[type="button"]').length || 0,
        clippedText,
        formControls: document.querySelectorAll('input, select, textarea').length,
        horizontalOverflow: Math.max(0, Math.ceil(Math.max(body.scrollWidth, root.scrollWidth) - viewportWidth)),
        internalLinks,
        textLength: visibleText.trim().length,
        title: document.title,
        unlabeledInteractive,
        visibleButtons: [...document.querySelectorAll('button, a.button, [role="button"]')].filter(isVisible).length,
        visibleTextLower: visibleText.toLowerCase(),
        wideElements,
      };
    })()`,
    returnByValue: true,
  });

  return response.result.value;
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

function getStatus(url) {
  return new Promise(resolve => {
    const request = httpRequest(url, { method: 'HEAD' }, response => {
      response.resume();
      response.on('end', () => resolve(response.statusCode ?? 0));
    });
    request.on('error', () => resolve(0));
    request.end();
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
  const listeners = new Map();

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
      return;
    }

    const handlers = listeners.get(payload.method);
    if (handlers) {
      for (const handler of handlers) {
        handler(payload.params ?? {});
      }
    }
  });

  return {
    close() {
      socket.close();
    },
    on(method, handler) {
      const handlers = listeners.get(method) ?? [];
      handlers.push(handler);
      listeners.set(method, handlers);
    },
    send(method, params = {}) {
      const callId = ++id;
      socket.send(JSON.stringify({ id: callId, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(callId, { reject, resolve });
      });
    },
    waitFor(method, timeout = 10_000) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Timed out waiting for ${method}`));
        }, timeout);
        const handler = params => {
          clearTimeout(timer);
          resolve(params);
        };
        const handlers = listeners.get(method) ?? [];
        handlers.push(handler);
        listeners.set(method, handlers);
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
