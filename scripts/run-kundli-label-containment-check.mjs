import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const baseUrl = process.env.PREDICTA_LABEL_BASE_URL ?? 'http://127.0.0.1:3009';
const fallbackSeedUrl =
  process.env.PREDICTA_LABEL_SEED_FALLBACK_URL ??
  'https://predicta-web--predicta-a4758.asia-east1.hosted.app';
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

if (!chromePath) {
  console.error('Chrome or Chromium is required for the Kundli label containment check.');
  process.exit(1);
}

const outputDir =
  process.env.PREDICTA_LABEL_OUTPUT_DIR ??
  join(tmpdir(), `predicta-kundli-containment-${Date.now()}`);

mkdirSync(outputDir, { recursive: true });

const viewports = [
  { height: 1100, name: 'desktop', width: 1440 },
  { height: 844, name: 'mobile', width: 390 },
];

const cases = [
  {
    containerSelector: '.hero-kundli-board',
    labelSelector: '.hero-chart-label',
    name: 'landing',
    route: '/',
    stackSelector: '.hero-chart-planet-stack',
  },
  {
    containerSelector: '.north-chart[data-chart-presentation="main"]',
    labelSelector: '.north-house-label',
    name: 'main-kundli',
    route: '/dashboard/kundli',
    stackSelector: '.north-planet-stack',
  },
  {
    containerSelector: '.north-chart[data-chart-presentation="charts"]',
    labelSelector: '.north-house-label',
    name: 'charts-explorer',
    route: '/dashboard/charts',
    stackSelector: '.north-planet-stack',
  },
  {
    containerSelector: '.kundli-library-mini-chart',
    labelSelector: '.kundli-library-mini-cell',
    name: 'library-snapshots',
    route: '/dashboard/saved-kundlis',
    stackSelector: '.kundli-library-mini-planets',
  },
  {
    afterNavigate: ensureChatMiniChart,
    containerSelector: '.chat-mini-chart[data-chart-presentation="chat"]',
    labelSelector: '.north-house-label',
    name: 'predicta-chat-chart',
    route: '/dashboard/vedic/chat',
    stackSelector: '.chat-mini-planet-row',
  },
];

const failures = [];
const summary = [];
const seedKundli = await loadSeedKundli();
const seedProfiles = buildSeedProfiles(seedKundli);
const port = 9300 + Math.floor(Math.random() * 400);
const userDataDir = join(tmpdir(), `predicta-kundli-containment-${Date.now()}`);
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
    for (const scenario of cases) {
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

        await navigateAndWait(cdp, `${baseUrl}/`);
        await seedLocalState(cdp, seedProfiles);
        await navigateAndWait(cdp, `${baseUrl}${scenario.route}`);
        if (scenario.afterNavigate) {
          await scenario.afterNavigate(cdp);
        }

        const metrics = await evaluateContainment(cdp, scenario);
        const screenshot = await cdp.send('Page.captureScreenshot', {
          captureBeyondViewport: false,
          format: 'png',
          fromSurface: true,
        });
        const fileName = `${viewport.name}-${scenario.name}.png`;
        writeFileSync(join(outputDir, fileName), Buffer.from(screenshot.data, 'base64'));

        summary.push({
          case: scenario.name,
          containerCount: metrics.containerCount,
          failures: metrics.failures.length,
          fileName,
          viewport: viewport.name,
        });

        if (!metrics.containerCount) {
          failures.push(`${viewport.name} ${scenario.name}: no chart container matched ${scenario.containerSelector}.`);
        }

        for (const failure of metrics.failures.slice(0, 8)) {
          failures.push(`${viewport.name} ${scenario.name}: ${failure}`);
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

console.log(`Kundli containment screenshots: ${outputDir}`);
console.table(summary);

if (failures.length) {
  console.error('Kundli label containment check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Kundli label containment check passed: ${summary.length} surface and viewport checks.`,
);

async function loadSeedKundli() {
  const payload = {
    date: '1994-08-16',
    latitude: 19.076,
    longitude: 72.8777,
    name: 'Aarav Mehta',
    place: 'Mumbai, India',
    time: '06:42',
    timezone: 'Asia/Kolkata',
  };
  const localResponse = await fetch(`${baseUrl}/api/generate-kundli`, {
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  }).catch(() => undefined);

  if (localResponse?.ok) {
    return localResponse.json();
  }

  const fallbackResponse = await fetch(`${fallbackSeedUrl}/api/generate-kundli`, {
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });

  if (!fallbackResponse.ok) {
    throw new Error('Could not create a seed Kundli for the containment check.');
  }

  return fallbackResponse.json();
}

function buildSeedProfiles(seedKundli) {
  const profiles = [
    ['sunrise', 'Aarav Sunrise', '06:42', 'Mumbai, India'],
    ['afternoon', 'Aarav Afternoon', '14:20', 'Mumbai, India'],
    ['sunset', 'Aarav Sunset', '18:08', 'Mumbai, India'],
    ['night', 'Aarav Night', '22:15', 'Mumbai, India'],
  ].map(([idSuffix, name, time, place], index) => ({
    ...seedKundli,
    birthDetails: {
      ...seedKundli.birthDetails,
      name,
      place,
      time,
    },
    id: `${seedKundli.id}-${idSuffix}`,
    isOwnerProfile: index === 0,
    relationshipToOwner: index === 0 ? 'self' : index === 1 ? 'spouse' : 'friend',
  }));

  return {
    activeKundli: profiles[0],
    savedKundlis: profiles,
  };
}

async function seedLocalState(cdp, seedProfiles) {
  const expression = `(() => {
    const seed = ${JSON.stringify(seedProfiles)};
    const updatedAt = new Date().toISOString();
    const language = {
      appLanguage: 'en',
      chartLanguage: 'en',
      language: 'en',
      predictaReplyLanguage: 'en',
      predictaStylePreference: 'balanced',
      reportLanguage: 'en',
      updatedAt,
    };
    const chatMemory = {
      chatLanguage: 'en',
      messages: [{ id: 'welcome', role: 'pridicta', text: 'welcome' }],
    };
    const store = {
      activeKundli: seed.activeKundli,
      activeKundliId: seed.activeKundli.id,
      savedKundlis: seed.savedKundlis,
      updatedAt,
    };
    window.localStorage.setItem('pridicta.languagePreference.v1', JSON.stringify(language));
    window.localStorage.setItem('predicta.webChatMemory.v4', JSON.stringify(chatMemory));
    window.localStorage.setItem('pridicta.webKundliStore.v1', JSON.stringify(store));
    window.localStorage.setItem('pridicta.activeKundli.v1', JSON.stringify(seed.activeKundli));
    window.localStorage.setItem('pridicta.savedKundlis.v1', JSON.stringify(seed.savedKundlis));
    return true;
  })()`;

  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression,
    returnByValue: true,
  });
}

async function ensureChatMiniChart(cdp) {
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `new Promise((resolve, reject) => {
      const trySend = () => {
        const input = document.querySelector('textarea');
        const button = [...document.querySelectorAll('button')].find(node =>
          /ask predicta/i.test((node.textContent || '').trim()),
        );

        if (!input || !button) {
          setTimeout(trySend, 200);
          return;
        }

        input.focus();
        const setter = Object.getOwnPropertyDescriptor(
          HTMLTextAreaElement.prototype,
          'value',
        )?.set;
        setter?.call(
          input,
          'Show my career chart and explain what it is saying in simple language.',
        );
        input.dispatchEvent(new Event('input', { bubbles: true }));
        button.click();

        const startedAt = Date.now();
        const waitForChart = () => {
          if (document.querySelector('.chat-mini-chart')) {
            resolve(true);
            return;
          }
          if (Date.now() - startedAt > 14000) {
            reject(new Error('Chat mini chart did not appear in time.'));
            return;
          }
          setTimeout(waitForChart, 200);
        };

        waitForChart();
      };

      trySend();
    })`,
  });
}

async function evaluateContainment(cdp, scenario) {
  const expression = `(() => {
    const containerSelector = ${JSON.stringify(scenario.containerSelector)};
    const labelSelector = ${JSON.stringify(scenario.labelSelector)};
    const stackSelector = ${JSON.stringify(scenario.stackSelector)};
    const epsilon = 1;
    const failures = [];
    const containers = [...document.querySelectorAll(containerSelector)];

    function rectOverflow(labelRect, containerRect) {
      return (
        labelRect.left < containerRect.left - epsilon ||
        labelRect.right > containerRect.right + epsilon ||
        labelRect.top < containerRect.top - epsilon ||
        labelRect.bottom > containerRect.bottom + epsilon
      );
    }

    function describe(element) {
      const classes = [...(element.classList || [])].slice(0, 3).join('.');
      return classes ? element.tagName.toLowerCase() + '.' + classes : element.tagName.toLowerCase();
    }

    for (const container of containers) {
      const containerRect = container.getBoundingClientRect();
      const labels = [...container.querySelectorAll(labelSelector)];

      for (const label of labels) {
        const labelRect = label.getBoundingClientRect();
        if (!labelRect.width || !labelRect.height) {
          failures.push(describe(label) + ' has zero-sized label box.');
          continue;
        }

        if (rectOverflow(labelRect, containerRect)) {
          failures.push(describe(label) + ' leaves the chart bounds.');
        }

        if (
          label.scrollWidth > label.clientWidth + epsilon ||
          label.scrollHeight > label.clientHeight + epsilon
        ) {
          failures.push(describe(label) + ' overflows its own label box.');
        }

        const stacks = stackSelector
          ? [...label.querySelectorAll(stackSelector)]
          : [];

        for (const stack of stacks) {
          const stackRect = stack.getBoundingClientRect();
          if (rectOverflow(stackRect, labelRect)) {
            failures.push(describe(stack) + ' crosses the label boundary inside ' + describe(label) + '.');
          }
        }
      }
    }

    return {
      containerCount: containers.length,
      failures,
    };
  })()`;

  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression,
    returnByValue: true,
  });

  return response.result.value;
}

async function waitForChrome(debugPort) {
  for (let attempt = 0; attempt < 160; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
      if (response.ok) {
        return;
      }
    } catch {}
    await delay(250);
  }

  throw new Error('Chrome did not expose a debugging endpoint in time.');
}

async function createTarget(debugPort, url) {
  const response = await fetch(
    `http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(url)}`,
    { method: 'PUT' },
  );
  return response.json();
}

async function closeTarget(debugPort, id) {
  await fetch(`http://127.0.0.1:${debugPort}/json/close/${id}`);
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
  await delay(900);
}

async function connectWebSocket(wsUrl) {
  const socket = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('WebSocket connection timed out.'));
    }, 10_000);
    socket.addEventListener(
      'open',
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
    socket.addEventListener(
      'error',
      () => {
        clearTimeout(timeout);
        reject(new Error('WebSocket connection failed.'));
      },
      { once: true },
    );
  });

  socket.addEventListener('message', event => {
    const payload = JSON.parse(String(event.data));
    if (payload.id && pending.has(payload.id)) {
      const { reject, resolve, timeout } = pending.get(payload.id);
      pending.delete(payload.id);
      clearTimeout(timeout);
      if (payload.error) {
        reject(new Error(JSON.stringify(payload.error)));
      } else {
        resolve(payload.result ?? {});
      }
    }
  });

  socket.addEventListener('close', () => {
    const error = new Error('WebSocket closed before Chrome replied.');
    for (const { reject, timeout } of pending.values()) {
      clearTimeout(timeout);
      reject(error);
    }
    pending.clear();
  });

  return {
    close() {
      socket.close();
    },
    send(method, params = {}) {
      const id = nextId;
      nextId += 1;
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`Timed out waiting for ${method}`));
        }, 45_000);
        pending.set(id, { reject, resolve, timeout });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
  };
}

async function waitForProcessExit(process, timeoutMs) {
  if (process.exitCode !== null) {
    return;
  }

  await Promise.race([
    new Promise(resolve => process.once('exit', resolve)),
    delay(timeoutMs),
  ]);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
