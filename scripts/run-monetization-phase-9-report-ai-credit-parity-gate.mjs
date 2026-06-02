import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  console.error(`Monetization Phase 9 report/AI credit parity gate failed: ${message}`);
  process.exit(1);
}

function assert(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function assertIncludes(source, needle, label) {
  assert(source.includes(needle), `${label} is missing ${needle}`);
}

async function importParityModule() {
  const sourcePath = path.join(root, 'packages/monetization/src/entitlementParity.ts');
  const source = fs
    .readFileSync(sourcePath, 'utf8')
    .replace(
      "import { FREE_AI_QUESTION_LIFETIME_LIMIT } from './serverEntitlementLedger';",
      'const FREE_AI_QUESTION_LIFETIME_LIMIT = 3;',
    )
    .replace("import type { ServerEntitlementLedger } from './serverEntitlementLedger';", '')
    .replace("import type { ReportCreditType } from './serverEntitlementLedger';", '');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: false,
    },
    fileName: sourcePath,
  }).outputText;
  const tmpPath = path.join(os.tmpdir(), `predicta-phase-9-parity-${Date.now()}.mjs`);
  fs.writeFileSync(tmpPath, compiled);
  return import(pathToFileURL(tmpPath).href);
}

function makeLedger(overrides = {}) {
  return {
    dayPassEntitlement: {
      active: false,
      pdfsRemaining: 0,
      questionsRemaining: 0,
    },
    familyBank: {
      sharedQuestionCreditsBalance: 0,
      sharedReportCreditsByType: {},
    },
    freeAiCreditsUsed: 0,
    paidAiQuestionCreditsBalance: 0,
    premiumEntitlement: {
      status: 'NONE',
    },
    reportCreditsByType: {},
    ...overrides,
  };
}

const requiredFiles = [
  'docs/audits/PREDICTA_MONETIZATION_PHASE_9_REPORT_AND_AI_CREDIT_ENTITLEMENT_PARITY/report-ai-credit-entitlement-parity-audit.md',
  'docs/audits/PREDICTA_MONETIZATION_PHASE_9_REPORT_AND_AI_CREDIT_ENTITLEMENT_PARITY/phase-9-report-ai-credit-parity-manifest.json',
  'packages/monetization/src/entitlementParity.ts',
  'packages/monetization/src/serverEntitlementLedger.ts',
  'apps/web/app/api/ask-pridicta/route.ts',
  'apps/mobile/src/services/ai/pridictaService.ts',
  'apps/web/app/api/report/pdf/route.ts',
  'apps/mobile/src/screens/ReportScreen.tsx',
  'apps/web/components/WebDossierPreview.tsx',
  'apps/web/lib/pridicta-ai.ts',
];

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing required file: ${file}`);
}

const roadmap = read('docs/PREDICTA_MONETIZATION_CREDIT_LED_FUNNEL_STRICT_PHASES.md');
[
  'PREDICTA_MONETIZATION_PHASE_9_REPORT_AND_AI_CREDIT_ENTITLEMENT_PARITY',
  'Vedic, KP, Jaimini, Numerology, Signature, and Life Atlas report downloads use',
  'Free deterministic reports remain available where allowed.',
  'Premium AI-written reports require premium/report credit.',
  'Signature report still requires confirmed signature traits.',
  'Life Atlas optional signature layer does not block when signature is missing.',
  'Mobile report generation uses the same entitlement logic as web.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'monetization roadmap'));

const parity = read('packages/monetization/src/entitlementParity.ts');
[
  'evaluateAiCreditEntitlement',
  'shouldConsumeDayPassAiCredit',
  'evaluateReportEntitlement',
  'selectPaidReportCreditSpend',
  'getReportCreditCandidates',
  'mapReportFocusToCreditType',
  'reportCreditLabel',
  "case 'KP':",
  "case 'JAIMINI':",
  "case 'NUMEROLOGY':",
  "case 'SIGNATURE':",
  "case 'LIFE_ATLAS':",
].forEach(fragment => assertIncludes(parity, fragment, 'shared entitlement parity contract'));

const ledger = read('packages/monetization/src/serverEntitlementLedger.ts');
[
  "kind: 'record_successful_day_pass_ai_answer'",
  "kind: 'consume_day_pass_report_pdf'",
  'questionsRemaining: next.dayPassEntitlement.questionsRemaining - 1',
  'pdfsRemaining: next.dayPassEntitlement.pdfsRemaining - 1',
  "'day_pass_ai_exhausted'",
  "'day_pass_report_exhausted'",
].forEach(fragment => assertIncludes(ledger, fragment, 'server entitlement ledger day-pass consumption'));

const webAsk = read('apps/web/app/api/ask-pridicta/route.ts');
[
  'evaluateAiCreditEntitlement',
  'shouldConsumeDayPassAiCredit',
  "kind: 'record_successful_day_pass_ai_answer'",
  'selectPaidAiCreditSpendSource(aiEntitlement)',
].forEach(fragment => assertIncludes(webAsk, fragment, 'web AI credit parity'));

const mobileAsk = read('apps/mobile/src/services/ai/pridictaService.ts');
[
  'evaluateAiCreditEntitlement',
  'shouldConsumeDayPassAiCredit',
  "kind: 'record_successful_day_pass_ai_answer'",
  'selectPaidAiCreditSpendSource(aiEntitlement)',
].forEach(fragment => assertIncludes(mobileAsk, fragment, 'mobile AI credit parity'));

const webReportRoute = read('apps/web/app/api/report/pdf/route.ts');
[
  'evaluateReportEntitlement',
  'requiredCreditType',
  "kind: 'consume_report_credit'",
  "kind: 'consume_day_pass_report_pdf'",
  'hasReadySignatureAnalysis(payload.signatureAnalysis)',
].forEach(fragment => assertIncludes(webReportRoute, fragment, 'web report entitlement parity'));
assert(!webReportRoute.includes('function selectPaidReportCreditSpend('), 'web report route must not keep a local report credit selector');
assert(!webReportRoute.includes('function mapReportFocusToCreditType('), 'web report route must not keep a local report credit mapper');

const mobileReport = read('apps/mobile/src/screens/ReportScreen.tsx');
[
  'evaluateReportEntitlement',
  'reportCreditLabel',
  "kind: 'consume_report_credit'",
  "kind: 'consume_day_pass_report_pdf'",
  'Signature reports require a confirmed signature sample',
].forEach(fragment => assertIncludes(mobileReport, fragment, 'mobile report entitlement parity'));
assert(!mobileReport.includes('function selectPaidReportCreditSpend('), 'mobile report screen must not keep a local report credit selector');
assert(!mobileReport.includes('consumeReportPdfCredit(kundli.id'), 'mobile premium reports must not fall back to local legacy PDF credit consumption');

const webDossier = read('apps/web/components/WebDossierPreview.tsx');
[
  'hasServerReportCreditForFocus',
  'getReportCreditCandidates',
  'reportCreditLabel',
  'Requires Premium, Day Pass, Family Bank, or one',
  'Free deterministic report does not spend AI or report credits.',
  'Signature expression layer was not included because no signature sample was provided. Missing signature does not block Life Atlas.',
].forEach(fragment => assertIncludes(webDossier, fragment, 'web report composer credit requirement and Life Atlas optional signature copy'));

const balanceLoader = read('apps/web/lib/pridicta-ai.ts');
[
  'familyReportCreditsByType',
  'reportCreditsByType',
  'payload.ledger.familyBank.sharedReportCreditsByType',
  'payload.ledger.reportCreditsByType',
].forEach(fragment => assertIncludes(balanceLoader, fragment, 'web Product Bank per-lane balance loader'));

const mod = await importParityModule();
const expectedMappings = new Map([
  ['KUNDLI', 'VEDIC'],
  ['VEDIC', 'VEDIC'],
  ['CAREER', 'VEDIC'],
  ['KP', 'KP'],
  ['JAIMINI', 'JAIMINI'],
  ['NUMEROLOGY', 'NUMEROLOGY'],
  ['SIGNATURE', 'SIGNATURE'],
  ['LIFE_ATLAS', 'LIFE_ATLAS'],
]);
for (const [focus, credit] of expectedMappings) {
  assert(mod.mapReportFocusToCreditType(focus) === credit, `${focus} must map to ${credit}`);
}

for (const focus of expectedMappings.keys()) {
  assert(
    mod.evaluateReportEntitlement({
      ledger: makeLedger(),
      mode: 'FREE',
      reportFocus: focus,
    }).allowed,
    `${focus} free deterministic report must be allowed`,
  );
  assert(
    !mod.evaluateReportEntitlement({
      ledger: makeLedger(),
      mode: 'PREMIUM',
      reportFocus: focus,
    }).allowed,
    `${focus} premium report must block without entitlement`,
  );
  assert(
    mod.evaluateReportEntitlement({
      ledger: makeLedger({ reportCreditsByType: { PREMIUM_PDF: 1 } }),
      mode: 'PREMIUM',
      reportFocus: focus,
    }).allowed,
    `${focus} premium report must accept generic Premium PDF credit`,
  );
  assert(
    mod.evaluateReportEntitlement({
      ledger: makeLedger({
        familyBank: {
          sharedQuestionCreditsBalance: 0,
          sharedReportCreditsByType: { [mod.mapReportFocusToCreditType(focus)]: 1 },
        },
      }),
      mode: 'PREMIUM',
      reportFocus: focus,
    }).allowed,
    `${focus} premium report must accept Family Bank lane credit`,
  );
}

const freeAi = mod.evaluateAiCreditEntitlement(makeLedger({ freeAiCreditsUsed: 2 }), 'FREE');
assert(freeAi.allowed && freeAi.creditSource === 'free_lifetime_ai_credit', 'free AI credit source must be free lifetime');
assert(!mod.evaluateAiCreditEntitlement(makeLedger({ freeAiCreditsUsed: 3 }), 'FREE').allowed, 'fourth free AI question must block');
assert(
  mod.evaluateAiCreditEntitlement(makeLedger({ paidAiQuestionCreditsBalance: 1 }), 'FREE').creditSource === 'personal',
  'paid AI question pack must be selected before free exhaustion matters',
);
assert(
  mod.evaluateAiCreditEntitlement(makeLedger({ familyBank: { sharedQuestionCreditsBalance: 1, sharedReportCreditsByType: {} } }), 'FREE').creditSource === 'family_bank',
  'Family Bank question credit must be selected',
);
assert(
  mod.evaluateAiCreditEntitlement(makeLedger({ dayPassEntitlement: { active: true, questionsRemaining: 1, pdfsRemaining: 0 } }), 'FREE').creditSource === 'day_pass',
  'Day Pass question credit must be selected',
);

console.log(
  'Monetization Phase 9 report/AI credit parity gate passed: all report lanes share entitlement rules, AI credits are source-aware, day pass consumption is wired, Signature remains gated, and Life Atlas keeps signature optional.',
);
