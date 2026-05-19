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

assert.match(pdfSource, /signatureAnalysis\?: SignatureAnalysisModel/);
assert.match(pdfSource, /function buildSignatureReportSection/);
assert.match(pdfSource, /function buildSignatureNumerologySynthesisSection/);
assert.match(pdfSource, /Signature Predicta premium synthesis/);
assert.match(pdfSource, /Numerology \+ Signature synthesis/);
assert.match(pdfSource, /identity verification or handwriting forensics/);
assert.match(pdfSource, /No identity, legal, medical, hiring, or certainty claims/);

assert.match(webSource, /SIGNATURE_DRAFT_STORAGE_KEY/);
assert.match(webSource, /setSignatureAnalysis\(loadSignatureAnalysisDraft\(\)\)/);
assert.match(webSource, /signatureAnalysis,\n\s+\}\),/);
assert.match(webSource, /Signature Predicta and improvement plan/);
assert.match(webSource, /Detailed trait comparison, improvement plan/);

assert.match(pricingSource, /\| 'SIGNATURE'/);
assert.match(pricingSource, /id: 'SIGNATURE'/);
assert.match(pricingSource, /Signature Report/);
assert.match(pricingSource, /Numerology \+ Signature synthesis/);

assert.match(labelSource, /"Signature Predicta premium synthesis"/);
assert.match(labelSource, /"Numerology \+ Signature synthesis"/);
assert.match(labelSource, /"SIGNATURE \+ NUMEROLOGY"/);

console.log('Signature report synthesis passed: 19 deterministic assertions.');
