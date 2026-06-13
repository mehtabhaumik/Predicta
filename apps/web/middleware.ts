import { NextResponse, type NextRequest } from 'next/server';

const DASHBOARD_PREDICTA_PROMPT =
  'Use my selected Kundli if available. If I do not have one yet, help me create it from birth date, birth time, and birth place. Give the direct answer first.';

export function middleware(request: NextRequest): NextResponse {
  const { nextUrl } = request;

  if (nextUrl.pathname !== '/dashboard') {
    return NextResponse.next();
  }

  if (
    nextUrl.searchParams.get('view') === 'library' ||
    nextUrl.searchParams.get('source') === 'family-friends'
  ) {
    return NextResponse.next();
  }

  const askUrl = nextUrl.clone();
  askUrl.pathname = '/ask';
  askUrl.search = '';
  askUrl.searchParams.set('sourceScreen', 'Kundli Home');
  askUrl.searchParams.set('prompt', DASHBOARD_PREDICTA_PROMPT);
  askUrl.searchParams.set('autoSend', 'true');

  return NextResponse.redirect(askUrl);
}

export const config = {
  matcher: ['/dashboard'],
};
