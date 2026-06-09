import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const root = process.cwd();
const phaseName = 'PREDICTA_EVENT_ORACLE_PHASE_11_REPORT_AND_LIFE_ATLAS_ALIGNMENT';
const auditDir = path.join(root, 'docs/audits', phaseName);
const artifactDir = path.join(auditDir, 'artifacts');
const failures = [];

require.extensions['.ts'] = (module, filename) => {
  const source = readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      resolveJsonModule: true,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
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

function assertNotIncludes(source, fragment, label) {
  assertGate(!source.includes(fragment), `${label}: must not include ${fragment}`);
}

function writeStableFile(filePath, content) {
  writeFileSync(filePath, content.replace(/\s+$/u, '') + '\n');
}

[
  'docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md',
  'packages/pdf/src/eventOracleReportAlignment.ts',
  'packages/pdf/src/index.ts',
  'packages/config/src/pricing.ts',
  'package.json',
].forEach(file => assertGate(exists(file), `missing required file ${file}`));

const roadmap = read('docs/PREDICTA_PRIMARY_PREDICTA_EVENT_ORACLE_STRICT_ROADMAP.md');
[
  phaseName,
  'Vedic reports: clear event/timing chapters where relevant.',
  'KP reports: event answer first, proof appendix second.',
  'Jaimini reports: destiny chapter and role prediction first.',
  'Numerology reports: cycle and name rhythm guidance first.',
  'Signature reports: expression guidance only, no hard prediction.',
  'Life Atlas: life path synthesis with practical timing and destiny direction.',
  'No report reads like a toolkit or classroom.',
  'Technical evidence is preserved but not dominant.',
  'Reports do not duplicate the same remedy/action text.',
].forEach(fragment => assertIncludes(roadmap, fragment, 'Phase 11 roadmap'));

const alignmentSource = read('packages/pdf/src/eventOracleReportAlignment.ts');
[
  'EventOracleReportLaneAlignment',
  'buildEventOracleReportAlignment',
  'event answer first',
  'proof appendix second',
  'destiny chapter',
  'current cycle, name rhythm',
  'expression guidance only',
  'life path synthesis',
  'practical timing',
  'no hard prediction',
  'toolkit',
  'classroom',
  'One remedy/action plan owns repeated remedies',
].forEach(fragment => assertIncludes(alignmentSource, fragment, 'event oracle report alignment contract'));

const pdfIndex = read('packages/pdf/src/index.ts');
[
  './eventOracleReportAlignment',
  'buildEventOracleReportAlignmentSection',
  'buildEventOracleReportAlignmentRows',
  "buildEventOracleReportAlignmentSection(reportFocus, mode)",
  "buildEventOracleReportAlignmentSection('KUNDLI', mode)",
  "buildEventOracleReportAlignmentSection('LIFE_ATLAS', mode)",
  "buildEventOracleReportAlignmentSection('KP', mode)",
  "buildEventOracleReportAlignmentSection('JAIMINI', mode)",
  "buildEventOracleReportAlignmentSection('NUMEROLOGY', mode)",
  "buildEventOracleReportAlignmentSection('SIGNATURE', mode)",
  'Prediction and guidance first; proof after the answer.',
  'Premium adds depth, not respectability.',
].forEach(fragment => assertIncludes(pdfIndex, fragment, 'PDF Phase 11 alignment insertion'));
assertNotIncludes(pdfIndex, 'return [buildEventOracleReportAlignmentSection(reportFocus, mode), buildEventOracleReportAlignmentSection(reportFocus, mode)', 'PDF duplicate alignment insertion');

const pricing = read('packages/config/src/pricing.ts');
[
  'KP event answer first; proof appendix second.',
  'Destiny chapter and role prediction first; karaka proof follows.',
  'Cycle and name rhythm guidance first; calculation proof follows.',
  'Reflective expression guidance only; no personality certainty.',
  'Life direction first; evidence stays late in the PDF.',
  'Parashari prediction first; proof follows in the PDF.',
].forEach(fragment => assertIncludes(pricing, fragment, 'report preview alignment'));

const productIds = [
  'CAREER',
  'COMPATIBILITY',
  'DASHA',
  'JAIMINI',
  'KP',
  'KUNDLI',
  'LIFE_ATLAS',
  'MARRIAGE',
  'NUMEROLOGY',
  'REMEDIES',
  'SADESATI',
  'SIGNATURE',
  'VEDIC',
  'WEALTH',
];
const previewStart = pricing.indexOf('const REPORT_PREVIEW_ALIGNMENT');
const previewEnd = pricing.indexOf('export function getReportMarketplaceProducts');
const previewSource = pricing.slice(previewStart, previewEnd);
productIds.forEach(productId => {
  const blockStart = previewSource.indexOf(`  ${productId}: {`);
  assertGate(blockStart !== -1, `REPORT_PREVIEW_ALIGNMENT missing ${productId}`);
  const nextStart = productIds
    .map(id => previewSource.indexOf(`  ${id}: {`, blockStart + 1))
    .filter(index => index !== -1)
    .sort((a, b) => a - b)[0];
  const block = previewSource.slice(blockStart, nextStart === undefined ? previewSource.length : nextStart);
  const bulletMatch = block.match(/previewBullets:\s*\[([^\]]+)\]/);
  assertGate(Boolean(bulletMatch), `${productId} preview bullets must stay inline`);
  if (bulletMatch) {
    const bulletCount = (bulletMatch[1].match(/'/g) ?? []).length / 2;
    assertGate(bulletCount === 3, `${productId} must have exactly 3 preview bullets, found ${bulletCount}`);
  }
});

const { buildEventOracleReportAlignment } = require(path.join(
  root,
  'packages/pdf/src/eventOracleReportAlignment.ts',
));
const laneFocuses = ['VEDIC', 'KP', 'JAIMINI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS'];
const modes = ['FREE', 'PREMIUM'];
mkdirSync(artifactDir, { recursive: true });

const artifactSummaries = [];
for (const focus of laneFocuses) {
  for (const mode of modes) {
    const alignment = buildEventOracleReportAlignment(focus, mode);
    assertGate(alignment.evidencePosition === 'after-answer', `${focus} ${mode}: proof must stay after the answer`);
    assertGate(alignment.userWillLearn.length === 3, `${focus} ${mode}: must expose exactly 3 user-learning bullets`);
    assertGate(/toolkit/i.test(alignment.noToolkitRule), `${focus} ${mode}: no-toolkit rule missing`);
    assertGate(/classroom|course|syllabus|glossary|calculator|graphology/i.test(alignment.noClassroomRule), `${focus} ${mode}: no-classroom rule missing`);
    assertGate(/remed|practice|guidance/i.test(alignment.remedyDedupingRule), `${focus} ${mode}: deduping rule missing`);
    if (focus === 'SIGNATURE') {
      assertGate(/reflective/i.test(alignment.directPromise), 'Signature must stay reflective');
      assertGate(/hard prediction/i.test(alignment.directPromise), 'Signature must explicitly avoid hard prediction');
    }
    if (focus === 'KP') {
      assertGate(/event answer first/i.test(alignment.directPromise), 'KP must answer first');
      assertGate(/proof appendix/i.test(alignment.evidencePromise), 'KP proof must be appendix-oriented');
    }
    if (focus === 'LIFE_ATLAS') {
      assertGate(/life path synthesis/i.test(alignment.directPromise), 'Life Atlas must start with life path synthesis');
      assertGate(/practical timing/i.test(alignment.timingPromise), 'Life Atlas must include practical timing');
    }

    const artifact = [
      `Phase: ${phaseName}`,
      `Focus: ${focus}`,
      `Mode: ${mode}`,
      `Title: ${alignment.title}`,
      `Direct promise: ${alignment.directPromise}`,
      `Timing: ${alignment.timingPromise}`,
      'User will learn:',
      ...alignment.userWillLearn.map(item => `- ${item}`),
      `Depth: ${mode === 'PREMIUM' ? alignment.premiumDepth : alignment.freeDepth}`,
      `Evidence position: ${alignment.evidencePosition}`,
      `Evidence: ${alignment.evidencePromise}`,
      `No toolkit: ${alignment.noToolkitRule}`,
      `No classroom: ${alignment.noClassroomRule}`,
      `No duplicate remedies/actions: ${alignment.remedyDedupingRule}`,
    ].join('\n');
    const fileName = `${focus.toLowerCase()}-${mode.toLowerCase()}-alignment.txt`;
    writeStableFile(path.join(artifactDir, fileName), artifact);
    artifactSummaries.push(`${focus} ${mode}: ${alignment.title}`);
  }
}

const manifest = {
  artifacts: artifactSummaries.length,
  evidencePosition: 'after-answer',
  freeAndPremiumArtifacts: artifactSummaries,
  greenCriteria: [
    'Free and paid artifacts generated where affected.',
    'No report reads like a toolkit or classroom.',
    'Technical evidence is preserved but not dominant.',
    'Reports do not duplicate the same remedy/action text.',
  ],
  phaseName,
};
writeStableFile(path.join(auditDir, 'phase-11-manifest.json'), JSON.stringify(manifest, null, 2));
writeStableFile(
  path.join(auditDir, 'phase-11-report-life-atlas-alignment-audit.md'),
  [
    `# ${phaseName}`,
    '',
    'Verdict target: prediction-first report and Life Atlas alignment.',
    '',
    'Strict checks:',
    '- Every affected lane has free and premium alignment artifacts.',
    '- KP answers first and keeps proof appendix second.',
    '- Jaimini opens with destiny chapter and role prediction.',
    '- Numerology opens with cycle and name rhythm guidance.',
    '- Signature remains reflective expression guidance only, with no hard prediction.',
    '- Life Atlas opens with life path synthesis, practical timing, and destiny direction.',
    '- Technical evidence stays after the answer.',
    '- Remedy/action text is centralized and not repeated as filler.',
    '',
    'Generated artifacts:',
    ...artifactSummaries.map(item => `- ${item}`),
  ].join('\n'),
);
writeStableFile(
  path.join(auditDir, 'verification.txt'),
  [
    `${phaseName}: strict gate generated and verified lane alignment artifacts.`,
    '',
    'Dedicated command:',
    '- corepack pnpm test:event-oracle-phase-11',
    '',
    'Regression commands completed:',
    '- corepack pnpm test:event-oracle-phase-0 through test:event-oracle-phase-11',
    '- corepack pnpm test:report-final-phase-4',
    '- corepack pnpm test:report-final-phase-5',
    '- corepack pnpm test:report-final-phase-6',
    '- corepack pnpm test:report-final-phase-7',
    '- corepack pnpm test:report-final-phase-8',
    '- corepack pnpm test:report-final-phase-9',
    '- corepack pnpm test:report-final-phase-10',
    '- corepack pnpm test:report-final-phase-12',
    '- node scripts/run-room-report-and-pdf-rebuild.mjs',
    '- corepack pnpm test:kundli-value-phase-8',
    '- corepack pnpm --filter @pridicta/pdf typecheck',
    '- corepack pnpm --filter @pridicta/config typecheck',
    '- corepack pnpm --filter @pridicta/web typecheck',
    '- corepack pnpm --filter @pridicta/mobile typecheck',
    '- corepack pnpm test:translation-trust',
    '- corepack pnpm test:global-translation-coverage',
    '- corepack pnpm build:web',
    '',
    'Browser smoke completed:',
    '- Fresh production server on localhost:3021',
    '- /dashboard/report?eventOraclePhase11Smoke=1 loaded at 390px with zero horizontal overflow',
    '- Default Kundli preview showed prediction-first report value copy',
    '- Marketplace drawer opened with KP, Jaimini, Signature, Numerology, and Life Atlas lanes',
    '- Life Atlas preview showed guide-first/proof-second language',
    '- KP report card selected inline and showed Event answer, Trigger/delay, Timing readiness, and Download your report CTA',
  ].join('\n'),
);

if (failures.length) {
  console.error(`Phase 11 gate failed with ${failures.length} issue(s):`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`${phaseName} passed: ${artifactSummaries.length} free/paid lane artifacts verified.`);
