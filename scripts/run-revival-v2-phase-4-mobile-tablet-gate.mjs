import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { assertAuditablePredictaPage } from './lib/predicta-audit-page-readiness.mjs';

const phaseName = 'PREDICTA_REVIVAL_V2_PHASE_4_MOBILE_TABLET_APP_FEEL_REBUILD';
const baseUrl = (process.env.PREDICTA_REVIVAL_V2_PHASE_4_BASE_URL ?? 'http://127.0.0.1:3009').replace(/\/$/u, '');
const auditRoot = `docs/audits/${phaseName}`;
const screenshotRoot = join(auditRoot, 'screenshots');
const manifestPath = join(auditRoot, 'phase-4-mobile-tablet-manifest.json');
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
  { height: 780, mobile: true, name: 'mobile-360', width: 360 },
  { height: 844, mobile: true, name: 'mobile-390', width: 390 },
  { height: 932, mobile: true, name: 'mobile-430', width: 430 },
  { height: 1024, mobile: true, name: 'tablet-768', width: 768 },
  { height: 1112, mobile: true, name: 'tablet-834', width: 834 },
  { height: 900, mobile: false, name: 'laptop-1024', width: 1024 },
  { height: 940, mobile: false, name: 'desktop-1440', width: 1440 },
];

const routes = [
  '/',
  '/ask',
  '/dashboard',
  '/dashboard/kundli',
  '/dashboard/charts',
  '/dashboard/report',
  '/dashboard/chat',
  '/dashboard/vedic',
  '/dashboard/kp',
  '/dashboard/jaimini',
  '/dashboard/numerology',
  '/dashboard/signature',
];

if (!chromePath) {
  console.error('Chrome or Chromium is required for the Revival V2 Phase 4 gate.');
  process.exit(1);
}

mkdirSync(screenshotRoot, { recursive: true });

const failures = [];
const results = [];
const port = 9600 + Math.floor(Math.random() * 300);
const userDataDir = join(tmpdir(), `predicta-revival-v2-phase-4-${Date.now()}`);
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
    for (const route of routes) {
      const url = `${baseUrl}${route}`;
      const page = await createTarget(port, 'about:blank');
      const cdp = await connectWebSocket(page.webSocketDebuggerUrl);

      try {
        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');
        await cdp.send('Emulation.setDeviceMetricsOverride', {
          deviceScaleFactor: 1,
          height: viewport.height,
          mobile: viewport.mobile,
          width: viewport.width,
        });
        await navigateAndWait(cdp, url);
        await cdp.send('Runtime.evaluate', {
          awaitPromise: true,
          expression:
            'document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 4000))]) : true',
        });
        await assertAuditablePredictaPage(cdp, { route, url });

        const metrics = await auditRoute(cdp, route, viewport);
        const fileName = `${viewport.name}-${routeToFileName(route)}.png`;
        const screenshot = await cdp.send('Page.captureScreenshot', {
          captureBeyondViewport: false,
          format: 'png',
          fromSurface: true,
        });
        writeFileSync(join(screenshotRoot, fileName), Buffer.from(screenshot.data, 'base64'));

        const result = {
          ...metrics.summary,
          fileName,
          route,
          viewport: viewport.name,
          viewportWidth: viewport.width,
        };
        results.push(result);
        failures.push(...metrics.failures.map(failure => `${viewport.name} ${route}: ${failure}`));
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
  generatedAt: new Date().toISOString(),
  phase: phaseName,
  results,
  screenshotRoot,
  status: failures.length ? 'failed' : 'green',
  viewports,
};

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({
  manifestPath,
  resultCount: results.length,
  screenshotRoot,
  status: manifest.status,
}, null, 2));
console.table(results.map(({ route, viewport, viewportWidth, horizontalOverflow, clippedText, touchIssues }) => ({
  clippedText,
  horizontalOverflow,
  route,
  touchIssues,
  viewport,
  viewportWidth,
})));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.slice(0, 120).forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

writeFileSync(
  join(auditRoot, 'redline-audit.md'),
  [
    `# ${phaseName}`,
    '',
    '## Verdict',
    '',
    'GREEN.',
    '',
    '## Locked Behavior',
    '',
    '- Required viewport matrix passed: 360, 390, 430, 768, 834, 1024, and desktop.',
    '- Ask Predicta remains visible early on mobile landing and Ask pages.',
    '- Touch targets stay at or above 44px.',
    '- Sticky Ask/chat bars have sufficient content clearance.',
    '- Report composer and specialist evidence-room cards stack cleanly on phone/tablet.',
    '- No horizontal overflow or clipped text was detected.',
  ].join('\n'),
);

console.log(`${phaseName} passed: mobile/tablet app-feel is green.`);

async function auditRoute(cdp, route, viewport) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    returnByValue: true,
    expression: `(() => {
      const route = ${JSON.stringify(route)};
      const viewport = ${JSON.stringify(viewport)};
      const failures = [];
      const mobile = viewport.width <= 430;
      const tablet = viewport.width > 430 && viewport.width <= 834;
      const viewportWidth = document.documentElement.clientWidth;
      const documentWidth = Math.max(document.documentElement.scrollWidth, document.body?.scrollWidth || 0);
      const horizontalOverflow = Math.max(0, Math.ceil(documentWidth - viewportWidth));

      if (horizontalOverflow > 1) failures.push('page has horizontal overflow');

      const visible = element => {
        if (!element) return false;
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return rect.width > 0 &&
          rect.height > 0 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity) > 0 &&
          element.getAttribute('aria-hidden') !== 'true' &&
          !element.closest('[aria-hidden="true"]') &&
          !element.closest('.sr-only');
      };

      const selectorFor = element => {
        if (element.id) return '#' + element.id;
        const classes = [...element.classList].slice(0, 3).join('.');
        return element.tagName.toLowerCase() + (classes ? '.' + classes : '');
      };

      const rectFor = selector => {
        const element = document.querySelector(selector);
        if (!visible(element)) return null;
        const rect = element.getBoundingClientRect();
        return {
          bottom: Math.round(rect.bottom),
          height: Math.round(rect.height),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          top: Math.round(rect.top),
          width: Math.round(rect.width),
        };
      };

      const countGridColumns = value => {
        if (!value || value === 'none') return 0;
        return (value.match(/minmax\\([^)]*\\)|repeat\\([^)]*\\)|[^\\s]+/gu) || []).length;
      };

      const touchTargets = [...document.querySelectorAll([
        'button',
        '[role="button"]',
        'a.button',
        '.button',
        '.predicta-button',
        'summary',
        'textarea',
        'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])',
        'select',
        '.report-school-subnav a',
        '.predicta-world-local-card',
        '.report-product-card',
        '.report-choice-card'
      ].join(','))]
        .filter(visible)
        .map(element => {
          const rect = element.getBoundingClientRect();
          return {
            height: Math.round(rect.height),
            selector: selectorFor(element),
            text: (element.textContent || element.getAttribute('aria-label') || element.getAttribute('placeholder') || '').replace(/\\s+/g, ' ').trim().slice(0, 80),
            width: Math.round(rect.width),
          };
        })
        .filter(item => item.height < 44 || item.width < 44);

      for (const item of touchTargets.slice(0, 8)) {
        failures.push(\`touch target below 44px: \${item.selector} "\${item.text}" \${item.width}x\${item.height}\`);
      }

      const clippedTextSelectors = [
        'a',
        'button',
        '[role="button"]',
        'summary',
        'span',
        'small',
        'strong',
        'em',
        'p',
        'h1',
        'h2',
        'h3',
        'h4',
        'label',
        'input',
        'textarea',
        'select'
      ].join(',');
      const clippedText = [...document.querySelectorAll(clippedTextSelectors)]
        .filter(visible)
        .filter(element => {
          const style = window.getComputedStyle(element);
          if (!['hidden', 'clip'].includes(style.overflow) && !['hidden', 'clip'].includes(style.overflowX)) return false;
          const text = (element.textContent || '').replace(/\\s+/g, ' ').trim();
          if (text.length < 4) return false;
          return element.scrollWidth > element.clientWidth + 2 || element.scrollHeight > element.clientHeight + 2;
        })
        .slice(0, 8)
        .map(element => ({ selector: selectorFor(element), text: (element.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 80) }));

      for (const item of clippedText.slice(0, 5)) {
        failures.push(\`text appears clipped in \${item.selector}: \${item.text}\`);
      }

      const landingTextarea = rectFor('.landing-ask-field textarea');
      const askTextarea = rectFor('.ask-light-field textarea');
      const dashboardDock = rectFor('.dashboard-ask-dock');
      const chatInput = rectFor('.predicta-chat-page .chat-input-row, .chat-input-row');
      const mainWorkspace = document.querySelector('.main-workspace');
      const mainPaddingBottom = mainWorkspace ? Number.parseFloat(window.getComputedStyle(mainWorkspace).paddingBottom || '0') : 0;

      if (mobile && route === '/') {
        if (!landingTextarea) failures.push('mobile landing Ask textarea is not visible');
        else if (landingTextarea.top > window.innerHeight * 0.52) failures.push(\`mobile landing Ask textarea starts too low at \${landingTextarea.top}px\`);
      }

      if (mobile && route === '/ask') {
        if (!askTextarea) failures.push('mobile Ask Predicta textarea is not visible');
        else if (askTextarea.top > window.innerHeight * 0.54) failures.push(\`mobile Ask textarea starts too low at \${askTextarea.top}px\`);
      }

      if ((mobile || tablet) && dashboardDock) {
        if (dashboardDock.bottom > window.innerHeight - 4) failures.push('dashboard Ask dock touches or exceeds viewport bottom');
        if (mainPaddingBottom && mainPaddingBottom < dashboardDock.height + 20) failures.push('main workspace does not reserve enough space for sticky Ask dock');
      }

      if ((mobile || tablet) && route === '/dashboard/chat' && chatInput) {
        if (chatInput.bottom > window.innerHeight + 2) failures.push('chat composer exceeds viewport bottom');
      }

      const worldGrid = document.querySelector('.predicta-world-local-grid');
      const worldGridColumns = worldGrid ? window.getComputedStyle(worldGrid).gridTemplateColumns : '';
      if (mobile && worldGrid && countGridColumns(worldGridColumns) > 1) {
        failures.push(\`evidence room local grid is not stacked: \${worldGridColumns}\`);
      }

      const reportSubnav = document.querySelector('.report-school-subnav');
      const reportSubnavStyle = reportSubnav ? window.getComputedStyle(reportSubnav) : null;
      if (mobile && route === '/dashboard/report' && reportSubnavStyle && reportSubnavStyle.display !== 'grid') {
        failures.push('mobile report school navigation is not a stacked grid');
      }

      const reportActions = document.querySelector('.report-inline-actions, .report-selected-actions, .report-download-actions');
      const reportActionColumns = reportActions ? window.getComputedStyle(reportActions).gridTemplateColumns : '';
      if (mobile && route === '/dashboard/report' && reportActionColumns && countGridColumns(reportActionColumns) > 1) {
        failures.push(\`mobile report actions are not stacked: \${reportActionColumns}\`);
      }

      return {
        failures,
        summary: {
          askTextareaTop: askTextarea?.top ?? null,
          chatInputHeight: chatInput?.height ?? null,
          clippedText: clippedText.length,
          dashboardDockHeight: dashboardDock?.height ?? null,
          horizontalOverflow,
          landingTextareaTop: landingTextarea?.top ?? null,
          mainPaddingBottom: Math.round(mainPaddingBottom),
          reportActionColumns,
          touchIssues: touchTargets.length,
          worldGridColumns,
        },
      };
    })()`,
  });

  return response.result.value;
}

function routeToFileName(route) {
  return route.replace(/[^a-z0-9]+/giu, '-').replace(/^-|-$/gu, '') || 'home';
}

async function waitForChrome(debugPort) {
  for (let attempt = 0; attempt < 160; attempt += 1) {
    try {
      await getText(`http://127.0.0.1:${debugPort}/json/version`);
      return;
    } catch {
      await delay(200);
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
  await cdp.send('Runtime.evaluate', {
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
  });
  await delay(500);
}

function connectWebSocket(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    let id = 0;
    const pending = new Map();

    socket.addEventListener('open', () => {
      resolve({
        close: () => socket.close(),
        send(method, params = {}) {
          const messageId = ++id;
          socket.send(JSON.stringify({ id: messageId, method, params }));
          return new Promise((messageResolve, messageReject) => {
            pending.set(messageId, { reject: messageReject, resolve: messageResolve });
          });
        },
      });
    });

    socket.addEventListener('message', event => {
      const payload = JSON.parse(event.data);
      if (!payload.id || !pending.has(payload.id)) return;
      const callbacks = pending.get(payload.id);
      pending.delete(payload.id);
      if (payload.error) callbacks.reject(new Error(payload.error.message));
      else callbacks.resolve(payload.result ?? {});
    });

    socket.addEventListener('error', () => reject(new Error('CDP socket error')));
  });
}

function requestJson(options) {
  return new Promise((resolve, reject) => {
    const req = httpRequest(options.url, { method: options.method ?? 'GET' }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function getText(url) {
  return new Promise((resolve, reject) => {
    httpGet(url, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        body += chunk;
      });
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

function waitForProcessExit(child, timeoutMs) {
  return new Promise(resolve => {
    const timer = setTimeout(resolve, timeoutMs);
    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
