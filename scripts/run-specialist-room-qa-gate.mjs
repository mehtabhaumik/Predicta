import { spawnSync } from 'node:child_process';
import { strict as assert } from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const phaseCommands = [
  ['corepack', ['pnpm', 'test:nav-new-rooms']],
  ['corepack', ['pnpm', 'test:discipline-handoff']],
  ['corepack', ['pnpm', 'test:native-script-chat']],
  ['corepack', ['pnpm', 'test:translation-trust']],
  ['corepack', ['pnpm', 'test:numerology']],
  ['node', ['scripts/run-numerology-predicta-room.mjs']],
  ['node', ['scripts/run-signature-analysis-model.mjs']],
  ['node', ['scripts/run-signature-predicta-room.mjs']],
  ['corepack', ['pnpm', 'test:signature-report']],
  ['corepack', ['pnpm', 'test:room-report-pdf']],
  ['corepack', ['pnpm', 'test:predicta-context']],
];

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    throw new Error(`${command} ${args.join(' ')} failed`);
  }
}

for (const [command, args] of phaseCommands) {
  runCommand(command, args);
}

function readWorkspaceFile(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function expectFile(file) {
  assert.equal(existsSync(path.join(repoRoot, file)), true, `${file} must exist`);
  return readWorkspaceFile(file);
}

function expectIncludes(file, fragments) {
  const source = expectFile(file);

  for (const fragment of fragments) {
    assert.equal(
      source.includes(fragment),
      true,
      `${file} must include ${fragment}`,
    );
  }
}

const chatRoutes = [
  {
    file: 'apps/web/app/dashboard/vedic/chat/page.tsx',
    school: "school: 'PARASHARI'",
    source: "sourceScreen: 'Vedic Predicta'",
  },
  {
    file: 'apps/web/app/dashboard/kp/chat/page.tsx',
    school: "school: 'KP'",
    source: "sourceScreen: 'KP Predicta'",
  },
  {
    file: 'apps/web/app/dashboard/nadi/chat/page.tsx',
    school: "school: 'NADI'",
    source: "sourceScreen: 'Nadi Predicta'",
  },
  {
    file: 'apps/web/app/dashboard/numerology/chat/page.tsx',
    school: "school: 'NUMEROLOGY'",
    source: "sourceScreen: 'Numerology Predicta'",
  },
  {
    file: 'apps/web/app/dashboard/signature/chat/page.tsx',
    school: "school: 'SIGNATURE'",
    source: "sourceScreen: 'Signature Predicta'",
  },
];

for (const route of chatRoutes) {
  expectIncludes(route.file, [
    'WebPredictaRoomChatPage',
    route.school,
    route.source,
    'prompt:',
  ]);
}

expectIncludes('apps/web/components/WebPredictaRoomChatPage.tsx', [
  'room.sourceScreen',
  'room.title',
  'room.body',
  '<WebPridictaChat room={room} />',
]);

expectIncludes('packages/config/src/pricing.ts', [
  "id: 'VEDIC'",
  "id: 'KP'",
  "id: 'NADI'",
  "id: 'NUMEROLOGY'",
  "id: 'SIGNATURE'",
  'Vedic Predicta Report',
  'KP Predicta Report',
  'Nadi Predicta Report',
  'Numerology Report',
  'Signature Report',
]);

expectIncludes('packages/pdf/src/index.ts', [
  "case 'KP':",
  "case 'NADI':",
  "case 'NUMEROLOGY':",
  "case 'SIGNATURE':",
  'buildRoomSpecificReportSections',
  'buildVedicPredictaReportSection',
  'does not claim palm-leaf manuscript access',
  'without casually mixing Parashari, KP, or Nadi methods',
  'not identity verification or handwriting forensics',
]);

expectIncludes('backend/astro_api/ai.py', [
  'Vedic Predicta is traditional holistic Vedic Jyotish',
  'KP Predicta is Krishnamurti Paddhati',
  'Nadi Predicta is a separate premium school',
  'Numerology Predicta is a separate number-reading room',
  'Signature Predicta is a separate signature-analysis room',
  'disciplineHandoff.requiresHandoff is true',
]);

expectIncludes('packages/astrology/src/predictaChatActions.ts', [
  'kpHandoffReply',
  'nadiHandoffReply',
  'numerologyHandoffReply',
  'signatureHandoffReply',
  'vedicHandoffReply',
  'kp-handoff',
  'nadi-handoff',
  'numerology-handoff',
  'signature-handoff',
  'vedic-handoff',
  'does not claim real palm-leaf manuscript access',
]);

const translationSource = readWorkspaceFile('packages/config/src/translations/language.json');
for (const nativeFragment of [
  'वैदिक',
  'અંક પ્રેડિક્ટા',
  'हस्ताक्षर',
  'હસ્તાક્ષર',
]) {
  assert.equal(
    translationSource.includes(nativeFragment),
    true,
    `language translations must include native specialist fragment ${nativeFragment}`,
  );
}

const numerologyPanelSource = readWorkspaceFile(
  'apps/web/components/WebNumerologyPredictaPanel.tsx',
);
assert.equal(
  numerologyPanelSource.includes("from: 'PARASHARI'"),
  false,
  'Numerology panel must not fake a Parashari handoff inside the Numerology room',
);
assert.equal(
  numerologyPanelSource.includes("composeNumerologyFoundationModel(activeKundli?.birthDetails, language)"),
  true,
  'Numerology panel must localize the active numerology profile',
);

console.log('Specialist room QA gate passed: room routes, context contracts, reports, language, and handoff safety are covered.');
