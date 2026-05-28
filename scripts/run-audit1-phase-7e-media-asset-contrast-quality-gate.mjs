import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import path, { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const phaseName = 'PREDICTA_AUDIT_1_PHASE_7E_MEDIA_ASSET_AND_CONTRAST_QUALITY_GATE';
const baseUrl = process.env.PREDICTA_AUDIT_BASE_URL ?? 'http://127.0.0.1:3009';
const auditRoot = join(
  repoRoot,
  'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-7e-media-asset-contrast-quality-gate',
);
const screenshotRoot = join(auditRoot, 'screenshots');
const manifestPath = join(auditRoot, 'phase-7e-media-asset-contrast-manifest.json');
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

const approvedMediaUrls = [
  '/predicta-logo.png',
  '/predicta-seal-watermark.png',
  '/founder-bhaumik-mehta.png',
];
const viewports = [
  { height: 1000, mobile: false, name: 'desktop', width: 1440 },
  { height: 1100, mobile: false, name: 'tablet', width: 834 },
  { height: 940, mobile: true, name: 'mobile', width: 390 },
];
const requiredContrastSamples = [
  'primary-text',
  'muted-text',
  'disabled-text',
  'primary-cta',
  'secondary-cta',
  'badge',
  'card',
  'form-input',
  'table',
  'modal',
  'report-preview',
];

function read(relativePath) {
  return readFileSync(join(repoRoot, relativePath), 'utf8');
}

function assertIncludes(source, label, required) {
  for (const item of required) {
    assert.ok(source.includes(item), `${label} must include ${item}`);
  }
}

function buildHarness(globalsSource) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${phaseName}</title>
  <style>${globalsSource}</style>
</head>
<body>
  <main class="predicta-page-shell predicta-section-stack predicta-component-audit-board">
    <section class="predicta-panel predicta-motion-reveal" data-contrast-bg data-media-surface="product-logo">
      <p class="section-title">Media and contrast gate</p>
      <h1 data-contrast="primary-text" data-threshold="4.5">Predicta media quality proof</h1>
      <p class="predicta-contrast-muted" data-contrast="muted-text" data-threshold="4.5">Muted guidance remains readable on glass panels.</p>
      <p class="predicta-contrast-disabled" data-contrast="disabled-text" data-threshold="3">Disabled or pending states remain understandable.</p>
      <div class="predicta-action-row">
        <button class="predicta-button predicta-button--primary predicta-contrast-solid-cta" data-contrast="primary-cta" data-threshold="3">Primary CTA</button>
        <button class="predicta-button predicta-button--secondary" data-contrast="secondary-cta" data-threshold="4.5">Secondary CTA</button>
        <span class="predicta-badge" data-contrast="badge" data-threshold="4.5">Premium badge</span>
      </div>
      <span class="predicta-media-frame">
        <img alt="Predicta logo runtime proof" class="predicta-media-logo" data-media-url="/predicta-logo.png" height="96" src="${baseUrl}/predicta-logo.png" width="96">
      </span>
    </section>

    <section class="predicta-card" data-contrast-bg data-media-surface="controlled-fallback">
      <h2 data-contrast="card" data-threshold="4.5">Controlled founder fallback</h2>
      <p>This is a branded fallback asset, not a founder photograph.</p>
      <span class="predicta-media-frame">
        <img alt="Predicta branded fallback asset" class="predicta-media-asset" data-media-url="/founder-bhaumik-mehta.png" height="112" src="${baseUrl}/founder-bhaumik-mehta.png" width="112">
      </span>
    </section>

    <section class="predicta-card" data-contrast-bg>
      <form class="predicta-form">
        <label for="media-quality-input" data-contrast="form-input" data-threshold="4.5">Form field contrast</label>
        <input class="predicta-input" id="media-quality-input" value="Readable input value">
      </form>
    </section>

    <section class="predicta-table" data-contrast-bg>
      <table>
        <thead><tr><th data-contrast="table" data-threshold="4.5">Table proof</th><th>Meaning</th></tr></thead>
        <tbody><tr><td>Contrast</td><td>Rows stay readable inside table surfaces.</td></tr></tbody>
      </table>
    </section>

    <section class="predicta-modal" data-contrast-bg>
      <h2 data-contrast="modal" data-threshold="4.5">Modal contrast</h2>
      <p>Dialogs keep reading quality while layered above the page.</p>
    </section>

    <section class="predicta-card report-dossier" data-contrast-bg data-media-surface="pdf-preview">
      <div class="report-watermark">PREDICTA</div>
      <h2 data-contrast="report-preview" data-threshold="4.5">PDF preview contrast</h2>
      <p>Report preview content remains readable above watermark treatment.</p>
      <span class="predicta-media-frame">
        <img alt="Predicta seal watermark runtime proof" class="predicta-media-watermark" data-media-url="/predicta-seal-watermark.png" height="160" src="${baseUrl}/predicta-seal-watermark.png" width="160">
      </span>
    </section>
  </main>
</body>
</html>`;
}

const packageSource = read('package.json');
const tokenSource = read('packages/ui-tokens/src/index.ts');
const primitiveSource = read('apps/web/components/ui/DesignSystemPrimitives.tsx');
const globalsSource = read('apps/web/app/globals.css');
const headerSource = read('apps/web/components/WebHeader.tsx');
const sidebarSource = read('apps/web/components/SidebarNav.tsx');
const introSource = read('apps/web/components/LandingIntroOverlay.tsx');
const signatureSource = read('apps/web/components/WebSignatureAnalysisInputFlow.tsx');
const pdfRouteSource = read('apps/web/app/api/report/pdf/route.ts');
const pdfReportSource = read('packages/pdf/src/reportDocument.tsx');
const roadmapSource = read('docs/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX_ROADMAP.md');
const readmeSource = read('docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/README.md');
const contractSource = read(
  'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX/phase-7e-media-asset-contrast-quality-gate/media-asset-contrast-contract.md',
);

assertIncludes(packageSource, 'Phase 7E package script', [
  '"test:audit1-phase-7e": "node scripts/run-audit1-phase-7e-media-asset-contrast-quality-gate.mjs"',
]);
assertIncludes(tokenSource, 'media primitive class token contract', [
  'mediaAsset:',
  'mediaFrame:',
  'mediaLogo:',
  'mediaWatermark:',
]);
assertIncludes(primitiveSource, 'PredictaMediaAsset primitive', [
  "import Image, { type ImageProps } from 'next/image'",
  'export function PredictaMediaAsset',
  'alt: string',
  'primitiveClasses.mediaFrame',
]);
assertIncludes(globalsSource, 'media and contrast CSS contract', [
  '--predicta-ink',
  '.predicta-media-frame',
  '.predicta-media-asset',
  '.predicta-media-logo',
  '.predicta-media-watermark',
  '.predicta-contrast-muted',
  '.predicta-contrast-disabled',
  '.predicta-contrast-solid-cta',
]);
assertIncludes(headerSource, 'web header media primitive usage', ['PredictaMediaAsset', 'kind="logo"']);
assertIncludes(sidebarSource, 'sidebar media primitive usage', ['PredictaMediaAsset', 'kind="logo"']);
assertIncludes(introSource, 'intro media primitive usage', ['PredictaMediaAsset', 'kind="logo"']);
assertIncludes(signatureSource, 'signature raw image exception remains local and ephemeral', [
  'getCurrentImageDataUrl',
  '<img alt="" src={previewUrl} />',
]);
assertIncludes(pdfRouteSource, 'PDF approved media loading', [
  'predicta-logo.png',
  'predicta-seal-watermark.png',
  'loadPredictaLogoDataUri',
  'loadPredictaWatermarkDataUri',
]);
assertIncludes(pdfReportSource, 'PDF watermark rendering', ['watermarkLogo', 'PdfWatermark', 'options.watermarkSrc']);
assertIncludes(roadmapSource, 'roadmap Phase 7E command', [phaseName, 'test:audit1-phase-7e']);
assertIncludes(readmeSource, 'audit README Phase 7E evidence', [
  phaseName,
  'phase-7e-media-asset-contrast-quality-gate',
]);
assertIncludes(contractSource, 'media contrast contract doc', [
  'Approved Media Assets',
  'Media Primitive Rules',
  'Asset Runtime Rules',
  'Contrast Rules',
  'Hard Failure Rules',
]);

for (const relativePath of [
  'apps/web/public/predicta-logo.png',
  'apps/web/public/predicta-seal-watermark.png',
  'apps/web/public/founder-bhaumik-mehta.png',
  'packages/pdf/assets/predicta-seal-watermark.png',
]) {
  assert.ok(existsSync(join(repoRoot, relativePath)), `${relativePath} must exist`);
}

if (!chromePath) {
  throw new Error('Chrome or Chromium is required for Phase 7E media and contrast screenshots.');
}

mkdirSync(screenshotRoot, { recursive: true });

const assetResults = [];
for (const assetPath of approvedMediaUrls) {
  const result = await fetchAsset(`${baseUrl}${assetPath}`);
  assetResults.push({ path: assetPath, ...result });
  assert.ok(result.statusCode >= 200 && result.statusCode < 300, `${assetPath} must return 2xx`);
  assert.ok(result.contentType.startsWith('image/'), `${assetPath} must be served as an image`);
  assert.ok(result.bytes > 500, `${assetPath} must not be an empty placeholder`);
}

const port = 11_500 + Math.floor(Math.random() * 300);
const userDataDir = join(tmpdir(), `predicta-audit1-phase7e-chrome-${Date.now()}`);
const harnessPath = join(userDataDir, 'media-contrast-harness.html');
mkdirSync(userDataDir, { recursive: true });
writeFileSync(harnessPath, buildHarness(globalsSource));
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

const failures = [];
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
        mobile: viewport.mobile,
        width: viewport.width,
      });
      await navigateAndWait(cdp, pathToFileURL(harnessPath).href);

      const metrics = await evaluateHarness(cdp);
      const screenshot = await cdp.send('Page.captureScreenshot', {
        captureBeyondViewport: true,
        format: 'png',
        fromSurface: true,
      });
      const fileName = `${viewport.name}-media-asset-contrast-proof.png`;
      writeFileSync(join(screenshotRoot, fileName), Buffer.from(screenshot.data, 'base64'));

      checks.push({
        fileName,
        viewport: viewport.name,
        viewportWidth: viewport.width,
        ...metrics.summary,
      });

      if (metrics.summary.horizontalOverflow > 0) {
        failures.push(`${viewport.name}: media harness overflows horizontally by ${metrics.summary.horizontalOverflow}px.`);
      }
      if (metrics.summary.missingContrastCount > 0) {
        failures.push(`${viewport.name}: ${metrics.summary.missingContrastCount} contrast samples are missing.`);
      }
      if (metrics.summary.brokenMediaCount > 0) {
        failures.push(`${viewport.name}: ${metrics.summary.brokenMediaCount} media assets failed to load.`);
      }
      if (metrics.summary.mediaOverflowCount > 0) {
        failures.push(`${viewport.name}: ${metrics.summary.mediaOverflowCount} media assets overflow or crop incorrectly.`);
      }
      for (const contrastFailure of metrics.contrastFailures) {
        failures.push(
          `${viewport.name}: ${contrastFailure.name} contrast ${contrastFailure.ratio} is below ${contrastFailure.threshold}.`,
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
  approvedMediaUrls,
  assetResults,
  checks,
  generatedAt: new Date().toISOString(),
  phase: phaseName,
  requiredContrastSamples,
  screenshotRoot: path.relative(repoRoot, screenshotRoot),
  status: failures.length ? 'failed' : 'green',
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

console.log(`${phaseName} passed: media URLs, media primitives, contrast, and screenshots are green.`);

async function evaluateHarness(cdp) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `(() => {
      const requiredContrastSamples = ${JSON.stringify(requiredContrastSamples)};
      const viewportWidth = document.documentElement.clientWidth;
      const root = document.documentElement;
      const body = document.body;

      function numbersFrom(value) {
        return (value.match(/[-+]?\\d*\\.?\\d+/g) || []).map(Number);
      }

      function parseColor(value) {
        if (!value || value === 'transparent') return null;
        const text = value.trim();
        const nums = numbersFrom(text);
        if (text.startsWith('color')) {
          return {
            a: nums[3] ?? 1,
            b: Math.round((nums[2] ?? 0) * 255),
            g: Math.round((nums[1] ?? 0) * 255),
            r: Math.round((nums[0] ?? 0) * 255),
          };
        }
        if (text.startsWith('rgb')) {
          return {
            a: nums[3] ?? 1,
            b: nums[2] ?? 0,
            g: nums[1] ?? 0,
            r: nums[0] ?? 0,
          };
        }
        return null;
      }

      function composite(foreground, background) {
        const alpha = foreground.a ?? 1;
        return {
          a: 1,
          b: foreground.b * alpha + background.b * (1 - alpha),
          g: foreground.g * alpha + background.g * (1 - alpha),
          r: foreground.r * alpha + background.r * (1 - alpha),
        };
      }

      function backgroundFor(element) {
        let current = element;
        while (current) {
          const bg = parseColor(window.getComputedStyle(current).backgroundColor);
          if (bg && (bg.a ?? 1) > 0) {
            return bg.a < 1 ? composite(bg, { a: 1, b: 15, g: 10, r: 10 }) : bg;
          }
          current = current.parentElement;
        }
        return { a: 1, b: 15, g: 10, r: 10 };
      }

      function luminance(color) {
        const channels = [color.r, color.g, color.b].map(channel => {
          const value = channel / 255;
          return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
        return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
      }

      function contrastRatio(foreground, background) {
        const fg = luminance(foreground);
        const bg = luminance(background);
        const lighter = Math.max(fg, bg);
        const darker = Math.min(fg, bg);
        return (lighter + 0.05) / (darker + 0.05);
      }

      const contrastFailures = [];
      const contrastSamples = [...document.querySelectorAll('[data-contrast]')].map(element => {
        const style = window.getComputedStyle(element);
        const fgBase = parseColor(style.color);
        const opacity = Number.parseFloat(style.opacity || '1');
        const bgAnchor =
          ['BUTTON', 'INPUT'].includes(element.tagName) ||
          element.classList.contains('predicta-badge') ||
          element.classList.contains('predicta-pill')
            ? element
            : element.closest('[data-contrast-bg]') || element.parentElement || document.body;
        const bg = backgroundFor(bgAnchor);
        const fg = composite({ ...fgBase, a: (fgBase?.a ?? 1) * opacity }, bg);
        const ratio = contrastRatio(fg, bg);
        const threshold = Number.parseFloat(element.dataset.threshold || '4.5');
        const name = element.dataset.contrast;
        const rounded = Number(ratio.toFixed(2));
        if (rounded < threshold) {
          contrastFailures.push({ name, ratio: rounded, threshold });
        }
        return { name, ratio: rounded, threshold };
      });

      const mediaProblems = [];
      const mediaItems = [...document.querySelectorAll('img[data-media-url]')].map(image => {
        const rect = image.getBoundingClientRect();
        const parentRect = image.parentElement?.getBoundingClientRect() || rect;
        const loaded = image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
        const objectFit = window.getComputedStyle(image).objectFit;
        const overflow =
          rect.width > parentRect.width + 2 ||
          rect.height > parentRect.height + 2 ||
          rect.right > viewportWidth + 2;
        if (!loaded || overflow || objectFit !== 'contain') {
          mediaProblems.push({
            loaded,
            objectFit,
            overflow,
            url: image.dataset.mediaUrl,
          });
        }
        return {
          height: Math.round(rect.height),
          loaded,
          naturalHeight: image.naturalHeight,
          naturalWidth: image.naturalWidth,
          objectFit,
          url: image.dataset.mediaUrl,
          width: Math.round(rect.width),
        };
      });

      const missingContrast = requiredContrastSamples.filter(name => {
        return !contrastSamples.some(sample => sample.name === name);
      });

      return {
        contrastFailures,
        contrastSamples,
        mediaItems,
        mediaProblems,
        summary: {
          brokenMediaCount: mediaProblems.filter(item => !item.loaded).length,
          horizontalOverflow: Math.max(0, Math.ceil(Math.max(root.scrollWidth, body.scrollWidth) - viewportWidth)),
          mediaCount: mediaItems.length,
          mediaOverflowCount: mediaProblems.filter(item => item.overflow || item.objectFit !== 'contain').length,
          missingContrastCount: missingContrast.length,
        },
      };
    })()`,
    returnByValue: true,
  });

  return response.result.value;
}

function fetchAsset(url) {
  return new Promise((resolve, reject) => {
    httpGet(url, response => {
      let bytes = 0;
      response.on('data', chunk => {
        bytes += chunk.length;
      });
      response.on('end', () => {
        resolve({
          bytes,
          contentType: response.headers['content-type'] ?? '',
          statusCode: response.statusCode ?? 0,
        });
      });
    }).on('error', reject);
  });
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
  await delay(800);
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

    socket.onopen = () => {
      resolve({
        close: () => socket.close(),
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
      }
    };
    socket.onclose = () => {
      for (const entry of pending.values()) {
        entry.reject(new Error('WebSocket closed before response'));
      }
      pending.clear();
    };
  });
}
