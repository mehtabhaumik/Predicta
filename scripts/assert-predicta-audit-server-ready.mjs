import { get as httpGet } from 'node:http';
import { get as httpsGet } from 'node:https';
import { fileURLToPath } from 'node:url';

const defaultBaseUrl = process.env.PREDICTA_AUDIT_BASE_URL ?? 'http://127.0.0.1:3009';
const requiredRoutes = [
  '/',
  '/dashboard',
  '/dashboard/report',
  '/dashboard/signature',
  '/dashboard/kp',
  '/dashboard/nadi',
  '/dashboard/numerology',
  '/dashboard/settings',
  '/dashboard/family',
  '/dashboard/account',
];
const bannedBodyPatterns = [
  /ChunkLoadError/i,
  /ERR_TOO_MANY_REDIRECTS/i,
  /<html[^>]*id="__next_error__"/i,
];

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const result = await assertPredictaAuditServerReady(process.argv[2] ?? defaultBaseUrl);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

export async function assertPredictaAuditServerReady(baseUrl = defaultBaseUrl) {
  const parsedBaseUrl = parseBaseUrl(baseUrl);
  assertPortDiscipline(parsedBaseUrl);

  const routeResults = [];
  for (const route of requiredRoutes) {
    const response = await getWithRedirects(new URL(route, parsedBaseUrl).toString());
    assertHealthyRoute(route, response);
    routeResults.push({
      finalUrl: response.finalUrl,
      redirects: response.redirects.length,
      route,
      statusCode: response.statusCode,
    });
  }

  const assetResults = await assertChunkAssetsHealthy(parsedBaseUrl);

  return {
    assetChecks: assetResults,
    baseUrl: parsedBaseUrl.toString().replace(/\/$/, ''),
    routeChecks: routeResults,
    status: 'ready',
  };
}

function parseBaseUrl(baseUrl) {
  try {
    return new URL(baseUrl);
  } catch {
    throw new Error(`Invalid Predicta audit base URL: ${baseUrl}`);
  }
}

function assertPortDiscipline(parsedBaseUrl) {
  const port = parsedBaseUrl.port || (parsedBaseUrl.protocol === 'https:' ? '443' : '80');
  const allowDevServer = process.env.PREDICTA_ALLOW_NEXT_DEV_AUDIT === '1';
  if (port === '3000' && !allowDevServer) {
    throw new Error(
      'Predicta audit server preflight refuses localhost:3000 by default. Use the production-like audit server on 3009, or set PREDICTA_ALLOW_NEXT_DEV_AUDIT=1 for an explicit dev-server exception.',
    );
  }
}

function assertHealthyRoute(route, response) {
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw new Error(
      `Predicta audit server route ${route} returned HTTP ${response.statusCode} at ${response.finalUrl}.`,
    );
  }

  if (!/Predicta/i.test(response.body)) {
    throw new Error(`Predicta audit server route ${route} did not return recognizable Predicta content.`);
  }

  for (const pattern of bannedBodyPatterns) {
    if (pattern.test(response.body)) {
      throw new Error(`Predicta audit server route ${route} contains ${pattern.source}.`);
    }
  }
}

async function assertChunkAssetsHealthy(parsedBaseUrl) {
  const root = await getWithRedirects(parsedBaseUrl.toString());
  const assetPaths = [...root.body.matchAll(/(?:src|href)="([^"]*\/_next\/static\/[^"]+\.(?:js|css))"/g)]
    .map(match => match[1])
    .filter((asset, index, assets) => assets.indexOf(asset) === index)
    .slice(0, 12);

  const results = [];
  for (const assetPath of assetPaths) {
    const assetUrl = new URL(assetPath, parsedBaseUrl).toString();
    const response = await getWithRedirects(assetUrl);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new Error(`Predicta audit server static asset ${assetPath} returned HTTP ${response.statusCode}.`);
    }
    results.push({
      assetPath,
      statusCode: response.statusCode,
    });
  }
  return results;
}

function getWithRedirects(url, redirects = []) {
  if (redirects.includes(url)) {
    throw new Error(`Predicta audit server redirect loop detected: ${[...redirects, url].join(' -> ')}`);
  }
  if (redirects.length > 5) {
    throw new Error(`Predicta audit server exceeded redirect limit: ${[...redirects, url].join(' -> ')}`);
  }

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const get = parsedUrl.protocol === 'https:' ? httpsGet : httpGet;
    const request = get(parsedUrl, response => {
      const statusCode = response.statusCode ?? 0;
      const location = response.headers.location;

      if (statusCode >= 300 && statusCode < 400 && location) {
        response.resume();
        resolve(getWithRedirects(new URL(location, parsedUrl).toString(), [...redirects, url]));
        return;
      }

      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => {
        body += chunk;
      });
      response.on('end', () => {
        resolve({
          body,
          finalUrl: url,
          redirects,
          statusCode,
        });
      });
    });

    request.on('error', reject);
    request.setTimeout(12_000, () => {
      request.destroy(new Error(`Predicta audit server request timed out: ${url}`));
    });
  });
}
