import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const phaseName =
  'PREDICTA_APP_REVIVAL_PHASE_7_LINK_CLICK_LATENCY_AND_NAVIGATION_RELIABILITY';
const baseUrl = (
  process.env.PREDICTA_LINK_RELIABILITY_BASE_URL ?? 'http://127.0.0.1:3009'
).replace(/\/$/u, '');
const auditDir = `docs/audits/${phaseName}`;
const manifestPath = `${auditDir}/link-reliability-manifest.json`;
const maxClickMs = Number(process.env.PREDICTA_LINK_CLICK_BUDGET_MS ?? 1_800);
const maxHrefLength = Number(process.env.PREDICTA_LINK_MAX_HREF_LENGTH ?? 900);
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

const routeChecks = [
  '/',
  '/ask',
  '/dashboard/chat?legacyChatSmoke=1&prompt=Will+my+job+improve%3F',
  '/dashboard/vedic/chat?legacyRoomSmoke=1',
  '/dashboard/kp/chat?legacyRoomSmoke=1',
  '/dashboard/jaimini/chat?legacyRoomSmoke=1',
  '/dashboard/nadi/chat?legacyRoomSmoke=1',
  '/dashboard/numerology/chat?legacyRoomSmoke=1',
  '/dashboard/signature/chat?legacyRoomSmoke=1',
  '/pricing',
  '/checkout?productId=pridicta_10_questions',
  '/accuracy-method',
  '/safety',
  '/legal',
  '/feedback',
  '/dashboard',
  '/dashboard/kundli',
  '/dashboard/vedic',
  '/dashboard/kp',
  '/dashboard/jaimini',
  '/dashboard/numerology',
  '/dashboard/signature',
  '/dashboard/report',
  '/dashboard/redeem-pass',
  '/dashboard/saved-kundlis',
  '/dashboard/family',
  '/dashboard/settings',
  '/dashboard/account',
];

const requiredLinksByRoute = [
  {
    route: '/',
    links: [
      '/ask',
      '/dashboard/report',
      '/pricing',
      '/accuracy-method',
      '/safety',
      '/feedback',
      '/legal',
    ],
    schoolAskLinks: ['PARASHARI', 'KP', 'JAIMINI', 'NUMEROLOGY', 'SIGNATURE'],
  },
  {
    route: '/ask',
    links: ['/'],
  },
  {
    route: '/dashboard',
    links: ['/ask', '/dashboard/kundli', '/dashboard/saved-kundlis'],
  },
  {
    route: '/dashboard/vedic',
    links: ['/ask', '/dashboard/report', '/dashboard/kundli', '/dashboard/charts'],
  },
  {
    route: '/dashboard/kp',
    links: ['/ask', '/dashboard/report'],
  },
  {
    route: '/dashboard/jaimini',
    links: ['/ask', '/dashboard/report'],
  },
  {
    route: '/dashboard/numerology',
    links: ['/ask', '/dashboard/report'],
  },
  {
    route: '/dashboard/signature',
    links: ['/dashboard/report'],
  },
  {
    route: '/dashboard/report',
    links: ['/ask', '/dashboard/kundli', '/dashboard/premium'],
  },
  {
    route: '/pricing',
    links: ['/ask', '/checkout?productId=pridicta_10_questions', '/legal', '/'],
  },
  {
    route: '/accuracy-method',
    links: ['/ask', '/safety', '/legal', '/feedback'],
  },
  {
    route: '/safety',
    links: ['/ask', '/accuracy-method', '/legal', '/feedback'],
  },
  {
    route: '/legal',
    links: ['/ask', '/accuracy-method', '/safety', '/feedback'],
  },
  {
    route: '/feedback',
    links: ['/ask', '/accuracy-method', '/safety', '/legal'],
  },
  {
    route: '/dashboard/redeem-pass',
    links: ['/dashboard/settings'],
  },
];

const clickChecks = [
  {
    from: '/',
    name: 'landing primary ask entry',
    selector:
      'a[href="/ask"], a[href^="/ask?sourceScreen=Landing"], form button[type="submit"]',
    targetIncludes: '/ask',
  },
  {
    from: '/dashboard',
    name: 'dashboard ask predicta link',
    selector: 'a[href^="/ask"]',
    targetIncludes: '/ask',
  },
  {
    from: '/dashboard/vedic',
    name: 'vedic evidence room ask link',
    selector: 'a[href^="/ask"]',
    targetIncludes: '/ask',
  },
  {
    from: '/pricing',
    name: 'pricing checkout link',
    selector: 'a[href^="/checkout?productId="]',
    targetIncludes: '/checkout',
  },
];

if (!chromePath) {
  console.error('Chrome or Chromium is required for the Phase 7 link reliability gate.');
  process.exit(1);
}

mkdirSync(auditDir, { recursive: true });

const failures = [];
const routeResults = [];
const pageResults = [];
const clickResults = [];

for (const route of routeChecks) {
  const result = await fetchRoute(route);
  routeResults.push(result);

  if (result.status >= 400) {
    failures.push(`${route} returned HTTP ${result.status}.`);
  }

  if (isLegacyChatRoute(route)) {
    if (![307, 308].includes(result.status)) {
      failures.push(`${route} must redirect to /ask instead of rendering dashboard chat.`);
    }
    if (!result.location?.startsWith('/ask?')) {
      failures.push(`${route} redirect location must preserve context into /ask, got ${result.location ?? 'none'}.`);
    }
    const expectedSchool = expectedSchoolForLegacyChatRoute(route);
    if (expectedSchool && !result.location?.includes(`school=${expectedSchool}`)) {
      failures.push(`${route} redirect must preserve school=${expectedSchool}, got ${result.location ?? 'none'}.`);
    }
  }
}

const port = 9700 + Math.floor(Math.random() * 250);
const userDataDir = join(tmpdir(), `predicta-phase-7-links-${Date.now()}`);
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

  for (const check of requiredLinksByRoute) {
    const page = await createTarget(port, 'about:blank');
    const cdp = await connectWebSocket(page.webSocketDebuggerUrl);
    try {
      await cdp.send('Page.enable');
      await cdp.send('Runtime.enable');
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        deviceScaleFactor: 1,
        height: 940,
        mobile: false,
        width: 1440,
      });
      await navigateAndWait(cdp, `${baseUrl}${check.route}`);
      const pageAudit = await auditPageLinks(cdp, check);
      pageResults.push(pageAudit);
      failures.push(...pageAudit.failures);
    } finally {
      cdp.close();
      await closeTarget(port, page.id).catch(() => undefined);
    }
  }

  for (const clickCheck of clickChecks) {
    const page = await createTarget(port, 'about:blank');
    const cdp = await connectWebSocket(page.webSocketDebuggerUrl);
    try {
      await cdp.send('Page.enable');
      await cdp.send('Runtime.enable');
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        deviceScaleFactor: 1,
        height: 844,
        mobile: true,
        width: 390,
      });
      await navigateAndWait(cdp, `${baseUrl}${clickCheck.from}`);
      const result = await runClickCheck(cdp, clickCheck);
      clickResults.push(result);
      if (!result.clicked) {
        failures.push(`${clickCheck.name}: selector was not clickable.`);
      } else if (!result.url.includes(clickCheck.targetIncludes)) {
        failures.push(
          `${clickCheck.name}: expected URL containing ${clickCheck.targetIncludes}, got ${result.url}.`,
        );
      } else if (result.elapsedMs > maxClickMs) {
        failures.push(
          `${clickCheck.name}: click took ${result.elapsedMs}ms, above ${maxClickMs}ms.`,
        );
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
  clickBudgetMs: maxClickMs,
  clickResults,
  generatedAt: new Date().toISOString(),
  hrefLengthBudget: maxHrefLength,
  pageResults,
  routeResults,
};

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(JSON.stringify(manifest, null, 2));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName} passed. Manifest: ${manifestPath}`);

async function fetchRoute(route) {
  const startedAt = Date.now();
  const url = `${baseUrl}${route}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'manual',
    });

    return {
      elapsedMs: Date.now() - startedAt,
      location: response.headers.get('location'),
      route,
      status: response.status,
      url,
    };
  } catch (error) {
    return {
      elapsedMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : String(error),
      route,
      status: 599,
      url,
    };
  }
}

async function auditPageLinks(cdp, check) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const requiredLinks = ${JSON.stringify(check.links)};
      const requiredSchoolAskLinks = ${JSON.stringify(check.schoolAskLinks ?? [])};
      const isAskRoute = ${JSON.stringify(check.route === '/ask')};
      const anchors = [...document.querySelectorAll('a[href]')].map(anchor => ({
        ariaCurrent: anchor.getAttribute('aria-current') || '',
        ariaDisabled: anchor.getAttribute('aria-disabled') || '',
        className: String(anchor.className || ''),
        href: anchor.getAttribute('href') || '',
        inAskHeader:
          isAskRoute &&
          /\\bask-lean-header\\b/u.test(anchor.closest('header')?.className || ''),
        inPublicHeader:
          /\\bweb-header\\b/u.test(anchor.closest('header')?.className || ''),
        text: (anchor.textContent || '').replace(/\\s+/g, ' ').trim(),
      }));
      const publicHeaderForbiddenHrefs = new Set([
        '/#predicta-worlds',
        '/dashboard',
        '/dashboard/vedic',
        '/dashboard/kp',
        '/dashboard/jaimini',
        '/dashboard/numerology',
        '/dashboard/signature',
      ]);
      const hrefs = anchors.map(anchor => anchor.href);
      const disabledActive = anchors.filter(anchor =>
        anchor.ariaDisabled === 'true' ||
        /\\bdisabled\\b/u.test(anchor.className)
      );
      const nestedInteractive = [...document.querySelectorAll(
        'a button, a input, a select, a textarea, button a, button button, [role="button"] a, a [role="button"]'
      )].map(element => ({
        selector: element.tagName.toLowerCase(),
        text: (element.textContent || element.getAttribute('aria-label') || '')
          .replace(/\\s+/g, ' ')
          .trim(),
      }));
      const oversizedHrefs = anchors
        .filter(anchor => anchor.href.length > ${maxHrefLength})
        .map(anchor => ({
          hrefLength: anchor.href.length,
          text: anchor.text,
        }));
      const missing = requiredLinks.filter(required =>
        !hrefs.some(href => href === required || href.startsWith(required + '?') || href.startsWith(required + '#'))
      );
      const missingSchoolAskLinks = requiredSchoolAskLinks.filter(requiredSchool =>
        !anchors.some(anchor => {
          if (!anchor.href.startsWith('/ask?')) {
            return false;
          }

          const params = new URLSearchParams(anchor.href.split('?')[1] || '');

          return (
            params.get('autoSend') === 'true' &&
            params.get('school') === requiredSchool &&
            params.get('sourceScreen') === 'Landing'
          );
        })
      );
      const askHeaderDashboardLinks = anchors.filter(
        anchor => anchor.inAskHeader && anchor.href === '/dashboard'
      );
      const publicHeaderControlPanelLinks = anchors.filter(
        anchor => anchor.inPublicHeader && publicHeaderForbiddenHrefs.has(anchor.href)
      );
      const staleDashboardLibraryHandoffs =
        ${JSON.stringify(check.route === '/dashboard')}
          ? anchors.filter(anchor => {
              if (!anchor.href.startsWith('/ask?')) {
                return false;
              }

              const params = new URLSearchParams(anchor.href.split('?')[1] || '');
              return params.get('sourceScreen') === 'My Kundlis';
            })
          : [];

      return {
        activeLinks: anchors.filter(anchor => anchor.ariaCurrent),
        askHeaderDashboardLinks,
        anchorCount: anchors.length,
        disabledActive,
        hrefs,
        missing,
        missingSchoolAskLinks,
        nestedInteractive,
        oversizedHrefs,
        publicHeaderControlPanelLinks,
        staleDashboardLibraryHandoffs,
      };
    })()`,
    returnByValue: true,
  });

  const result = response.result?.value ?? {};
  const pageFailures = [];

  for (const missing of result.missing ?? []) {
    pageFailures.push(`${check.route}: missing expected link ${missing}.`);
  }

  for (const missingSchool of result.missingSchoolAskLinks ?? []) {
    pageFailures.push(
      `${check.route}: missing chat-first landing world handoff for ${missingSchool}.`,
    );
  }

  for (const item of result.disabledActive ?? []) {
    pageFailures.push(
      `${check.route}: disabled-looking link "${item.text || item.href}" remains in navigation.`,
    );
  }

  for (const item of result.nestedInteractive ?? []) {
    pageFailures.push(
      `${check.route}: nested interactive element detected near "${item.text}".`,
    );
  }

  for (const item of result.oversizedHrefs ?? []) {
    pageFailures.push(
      `${check.route}: oversized navigation href (${item.hrefLength} chars) near "${item.text}".`,
    );
  }

  for (const item of result.askHeaderDashboardLinks ?? []) {
    pageFailures.push(
      `${check.route}: Ask header exposes dashboard/library exit "${item.text || item.href}".`,
    );
  }

  for (const item of result.publicHeaderControlPanelLinks ?? []) {
    pageFailures.push(
      `${check.route}: public header exposes control-panel/specialist link "${item.text || item.href}".`,
    );
  }

  for (const item of result.staleDashboardLibraryHandoffs ?? []) {
    pageFailures.push(
      `${check.route}: primary dashboard Ask handoff still identifies as My Kundlis near "${item.text || item.href}".`,
    );
  }

  return {
    ...result,
    failures: pageFailures,
    route: check.route,
  };
}

async function runClickCheck(cdp, clickCheck) {
  const clickResponse = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const selector = ${JSON.stringify(clickCheck.selector)};
      const elements = [...document.querySelectorAll(selector)].filter(element => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        return rect.width > 0 &&
          rect.height > 0 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          !element.closest('[aria-hidden="true"]');
      });
      const element = elements[0];
      if (!element) {
        return { clicked: false };
      }
      element.scrollIntoView({ block: 'center', inline: 'center' });
      element.click();
      return {
        clicked: true,
        href: element.getAttribute('href') || '',
        text: (element.textContent || element.getAttribute('aria-label') || '')
          .replace(/\\s+/g, ' ')
          .trim(),
      };
    })()`,
    returnByValue: true,
  });

  const clicked = clickResponse.result?.value ?? { clicked: false };
  const startedAt = Date.now();

  if (!clicked.clicked) {
    return {
      ...clicked,
      elapsedMs: 0,
      from: clickCheck.from,
      name: clickCheck.name,
      url: '',
    };
  }

  const navigation = await waitForUrlIncludes(cdp, clickCheck.targetIncludes, 6_000);

  return {
    ...clicked,
    elapsedMs: Date.now() - startedAt,
    from: clickCheck.from,
    name: clickCheck.name,
    url: navigation.url,
  };
}

async function waitForUrlIncludes(cdp, expected, timeoutMs) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const response = await cdp.send('Runtime.evaluate', {
      expression: 'window.location.pathname + window.location.search + window.location.hash',
      returnByValue: true,
    });
    const url = response.result?.value ?? '';

    if (url.includes(expected)) {
      await cdp.send('Runtime.evaluate', {
        awaitPromise: true,
        expression: `new Promise(resolve => {
          if (document.readyState === 'complete' || document.readyState === 'interactive') {
            resolve(true);
            return;
          }
          setTimeout(() => resolve(false), 100);
        })`,
      });

      return { url };
    }

    await delay(100);
  }

  const response = await cdp.send('Runtime.evaluate', {
    expression: 'window.location.pathname + window.location.search + window.location.hash',
    returnByValue: true,
  });

  return { url: response.result?.value ?? '' };
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
  await delay(300);
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

function isLegacyChatRoute(route) {
  return /^\/dashboard\/(?:chat|(?:vedic|kp|jaimini|nadi|numerology|signature)\/chat)(?:[?#]|$)/u.test(route);
}

function expectedSchoolForLegacyChatRoute(route) {
  if (route.startsWith('/dashboard/vedic/chat')) return 'PARASHARI';
  if (route.startsWith('/dashboard/kp/chat')) return 'KP';
  if (route.startsWith('/dashboard/jaimini/chat')) return 'JAIMINI';
  if (route.startsWith('/dashboard/nadi/chat')) return 'JAIMINI';
  if (route.startsWith('/dashboard/numerology/chat')) return 'NUMEROLOGY';
  if (route.startsWith('/dashboard/signature/chat')) return 'SIGNATURE';
  return undefined;
}
