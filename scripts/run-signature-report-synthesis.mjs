import { strict as assert } from 'node:assert';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const pdfSource = await readFile(
  path.join(repoRoot, 'packages/pdf/src/index.ts'),
  'utf8',
);
const webSource = await readFile(
  path.join(repoRoot, 'apps/web/components/WebDossierPreview.tsx'),
  'utf8',
);
const pricingSource = await readFile(
  path.join(repoRoot, 'packages/config/src/pricing.ts'),
  'utf8',
);
const labelSource = await readFile(
  path.join(repoRoot, 'packages/pdf/src/translations/reportLabels.json'),
  'utf8',
);
const modelSource = await readFile(
  path.join(repoRoot, 'packages/astrology/src/signatureAnalysisModel.ts'),
  'utf8',
);

assert.match(pdfSource, /signatureAnalysis\?: SignatureAnalysisModel/);
assert.match(pdfSource, /function buildSignatureReportSection/);
assert.match(pdfSource, /Signature Predicta premium synthesis/);
assert.match(pdfSource, /identity verification or handwriting forensics/);
assert.match(modelSource, /Predicta did not store your signature image/);
assert.match(pdfSource, /What this can and cannot tell you/);

assert.match(webSource, /SIGNATURE_DRAFT_STORAGE_KEY/);
assert.match(webSource, /setSignatureAnalysis\(loadSignatureAnalysisDraft\(\)\)/);
assert.match(webSource, /signatureAnalysis,\n\s+\}\),/);
assert.match(webSource, /Signature Predicta and improvement plan/);
assert.match(webSource, /multi-sample comparison, before\/after guidance/);

assert.match(pricingSource, /\| 'SIGNATURE'/);
assert.match(pricingSource, /id: 'SIGNATURE'/);
assert.match(pricingSource, /Signature Report/);
assert.match(pricingSource, /Signature Report/);

assert.match(labelSource, /"Signature Predicta premium synthesis"/);
assert.match(labelSource, /"SIGNATURE"/);

console.log('Signature report synthesis passed: strict privacy and report assertions.');
