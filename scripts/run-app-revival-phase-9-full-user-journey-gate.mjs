import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { get as httpGet, request as httpRequest } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const phaseName = 'PREDICTA_APP_REVIVAL_PHASE_9_FULL_USER_JOURNEY_GOLDEN_NO_GO_AUDIT';
const baseUrl = (
  process.env.PREDICTA_FULL_JOURNEY_BASE_URL ?? 'http://127.0.0.1:3009'
).replace(/\/$/u, '');
const auditDir = `docs/audits/${phaseName}`;
const screenshotDir = `${auditDir}/screenshots`;
const manifestPath = `${auditDir}/full-user-journey-manifest.json`;
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

const mobileViewport = { height: 844, mobile: true, name: 'mobile-390', width: 390 };
const desktopViewport = { height: 940, mobile: false, name: 'desktop-1440', width: 1440 };

if (!chromePath) {
  console.error('Chrome or Chromium is required for the Phase 9 full journey gate.');
  process.exit(1);
}

mkdirSync(screenshotDir, { recursive: true });

const failures = [];
const scenarioResults = [];
const sourceResults = await runSourceContractChecks();

for (const failure of sourceResults.failures) {
  failures.push(failure);
}

const port = 9950 + Math.floor(Math.random() * 200);
const userDataDir = join(tmpdir(), `predicta-phase-9-full-journey-${Date.now()}`);
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
  await runScenario('new-visitor-direct-ask', mobileViewport, async cdp => {
    await navigateAndWait(cdp, `${baseUrl}/ask`);
    const audit = await evaluate(cdp, `(() => {
      const textarea = document.querySelector('.ask-light-field textarea');
      const shell = document.querySelector('.ask-light-shell');
      const dashboardShell = document.querySelector('.dashboard-shell');
      const rect = textarea?.getBoundingClientRect();
      return {
        hasAskShell: Boolean(shell),
        hasDashboardShell: Boolean(dashboardShell),
        hasTextarea: Boolean(textarea),
        textareaTop: rect ? Math.round(rect.top) : null,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        text: document.body.textContent || '',
        url: location.href,
      };
    })()`);

    const localFailures = [];
    if (!audit.hasAskShell || !audit.hasTextarea) {
      localFailures.push('direct /ask does not show the Predicta ask surface');
    }
    if (audit.hasDashboardShell) {
      localFailures.push('direct /ask still loads the dashboard maze shell');
    }
    if (audit.textareaTop > windowHeightLimit(mobileViewport, 0.5)) {
      localFailures.push(`direct /ask textarea starts too low at ${audit.textareaTop}px`);
    }
    if (audit.horizontalOverflow) {
      localFailures.push('direct /ask has horizontal overflow');
    }

    return { audit, failures: localFailures };
  });

  await runScenario('new-visitor-asks-question', mobileViewport, async cdp => {
    await navigateAndWait(cdp, `${baseUrl}/ask`);
    await click(cdp, '.ask-light-chips a[href^="/ask?"]');
    await waitForCondition(cdp, `Boolean(document.querySelector('.auth-required-panel, .chat-workspace, .chat-panel, .predicta-chat-loading'))`, 6_000);
    const audit = await evaluate(cdp, `(() => ({
      chatStarted: Boolean(document.querySelector('.ask-light-shell-started')),
      hasChatEntry: Boolean(document.querySelector('.auth-required-panel, .chat-workspace, .chat-panel, .predicta-chat-loading, .chat-message')),
      preservesQuestion: (document.querySelector('.ask-light-field textarea')?.value || '').trim().length > 12,
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      query: location.search,
      url: location.href,
    }))()`);
    const localFailures = [];
    if (!audit.chatStarted || !audit.query.includes('autoSend=true')) {
      localFailures.push('question submit did not start direct Predicta chat with autoSend');
    }
    if (!audit.hasChatEntry || !audit.preservesQuestion) {
      localFailures.push('question submit did not reveal a direct chat/sign-in state with the question preserved');
    }
    if (audit.horizontalOverflow) {
      localFailures.push('question submit route has horizontal overflow');
    }
    return { audit, failures: localFailures };
  });

  await runScenario('legacy-dashboard-chat-redirects-to-ask', mobileViewport, async cdp => {
    const prompt = encodeURIComponent('Will my job improve soon?');
    await navigateAndWait(cdp, `${baseUrl}/dashboard/chat?prompt=${prompt}&autoSend=true&sourceScreen=Legacy+Dashboard+Chat`);
    await waitForCondition(cdp, `location.pathname === '/ask' && Boolean(document.querySelector('.auth-required-panel, .chat-workspace, .chat-panel, .predicta-chat-loading'))`, 8_000);
    const audit = await evaluate(cdp, `(() => ({
      hasAskShell: Boolean(document.querySelector('.ask-light-shell')),
      hasDashboardShell: Boolean(document.querySelector('.dashboard-shell')),
      hasPreservedPrompt: /Will my job improve soon/.test(document.body.textContent || '') ||
        /Will my job improve soon/.test(document.querySelector('.ask-light-field textarea')?.value || ''),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      path: location.pathname,
      search: location.search,
      url: location.href,
    }))()`);
    const localFailures = [];
    if (audit.path !== '/ask' || !audit.hasAskShell) {
      localFailures.push('legacy /dashboard/chat did not redirect into the lightweight /ask shell');
    }
    if (audit.hasDashboardShell) {
      localFailures.push('legacy /dashboard/chat still rendered the dashboard shell');
    }
    if (!audit.hasPreservedPrompt) {
      localFailures.push('legacy /dashboard/chat redirect did not preserve the user prompt');
    }
    if (audit.horizontalOverflow) {
      localFailures.push('legacy /dashboard/chat redirect has horizontal overflow');
    }
    return { audit, failures: localFailures };
  });

  await runScenario('legacy-specialist-chat-redirects-to-ask', mobileViewport, async cdp => {
    const prompt = encodeURIComponent('Will I get a promotion this year?');
    await navigateAndWait(cdp, `${baseUrl}/dashboard/kp/chat?prompt=${prompt}&autoSend=true&sourceScreen=Legacy+KP+Chat`);
    await waitForCondition(cdp, `location.pathname === '/ask' && new URLSearchParams(location.search).get('school') === 'KP'`, 8_000);
    const audit = await evaluate(cdp, `(() => ({
      hasAskShell: Boolean(document.querySelector('.ask-light-shell')),
      hasDashboardShell: Boolean(document.querySelector('.dashboard-shell')),
      hasPreservedPrompt: /Will I get a promotion this year/.test(document.body.textContent || '') ||
        /Will I get a promotion this year/.test(document.querySelector('.ask-light-field textarea')?.value || ''),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      path: location.pathname,
      school: new URLSearchParams(location.search).get('school'),
      search: location.search,
      url: location.href,
    }))()`);
    const localFailures = [];
    if (audit.path !== '/ask' || !audit.hasAskShell) {
      localFailures.push('legacy specialist chat did not redirect into the lightweight /ask shell');
    }
    if (audit.school !== 'KP') {
      localFailures.push(`legacy specialist chat did not preserve school=KP, got ${audit.school}`);
    }
    if (audit.hasDashboardShell) {
      localFailures.push('legacy specialist chat still rendered the dashboard shell');
    }
    if (!audit.hasPreservedPrompt) {
      localFailures.push('legacy specialist chat redirect did not preserve the user prompt');
    }
    if (audit.horizontalOverflow) {
      localFailures.push('legacy specialist chat redirect has horizontal overflow');
    }
    return { audit, failures: localFailures };
  });

  await runScenario('new-visitor-creates-kundli-from-chat', mobileViewport, async cdp => {
    const prompt = encodeURIComponent(
      'Create my Kundli. Name: Bhaumik Mehta. DOB: 22 August 1980. Time: 06:30 AM. Place: Mumbai, Maharashtra, India.',
    );
    await navigateAndWait(cdp, `${baseUrl}/ask?prompt=${prompt}&autoSend=true&sourceScreen=Golden+Kundli+Journey`);
    await waitForCondition(cdp, `Boolean(document.querySelector('.auth-required-panel, .chat-workspace, .chat-panel, .predicta-chat-loading'))`, 6_000);
    const audit = await evaluate(cdp, `(() => {
      const textarea = document.querySelector('.ask-light-field textarea');
      return {
        chatStarted: Boolean(document.querySelector('.ask-light-shell-started')),
        hasChatEntry: Boolean(document.querySelector('.auth-required-panel, .chat-workspace, .chat-panel, .predicta-chat-loading, .chat-message')),
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        textareaValue: textarea?.value || '',
        url: location.href,
      };
    })()`);
    const localFailures = [];
    if (!audit.chatStarted || !audit.textareaValue.includes('Create my Kundli')) {
      localFailures.push('Kundli creation prompt was not preserved in the direct chat flow');
    }
    if (!audit.hasChatEntry) {
      localFailures.push('Kundli creation prompt did not reveal a direct chat/sign-in state');
    }
    if (audit.horizontalOverflow) {
      localFailures.push('Kundli creation chat route has horizontal overflow');
    }
    return { audit, failures: localFailures };
  });

  await runScenario('returning-user-asks-prediction', mobileViewport, async cdp => {
    await navigateAndWait(cdp, `${baseUrl}/ask`);
    await seedReturningKundli(cdp);
    const prompt = encodeURIComponent('From my saved Kundli, is a foreign work opportunity likely soon?');
    await navigateAndWait(cdp, `${baseUrl}/ask?kundliId=golden-kundli&prompt=${prompt}&autoSend=true&sourceScreen=Saved+Kundli`);
    await waitForCondition(cdp, `Boolean(document.querySelector('.auth-required-panel, .chat-workspace, .chat-panel, .predicta-chat-loading'))`, 6_000);
    const audit = await evaluate(cdp, `(() => ({
      activeKundliStored: Boolean(JSON.parse(localStorage.getItem('pridicta.webKundliStore.v1') || '{}').activeKundli),
      chatStarted: Boolean(document.querySelector('.ask-light-shell-started')),
      hasChatEntry: Boolean(document.querySelector('.auth-required-panel, .chat-workspace, .chat-panel, .predicta-chat-loading, .chat-message')),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      text: (document.body.textContent || '').slice(0, 2000),
      url: location.href,
    }))()`);
    const localFailures = [];
    if (!audit.activeKundliStored) {
      localFailures.push('returning-user Kundli context was not seeded');
    }
    if (!audit.chatStarted || !audit.hasChatEntry) {
      localFailures.push('returning-user prediction did not reveal a direct chat/sign-in state');
    }
    if (audit.horizontalOverflow) {
      localFailures.push('returning-user prediction route has horizontal overflow');
    }
    return { audit, failures: localFailures };
  });

  await runEvidenceHandoffScenario('vedic-evidence-handoff', '/dashboard/vedic', desktopViewport);
  await runEvidenceHandoffScenario('kp-evidence-handoff', '/dashboard/kp', desktopViewport);
  await runEvidenceHandoffScenario('jaimini-evidence-handoff', '/dashboard/jaimini', desktopViewport);

  await runScenario('chat-driven-report-composer', desktopViewport, async cdp => {
    const prompt = encodeURIComponent('Create a Vedic report for my current career and timing question.');
    await navigateAndWait(cdp, `${baseUrl}/ask?prompt=${prompt}&autoSend=true&reportFocus=VEDIC&sourceScreen=Report+Chat+Journey`);
    await waitForCondition(cdp, `Boolean(document.querySelector('.ask-light-shell-started, .auth-required-panel, .chat-workspace, .chat-panel, .predicta-chat-loading'))`, 8_000);
    await navigateAndWait(cdp, `${baseUrl}/dashboard/report`);
    await waitForCondition(cdp, `location.pathname === '/dashboard/report' && Boolean(document.querySelector('.report-inline-composer, .report-selected-choice, .report-download-stage, .report-product-card'))`, 20_000).catch(() => undefined);
    const audit = await evaluate(cdp, `(() => ({
      hasComposer: Boolean(document.querySelector('.report-inline-composer, .report-selected-choice, .report-download-stage')),
      hasDownloadCta: /Download your report|Save chat PDF|report/i.test(document.body.textContent || ''),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      path: location.pathname,
      text: (document.body.textContent || '').slice(0, 2200),
      url: location.href,
    }))()`);
    const localFailures = [];
    if (audit.path !== '/dashboard/report') {
      localFailures.push('chat-driven report flow did not reach /dashboard/report');
    }
    if (!audit.hasComposer || !audit.hasDownloadCta) {
      localFailures.push('report composer/download surface is not reachable from chat');
    }
    if (audit.horizontalOverflow) {
      localFailures.push('report composer route has horizontal overflow');
    }
    return { audit, failures: localFailures };
  });

  await runScenario('zero-credit-deterministic-help', mobileViewport, async cdp => {
    await navigateAndWait(cdp, `${baseUrl}/ask?cost-guardrail-smoke=true`);
    await evaluate(cdp, `(() => {
      localStorage.setItem('pridicta.freeCostUsage.v2.smoke', JSON.stringify({
        deepReadingsUsed: 0,
        questionsUsed: 3,
        updatedAt: new Date().toISOString(),
      }));
      return true;
    })()`);
    const prompt = encodeURIComponent('Will I get a career move this year?');
    await navigateAndWait(cdp, `${baseUrl}/ask?cost-guardrail-smoke=true&prompt=${prompt}&autoSend=true&sourceScreen=Zero+Credit+Journey`);
    await waitForCondition(cdp, `Boolean(document.querySelector('.auth-required-panel, .chat-workspace, .chat-panel, .predicta-chat-loading'))`, 6_000);
    const audit = await evaluate(cdp, `(() => {
      const text = document.body.textContent || '';
      const hrefs = [...document.querySelectorAll('a[href]')].map(link => link.getAttribute('href'));
      return {
        hasAccountRequired: Boolean(document.querySelector('.auth-required-panel')),
        hasDeterministicCopy: /free AI questions are used|without AI|deterministic|Kundli|charts|reports/i.test(text),
        hasPreservedQuestionBridge: /Your question is ready|question ready after sign-in|do not have to start again/i.test(text),
        hasFallbackLinks: hrefs.some(href => href === '/dashboard/kundli') &&
          hrefs.some(href => href === '/dashboard/redeem-pass') &&
          hrefs.some(href => href === '/pricing'),
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        text: text.slice(0, 2400),
        url: location.href,
      };
    })()`);
    const localFailures = [];
    if (!audit.hasDeterministicCopy) {
      localFailures.push('zero-credit state did not explain deterministic help remains available');
    }
    if (audit.hasAccountRequired && !audit.hasPreservedQuestionBridge) {
      localFailures.push('signed-out zero-credit state did not preserve the user question before sign-in');
    }
    if (!audit.hasFallbackLinks) {
      localFailures.push('zero-credit state did not show deterministic/redeem/pricing next steps');
    }
    if (audit.horizontalOverflow) {
      localFailures.push('zero-credit journey has horizontal overflow');
    }
    return { audit, failures: localFailures };
  });

  await runScenario('signed-out-redeem-pass-lock', mobileViewport, async cdp => {
    await navigateAndWait(cdp, `${baseUrl}/dashboard/redeem-pass`);
    await delay(2_000);
    const audit = await evaluate(cdp, `(() => ({
      hasPassInput: Boolean(document.querySelector('#pass-code')),
      hasSignInLock: Boolean(document.querySelector('.redeem-signin-lock')),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      text: (document.body.textContent || '').slice(0, 2200),
      url: location.href,
    }))()`);
    const localFailures = [];
    if (!audit.hasSignInLock) {
      localFailures.push('signed-out redeem pass does not show the sign-in lock');
    }
    if (audit.hasPassInput) {
      localFailures.push('signed-out redeem pass still exposes the pass-code field');
    }
    if (audit.horizontalOverflow) {
      localFailures.push('signed-out redeem pass route has horizontal overflow');
    }
    return { audit, failures: localFailures };
  });

  await runScenario('mobile-navigation-primary-links', mobileViewport, async cdp => {
    await navigateAndWait(cdp, `${baseUrl}/`);
    await click(cdp, '.mobile-menu-button');
    await delay(400);
    const menuAudit = await evaluate(cdp, `(() => {
      const links = [...document.querySelectorAll('.mobile-menu-panel a[href]')].map(link => ({
        href: link.getAttribute('href'),
        text: (link.textContent || '').replace(/\\s+/g, ' ').trim(),
      }));
      return {
        hasMenu: Boolean(document.querySelector('.mobile-menu-panel')),
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        links,
      };
    })()`);
    await click(cdp, '.mobile-menu-panel a[href="/ask"]');
    await delay(800);
    const askAudit = await evaluate(cdp, `(() => ({
      hasAskShell: Boolean(document.querySelector('.ask-light-shell')),
      path: location.pathname,
      url: location.href,
    }))()`);
    const requiredLinks = ['/ask', '/dashboard/vedic', '/dashboard/kp', '/dashboard/jaimini', '/dashboard/numerology', '/dashboard/signature', '/dashboard/report', '/pricing'];
    const missingLinks = requiredLinks.filter(href => !menuAudit.links.some(link => link.href === href));
    const localFailures = [];
    if (!menuAudit.hasMenu) {
      localFailures.push('mobile menu did not open');
    }
    if (missingLinks.length) {
      localFailures.push(`mobile menu missing links: ${missingLinks.join(', ')}`);
    }
    if (menuAudit.horizontalOverflow) {
      localFailures.push('mobile menu has horizontal overflow');
    }
    if (askAudit.path !== '/ask' || !askAudit.hasAskShell) {
      localFailures.push('mobile menu Ask Predicta link did not open /ask');
    }
    return { audit: { askAudit, menuAudit }, failures: localFailures };
  });

  await runLanguageScenario('language-hindi', 'hi', ['वैदिक', 'जैमिनी', 'अंक ज्योतिष', 'हस्ताक्षर', 'रिपोर्ट', 'प्रीमियम']);
  await runLanguageScenario('language-gujarati', 'gu', ['વેદિક', 'જૈમિની', 'અંક જ્યોતિષ', 'હસ્તાક્ષર', 'રિપોર્ટ', 'પ્રીમિયમ']);
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
  generatedAt: new Date().toISOString(),
  phaseName,
  scenarioResults,
  screenshotDir,
  sourceResults,
};

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({
  manifestPath,
  scenarioCount: scenarioResults.length,
  screenshotDir,
}, null, 2));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName} passed. Manifest: ${manifestPath}`);

async function runSourceContractChecks() {
  const checks = [];
  const failures = [];
  const [chatSource, passGuardrailSource, redeemSource, languageSource] = await Promise.all([
    readFile('apps/web/components/WebPridictaChat.tsx', 'utf8'),
    readFile('apps/web/lib/web-pass-cost-guardrails.ts', 'utf8'),
    readFile('apps/web/components/WebRedeemPassForm.tsx', 'utf8'),
    readFile('packages/config/src/translations/language.json', 'utf8'),
  ]);

  const requiredChatFragments = [
    'free-ai-zero-credit-kundli',
    'free-ai-zero-credit-charts',
    'free-ai-zero-credit-report',
    'autoSend',
    'sourceScreen',
  ];
  for (const fragment of requiredChatFragments) {
    const passed = chatSource.includes(fragment);
    checks.push({ fragment, passed, source: 'WebPridictaChat.tsx' });
    if (!passed) {
      failures.push(`source contract missing chat fragment: ${fragment}`);
    }
  }

  const requiredZeroCreditFragments = ['/dashboard/kundli', '/dashboard/redeem-pass', '/pricing'];
  for (const fragment of requiredZeroCreditFragments) {
    const passed = passGuardrailSource.includes(fragment);
    checks.push({ fragment, passed, source: 'web-pass-cost-guardrails.ts' });
    if (!passed) {
      failures.push(`source contract missing zero-credit fragment: ${fragment}`);
    }
  }

  const passLockFragments = ['redeem-signin-lock', 'id="pass-code"', '!user?.email'];
  for (const fragment of passLockFragments) {
    const passed = redeemSource.includes(fragment);
    checks.push({ fragment, passed, source: 'WebRedeemPassForm.tsx' });
    if (!passed) {
      failures.push(`source contract missing redeem-pass fragment: ${fragment}`);
    }
  }

  const languageData = JSON.parse(languageSource);
  for (const language of ['en', 'hi', 'gu']) {
    const labels = languageData.appShellLabels?.[language]?.nav;
    const passed = Boolean(labels?.vedic && labels?.kp && labels?.jaimini && labels?.numerology && labels?.signature && labels?.reports && labels?.premium);
    checks.push({ language, passed, source: 'language.json' });
    if (!passed) {
      failures.push(`source contract missing app shell labels for ${language}`);
    }
  }

  return { checks, failures };
}

async function runEvidenceHandoffScenario(name, route, viewport) {
  await runScenario(name, viewport, async cdp => {
    await navigateAndWait(cdp, `${baseUrl}${route}`);
    await waitForCondition(cdp, `Boolean(document.querySelector('.evidence-room-entry, a[href^="/ask"]'))`, 8_000).catch(() => undefined);
    const before = await evaluate(cdp, `(() => {
      const hrefs = [...document.querySelectorAll('a[href^="/ask"]')].map(link => link.getAttribute('href'));
      return {
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        hrefs,
        text: (document.body.textContent || '').slice(0, 2000),
      };
    })()`);
    let after = {
      hasAskShell: false,
      path: '',
      search: '',
      url: '',
    };
    if (before.hrefs.length) {
      await evaluate(cdp, `(() => {
        const links = [...document.querySelectorAll('a[href^="/ask"]')];
        const link = links.find(item => (item.getAttribute('href') || '').includes('sourceScreen')) ?? links[0];
        link?.click();
        return Boolean(link);
      })()`);
      await delay(800);
      after = await evaluate(cdp, `(() => ({
        hasAskShell: Boolean(document.querySelector('.ask-light-shell')),
        path: location.pathname,
        search: location.search,
        url: location.href,
      }))()`);
    }
    const localFailures = [];
    if (!before.hrefs.length) {
      localFailures.push(`${route} has no Ask Predicta handoff link`);
    }
    if (before.horizontalOverflow) {
      localFailures.push(`${route} has horizontal overflow before handoff`);
    }
    if (after.path !== '/ask' || !after.hasAskShell) {
      localFailures.push(`${route} handoff did not open /ask`);
    }
    if (!after.search.includes('sourceScreen') && !after.search.includes('prompt')) {
      localFailures.push(`${route} handoff did not carry source/prompt context`);
    }
    return { audit: { after, before }, failures: localFailures };
  });
}

async function runLanguageScenario(name, language, expectedLabels) {
  await runScenario(name, mobileViewport, async cdp => {
    await navigateAndWait(cdp, `${baseUrl}/`);
    await setLanguage(cdp, language);
    await navigateAndWait(cdp, `${baseUrl}/`);
    await click(cdp, '.mobile-menu-button');
    await delay(400);
    const audit = await evaluate(cdp, `(() => {
      const text = document.body.textContent || '';
      return {
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        menuText: document.querySelector('.mobile-menu-panel')?.textContent || '',
        text,
      };
    })()`);
    const localFailures = [];
    for (const label of expectedLabels) {
      if (!audit.text.includes(label)) {
        localFailures.push(`${name} missing translated label: ${label}`);
      }
    }
    if (audit.horizontalOverflow) {
      localFailures.push(`${name} has horizontal overflow`);
    }
    return { audit: { menuText: audit.menuText.slice(0, 1200) }, failures: localFailures };
  });
}

async function runScenario(name, viewport, callback) {
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
    await prepareCleanScenarioStorage(cdp);
    const result = await callback(cdp);
    const screenshotPath = await captureScenarioScreenshot(cdp, name, viewport);
    const scenario = {
      ...result,
      name,
      screenshotPath,
      viewport: viewport.name,
    };
    scenarioResults.push(scenario);
    failures.push(...result.failures.map(failure => `${name}: ${failure}`));
    return scenario;
  } finally {
    cdp.close();
    await closeTarget(port, page.id).catch(() => undefined);
  }
}

async function prepareCleanScenarioStorage(cdp) {
  await navigateAndWait(cdp, `${baseUrl}/?phase9StoragePrep=1`);
  await evaluate(cdp, `(() => {
    localStorage.clear();
    sessionStorage.clear();
    return true;
  })()`);
}

async function captureScenarioScreenshot(cdp, name, viewport) {
  const screenshotPath = `${screenshotDir}/${viewport.name}-${name}.png`;
  const screenshot = await cdp.send('Page.captureScreenshot', {
    captureBeyondViewport: false,
    format: 'png',
  });
  writeFileSync(screenshotPath, Buffer.from(screenshot.data, 'base64'));
  return screenshotPath;
}

async function seedReturningKundli(cdp) {
  await evaluate(cdp, `(() => {
    const birthDetails = {
      date: '1980-08-22',
      isTimeApproximate: false,
      latitude: 19.076,
      longitude: 72.8777,
      name: 'Bhaumik Mehta',
      place: 'Mumbai, Maharashtra, India',
      time: '06:30',
      timezone: 'Asia/Kolkata',
    };
    const kundli = {
      ascendant: 'Leo',
      birthDetails,
      chart: { D1: [] },
      dasha: {
        current: {
          antardasha: 'Sun',
          mahadasha: 'Venus',
          pratyantardasha: 'Moon',
        },
      },
      id: 'golden-kundli',
      moonSign: 'Sagittarius',
      nakshatra: 'Mula',
    };
    localStorage.setItem('pridicta.webKundliStore.v1', JSON.stringify({
      activeKundli: kundli,
      activeKundliId: kundli.id,
      savedKundlis: [kundli],
      updatedAt: new Date().toISOString(),
    }));
    return true;
  })()`);
}

async function setLanguage(cdp, language) {
  await evaluate(cdp, `(() => {
    localStorage.setItem('pridicta.languagePreference.v1', JSON.stringify({
      appLanguage: ${JSON.stringify(language)},
      chartLanguage: ${JSON.stringify(language)},
      language: ${JSON.stringify(language)},
      predictaReplyLanguage: ${JSON.stringify(language)},
      predictaStylePreference: 'balanced',
      reportLanguage: ${JSON.stringify(language)},
      updatedAt: new Date().toISOString(),
    }));
    window.dispatchEvent(new Event('pridicta-language-change'));
    return true;
  })()`);
}

async function setTextareaValue(cdp, selector, value) {
  await evaluate(cdp, `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) {
      return false;
    }
    const setter = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value')?.set;
    setter.call(element, ${JSON.stringify(value)});
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
}

async function click(cdp, selector) {
  const response = await evaluate(cdp, `(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) {
      return false;
    }
    element.click();
    return true;
  })()`);
  if (!response) {
    throw new Error(`Selector not found for click: ${selector}`);
  }
}

async function evaluate(cdp, expression) {
  const response = await cdp.send('Runtime.evaluate', {
    awaitPromise: true,
    expression,
    returnByValue: true,
  });

  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.text ?? 'Browser evaluation failed.');
  }

  return response.result?.value;
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
  await delay(500);
}

async function waitForCondition(cdp, conditionExpression, timeoutMs = 8_000) {
  return evaluate(cdp, `new Promise((resolve, reject) => {
    const deadline = Date.now() + ${Number(timeoutMs)};
    const check = () => {
      try {
        if (${conditionExpression}) {
          resolve(true);
          return;
        }
      } catch {
        // Keep polling until hydration catches up or the timeout expires.
      }

      if (Date.now() >= deadline) {
        reject(new Error('Timed out waiting for browser condition.'));
        return;
      }

      setTimeout(check, 120);
    };
    check();
  })`);
}

async function waitForChrome(debugPort) {
  const deadline = Date.now() + 10_000;
  let lastError;

  while (Date.now() < deadline) {
    try {
      await getText(`http://127.0.0.1:${debugPort}/json/version`);
      return;
    } catch (error) {
      lastError = error;
      await delay(150);
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
            const timeout = setTimeout(() => {
              pending.delete(messageId);
              messageReject(new Error(`Timed out waiting for ${method}`));
            }, 45_000);
            pending.set(messageId, {
              reject: messageReject,
              resolve: messageResolve,
              timeout,
            });
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
      clearTimeout(callbacks.timeout);

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

function windowHeightLimit(viewport, ratio) {
  return Math.round(viewport.height * ratio);
}
