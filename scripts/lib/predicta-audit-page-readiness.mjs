const routeExpectations = new Map([
  ['/', { selector: 'body', text: '(predicta|kundli|astrology|vedic)' }],
  ['/pricing', { selector: 'body', text: '(pricing|premium|pass|predicta)' }],
  ['/checkout', { selector: 'body', text: '(checkout|payment|purchase|predicta)' }],
  ['/feedback', { selector: 'body', text: '(feedback|support|predicta)' }],
  ['/legal', { selector: 'body', text: '(legal|terms|privacy|predicta)' }],
  ['/safety', { selector: 'body', text: '(safety|guidance|predicta)' }],
  ['/founder', { selector: 'body', text: '(founder|bhaumik|predicta)' }],
  ['/dashboard', { selector: 'body', text: '(dashboard|kundli|predicta)' }],
  ['/dashboard/kundli', { selector: 'body', text: '(kundli|birth|chart|predicta)' }],
  ['/dashboard/charts', { selector: 'body', text: '(chart|varga|kundli|predicta)' }],
  ['/dashboard/report', { selector: 'body', text: '(report|download|predicta)' }],
  ['/dashboard/saved-kundlis', { selector: 'body', text: '(saved|kundli|predicta)' }],
  ['/dashboard/chat', { selector: 'body', text: '(chat|ask|predicta)' }],
  ['/dashboard/vedic', { selector: 'body', text: '(vedic|parashari|kundli|predicta)' }],
  ['/dashboard/vedic/chat', { selector: 'body', text: '(vedic|chat|predicta)' }],
  ['/dashboard/kp', { selector: 'body', text: '(kp|question|event|predicta)' }],
  ['/dashboard/kp/chat', { selector: 'body', text: '(kp|chat|predicta)' }],
  ['/dashboard/nadi', { selector: 'body', text: '(nadi|story|karmic|predicta)' }],
  ['/dashboard/nadi/chat', { selector: 'body', text: '(nadi|chat|predicta)' }],
  ['/dashboard/numerology', { selector: 'body', text: '(numerology|number|predicta)' }],
  ['/dashboard/numerology/chat', { selector: 'body', text: '(numerology|chat|predicta)' }],
  ['/dashboard/signature', { selector: 'body', text: '(signature|trait|predicta)' }],
  ['/dashboard/signature/chat', { selector: 'body', text: '(signature|chat|predicta)' }],
  ['/dashboard/family', { selector: 'body', text: '(family|relationship|predicta)' }],
  ['/dashboard/family/compare', { selector: 'body', text: '(compare|family|predicta)' }],
  ['/dashboard/family/karma-map', { selector: 'body', text: '(karma|family|predicta)' }],
  ['/dashboard/settings', { selector: 'body', text: '(settings|language|predicta)' }],
  ['/dashboard/account', { selector: 'body', text: '(account|profile|predicta)' }],
  ['/dashboard/redeem-pass', { selector: 'body', text: '(redeem|pass|predicta)' }],
]);

const bannedReadinessPatterns = [
  'Application error: a client-side exception has occurred',
  'ChunkLoadError',
  'ERR_TOO_MANY_REDIRECTS',
  '__next_error__',
  'Internal Server Error',
];

export async function assertAuditablePredictaPage(cdp, { route, url }) {
  const expectation = routeExpectations.get(route) ?? {
    selector: 'body',
    text: 'predicta',
  };

  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression: `Promise.resolve((async () => {
      const expectation = ${JSON.stringify(expectation)};
      const banned = ${JSON.stringify(bannedReadinessPatterns)};
      const visibleText = (document.body?.innerText || '').replace(/\\s+/g, ' ').trim();
      const html = document.documentElement?.outerHTML || '';
      const selectorMatch = Boolean(document.querySelector(expectation.selector));
      const textMatch = new RegExp(expectation.text, 'i').test(visibleText);
      const predictaTextMatch = /predicta/i.test(visibleText);
      let httpStatus = 0;
      let httpOk = false;

      try {
        const routeResponse = await fetch(location.href, {
          cache: 'no-store',
          credentials: 'same-origin',
          redirect: 'follow',
        });
        httpStatus = routeResponse.status;
        httpOk = routeResponse.ok;
      } catch {
        httpStatus = 0;
        httpOk = false;
      }

      const bannedMatch = banned.find(pattern => visibleText.includes(pattern) || html.includes(pattern)) || null;
      const loadedStyleSheets = [...document.styleSheets].length;
      const nextScripts = document.querySelectorAll('script[src*="/_next/static/"]').length;

      return {
        bannedMatch,
        finalUrl: location.href,
        httpOk,
        httpStatus,
        loadedStyleSheets,
        nextScripts,
        selector: expectation.selector,
        selectorMatch,
        predictaTextMatch,
        textMatch,
        textPattern: expectation.text,
        title: document.title,
        visibleTextPreview: visibleText.slice(0, 180),
      };
    })())`,
    returnByValue: true,
  });

  const readiness = response.result.value;
  const failures = [];

  if (!readiness.httpOk) {
    failures.push(`HTTP status is ${readiness.httpStatus || 'unavailable'}`);
  }

  if (!readiness.selectorMatch) {
    failures.push(`missing required selector "${readiness.selector}"`);
  }

  if (!readiness.textMatch) {
    failures.push(`missing route-specific text /${readiness.textPattern}/i`);
  }

  if (!readiness.predictaTextMatch) {
    failures.push('missing recognizable Predicta visible content');
  }

  if (readiness.bannedMatch) {
    failures.push(`contains banned error marker "${readiness.bannedMatch}"`);
  }

  if (readiness.loadedStyleSheets < 1 || readiness.nextScripts < 1) {
    failures.push(
      `missing expected Next assets (styleSheets=${readiness.loadedStyleSheets}, nextScripts=${readiness.nextScripts})`,
    );
  }

  if (failures.length) {
    throw new Error(
      [
        `Audit refused to measure ${route} at ${url}; page readiness failed:`,
        ...failures.map(failure => `- ${failure}`),
        `Visible text preview: ${readiness.visibleTextPreview || '(empty)'}`,
      ].join('\n'),
    );
  }

  return readiness;
}

export function expectedAuditRoutes() {
  return [...routeExpectations.keys()];
}
