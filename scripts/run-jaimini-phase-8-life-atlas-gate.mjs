import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const phaseName = 'PREDICTA_JAIMINI_PHASE_8_LIFE_ATLAS_JAIMINI_EVIDENCE_LAYER';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);
const artifactRoot = path.join(auditRoot, 'artifacts');
const previewRoot = path.join(auditRoot, 'previews');
const baseUrl = process.env.PREDICTA_JAIMINI_PHASE8_BASE_URL ?? 'http://127.0.0.1:3009';
const shouldGenerate = process.env.PREDICTA_JAIMINI_PHASE8_GENERATE === '1';

const artifacts = [
  {
    id: 'life-atlas-jaimini-free',
    mode: 'FREE',
    pdf: path.join(artifactRoot, 'predicta-life-atlas-jaimini-free.pdf'),
    payload: path.join(artifactRoot, 'predicta-life-atlas-jaimini-free-payload.json'),
    text: path.join(artifactRoot, 'predicta-life-atlas-jaimini-free-text.txt'),
  },
  {
    id: 'life-atlas-jaimini-premium',
    mode: 'PREMIUM',
    pdf: path.join(artifactRoot, 'predicta-life-atlas-jaimini-premium.pdf'),
    payload: path.join(artifactRoot, 'predicta-life-atlas-jaimini-premium-payload.json'),
    text: path.join(artifactRoot, 'predicta-life-atlas-jaimini-premium-text.txt'),
  },
];

mkdirSync(artifactRoot, { recursive: true });
mkdirSync(previewRoot, { recursive: true });

const roadmap = read('docs/PREDICTA_JAIMINI_REPLACES_NADI_STRICT_ROADMAP.md');
for (const fragment of [
  phaseName,
  'Replace Life Atlas Nadi evidence with Jaimini evidence',
  'Life Atlas input map uses Vedic, KP, Jaimini, Numerology, optional Signature.',
  'Jaimini contributes soul role, visible identity, career dharma, relationship',
  'Life Atlas remains non-technical in the main body.',
  'technical evidence appears only in optional appendix.',
  'Life Atlas text extraction confirms no Nadi references.',
]) {
  assertIncludes(roadmap, fragment, `roadmap locks ${fragment}`);
}

const packageJson = read('package.json');
const lifeAtlas = read('packages/astrology/src/lifeAtlasReport.ts');
const pdfSource = read('packages/pdf/src/index.ts');
const typeSource = read('packages/types/src/astrology.ts');
const mobileTypeSource = read('apps/mobile/src/types/astrology.ts');

assertIncludes(
  packageJson,
  '"test:jaimini-phase-8": "node scripts/run-jaimini-phase-8-life-atlas-gate.mjs"',
  'package exposes Jaimini Phase 8 gate',
);

for (const fragment of [
  'JaiminiLifeAtlasContribution',
  'buildJaiminiLifeAtlasContribution',
  'jaimini-destiny-thread',
  'Jaimini Destiny Thread',
  'soulRole',
  'visibleIdentity',
  'careerDharma',
  'relationshipMirror',
  'currentDestinyChapter',
  'technicalEvidence',
  "label: 'Jaimini'",
  'Vedic, KP, Jaimini, Numerology, and Signature reports remain separate.',
]) {
  assertIncludes(lifeAtlas, fragment, `Life Atlas source includes ${fragment}`);
}

for (const fragment of [
  'jaimini-destiny-thread',
  'technicalEvidence?: string[]',
]) {
  assertIncludes(typeSource, fragment, `shared types include ${fragment}`);
  assertIncludes(mobileTypeSource, fragment, `mobile types include ${fragment}`);
}

for (const fragment of [
  "reportFocus === 'LIFE_ATLAS'",
  'Core inputs: Vedic, KP, Jaimini, and Numerology',
  'Predicta Life Atlas is the approved all-school synthesis report path.',
  'layer.technicalEvidence?.map',
  'How Predicta Built This Reading',
]) {
  assertIncludes(pdfSource, fragment, `PDF source includes ${fragment}`);
}

for (const forbidden of [
  'composeNadiJyotishPlan',
  "id: 'nadi'",
  'Nadi evidence',
  'Nadi story',
]) {
  assertNotIncludes(lifeAtlas, forbidden, `Life Atlas source excludes active ${forbidden}`);
}

if (shouldGenerate) {
  const kundli = generateKundli();

  for (const artifact of artifacts) {
    const payload = {
      kundli,
      language: 'en',
      mode: artifact.mode,
      reportFocus: 'LIFE_ATLAS',
    };
    writeFileSync(artifact.payload, `${JSON.stringify(payload, null, 2)}\n`);
    const pdf = await downloadPdf(payload);
    assertPdfBuffer(pdf, artifact.id);
    writeFileSync(artifact.pdf, pdf);
  }
}

const manifest = [];
for (const artifact of artifacts) {
  assertArtifactExists(artifact.pdf, artifact.id);
  assertPayloadExists(artifact.payload, `${artifact.id} payload`);
  const { pageCount, pages, text } = extractPdfText(artifact.pdf);
  writeFileSync(artifact.text, `${text.trim()}\n`);
  assert.ok(pageCount >= (artifact.mode === 'PREMIUM' ? 15 : 10), `${artifact.id} is a substantial Life Atlas report`);
  assertTextContract({
    id: artifact.id,
    mode: artifact.mode,
    pageCount,
    pages,
    text,
  });
  const previews = renderPdfPreviews({
    id: artifact.id,
    pageCount,
    pdf: artifact.pdf,
  });
  manifest.push({
    bytes: statSync(artifact.pdf).size,
    id: artifact.id,
    mode: artifact.mode,
    pageCount,
    pdf: path.relative(auditRoot, artifact.pdf),
    payload: path.relative(auditRoot, artifact.payload),
    previews: previews.map(file => path.relative(auditRoot, file)),
    text: path.relative(auditRoot, artifact.text),
  });
}

writeFileSync(
  path.join(auditRoot, 'artifact-manifest.json'),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), phaseName, artifacts: manifest }, null, 2)}\n`,
);
writeFileSync(path.join(auditRoot, 'verification.txt'), renderVerification(manifest));

console.log(
  JSON.stringify(
    {
      artifacts: manifest,
      phase: phaseName,
      status: 'passed',
    },
    null,
    2,
  ),
);

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), label);
}

function assertNotIncludes(source, fragment, label) {
  assert.ok(!source.includes(fragment), label);
}

function assertArtifactExists(file, label) {
  assert.ok(existsSync(file), `${label} artifact exists`);
  assert.ok(statSync(file).size > 500_000, `${label} artifact is substantial`);
}

function assertPayloadExists(file, label) {
  assert.ok(existsSync(file), `${label} artifact exists`);
  assert.ok(statSync(file).size > 5_000, `${label} artifact is substantial`);
}

function generateKundli() {
  const python = String.raw`
import json
from backend.astro_api.calculations import generate_kundli
from backend.astro_api.models import BirthDetails

details = BirthDetails(
    name="Bhaumik Mehta",
    date="1980-08-22",
    time="06:30",
    place="Mumbai, Maharashtra, India",
    latitude=19.0760,
    longitude=72.8777,
    timezone="Asia/Kolkata",
    isTimeApproximate=False,
)

kundli = generate_kundli(details)
print(kundli.model_dump_json())
`;
  const result = spawnSync('python3', ['-c', python], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      PYTHONPATH: repoRoot,
    },
    maxBuffer: 20 * 1024 * 1024,
  });

  if (result.status !== 0) {
    throw new Error(`Unable to generate Life Atlas phase Kundli:\n${result.stdout}\n${result.stderr}`);
  }

  const kundli = JSON.parse(result.stdout);
  assert.equal(kundli.birthDetails.name, 'Bhaumik Mehta');
  assert.ok(kundli.planets?.length >= 7, 'Kundli includes enough grahas for Jaimini evidence');
  return kundli;
}

async function downloadPdf(payload) {
  const response = await fetch(`${baseUrl}/api/report/pdf`, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Life Atlas report route failed: ${response.status} ${await response.text()}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  assert.ok(contentType.includes('application/pdf'), 'Life Atlas report route returns application/pdf');
  return Buffer.from(await response.arrayBuffer());
}

function assertPdfBuffer(buffer, id) {
  assert.equal(buffer.subarray(0, 4).toString('utf8'), '%PDF', `${id} opens as PDF`);
  assert.ok(buffer.length > 500_000, `${id} is a substantial PDF`);
}

function extractPdfText(file) {
  const python = String.raw`
import fitz
import json
import sys

doc = fitz.open(sys.argv[1])
pages = [page.get_text("text") for page in doc]
print(json.dumps({"pageCount": len(doc), "pages": pages}))
`;
  const result = spawnSync('python3', ['-c', python, file], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });

  if (result.status !== 0) {
    throw new Error(`Unable to extract ${file}:\n${result.stdout}\n${result.stderr}`);
  }

  const parsed = JSON.parse(result.stdout);
  return {
    pageCount: parsed.pageCount,
    pages: parsed.pages,
    text: parsed.pages.join('\n\n---PAGE---\n\n'),
  };
}

function renderPdfPreviews({ id, pageCount, pdf }) {
  const previewPages = [0, Math.min(1, pageCount - 1), Math.min(4, pageCount - 1), pageCount - 1];
  const uniquePages = Array.from(new Set(previewPages));
  const outputDir = path.join(previewRoot, id);
  mkdirSync(outputDir, { recursive: true });
  const python = String.raw`
import fitz
import json
import pathlib
import sys

pdf = pathlib.Path(sys.argv[1])
output_dir = pathlib.Path(sys.argv[2])
pages = json.loads(sys.argv[3])
doc = fitz.open(pdf)
rendered = []
for page_index in pages:
    page = doc[page_index]
    pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False)
    out = output_dir / f"page-{page_index + 1:02d}.png"
    pix.save(out)
    rendered.append(str(out))
print(json.dumps(rendered))
`;
  const result = spawnSync('python3', ['-c', python, pdf, outputDir, JSON.stringify(uniquePages)], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });

  if (result.status !== 0) {
    throw new Error(`Unable to render previews for ${pdf}:\n${result.stdout}\n${result.stderr}`);
  }

  const files = JSON.parse(result.stdout);
  for (const file of files) {
    assert.ok(existsSync(file), `preview exists: ${file}`);
    assert.ok(statSync(file).size > 50_000, `preview is substantial: ${file}`);
  }

  return files;
}

function assertTextContract({ id, mode, pageCount, pages, text }) {
  const normalizedText = normalizeExtractedText(text);
  for (const forbidden of [
    'Nadi',
    'nadi',
  ]) {
    assert.ok(!normalizedText.toLowerCase().includes(forbidden.toLowerCase()), `${id} text excludes ${forbidden}`);
  }

  for (const fragment of [
    'Jaimini Destiny Thread',
    'Soul role:',
    'Visible identity',
    'Career dharma',
    'Relationship mirror',
    'Current destiny chapter',
    'A Final Note From Predicta',
  ]) {
    assert.ok(
      normalizedText.toLowerCase().includes(fragment.toLowerCase()),
      `${id} text includes meaningful Jaimini synthesis: ${fragment}`,
    );
  }

  const appendixPageIndex = pages.findIndex(page => page.includes('How Predicta Built This Reading'));
  if (mode === 'PREMIUM') {
    assert.ok(appendixPageIndex >= 0, `${id} premium includes the optional technical appendix`);
    const appendixText = pages.slice(appendixPageIndex).join('\n');
    for (const fragment of [
      'Atmakaraka',
      'Arudha Lagna',
      'Upapada Lagna',
      'Karakamsha',
      'Swamsa',
      'Chara Dasha',
    ]) {
      assert.ok(
        normalizeExtractedText(appendixText).toLowerCase().includes(fragment.toLowerCase()),
        `${id} appendix includes technical Jaimini evidence ${fragment}`,
      );
    }
  }

  const mainBodyPages = appendixPageIndex >= 0 ? pages.slice(0, appendixPageIndex) : pages;
  const mainBodyText = normalizeExtractedText(mainBodyPages.join('\n'));
  for (const technical of [
    'Atmakaraka',
    'Arudha Lagna',
    'Upapada Lagna',
    'Karakamsha',
    'Swamsa',
  ]) {
    assert.ok(
      !mainBodyText.toLowerCase().includes(technical.toLowerCase()),
      `${id} keeps ${technical} out of the main Life Atlas body`,
    );
  }

  pages.forEach((page, index) => {
    const normalized = page.replace(/\s+/g, ' ').trim();
    assert.ok(normalized.length > 180, `${id} page ${index + 1}/${pageCount} is not an orphan or empty page`);
  });
}

function normalizeExtractedText(value) {
  return value.replace(/-\s+/g, '').replace(/\s+/g, ' ').trim();
}

function renderVerification(manifest) {
  return [
    `# ${phaseName}`,
    '',
    'Status: GREEN after source gate, generated free and premium Life Atlas PDF artifacts, extracted-text audit, no-Nadi audit, and preview rendering.',
    '',
    'Verified:',
    '- Life Atlas uses Vedic, KP, Jaimini, Numerology, and optional Signature as the input map.',
    '- Jaimini appears as a real Destiny Thread: soul role, visible identity, career dharma, relationship mirror, and current destiny chapter.',
    '- Main Life Atlas pages remain non-technical and do not expose Atmakaraka, Arudha Lagna, Upapada Lagna, Karakamsha, or Swamsa terminology.',
    '- Premium appendix contains the technical Jaimini evidence trail for auditability.',
    '- Generated Life Atlas PDFs contain no Nadi references.',
    '- Every extracted page has substantial text, so no orphan/empty pages passed this gate.',
    '',
    'Artifacts:',
    ...manifest.map(item => `- ${item.id}: ${item.pageCount} pages, ${item.bytes} bytes, ${item.mode}.`),
  ].join('\n');
}
