const BLOCKED_TAG_PATTERN =
  /<\s*(script|style|iframe|object|embed|meta|link|base|form|input|button|textarea|select|option|svg|math)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const SELF_CLOSING_BLOCKED_TAG_PATTERN =
  /<\s*(script|style|iframe|object|embed|meta|link|base|form|input|button|textarea|select|option|svg|math)[^>]*\/?\s*>/gi;
const EVENT_HANDLER_PATTERN = /\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const UNSAFE_URL_ATTRIBUTE_PATTERN =
  /\s+(href|src|xlink:href)\s*=\s*("?\s*(javascript|data|vbscript):[^"\s>]*"?|'?\s*(javascript|data|vbscript):[^'\s>]*'?)/gi;
const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g;
const TAG_PATTERN = /<[^>]+>/g;

export function sanitizeSupportEmailHtml(html: string): string {
  return html
    .replace(HTML_COMMENT_PATTERN, '')
    .replace(BLOCKED_TAG_PATTERN, '')
    .replace(SELF_CLOSING_BLOCKED_TAG_PATTERN, '')
    .replace(EVENT_HANDLER_PATTERN, '')
    .replace(UNSAFE_URL_ATTRIBUTE_PATTERN, '')
    .trim();
}

export function supportEmailHtmlToPlainText(html: string): string {
  return decodeHtmlEntities(
    sanitizeSupportEmailHtml(html)
      .replace(/<\s*br\s*\/?\s*>/gi, '\n')
      .replace(/<\s*\/\s*(p|div|li|tr|h[1-6])\s*>/gi, '\n')
      .replace(TAG_PATTERN, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
  );
}

export function normalizeSupportEmailText(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'");
}
