import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const phaseName = 'PREDICTA_APP_REVIVAL_PHASE_8_MOBILE_APP_FEEL_AND_TOUCH_FLOW_AUDIT';
const baseUrl = (
  process.env.PREDICTA_MOBILE_APP_FEEL_BASE_URL ?? 'http://127.0.0.1:3009'
).replace(/\/$/u, '');
const auditDir = `docs/audits/${phaseName}`;
const screenshotDir = `${auditDir}/screenshots`;
const manifestPath = `${auditDir}/mobile-app-feel-manifest.json`;
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

const routeChecks = [
  '/',
  '/ask',
  '/dashboard',
  '/dashboard/vedic',
  '/dashboard/kp',
  '/dashboard/jaimini',
  '/dashboard/numerology',
  '/dashboard/signature',
  '/dashboard/report',
];

if (!chromePath) {
  console.error('Chrome or Chromium is required for the Phase 8 mobile app-feel gate.');
  process.exit(1);
}

mkdirSync(screenshotDir, { recursive: true });

const failures = [];
const results = [];
const port = 9800 + Math.floor(Math.random() * 250);
const userDataDir = join(tmpdir(), `predicta-phase-8-mobile-feel-${Date.now()}`);
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
    for (const route of routeChecks) {
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
        await navigateAndWait(cdp, `${baseUrl}${route}`);

        const audit = await auditRoute(cdp, route, viewport);
        const screenshotName = `${viewport.name}-${route.replace(/[^a-z0-9]+/giu, '-').replace(/^-|-$/gu, '') || 'home'}.png`;
        const screenshotPath = `${screenshotDir}/${screenshotName}`;
        const screenshot = await cdp.send('Page.captureScreenshot', {
          captureBeyondViewport: false,
          format: 'png',
        });
        writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));

        const result = {
          ...audit,
          route,
          screenshotPath,
          viewport: viewport.name,
          viewportWidth: viewport.width,
        };
        results.push(result);
        failures.push(...audit.failures.map(failure => `${viewport.name} ${route}: ${failure}`));
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
  phaseName,
  results,
  viewports: viewports.map(({ height, mobile, name, width }) => ({
    height,
    mobile,
    name,
    width,
  })),
};

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({
  manifestPath,
  resultCount: results.length,
  screenshotDir,
}, null, 2));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName} passed. Manifest: ${manifestPath}`);
process.exit(0);

async function auditRoute(cdp, route, viewport) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const route = ${JSON.stringify(route)};
      const viewport = ${JSON.stringify(viewport)};
      const failures = [];
      const mobileWidth = viewport.width <= 430;
      const documentWidth = Math.max(
        document.documentElement.scrollWidth,
        document.body?.scrollWidth || 0
      );
      const horizontalOverflow = documentWidth > window.innerWidth + 1;

      if (horizontalOverflow) {
        failures.push('page has horizontal overflow');
      }

      const visible = element => {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 &&
          rect.height > 0 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          !element.closest('[aria-hidden="true"]');
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
      const minTouchSelectors = [
        'button',
        '.button',
        '[role="button"]',
        'textarea',
        'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])',
        'select',
        '.predicta-world-local-card',
        '.report-product-card',
        '.report-choice-card'
      ];
      const touchIssues = [...document.querySelectorAll(minTouchSelectors.join(','))]
        .filter(visible)
        .map(element => {
          const rect = element.getBoundingClientRect();
          return {
            className: String(element.className || ''),
            height: Math.round(rect.height),
            tag: element.tagName.toLowerCase(),
            text: (element.textContent || element.getAttribute('aria-label') || element.getAttribute('placeholder') || '')
              .replace(/\\s+/g, ' ')
              .trim()
              .slice(0, 80),
            width: Math.round(rect.width),
          };
        })
        .filter(item => item.height < 44 || item.width < 44);

      for (const issue of touchIssues.slice(0, 8)) {
        failures.push(\`touch target below 44px: \${issue.tag} "\${issue.text}" \${issue.width}x\${issue.height}\`);
      }

      let landingTextarea = null;
      let askTextarea = null;
      let voiceButton = null;
      let chipStrip = null;
      let localGridColumns = '';
      let reportActionColumns = '';

      if (route === '/') {
        landingTextarea = rectFor('.landing-ask-field textarea');
        voiceButton = rectFor('.landing-ask-actions .button.secondary');
        chipStrip = rectFor('.landing-question-chips');

        if (mobileWidth) {
          if (!landingTextarea) {
            failures.push('landing Predicta textarea is not visible');
          } else if (landingTextarea.top > window.innerHeight * 0.48) {
            failures.push(\`landing Predicta textarea starts too low at \${landingTextarea.top}px\`);
          }

          if (!voiceButton) {
            failures.push('landing voice button is not visible');
          } else if (voiceButton.height < 44 || voiceButton.width < 44) {
            failures.push('landing voice button is below touch target size');
          }
        }
      }

      if (route === '/ask') {
        askTextarea = rectFor('.ask-light-field textarea');
        voiceButton = rectFor('.ask-light-actions .button.secondary');
        chipStrip = rectFor('.ask-light-chips');

        if (mobileWidth) {
          if (!askTextarea) {
            failures.push('Ask Predicta textarea is not visible');
          } else if (askTextarea.top > window.innerHeight * 0.5) {
            failures.push(\`Ask Predicta textarea starts too low at \${askTextarea.top}px\`);
          }

          if (!voiceButton) {
            failures.push('Ask Predicta voice button is not visible');
          } else if (voiceButton.height < 44 || voiceButton.width < 44) {
            failures.push('Ask Predicta voice button is below touch target size');
          }
        }
      }

      if (route.startsWith('/dashboard/') && route !== '/dashboard/report') {
        const localGrid = document.querySelector('.predicta-world-local-grid');
        if (localGrid) {
          localGridColumns = window.getComputedStyle(localGrid).gridTemplateColumns;
        }

        if (mobileWidth && countGridColumns(localGridColumns) > 1) {
          failures.push(\`evidence room local grid is not stacked: \${localGridColumns}\`);
        }
      }

      if (route === '/dashboard/report') {
        const inlineActions = document.querySelector('.report-inline-actions');
        if (inlineActions) {
          reportActionColumns = window.getComputedStyle(inlineActions).gridTemplateColumns;
        }

        if (mobileWidth && countGridColumns(reportActionColumns) > 1) {
          failures.push(\`report inline actions are not stacked: \${reportActionColumns}\`);
        }
      }

      const fixedElements = [...document.querySelectorAll('*')]
        .filter(element => {
          const style = window.getComputedStyle(element);
          return visible(element) && (style.position === 'fixed' || style.position === 'sticky');
        })
        .map(element => {
          const rect = element.getBoundingClientRect();
          return {
            bottom: Math.round(rect.bottom),
            className: String(element.className || ''),
            height: Math.round(rect.height),
            tag: element.tagName.toLowerCase(),
            top: Math.round(rect.top),
          };
        });

      return {
        askTextarea,
        chipStrip,
        documentWidth,
        failures,
        fixedElements,
        horizontalOverflow,
        landingTextarea,
        localGridColumns,
        reportActionColumns,
        touchIssueCount: touchIssues.length,
        voiceButton,
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth,
      };
    })()`,
    returnByValue: true,
  });

  return response.result?.value ?? {
    failures: ['browser audit did not return a value'],
  };
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
  await delay(350);
}

async function waitForChrome(debugPort) {
  const deadline = Date.now() + 8_000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      await getText(`http://127.0.0.1:${debugPort}/json/version`);
      return;
    } catch (error) {
      lastError = error;
      await delay(120);
    }
  }

  throw lastError ?? new Error('Chrome did not start.');
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
      if (!payload.id || !pending.has(payload.id)) {
        return;
      }

      const callbacks = pending.get(payload.id);
      pending.delete(payload.id);

      if (payload.error) {
        callbacks.reject(new Error(payload.error.message));
      } else {
        callbacks.resolve(payload.result ?? {});
      }
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
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Process did not exit.')), timeoutMs);
    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
