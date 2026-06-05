import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const phaseName = 'PREDICTA_REPORT_FINAL_PHASE_8_SIGNATURE_REPORT_REBUILD';
const auditDir = `docs/audits/${phaseName}`;
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function assertIncludes(source, needle, label) {
  assert(source.includes(needle), `${label} is missing ${needle}`);
}

function assertNotIncludes(source, needle, label) {
  assert(!source.includes(needle), `${label} must not include ${needle}`);
}

function sliceFunction(source, functionName) {
  const start = source.indexOf(`function ${functionName}`);
  if (start === -1) {
    return '';
  }

  const next = source.indexOf('\nfunction ', start + 1);
  return source.slice(start, next === -1 ? source.length : next);
}

[
  'docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md',
  'packages/pdf/src/index.ts',
  'packages/pdf/src/signatureReportValueContract.ts',
  'apps/web/app/api/report/pdf/route.ts',
  'apps/mobile/src/screens/ReportScreen.tsx',
  `${auditDir}/signature-report-rebuild-audit.md`,
  `${auditDir}/phase-8-signature-report-rebuild-manifest.json`,
].forEach(file => assert(exists(file), `missing required file: ${file}`));

const roadmap = read('docs/PREDICTA_REPORTS_FINAL_VALUE_REBUILD_STRICT_PHASES.md');
[
  phaseName,
  'Add a Signature-specific report value contract',
  'Signature reports must preserve technical evidence through input readiness',
  'Signature reports must not generate when there is no uploaded, drawn, or',
  'Signature reports must not embed raw signature images by default',
  'Free Signature must include confirmed trait map',
  'Premium Signature must add refinement planning',
  'Signature must not make hard personality certainty',
].forEach(fragment => assertIncludes(roadmap, fragment, 'final report roadmap Phase 8'));

const contract = read('packages/pdf/src/signatureReportValueContract.ts');
[
  'SIGNATURE_FINAL_REPORT_REQUIRED_MODULES',
  'SIGNATURE_FINAL_REPORT_SECTION_ORDER',
  'buildSignatureReportValueContract',
  'Signature Input Readiness',
  'Confirmed Visible Trait Map',
  'Privacy and Session Handling',
  'Expression Reflection Opening',
  'Confidence Expression',
  'Writing Rhythm',
  'Consistency Profile',
  'Strengths and Care Points',
  'Improvement Practices',
  'Premium Refinement Plan',
  'Premium Multi-sample Comparison Readiness',
  'What This Can and Cannot Tell You',
  'Signature report without confirmed visible traits',
  'Empty signature accepted as ready',
  'Raw signature image embedded by default',
  'Raw signature image stored in report output',
  'Hard personality certainty',
  'Future prediction from signature traits',
  'Forensic handwriting analysis claim',
  'Identity verification claim',
  'Trait claims without visible evidence',
].forEach(fragment => assertIncludes(contract, fragment, 'Signature report value contract source'));

const pdfIndex = read('packages/pdf/src/index.ts');
[
  "from './signatureReportValueContract'",
  'buildSignatureReportValueContract',
  'buildSignatureReportSections',
  'What your signature is reflecting',
  'What your signature is reflecting with premium depth',
  'Signature Input Required',
  'Confirmed Visible Trait Map',
  'Confidence, Rhythm, and Consistency',
  'Strengths, Care Points, and Practices',
  'What This Can and Cannot Tell You',
].forEach(fragment => assertIncludes(pdfIndex, fragment, 'PDF Signature report composition'));

const signatureSections = sliceFunction(pdfIndex, 'buildSignatureReportSections');
[
  'signatureValueContract.openingReflection',
  'signatureValueContract.freeDepthPromise',
  'signatureValueContract.paidDepthPromise',
  'signatureValueContract.actionPromise',
  'What your signature is reflecting',
  'What your signature is reflecting with premium depth',
  'Confirmed Visible Trait Map',
  'Confidence, Rhythm, and Consistency',
  'Strengths, Care Points, and Practices',
  'Premium Refinement Plan',
  'What This Can and Cannot Tell You',
  'Only confirmed visible traits are used.',
].forEach(fragment => assertIncludes(signatureSections, fragment, 'Signature section builder'));
assertNotIncludes(signatureSections, 'Signature prediction:', 'Signature section builder');
assertNotIncludes(signatureSections, 'hard fixed-personality', 'Signature section builder');
assertNotIncludes(signatureSections, 'future prediction', 'Signature section builder');
assertNotIncludes(signatureSections, 'forensic proof', 'Signature section builder');
assertNotIncludes(signatureSections, 'Numerology or Vedic synthesis', 'Signature section builder');

const route = read('apps/web/app/api/report/pdf/route.ts');
[
  "normalizedPayload.reportFocus === 'SIGNATURE'",
  '!hasReadySignatureAnalysis(normalizedPayload.signatureAnalysis)',
  'A confirmed signature sample is required before creating a Signature report.',
  'trait.confirmationState ===',
].forEach(fragment => assertIncludes(route, fragment, 'web Signature report API readiness gate'));

const mobileReport = read('apps/mobile/src/screens/ReportScreen.tsx');
[
  "selectedReportId === 'SIGNATURE'",
  'Signature reports require a confirmed signature sample.',
  'Open Signature',
].forEach(fragment => assertIncludes(mobileReport, fragment, 'mobile Signature report readiness gate'));

const audit = read(`${auditDir}/signature-report-rebuild-audit.md`);
[
  'Verdict: GREEN',
  'reflective expression report',
  'What your signature is reflecting',
  'Confirmed Visible Trait Map',
  'Premium Refinement Plan',
  'Signature report without confirmed visible traits',
].forEach(fragment => assertIncludes(audit, fragment, 'Phase 8 audit'));

const manifest = readJson(`${auditDir}/phase-8-signature-report-rebuild-manifest.json`);
assert(manifest.phase === phaseName, 'manifest phase mismatch');
assert(manifest.status === 'GREEN', 'manifest must be GREEN');
assert(manifest.signatureValueContractSource === 'packages/pdf/src/signatureReportValueContract.ts', 'manifest source mismatch');
assert(manifest.reflectionOpeningInserted === true, 'manifest must record reflection opening');
assert(manifest.confirmedTraitsRequired === true, 'manifest must record confirmed trait requirement');
assert(manifest.rawSignatureImageForbidden === true, 'manifest must record raw image rule');
assert(manifest.reportLane === 'SIGNATURE', 'manifest lane must be SIGNATURE');

[
  'Signature Input Readiness',
  'Confirmed Visible Trait Map',
  'Privacy and Session Handling',
  'Expression Reflection Opening',
  'Confidence Expression',
  'Writing Rhythm',
  'Consistency Profile',
  'Strengths and Care Points',
  'Improvement Practices',
  'Premium Refinement Plan',
  'Premium Multi-sample Comparison Readiness',
  'What This Can and Cannot Tell You',
].forEach(module => assert(manifest.requiredModules?.includes(module), `manifest missing Signature module ${module}`));

[
  'phase8AuditExists',
  'phase8GatePasses',
  'signatureValueContractSourceExists',
  'requiredSignatureModulesLocked',
  'signatureReflectionOpeningUsed',
  'confirmedTraitsRequired',
  'rawSignatureImageForbidden',
  'technicalEvidenceAfterReflection',
  'schoolBoundaryLocked',
].forEach(key => assert(manifest.greenCriteria?.[key] === true, `manifest greenCriteria.${key} must be true`));

if (failures.length) {
  console.error(`${phaseName} failed:`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`${phaseName} passed.`);
