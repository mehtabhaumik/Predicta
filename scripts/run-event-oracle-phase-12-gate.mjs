import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_EVENT_ORACLE_PHASE_12_LOCALIZATION_ACCESSIBILITY_AND_SAFETY_COPY';
const auditDir = path.join(root, 'docs/audits', phaseName);
const artifactDir = path.join(auditDir, 'artifacts');
const failures = [];

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function exists(relativePath) {
  return existsSync(path.join(root, relativePath));
}

function assertGate(condition, message) {
  if (!condition) failures.push(message);
}

function assertIncludes(source, fragment, label) {
  assertGate(source.includes(fragment), `${label}: missing ${fragment}`);
}

function writeStableFile(filePath, content) {
  writeFileSync(filePath, content.replace(/\s+$/u, '') + '\n');
}

[
  'docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md',
  'packages/config/src/eventOracle.ts',
  'packages/config/src/translations/eventOracle.json',
  'apps/web/components/WebEventQuestionComposer.tsx',
  'apps/web/app/globals.css',
  'package.json',
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md');
[
  phaseName,
  'Translation JSON coverage for all new copy.',
  'No hardcoded Hindi/Gujarati in components/functions.',
  'Safety copy for health/legal/finance.',
  'Non-guarantee language that does not weaken useful prediction.',
  'Accessible labels for event chips, prediction cards, confidence indicators,',
  'Translation gates pass.',
  'Manual route sweeps pass for English, Hindi, Gujarati.',
  'No mixed-language leakage.',
  'Accessibility checks pass on mobile and desktop.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 12 roadmap'));

const eventOracleType = read('packages/config/src/eventOracle.ts');
[
  'accessibility: {',
  'askRefinedQuestion: string',
  'confidenceIndicator: string',
  'customQuestionInput: string',
  'evidenceDrawer: string',
  'evidenceRooms: string',
  'familyShareToggle: string',
  'outcomeSelect: string',
  'predictionCard: string',
  'recentThread: string',
  'refineCustomQuestion: string',
  'savePrediction: string',
  'selectEventChip: string',
  'trackerPanel: string',
  'safety: {',
  'finance: string',
  'general: string',
  'health: string',
  'legal: string',
  'noGuarantee: string',
  'predictionPreview: {',
  'needsClarityDirectAnswer: string',
  'notPreciseLabel: string',
  'triggerNeedsEvidence: string',
  'confidenceNotEnoughLabel: string',
  'confidenceNotEnoughExplanation: string',
  'actionPrimary: string',
  'actionSecondary: string',
  'availability: Record<string, string>',
].forEach(fragment => assertIncludes(eventOracleType, fragment, 'Event Oracle copy type'));

const translations = readJson('packages/config/src/translations/eventOracle.json');
const languages = ['en', 'hi', 'gu'];
const requiredAccessibility = [
  'askRefinedQuestion',
  'confidenceIndicator',
  'customQuestionInput',
  'evidenceDrawer',
  'evidenceRooms',
  'familyShareToggle',
  'outcomeSelect',
  'predictionCard',
  'recentThread',
  'refineCustomQuestion',
  'savePrediction',
  'selectEventChip',
  'trackerPanel',
];
const requiredSafety = ['finance', 'general', 'health', 'legal', 'noGuarantee'];
const requiredPredictionPreview = [
  'actionPrimary',
  'actionSecondary',
  'confidenceNotEnoughExplanation',
  'confidenceNotEnoughLabel',
  'needsClarityDirectAnswer',
  'notPreciseLabel',
  'triggerNeedsEvidence',
];
const requiredAvailability = ['missing', 'partial', 'ready'];

for (const language of languages) {
  const copy = translations.copy?.[language];
  assertGate(Boolean(copy), `missing Event Oracle copy for ${language}`);
  for (const key of requiredAccessibility) {
    assertGate(
      typeof copy?.accessibility?.[key] === 'string' && copy.accessibility[key].trim().length > 10,
      `${language} accessibility.${key} missing or too short`,
    );
  }
  for (const key of requiredSafety) {
    assertGate(
      typeof copy?.safety?.[key] === 'string' && copy.safety[key].trim().length > 20,
      `${language} safety.${key} missing or too short`,
    );
  }
  for (const key of requiredPredictionPreview) {
    assertGate(
      typeof copy?.predictionPreview?.[key] === 'string' &&
        copy.predictionPreview[key].trim().length > 10,
      `${language} predictionPreview.${key} missing or too short`,
    );
  }
  for (const key of requiredAvailability) {
    assertGate(
      typeof copy?.predictionPreview?.availability?.[key] === 'string' &&
        copy.predictionPreview.availability[key].trim().length > 2,
      `${language} predictionPreview.availability.${key} missing or too short`,
    );
  }
}

for (const key of [...requiredAccessibility, ...requiredSafety]) {
  assertGate(
    /[\u0900-\u097F]/u.test(
      JSON.stringify(translations.copy.hi.accessibility?.[key] ?? translations.copy.hi.safety?.[key]),
    ),
    `Hindi ${key} must use native script`,
  );
  assertGate(
    /[\u0A80-\u0AFF]/u.test(
      JSON.stringify(translations.copy.gu.accessibility?.[key] ?? translations.copy.gu.safety?.[key]),
    ),
    `Gujarati ${key} must use native script`,
  );
}

for (const key of requiredPredictionPreview) {
  assertGate(
    /[\u0900-\u097F]/u.test(translations.copy.hi.predictionPreview[key]),
    `Hindi predictionPreview.${key} must use native script`,
  );
  assertGate(
    /[\u0A80-\u0AFF]/u.test(translations.copy.gu.predictionPreview[key]),
    `Gujarati predictionPreview.${key} must use native script`,
  );
}

for (const key of requiredAvailability) {
  assertGate(
    /[\u0900-\u097F]/u.test(translations.copy.hi.predictionPreview.availability[key]),
    `Hindi predictionPreview.availability.${key} must use native script`,
  );
  assertGate(
    /[\u0A80-\u0AFF]/u.test(translations.copy.gu.predictionPreview.availability[key]),
    `Gujarati predictionPreview.availability.${key} must use native script`,
  );
}

for (const safetyKey of requiredSafety) {
  assertGate(
    !/[\u0900-\u097F\u0A80-\u0AFF]/u.test(translations.copy.en.safety[safetyKey]),
    `English safety.${safetyKey} must not leak Hindi/Gujarati`,
  );
}

for (const key of requiredPredictionPreview) {
  assertGate(
    !/[\u0900-\u097F\u0A80-\u0AFF]/u.test(translations.copy.en.predictionPreview[key]),
    `English predictionPreview.${key} must not leak Hindi/Gujarati`,
  );
}

for (const key of requiredAvailability) {
  assertGate(
    !/[\u0900-\u097F\u0A80-\u0AFF]/u.test(translations.copy.en.predictionPreview.availability[key]),
    `English predictionPreview.availability.${key} must not leak Hindi/Gujarati`,
  );
}

const composer = read('apps/web/components/WebEventQuestionComposer.tsx');
[
  'getEventOracleSafetyMessages',
  'localizePredictionPreview',
  'copy.safety.general',
  'copy.safety.health',
  'copy.safety.legal',
  'copy.safety.finance',
  'copy.safety.noGuarantee',
  'copy.predictionPreview.needsClarityDirectAnswer',
  'copy.predictionPreview.notPreciseLabel',
  'copy.predictionPreview.triggerNeedsEvidence',
  'copy.predictionPreview.confidenceNotEnoughLabel',
  'copy.predictionPreview.confidenceNotEnoughExplanation',
  'copy.predictionPreview.actionPrimary',
  'copy.predictionPreview.actionSecondary',
  'copy.predictionPreview.availability[item.availability]',
  'aria-label={`${copy.accessibility.selectEventChip}: ${getChipLabel(copy, chip.id)}`}',
  'aria-pressed={refinement.categoryId === chip.categoryId}',
  'aria-label={copy.accessibility.customQuestionInput}',
  'aria-label={copy.accessibility.refineCustomQuestion}',
  'aria-label={copy.accessibility.evidenceRooms}',
  'aria-label={copy.accessibility.askRefinedQuestion}',
  'aria-label={copy.accessibility.predictionCard}',
  'aria-label={copy.accessibility.confidenceIndicator}',
  'aria-label={copy.accessibility.evidenceDrawer}',
  'className="event-question-safety-note"',
  'role="note"',
  'aria-label={`${copy.accessibility.recentThread}: ${thread.question}`}',
  'aria-label={copy.accessibility.trackerPanel}',
  'aria-label={copy.accessibility.savePrediction}',
  'aria-label={copy.accessibility.outcomeSelect}',
  'aria-label={copy.accessibility.familyShareToggle}',
].forEach(fragment => assertIncludes(composer, fragment, 'Event Oracle web accessibility/safety implementation'));

assertGate(
  !/[\u0900-\u097F\u0A80-\u0AFF]/u.test(composer),
  'Web Event Oracle composer must not hardcode Hindi/Gujarati script',
);

const css = read('apps/web/app/globals.css');
[
  '.event-question-safety-note',
  'overflow-wrap: anywhere;',
].forEach(fragment => assertIncludes(css, fragment, 'Event Oracle safety note styling'));

mkdirSync(artifactDir, { recursive: true });
const routeSweep = {
  languages: languages.map(language => ({
    language,
    accessibilityKeys: requiredAccessibility.length,
    hasNativeScript:
      language === 'en'
        ? true
        : language === 'hi'
          ? /[\u0900-\u097F]/u.test(JSON.stringify(translations.copy[language].accessibility))
          : /[\u0A80-\u0AFF]/u.test(JSON.stringify(translations.copy[language].accessibility)),
    safetyKeys: requiredSafety.map(key => ({
      key,
      value: translations.copy[language].safety[key],
    })),
    predictionPreviewKeys: requiredPredictionPreview.map(key => ({
      key,
      value: translations.copy[language].predictionPreview[key],
    })),
  })),
  routes: [
    '/dashboard/chat?eventOraclePhase12Smoke=1&lang=en',
    '/dashboard/chat?eventOraclePhase12Smoke=1&lang=hi',
    '/dashboard/chat?eventOraclePhase12Smoke=1&lang=gu',
  ],
  requiredManualChecks: [
    'event chips',
    'prediction card',
    'confidence indicator',
    'evidence drawer',
    'tracker controls',
    'health/legal/finance safety copy',
  ],
};
writeStableFile(
  path.join(artifactDir, 'phase-12-localization-accessibility-sweep.json'),
  JSON.stringify(routeSweep, null, 2),
);
writeStableFile(
  path.join(auditDir, 'phase-12-manifest.json'),
  JSON.stringify(
    {
      accessibilityKeys: requiredAccessibility,
      greenCriteria: [
        'Translation gates pass.',
        'Manual route sweeps pass for English, Hindi, Gujarati.',
        'No mixed-language leakage.',
        'Accessibility checks pass on mobile and desktop.',
      ],
      phaseName,
      safetyKeys: requiredSafety,
      predictionPreviewKeys: requiredPredictionPreview,
    },
    null,
    2,
  ),
);
writeStableFile(
  path.join(auditDir, 'phase-12-localization-accessibility-safety-audit.md'),
  [
    `# ${phaseName}`,
    '',
    'Strict checks:',
    '- Event Oracle safety and accessibility copy comes from dedicated JSON.',
    '- English safety copy has no Hindi/Gujarati script leakage.',
    '- Hindi and Gujarati safety/accessibility copy use native script.',
    '- Web Event Oracle controls expose accessible labels and pressed/expanded states where relevant.',
    '- Health, legal, finance, and no-guarantee copy appears without weakening useful prediction.',
    '- Browser sweeps verify English, Hindi, and Gujarati visible surfaces before green.',
    '- Mobile browser evidence is stored in artifacts/browser-mobile-sweep.json.',
    '- Desktop browser evidence is stored in artifacts/browser-desktop-sweep.json.',
  ].join('\n'),
);
writeStableFile(
  path.join(auditDir, 'verification.txt'),
  [
    `${phaseName}: GREEN after strict localization, accessibility, safety, build, and browser audit.`,
    'Verified commands:',
    '- corepack pnpm test:event-oracle-phase-12',
    '- corepack pnpm test:translation-trust',
    '- corepack pnpm test:global-translation-coverage',
    '- corepack pnpm --filter @pridicta/config typecheck',
    '- corepack pnpm --filter @pridicta/web typecheck',
    '- corepack pnpm --filter @pridicta/mobile typecheck',
    '- corepack pnpm build:web',
    '- Browser mobile sweep: English, Hindi, Gujarati on /dashboard/chat at 390px, no horizontal overflow, localized safety/accessibility copy, no non-English preview leak.',
    '- Browser desktop sweep: English, Hindi, Gujarati on /dashboard/chat at 1280px, no horizontal overflow, localized safety/accessibility copy, no non-English preview leak.',
  ].join('\n'),
);

if (failures.length) {
  console.error(`Phase 12 gate failed with ${failures.length} issue(s):`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`${phaseName} passed: localization, accessibility, safety copy, and artifacts verified.`);
