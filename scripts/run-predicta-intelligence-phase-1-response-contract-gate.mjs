import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const source = readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const repoRoot = process.cwd();
const phaseName = 'PREDICTA_INTELLIGENCE_PHASE_1_MASTER_ASTROLOGER_RESPONSE_CONTRACT';
const phase0Name = 'PREDICTA_INTELLIGENCE_PHASE_0_CURRENT_CHAT_REDLINE_AND_PERSONA_LOCK';
const failures = [];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function exists(relativePath) {
  return existsSync(path.join(repoRoot, relativePath));
}

function assertGate(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function assertIncludes(source, fragment, label) {
  assertGate(source.includes(fragment), `${label}: missing ${fragment}`);
}

function assertExcludes(source, fragment, label) {
  assertGate(!source.includes(fragment), `${label}: forbidden ${fragment}`);
}

[
  `docs/audits/${phase0Name}/persona-contract.md`,
  `docs/audits/${phase0Name}/broken-record-phrase-ledger.md`,
  `docs/audits/${phase0Name}/chat-redline-transcript-set.md`,
  `docs/audits/${phase0Name}/verification.txt`,
  'packages/astrology/src/predictaResponseContract.ts',
  'packages/astrology/src/index.ts',
  'backend/astro_api/ai.py',
  'packages/astrology/src/predictaChatActions.ts',
  'apps/web/components/WebPridictaChat.tsx',
  'apps/mobile/src/screens/ChatScreen.tsx',
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const {
  PREDICTA_MASTER_RESPONSE_SEQUENCE,
  PREDICTA_RESPONSE_MODES,
  buildPredictaResponseContractInstruction,
  validatePredictaMasterResponse,
} = require('../packages/astrology/src/predictaResponseContract.ts');

assert.deepEqual(PREDICTA_MASTER_RESPONSE_SEQUENCE, [
  'direct_answer',
  'timing_or_trigger',
  'meaning_for_user',
  'action_or_remedy',
  'confidence_and_caution',
  'evidence_after_value',
]);

for (const mode of [
  'quick_answer',
  'event_prediction',
  'chart_report_explanation',
  'remedy_guidance',
  'app_action',
  'missing_data',
  'safety_sensitive',
]) {
  assertGate(PREDICTA_RESPONSE_MODES[mode], `missing response mode ${mode}`);
}

const instruction = buildPredictaResponseContractInstruction();
[
  'Give the direct answer first',
  'timing or real-world trigger',
  'what it means for this user',
  'action, remedy, or next step',
  'confidence, uncertainty, and safety boundaries',
  'evidence after the user has received value',
  'Never open with definitions',
].forEach(fragment => assertIncludes(instruction, fragment, 'contract instruction'));

const goodAnswers = [
  'Direct answer: career movement is possible in the next practical window, but the trigger looks stronger through an existing team than a cold outside offer.\n\nWhat to do now: prepare your internal pitch and keep documents ready.\n\nEvidence: timing and career proof can sit here after the answer.',
  'Likely: the relationship conversation can improve if you keep the next two weeks calm and specific.\n\nConfidence: medium, because timing support is visible but not absolute.',
  'Needs clarity: I need your birth time or confirmed unknown-time path before I give exact event timing.\n\nWhat I can still do: read broad life themes without timing certainty.',
  'I can start with career readiness now. For a final KP verdict, choose job change, promotion, foreign transfer, or write your exact question.',
];

for (const answer of goodAnswers) {
  const result = validatePredictaMasterResponse(answer);
  assertGate(result.isGreen, `good answer failed contract: ${JSON.stringify(result.issues)}`);
}

const badAnswers = [
  'This house represents foreign travel, expenses, and settlement, so we need to inspect the chart.',
  'KP uses cusps, star lords, sub lords, significators, and ruling planets before it can answer.',
  'Chart evidence:\n- D10 governs career.\n\nDirect answer: maybe.',
  'Provider decision: local_memory_answer. No AI credit is needed.\n\nYour Dosh is active.',
  'Premium adds deeper timing and proof. Direct answer comes after payment.',
  'This section helps you understand the Mahadasha table and how to read it.',
];

for (const answer of badAnswers) {
  const result = validatePredictaMasterResponse(answer);
  assertGate(!result.isGreen, `bad answer passed contract: ${answer}`);
}

const backendPrompt = read('backend/astro_api/ai.py');
[
  'Predicta master response contract: answer first',
  'evidence after value',
  'lived prediction and practical guidance first',
  'Evidence proves the answer; it must not replace the answer.',
  'Use a master-astrologer structure',
].forEach(fragment => assertIncludes(backendPrompt, fragment, 'backend prompt'));
[
  "For every chart-based answer, include a 'Chart evidence' section",
  'Use an audit-friendly but friendly structure',
].forEach(fragment => assertExcludes(backendPrompt, fragment, 'backend prompt'));

const actions = read('packages/astrology/src/predictaChatActions.ts');
[
  'Direct answer: your Kundli Karma snapshot is ready',
  'Direct answer: Kundli Karma covers Dosh, Shrap, Yog, and Lal Kitab',
  'This answer uses your calculated Predicta memory. No AI credit is needed.',
].forEach(fragment => assertIncludes(actions, fragment, 'Kundli Karma chat actions'));
[
  'Kundli Karma local memory is ready. No AI model is needed for this answer.',
  'Provider decision: local_memory_answer. No AI credit is needed.',
  'Ask like:',
].forEach(fragment => assertExcludes(actions, fragment, 'Kundli Karma chat actions'));

const webChat = read('apps/web/components/WebPridictaChat.tsx');
[
  'I will answer with the verdict, timing, trigger, and next step first',
  'I will answer with the Vedic prediction, timing, and practical guidance first',
  'I will answer from here, directly and clearly.',
].forEach(fragment => assertIncludes(webChat, fragment, 'web chat handoff copy'));
assertExcludes(webChat, 'The answer will now stay grounded in', 'web chat handoff copy');

const mobileChat = read('apps/mobile/src/screens/ChatScreen.tsx');
[
  'I will start with the KP verdict, timing, trigger, and next step.',
  'I will start with Vedic prediction, timing, and practical guidance.',
  'Ask your follow-up and I will answer directly from this context.',
].forEach(fragment => assertIncludes(mobileChat, fragment, 'mobile chat handoff copy'));
[
  'The answer will now stay grounded in',
  'Press Ask, or type your follow-up.',
].forEach(fragment => assertExcludes(mobileChat, fragment, 'mobile chat handoff copy'));

const indexSource = read('packages/astrology/src/index.ts');
assertIncludes(indexSource, "export * from './predictaResponseContract';", 'astrology exports');

if (failures.length) {
  console.error(`${phaseName} failed`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`${phaseName}: GREEN`);
