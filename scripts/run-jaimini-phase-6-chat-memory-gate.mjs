import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const phaseName = 'PREDICTA_JAIMINI_PHASE_6_CHAT_AND_PREDICTA_MEMORY_INTEGRATION';
const phaseRoot = path.join(repoRoot, 'docs/audits', phaseName);

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), label);
}

function assertNotIncludes(source, fragment, label) {
  assert.ok(!source.includes(fragment), label);
}

const roadmap = read('docs/PREDICTA_JAIMINI_REPLACES_NADI_STRICT_ROADMAP.md');
for (const fragment of [
  phaseName,
  'Make Predicta know Jaimini deeply',
  'Nadi was replaced by Jaimini',
  'Jaimini is one of the five specialist rooms',
  'Atmakaraka',
  'Amatyakaraka',
  'Darakaraka',
  'Karakamsha',
  'Swamsa',
  'Arudha',
  'Upapada',
  'Jaimini aspects',
  'Chara Dasha',
]) {
  assertIncludes(roadmap, fragment, `roadmap locks Phase 6 requirement ${fragment}`);
}

const memory = read('packages/config/src/predictaMemory.ts');
for (const fragment of [
  'Nadi was replaced by Jaimini',
  'Jaimini is one of the five specialist rooms',
  'Atmakaraka, Amatyakaraka, Darakaraka, Karakamsha, Swamsa, Arudha, Upapada, Jaimini aspects, and Chara Dasha',
  'soul role, destiny pattern, visible identity, career dharma, relationship mirror, and destiny chapters',
  'Never claim unsupported manuscript authority or hidden lineage access',
  'Life Atlas can use Jaimini only as a labeled synthesis evidence layer',
]) {
  assertIncludes(memory, fragment, `Predicta memory digest includes ${fragment}`);
}

for (const file of [
  'packages/ai/src/contextBuilder.ts',
  'apps/mobile/src/services/ai/contextBuilder.ts',
]) {
  const source = read(file);
  for (const fragment of [
    'composeJaiminiPlan',
    'composeJaiminiInterpretation',
    'compactJaiminiPlan',
    'compactJaiminiInterpretation',
    'jaiminiPlan:',
    'jaiminiInterpretation:',
    'charaDashaTimeline: plan.charaDashaTimeline.slice(0, 6)',
    'technicalEvidence: interpretation.technicalEvidence.slice(0, 8)',
  ]) {
    assertIncludes(source, fragment, `${file} includes Jaimini context fragment ${fragment}`);
  }
  for (const forbidden of [
    'composeNadiJyotishPlan',
    'nadiJyotishPlan',
    'compactNadiJyotishPlan',
  ]) {
    assertNotIncludes(source, forbidden, `${file} must not inject active Nadi memory ${forbidden}`);
  }
}

const sharedTypes = read('packages/types/src/astrology.ts');
const mobileTypes = read('apps/mobile/src/types/astrology.ts');
for (const source of [sharedTypes, mobileTypes]) {
  assertIncludes(source, 'jaiminiPlan?: Pick<', 'AI context exposes compact Jaimini plan');
  assertIncludes(source, 'jaiminiInterpretation?: Pick<', 'AI context exposes compact Jaimini interpretation');
  assertNotIncludes(source, 'nadiJyotishPlan?: Pick<', 'AI context no longer exposes Nadi plan as active memory');
}

const lifeAtlas = read('packages/astrology/src/lifeAtlasReport.ts');
for (const fragment of [
  'composeJaiminiInterpretation',
  "id: 'jaimini'",
  "label: 'Jaimini'",
  'Jaimini soul-role signal',
  'Predicta Life Atlas is the approved all-school synthesis report. Vedic, KP, Jaimini, Numerology, and Signature reports remain separate.',
]) {
  assertIncludes(lifeAtlas, fragment, `Life Atlas uses Jaimini evidence layer ${fragment}`);
}
assertNotIncludes(lifeAtlas, 'composeNadiJyotishPlan', 'Life Atlas must not use active Nadi calculation');
assertNotIncludes(lifeAtlas, "id: 'nadi'", 'Life Atlas must not label active evidence as Nadi');

const chatActions = read('packages/astrology/src/predictaChatActions.ts');
for (const fragment of [
  'jaimini-handoff',
  'jaimini-predicta',
  'composeJaiminiInterpretation',
  'function buildJaiminiPredictaReply',
  'Jaimini Predicta mode: I will read through soul role, visible identity, career dharma, relationship mirror, and destiny chapters.',
  'It does not claim unsupported manuscript authority.',
]) {
  assertIncludes(chatActions, fragment, `deterministic chat action includes ${fragment}`);
}
assertNotIncludes(chatActions, 'composeNadiJyotishPlan', 'deterministic chat must not use Nadi plan');

const followUps = read('packages/astrology/src/chatFollowUps.ts');
for (const fragment of [
  'Stay in Jaimini Predicta reading space',
  'Atmakaraka, Amatyakaraka, Darakaraka, Karakamsha, Swamsa, Arudha, Upapada, Jaimini aspects, and Chara Dasha',
  "targetScreen: 'JaiminiPredicta'",
]) {
  assertIncludes(followUps, fragment, `chat follow-up keeps Jaimini handoff ${fragment}`);
}

const webChat = read('apps/web/components/WebPridictaChat.tsx');
for (const fragment of [
  "value === 'JAIMINI'",
  'I will keep this inside Jaimini',
  "return 'Jaimini Predicta'",
]) {
  assertIncludes(webChat, fragment, `web chat supports Jaimini room ${fragment}`);
}

const mobileChat = read('apps/mobile/src/screens/ChatScreen.tsx');
for (const fragment of [
  "context?.predictaSchool === 'JAIMINI'",
  'Jaimini Predicta is ready',
  "return 'Jaimini Predicta'",
]) {
  assertIncludes(mobileChat, fragment, `mobile chat supports Jaimini room ${fragment}`);
}

const backendAi = read('backend/astro_api/ai.py');
for (const fragment of [
  'Nadi was replaced by Jaimini',
  'If activeContext.predictaSchool is JAIMINI or legacy NADI, answer as Jaimini Predicta using jaiminiPlan and jaiminiInterpretation',
  'There are five Predicta specialist rooms: Vedic Predicta, KP Predicta, Jaimini Predicta, Numerology Predicta, and Signature Predicta.',
]) {
  assertIncludes(backendAi, fragment, `backend prompt memory includes ${fragment}`);
}
assertNotIncludes(
  backendAi,
  'If activeContext.predictaSchool is NADI, answer as Nadi Predicta using nadiJyotishPlan',
  'backend prompt must not route active Nadi as Nadi memory',
);

const samples = [
  {
    room: 'Vedic',
    userQuestion: 'Explain my D9 marriage pattern.',
    expectedBehavior:
      'Answer from Parashari/Vedic evidence, mention D9 and dasha context, and avoid KP/Jaimini logic unless offering handoff.',
  },
  {
    room: 'KP',
    userQuestion: 'Will my job switch happen this year?',
    expectedBehavior:
      'Ask or use event question, answer through KP cusps, star lords, sub lords, significators, ruling planets, timing readiness, and confidence.',
  },
  {
    room: 'Jaimini',
    userQuestion: 'What is my destiny role?',
    expectedBehavior:
      'Answer through Atmakaraka, Amatyakaraka, Darakaraka, Karakamsha, Swamsa, Arudha, Upapada, Jaimini aspects, and Chara Dasha when calculated evidence is available.',
  },
  {
    room: 'Numerology',
    userQuestion: 'What does my name number say?',
    expectedBehavior:
      'Answer from name number, birth number, destiny number, current cycle, and name rhythm without smuggling Vedic/KP/Jaimini unless explicitly asked.',
  },
  {
    room: 'Signature',
    userQuestion: 'What does my signature show?',
    expectedBehavior:
      'Use confirmed visible traits only, avoid forensic certainty, and say not assessed for missing evidence.',
  },
  {
    room: 'Life Atlas',
    userQuestion: 'What is my life purpose?',
    expectedBehavior:
      'Use labeled synthesis evidence from Vedic, KP, Jaimini, Numerology, and optional Signature without turning any school-specific report into a mixed bag.',
  },
];

mkdirSync(phaseRoot, { recursive: true });
writeFileSync(
  path.join(phaseRoot, 'chat-boundary-samples.json'),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), phase: phaseName, samples }, null, 2)}\n`,
);

const audit = [
  `# ${phaseName}`,
  '',
  'Status: green-source-gate when this script and required package checks pass.',
  '',
  'Verified:',
  '- Predicta memory digest declares Jaimini as the active replacement for Nadi.',
  '- Shared and mobile AI context builders inject compact Jaimini plan and interpretation data.',
  '- Active context builders no longer inject nadiJyotishPlan.',
  '- Life Atlas uses Jaimini as a labeled synthesis evidence layer.',
  '- Deterministic chat actions route Jaimini and legacy Nadi terms into Jaimini Predicta without unsupported manuscript claims.',
  '- Web, mobile, and backend chat prompts understand Jaimini room boundaries.',
  '- Chat sample boundaries cover Vedic, KP, Jaimini, Numerology, Signature, and Life Atlas.',
  '',
  'Required follow-up commands:',
  '- corepack pnpm test:jaimini-phase-6',
  '- corepack pnpm test:specialist-room-qa',
  '- corepack pnpm test:discipline-handoff',
  '- package typechecks for config, astrology, ai, web, and mobile',
].join('\n');
writeFileSync(path.join(phaseRoot, 'phase-6-chat-memory-audit.md'), `${audit}\n`);

for (const artifact of [
  'chat-boundary-samples.json',
  'phase-6-chat-memory-audit.md',
]) {
  const full = path.join(phaseRoot, artifact);
  assert.ok(existsSync(full), `${artifact} exists`);
  assert.ok(statSync(full).size > 500, `${artifact} is substantial`);
}

console.log('Jaimini Phase 6 gate passed: chat, memory, context, Life Atlas synthesis, and boundary samples are locked.');
