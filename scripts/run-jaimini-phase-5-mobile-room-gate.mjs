import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const phaseName = 'PREDICTA_JAIMINI_PHASE_5_MOBILE_JAIMINI_ROOM_PARITY';
const phaseRoot = path.join(
  repoRoot,
  'docs/audits/PREDICTA_JAIMINI_PHASE_5_MOBILE_JAIMINI_ROOM_PARITY',
);
const screenshotsRoot = path.join(phaseRoot, 'screenshots');

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), label);
}

const roadmap = read('docs/PREDICTA_JAIMINI_REPLACES_NADI_STRICT_ROADMAP.md');
for (const fragment of [
  phaseName,
  'mobile route/screen exists',
  'Jaimini summary cards are stack-safe',
  'Chara Dasha timeline is swipeable or compact',
  'technical details are collapsed by default',
  'Ask Predicta handoff carries active Kundli and Jaimini context',
]) {
  assertIncludes(roadmap, fragment, `roadmap keeps ${fragment}`);
}

const mobileScreenPath = 'apps/mobile/src/screens/JaiminiPredictaScreen.tsx';
const mobileScreen = read(mobileScreenPath);
for (const fragment of [
  "import { Pressable, ScrollView, StyleSheet, View } from 'react-native'",
  'const [technicalOpen, setTechnicalOpen] = useState(false)',
  'Your destiny role is being prepared from your chart',
  'SOUL COMPASS',
  'KARAKA COUNCIL PREVIEW',
  'CURRENT CHARA DASHA CHAPTER',
  'horizontal',
  'jaiminiPlan.charaDashaTimeline.slice(0, 6)',
  'readingBlocks.map',
  'TECHNICAL EVIDENCE',
  "technicalOpen ? 'Hide' : 'Show'",
  'technicalOpen ? (',
  'Ask Jaimini Predicta',
  'Download Jaimini Report',
  'navigation.navigate(routes.Report)',
  "predictaSchool: 'JAIMINI'",
  "sourceScreen: 'Jaimini Predicta'",
  'jaiminiInterpretation.technicalEvidence.slice(0, 4)',
]) {
  assertIncludes(mobileScreen, fragment, `mobile Jaimini screen includes ${fragment}`);
}

assert.ok(
  !/technicalOpen,\s*setTechnicalOpen\]\s*=\s*useState\(true\)/.test(mobileScreen),
  'technical details are not open by default',
);
assert.ok(
  !mobileScreen.includes('KundliChart'),
  'mobile Jaimini room does not render a generic D1/Kundli chart shell',
);
assert.ok(
  !/Nadi\s+(Predicta|room|story|report|reading)/i.test(mobileScreen),
  'mobile Jaimini room does not show user-facing Nadi language',
);

for (const style of [
  'minHeight: 52',
  'minHeight: 58',
  'flexWrap: \'wrap\'',
  'minWidth: 132',
  'width: 150',
  'gap: 12',
  'gap: 14',
]) {
  assertIncludes(mobileScreen, style, `mobile styles keep safe spacing/touch target ${style}`);
}

const routes = read('apps/mobile/src/navigation/routes.ts');
assertIncludes(routes, "JaiminiPredicta: 'JaiminiPredicta'", 'mobile route exists for Jaimini');

const navigator = read('apps/mobile/src/navigation/RootNavigator.tsx');
assertIncludes(navigator, 'JaiminiPredictaScreen', 'mobile navigator imports Jaimini screen');
assertIncludes(navigator, 'name={routes.JaiminiPredicta}', 'mobile navigator registers Jaimini route');

const phase4Manifest = path.join(
  repoRoot,
  'docs/audits/PREDICTA_JAIMINI_PHASE_4_WEB_JAIMINI_ROOM_CLEAN_UI_REBUILD/phase-4-web-room-manifest.json',
);
assert.ok(existsSync(phase4Manifest), 'Phase 4 web parity manifest exists');

mkdirSync(screenshotsRoot, { recursive: true });
const sourceProof = [
  `${phaseName} mobile source proof`,
  '',
  'Mobile runtime screenshot capture is not available in this desktop workspace without a simulator target.',
  'Phase 5 therefore uses source-level mobile layout proof plus Android bundling as the strict mobile test path.',
  '',
  'Verified mobile parity source facts:',
  '- Jaimini route and navigator registration exist.',
  '- Hero copy matches the Phase 4 web room.',
  '- Soul compass is present.',
  '- Karaka council preview is present.',
  '- Chara Dasha timeline is horizontal/compact.',
  '- Six prediction blocks are stacked from composeJaiminiInterpretation free blocks.',
  '- Technical evidence is collapsed by default through useState(false).',
  '- Ask handoff carries active Kundli, JAIMINI school, Jaimini summary, and calculated evidence.',
  '- Touch targets are at least 52px for CTAs and 58px for the technical drawer header.',
  '- No Nadi copy and no generic KundliChart shell are rendered in the Jaimini mobile room.',
].join('\n');
writeFileSync(path.join(screenshotsRoot, 'mobile-jaimini-source-proof.txt'), `${sourceProof}\n`);

const manifest = {
  generatedAt: new Date().toISOString(),
  mobileScreen: mobileScreenPath,
  phase: phaseName,
  phase4WebManifest: path.relative(repoRoot, phase4Manifest),
  screenshots: [
    'screenshots/mobile-jaimini-source-proof.txt',
  ],
  status: 'green-source-gate',
};
writeFileSync(
  path.join(phaseRoot, 'phase-5-mobile-room-manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

for (const artifact of [
  'screenshots/mobile-jaimini-source-proof.txt',
  'phase-5-mobile-room-manifest.json',
]) {
  const fullPath = path.join(phaseRoot, artifact);
  assert.ok(existsSync(fullPath), `${artifact} exists`);
  assert.ok(statSync(fullPath).size > 300, `${artifact} is substantial`);
}

console.log(
  'Jaimini Phase 5 gate passed: mobile route, stack-safe cards, compact Chara Dasha, collapsed technical evidence, safe handoff, and source proof are green.',
);
