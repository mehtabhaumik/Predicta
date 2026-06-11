import { existsSync, rmSync } from 'node:fs';
import { request as httpRequest, get as httpGet } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const baseUrl = process.env.PREDICTA_AUTOCOMPLETE_BASE_URL ?? 'http://127.0.0.1:3009';
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
  console.error('Chrome or Chromium is required for the birth-place autocomplete gate.');
  process.exit(1);
}

const port = 9900 + Math.floor(Math.random() * 200);
const userDataDir = join(tmpdir(), `predicta-birth-place-autocomplete-${Date.now()}`);
const chrome = spawn(chromePath, [
  '--headless',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${userDataDir}`,
  '--disable-gpu',
  '--disable-extensions',
  '--disable-dev-shm-usage',
  '--no-sandbox',
  '--no-first-run',
  '--no-default-browser-check',
  'about:blank',
], {
  stdio: ['ignore', 'ignore', 'pipe'],
});

let cdp;
let page;

try {
  await waitForChrome(port);
  page = await createTarget(port, 'about:blank');
  cdp = await connectWebSocket(page.webSocketDebuggerUrl);

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    deviceScaleFactor: 1,
    height: 900,
    mobile: true,
    width: 390,
  });
  await navigateAndWait(cdp, `${baseUrl}/dashboard/kundli`);

  const result = await runAutocompleteScenario(cdp);

  console.log(JSON.stringify(result, null, 2));

  if (!result.inputFound) {
    throw new Error('Birth-place input was not found.');
  }

  if (result.partialSuggestionsMounted && result.partialHasSearchingPlaces) {
    throw new Error('Known local place suggestions showed a stale Searching places status.');
  }

  if (!result.exactTypedSettledClosed) {
    throw new Error('Exact birth-place auto-populate did not dismiss the suggestions without an extra click.');
  }

  if (
    !result.optionFound &&
    result.inputValue !== 'Petlad, Gujarat, India'
  ) {
    throw new Error('Petlad suggestion option was not found after search.');
  }

  if (result.inputValue !== 'Petlad, Gujarat, India') {
    throw new Error(`Expected selected value "Petlad, Gujarat, India"; received "${result.inputValue}".`);
  }

  if (result.suggestionsMounted || result.hasSearchingPlaces) {
    throw new Error('Birth-place suggestions remained visible or searching after selection.');
  }

  if (result.horizontalOverflow) {
    throw new Error('Kundli page has horizontal overflow after birth-place selection.');
  }

  if (!result.refocusStayedClosed) {
    throw new Error('Birth-place suggestions reopened after focusing the selected place.');
  }

  console.log('Birth-place autocomplete gate passed.');
} finally {
  cdp?.close();
  if (page?.id) {
    await closeTarget(port, page.id).catch(() => undefined);
  }
  chrome.kill('SIGTERM');
  await waitForProcessExit(chrome, 2_000).catch(() => undefined);
  rmSync(userDataDir, {
    force: true,
    maxRetries: 5,
    recursive: true,
    retryDelay: 200,
  });
}

async function runAutocompleteScenario(cdp) {
  await waitForBirthPlaceInput(cdp);

  const focusResponse = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const input = document.querySelector('input[placeholder="Start typing city, state, country"]');

      if (!input) {
        return { inputFound: false };
      }

      const rect = input.getBoundingClientRect();
      return {
        inputFound: true,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    })()`,
    returnByValue: true,
  });

  const focusResult = focusResponse.result?.value;

  if (!focusResult?.inputFound) {
    return { inputFound: false };
  }

  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const input = document.querySelector('input[placeholder="Start typing city, state, country"]');
      const setter = Object.getOwnPropertyDescriptor(input.constructor.prototype, 'value')?.set;
      setter.call(input, 'Petla');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    })()`,
  });

  await delay(350);

  const partialState = await collectAutocompleteState(cdp, {
    optionPattern: /Petlad/i,
  });

  await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const input = document.querySelector('input[placeholder="Start typing city, state, country"]');
      const setter = Object.getOwnPropertyDescriptor(input.constructor.prototype, 'value')?.set;
      setter.call(input, 'Petlad');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    })()`,
  });
  await delay(900);

  const exactTypedState = await collectAutocompleteState(cdp, {
    optionPattern: /Petlad/i,
  });

  if (
    exactTypedState.inputValue === 'Petlad, Gujarat, India' &&
    !exactTypedState.suggestionsMounted &&
    !exactTypedState.hasSearchingPlaces
  ) {
    return {
      ...exactTypedState,
      exactTypedHasSearchingPlaces: exactTypedState.hasSearchingPlaces,
      exactTypedSettledClosed: true,
      exactTypedSuggestionsMounted: exactTypedState.suggestionsMounted,
      partialHasSearchingPlaces: partialState.hasSearchingPlaces,
      partialOptionFound: partialState.optionFound,
      partialSuggestionsMounted: partialState.suggestionsMounted,
      partialSuggestionsText: partialState.suggestionsText,
      ...(await collectRefocusState(cdp)),
    };
  }

  const clickResponse = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
        const options = [...document.querySelectorAll('.birth-place-suggestions button')];
        const option = options.find(item => /Petlad/i.test(item.textContent || ''));

        if (!option) {
          const input = document.querySelector('input[placeholder="Start typing city, state, country"]');
          const suggestions = document.querySelector('.birth-place-suggestions');
          const text = document.body.textContent || '';
          return {
            hasSearchingPlaces: text.includes('Searching places...'),
            horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
            inputFound: true,
            inputValue: input?.value || '',
            optionFound: false,
            suggestionsMounted: Boolean(suggestions),
            suggestionsText: suggestions?.textContent?.trim() || '',
            optionTexts: options.map(item => item.textContent?.trim()),
          };
        }

        option.click();

        return {
          inputFound: true,
          optionFound: true,
        };
    })()`,
    returnByValue: true,
  });

  if (!clickResponse.result?.value?.optionFound) {
    const earlyResult = clickResponse.result?.value ?? {
      inputFound: true,
      optionFound: false,
    };

    if (
      earlyResult.inputValue === 'Petlad, Gujarat, India' &&
      !earlyResult.suggestionsMounted &&
      !earlyResult.hasSearchingPlaces
    ) {
      return {
        ...earlyResult,
        exactTypedHasSearchingPlaces: exactTypedState.hasSearchingPlaces,
        exactTypedSettledClosed: false,
        exactTypedSuggestionsMounted: exactTypedState.suggestionsMounted,
        partialHasSearchingPlaces: partialState.hasSearchingPlaces,
        partialOptionFound: partialState.optionFound,
        partialSuggestionsMounted: partialState.suggestionsMounted,
        partialSuggestionsText: partialState.suggestionsText,
        ...(await collectRefocusState(cdp)),
      };
    }

    return {
      ...earlyResult,
      exactTypedHasSearchingPlaces: exactTypedState.hasSearchingPlaces,
      exactTypedSettledClosed: false,
      exactTypedSuggestionsMounted: exactTypedState.suggestionsMounted,
      partialHasSearchingPlaces: partialState.hasSearchingPlaces,
      partialOptionFound: partialState.optionFound,
      partialSuggestionsMounted: partialState.suggestionsMounted,
      partialSuggestionsText: partialState.suggestionsText,
    };
  }

  await delay(1300);

  const resultResponse = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const suggestions = document.querySelector('.birth-place-suggestions');
      const input = document.querySelector('input[placeholder="Start typing city, state, country"]');
      const text = document.body.textContent || '';

      return {
        hasSearchingPlaces: text.includes('Searching places...'),
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        inputFound: Boolean(input),
        inputValue: input?.value || '',
        optionFound: true,
        suggestionsMounted: Boolean(suggestions),
        suggestionsText: suggestions?.textContent?.trim() || '',
      };
    })()`,
    returnByValue: true,
  });

  const selectedResult = resultResponse.result?.value ?? {};

  return {
    ...selectedResult,
    exactTypedHasSearchingPlaces: exactTypedState.hasSearchingPlaces,
    exactTypedSettledClosed: false,
    exactTypedSuggestionsMounted: exactTypedState.suggestionsMounted,
    partialHasSearchingPlaces: partialState.hasSearchingPlaces,
    partialOptionFound: partialState.optionFound,
    partialSuggestionsMounted: partialState.suggestionsMounted,
    partialSuggestionsText: partialState.suggestionsText,
    ...(await collectRefocusState(cdp)),
  };
}

async function waitForBirthPlaceInput(cdp) {
  await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `new Promise(resolve => {
      const findInput = () =>
        Boolean(document.querySelector('input[placeholder="Start typing city, state, country"]'));

      if (findInput()) {
        resolve(true);
        return;
      }

      const timer = setInterval(() => {
        if (findInput()) {
          clearInterval(timer);
          resolve(true);
        }
      }, 150);

      setTimeout(() => {
        clearInterval(timer);
        resolve(false);
      }, 15000);
    })`,
  });
}

async function collectAutocompleteState(cdp, { optionPattern }) {
  const stateResponse = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const options = [...document.querySelectorAll('.birth-place-suggestions button')];
      const suggestions = document.querySelector('.birth-place-suggestions');
      const input = document.querySelector('input[placeholder="Start typing city, state, country"]');
      const text = document.body.textContent || '';

      return {
        hasSearchingPlaces: text.includes('Searching places...'),
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        inputFound: Boolean(input),
        inputValue: input?.value || '',
        optionFound: options.some(item => ${optionPattern}.test(item.textContent || '')),
        suggestionsMounted: Boolean(suggestions),
        suggestionsText: suggestions?.textContent?.trim() || '',
        optionTexts: options.map(item => item.textContent?.trim()),
      };
    })()`,
    returnByValue: true,
  });

  return stateResponse.result?.value ?? {};
}

async function collectRefocusState(cdp) {
  const refocusResponse = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const input = document.querySelector('input[placeholder="Start typing city, state, country"]');
      input?.focus();
      return Boolean(input);
    })()`,
    returnByValue: true,
  });

  await delay(450);

  const refocusStateResponse = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const suggestions = document.querySelector('.birth-place-suggestions');
      const text = document.body.textContent || '';

      return {
        refocusInputFound: Boolean(document.querySelector('input[placeholder="Start typing city, state, country"]')),
        refocusHasSearchingPlaces: text.includes('Searching places...'),
        refocusSuggestionsMounted: Boolean(suggestions),
        refocusSuggestionsText: suggestions?.textContent?.trim() || '',
      };
    })()`,
    returnByValue: true,
  });

  const refocusState = refocusStateResponse.result?.value ?? {};

  return {
    refocusInputFound: Boolean(refocusResponse.result?.value) && refocusState.refocusInputFound,
    refocusStayedClosed:
      !refocusState.refocusHasSearchingPlaces && !refocusState.refocusSuggestionsMounted,
    refocusSuggestionsText: refocusState.refocusSuggestionsText,
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

async function waitForChrome(debugPort) {
  const deadline = Date.now() + 10_000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      await getJson(`http://127.0.0.1:${debugPort}/json/version`);
      return;
    } catch (error) {
      lastError = error;
      await delay(150);
    }
  }

  throw lastError ?? new Error('Chrome did not start.');
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
  const target = new URL(url);

  return new Promise((resolve, reject) => {
    const request = httpRequest(
      {
        hostname: target.hostname,
        method,
        path: `${target.pathname}${target.search}`,
        port: target.port,
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

async function connectWebSocket(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
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
    const message = JSON.parse(String(event.data));

    if (message.id && pending.has(message.id)) {
      const { reject, resolve, timeout } = pending.get(message.id);
      pending.delete(message.id);
      clearTimeout(timeout);

      if (message.error) {
        reject(new Error(JSON.stringify(message.error)));
      } else {
        resolve(message.result ?? {});
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

        pending.set(id, {
          reject,
          resolve,
          timeout,
        });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
  };
}
