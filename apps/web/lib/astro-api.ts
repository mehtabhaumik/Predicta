export function getAstroApiUrl(): string {
  return (
    process.env.PRIDICTA_WEB_ASTRO_API_URL ??
    process.env.PRIDICTA_ASTRO_API_URL ??
    'http://127.0.0.1:8000'
  ).replace(/\/$/, '');
}

export async function proxyAstroApiRequest(
  path: string,
  body: unknown,
  headers?: HeadersInit,
): Promise<Response> {
  const upstream = await fetch(`${getAstroApiUrl()}${path}`, {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    method: 'POST',
  });
  const text = await upstream.text();

  return new Response(text, {
    headers: {
      'Content-Type':
        upstream.headers.get('Content-Type') ?? 'application/json',
    },
    status: upstream.status,
  });
}

export async function proxyAstroApiGet(
  path: string,
  headers?: HeadersInit,
): Promise<Response> {
  const upstream = await fetch(`${getAstroApiUrl()}${path}`, {
    headers,
    method: 'GET',
  });
  const text = await upstream.text();

  return new Response(text, {
    headers: {
      'Content-Type':
        upstream.headers.get('Content-Type') ?? 'application/json',
    },
    status: upstream.status,
  });
}
