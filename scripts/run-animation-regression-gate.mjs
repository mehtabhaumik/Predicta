import { existsSync, readFileSync, rmSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { get as httpsGet, request as httpsRequest } from 'node:https';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const baseUrl = process.env.PREDICTA_ANIMATION_BASE_URL ?? 'http://127.0.0.1:3009';
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
  { height: 960, name: 'desktop', width: 1440 },
  { height: 1024, name: 'tablet', width: 768 },
  { height: 844, name: 'mobile', width: 390 },
];

const chatRoutes = [
  '/dashboard/chat',
  '/dashboard/vedic/chat',
  '/dashboard/kp/chat',
  '/dashboard/nadi/chat',
  '/dashboard/numerology/chat',
  '/dashboard/signature/chat',
];

const sourceContracts = [
  {
    file: 'apps/web/lib/kundli-animation-contract.ts',
    label: 'shared animation contract exposes surfaces and parts',
    mustContain: [
      "export type KundliAnimationSurface",
      "'standard'",
      "'landing'",
      "'creation'",
      "'chat'",
      "export type KundliAnimationPart",
      "'lines'",
      "'signs'",
      "'planets'",
      "'planet'",
      "'markers'",
      "'legend'",
      "'data-kundli-animation': 'true'",
      "'data-kundli-animation-surface': surface",
      "'--kundli-line-reveal-delay'",
      "'--kundli-planet-reveal-delay'",
    ],
  },
  {
    file: 'apps/web/components/HeroSection.tsx',
    label: 'landing hero uses the North Indian chart animation model',
    mustContain: [
      '<NorthIndianChartLines surface="landing" />',
      "getKundliAnimationSurfaceProps('landing')",
      'data-kundli-animation-part="signs"',
      'data-kundli-animation-part="planets"',
      'getKundliAnimationStyle(index,',
      'getSystemTimeChartTheme',
    ],
  },
  {
    file: 'apps/web/components/WebKundliWizard.tsx',
    label: 'Kundli creation uses real chart animation parts',
    mustContain: [
      'data-kundli-animation-part="signs"',
      'animationSurface="creation"',
      'creationNote.probableTime',
      'creationNote.originalTime',
      'This Kundli uses the birth time you confirmed',
    ],
  },
  {
    file: 'apps/web/components/WebKundliChart.tsx',
    label: 'interactive charts keep house controls separate from labels',
    mustContain: [
      '<NorthIndianChartLines surface={animationSurface} />',
      'className="north-house-state-map"',
      'className={`north-house north-house-${cell.house}',
      'onClick={() => selectHouse(cell.house)}',
      'onFocus={() => setHoveredHouse(cell.house)}',
      'aria-pressed={activeCell?.house === cell.house}',
      'data-kundli-animation-part="signs"',
      'animationSurface={animationSurface}',
      'ChartLegend',
    ],
  },
  {
    file: 'apps/web/components/WebPridictaChat.tsx',
    label: 'chat Kundli and loading animation keep dedicated containment hooks',
    mustContain: [
      'data-chat-kundli-reveal="true"',
      'animationSurface="chat"',
      'className="message pridicta thinking-message"',
      'className="predicta-thinking-row"',
      'className="predicta-thinking-mark"',
      'getChatHousePolygonPoints(cell.house ?? 0)',
    ],
  },
  {
    file: 'apps/web/app/globals.css',
    label: 'CSS gates animation containment and reduced motion',
    mustContain: [
      '@media (prefers-reduced-motion: reduce)',
      'animation-duration: 0.01ms !important',
      '.thinking-message',
      'flex: 0 0 auto;',
      '--thinking-orbit-radius',
      'overflow: hidden;',
      'landingKundliGlow',
      'heroKundliLineBreath',
      'chatKundliCardReveal',
      'predictaChatShellEnter',
    ],
  },
  {
    file: 'packages/astrology/src/chartStressSuite.ts',
    label: 'chart stress suite protects geometry and label placement',
    mustContain: [
      'north Indian line geometry has no center cross',
      'house hit map resolves every house center',
      'Bhaumik D1 planets stay in expected houses',
      '7 planets stay bounded in tight house',
      'assertChartLabelsResolveInsideHouses',
    ],
  },
];

const failures = [];
const routeSummary = [];

if (!chromePath) {
  console.error('Chrome or Chromium is required for the animation regression gate.');
  process.exit(1);
}

const port = 9700 + Math.floor(Math.random() * 250);
const userDataDir = join(tmpdir(), `predicta-animation-chrome-${Date.now()}`);
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
    await runLandingHeroGate(viewport);
    await runChatLoadingGate(viewport);
    await runReducedMotionGate(viewport);
  }
} finally {
  chrome.kill('SIGTERM');
  try {
    await waitForProcessExit(chrome, 2_500);
  } catch {
    chrome.kill('SIGKILL');
  }
  rmSync(userDataDir, { force: true, recursive: true });
}

if (failures.length) {
  console.error('Animation regression gate failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Animation regression gate passed: ${routeSummary.length} live checks plus ${sourceContracts.length} source contracts.`);

function runSourceContracts() {
  for (const contract of sourceContracts) {
    const source = readFileSync(join(process.cwd(), contract.file), 'utf8');
    for (const fragment of contract.mustContain) {
      if (!source.includes(fragment)) {
        failures.push(`${contract.label}: missing "${fragment}" in ${contract.file}.`);
      }
    }
  }
}

async function runLandingHeroGate(viewport) {
  const { cdp, target } = await openPage(viewport, '/?animation-regression=hero');
  try {
    const metrics = await evaluate(cdp, `(() => {
      const root = document.documentElement;
      const board = document.querySelector('.hero-kundli-board');
      if (!board) {
        return { ok: false, reason: 'missing hero Kundli board' };
      }
      const boardRect = board.getBoundingClientRect();
      const labels = [...board.querySelectorAll('.hero-chart-label')];
      const linePaths = [...board.querySelectorAll('.north-chart-lines path')];
      const leakingLabels = labels
        .map(label => {
          const rect = label.getBoundingClientRect();
          return {
            text: label.textContent.trim().replace(/\\s+/g, ' ').slice(0, 80),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            top: Math.round(rect.top),
            bottom: Math.round(rect.bottom),
            outside:
              rect.left < boardRect.left - 4 ||
              rect.right > boardRect.right + 4 ||
              rect.top < boardRect.top - 4 ||
              rect.bottom > boardRect.bottom + 4,
          };
        })
        .filter(item => item.outside);
      const firstPathStyle = linePaths[0] ? getComputedStyle(linePaths[0]) : undefined;
      const boardStyle = getComputedStyle(board);
      return {
        boardAnimation: boardStyle.animationName,
        boardHeight: Math.round(boardRect.height),
        boardWidth: Math.round(boardRect.width),
        horizontalOverflow: Math.max(0, Math.ceil(root.scrollWidth - root.clientWidth)),
        labelCount: labels.length,
        leakingLabels,
        lineCount: linePaths.length,
        lineAnimation: firstPathStyle?.animationName ?? '',
        ok:
          labels.length === 12 &&
          linePaths.length >= 4 &&
          leakingLabels.length === 0 &&
          Math.max(0, Math.ceil(root.scrollWidth - root.clientWidth)) <= 2,
      };
    })()`);

    if (!metrics.ok) {
      failures.push(`${viewport.name} landing hero animation failed: ${JSON.stringify(metrics)}`);
    }
    routeSummary.push({ route: '/', type: 'landing', viewport: viewport.name });
  } finally {
    await closePage(cdp, target);
  }
}

async function runChatLoadingGate(viewport) {
  for (const route of chatRoutes) {
    const { cdp, target } = await openPage(viewport, `${route}?animation-regression=loading`);
    try {
      await evaluate(cdp, `(() => {
        document.querySelectorAll('.thinking-message').forEach(node => node.remove());
        const thread = document.querySelector('.chat-thread');
        if (!thread) {
          return false;
        }
        const bubble = document.createElement('div');
        bubble.className = 'message pridicta thinking-message';
        bubble.innerHTML = '<span>Predicta</span><div class="predicta-thinking-row"><div class="predicta-thinking-mark" aria-hidden="true"><i></i><i></i><i></i></div><p>Checking Lagna, dasha timing, and chart proof while keeping this reading grounded.</p></div>';
        thread.appendChild(bubble);
        return true;
      })()`);
      await delay(260);
      const metrics = await evaluate(cdp, `(() => {
        const root = document.documentElement;
        let bubble = document.querySelector('.thinking-message');
        if (!bubble) {
          const thread = document.querySelector('.chat-thread');
          if (thread) {
            bubble = document.createElement('div');
            bubble.className = 'message pridicta thinking-message';
            bubble.innerHTML = '<span>Predicta</span><div class="predicta-thinking-row"><div class="predicta-thinking-mark" aria-hidden="true"><i></i><i></i><i></i></div><p>Checking Lagna, dasha timing, and chart proof while keeping this reading grounded.</p></div>';
            thread.appendChild(bubble);
          }
        }
        if (!bubble) {
          return { ok: false, reason: 'missing thinking message' };
        }
        const bubbleRect = bubble.getBoundingClientRect();
        const children = [...bubble.querySelectorAll('.predicta-thinking-row, .predicta-thinking-mark, .predicta-thinking-mark i, .predicta-thinking-row p')];
        const overflow = children
          .map(node => {
            const rect = node.getBoundingClientRect();
            return {
              selector: node.className || node.tagName,
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              top: Math.round(rect.top),
              bottom: Math.round(rect.bottom),
              outside:
                rect.left < bubbleRect.left - 2 ||
                rect.right > bubbleRect.right + 2 ||
                rect.top < bubbleRect.top - 2 ||
                rect.bottom > bubbleRect.bottom + 2,
            };
          })
          .filter(item => item.outside);
        return {
          bubbleHeight: Math.round(bubbleRect.height),
          bubbleWidth: Math.round(bubbleRect.width),
          horizontalOverflow: Math.max(0, Math.ceil(root.scrollWidth - root.clientWidth)),
          markOverflow: getComputedStyle(bubble.querySelector('.predicta-thinking-mark')).overflow,
          messageOverflow: getComputedStyle(bubble).overflow,
          ok:
            overflow.length === 0 &&
            Math.max(0, Math.ceil(root.scrollWidth - root.clientWidth)) <= 2 &&
            getComputedStyle(bubble.querySelector('.predicta-thinking-mark')).overflow === 'hidden' &&
            getComputedStyle(bubble).overflow === 'hidden',
          overflow,
        };
      })()`);

      if (!metrics.ok) {
        failures.push(`${viewport.name} ${route} loading containment failed: ${JSON.stringify(metrics)}`);
      }
      routeSummary.push({ route, type: 'chat-loading', viewport: viewport.name });
    } finally {
      await closePage(cdp, target);
    }
  }
}

async function runReducedMotionGate(viewport) {
  const { cdp, target } = await openPage(viewport, '/?animation-regression=reduced-motion', {
    reducedMotion: true,
  });
  try {
    const metrics = await evaluate(cdp, `(() => {
      const board = document.querySelector('.hero-kundli-board');
      const label = document.querySelector('.hero-chart-label');
      const line = document.querySelector('.hero-kundli-board .north-chart-lines path');
      const values = [board, label, line].filter(Boolean).map(node => {
        const style = getComputedStyle(node);
        return {
          animationDuration: style.animationDuration,
          animationIterationCount: style.animationIterationCount,
          animationName: style.animationName,
        };
      });
      const bad = values.filter(item => {
        const durations = item.animationDuration.split(',').map(value => value.trim());
        return durations.some(value => value !== '0.01ms' && value !== '1e-05s' && value !== '0s');
      });
      return { ok: bad.length === 0 && values.length >= 3, values, bad };
    })()`);

    if (!metrics.ok) {
      failures.push(`${viewport.name} reduced-motion animation gate failed: ${JSON.stringify(metrics)}`);
    }
    routeSummary.push({ route: '/', type: 'reduced-motion', viewport: viewport.name });
  } finally {
    await closePage(cdp, target);
  }
}

async function openPage(viewport, route, options = {}) {
  const target = await createTarget(port, `${baseUrl}${route}`);
  const cdp = await connectWebSocket(target.webSocketDebuggerUrl);
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    deviceScaleFactor: 1,
    height: viewport.height,
    mobile: viewport.name === 'mobile',
    width: viewport.width,
  });
  if (options.reducedMotion) {
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
  }
  await navigateAndWait(cdp, `${baseUrl}${route}`);
  await cdp
    .send('Runtime.evaluate', {
      awaitPromise: true,
      expression:
        'document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready.then(() => true), new Promise(resolve => setTimeout(() => resolve(false), 4000))]) : true',
    })
    .catch(() => undefined);
  return { cdp, target };
}

async function closePage(cdp, target) {
  try {
    cdp.close();
  } finally {
    await closeTarget(port, target.id).catch(() => undefined);
  }
}

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
  await cdp.send('Page.navigate', { url });
  await waitForDocumentReady(cdp);
  await delay(800);
}

async function waitForDocumentReady(cdp) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    const response = await cdp
      .send('Runtime.evaluate', {
        expression: 'document.readyState',
        returnByValue: true,
      })
      .catch(() => ({ result: { value: 'loading' } }));

    if (response.result.value === 'interactive' || response.result.value === 'complete') {
      return;
    }

    await delay(150);
  }
}

async function evaluate(cdp, expression) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression,
    returnByValue: true,
  });
  return response.result.value;
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    const get = url.startsWith('https:') ? httpsGet : httpGet;
    get(url, response => {
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
    const get = url.startsWith('https:') ? httpsGet : httpGet;
    get(url, response => {
      let data = '';
      response.setEncoding('utf8');
      response.on('data', chunk => {
        data += chunk;
      });
      response.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function requestJson({ method, url }) {
  return new Promise((resolve, reject) => {
    const requestFn = url.startsWith('https:') ? httpsRequest : httpRequest;
    const request = requestFn(url, { method }, response => {
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
    }
  });

  return {
    close() {
      socket.close();
    },
    send(method, params = {}) {
      const callId = ++id;
      socket.send(JSON.stringify({ id: callId, method, params }));
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(callId);
          reject(new Error(`Timed out waiting for ${method}`));
        }, 90_000);
        pending.set(callId, {
          reject: error => {
            clearTimeout(timer);
            reject(error);
          },
          resolve: value => {
            clearTimeout(timer);
            resolve(value);
          },
        });
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
