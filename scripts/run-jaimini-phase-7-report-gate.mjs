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
const phaseName = 'PREDICTA_JAIMINI_PHASE_7_JAIMINI_REPORTS_FREE_AND_PREMIUM';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);
const artifactRoot = path.join(auditRoot, 'artifacts');
const previewRoot = path.join(auditRoot, 'previews');
const baseUrl = process.env.PREDICTA_JAIMINI_PHASE7_BASE_URL ?? 'http://127.0.0.1:3009';
const shouldGenerate = process.env.PREDICTA_JAIMINI_PHASE7_GENERATE === '1';

const artifacts = [
  {
    id: 'jaimini-free',
    mode: 'FREE',
    pdf: path.join(artifactRoot, 'predicta-jaimini-free.pdf'),
    payload: path.join(artifactRoot, 'predicta-jaimini-free-payload.json'),
    text: path.join(artifactRoot, 'predicta-jaimini-free-text.txt'),
  },
  {
    id: 'jaimini-premium',
    mode: 'PREMIUM',
    pdf: path.join(artifactRoot, 'predicta-jaimini-premium.pdf'),
    payload: path.join(artifactRoot, 'predicta-jaimini-premium-payload.json'),
    text: path.join(artifactRoot, 'predicta-jaimini-premium-text.txt'),
  },
];

mkdirSync(artifactRoot, { recursive: true });
mkdirSync(previewRoot, { recursive: true });

const roadmap = read('docs/PREDICTA_JAIMINI_REPLACES_NADI_STRICT_ROADMAP.md');
for (const fragment of [
  phaseName,
  'Create Jaimini reports that feel predictive, polished, and valuable',
  '**Free Report**',
  '**Premium Report**',
  'no Vedic D1/D9 chart shell',
  'no Nadi language',
  'generated free PDF artifact.',
  'generated premium PDF artifact.',
]) {
  assertIncludes(roadmap, fragment, `roadmap locks ${fragment}`);
}

const pdfSource = read('packages/pdf/src/index.ts');
const renderer = read('packages/pdf/src/reportDocument.tsx');
const labels = read('packages/pdf/src/translations/reportLabels.json');
const packageJson = read('package.json');

for (const fragment of [
  'composeJaiminiPlan',
  'composeJaiminiInterpretation',
  "case 'JAIMINI':\n      return buildJaiminiReportSections(kundli, mode);",
  'function buildJaiminiReportSections(',
  'Jaimini Soul Compass',
  'Atmakaraka Soul Role',
  'Karakamsha and Swamsa Reading',
  'Arudha Visible Identity',
  'Amatyakaraka Career Dharma',
  'Darakaraka Relationship Mirror',
  'Current Chara Dasha Chapter',
  'Full Chara Karaka Council',
  'Chara Dasha Life Map',
  'Upapada Relationship Chapter',
  'Visible Reputation and Public Role',
  'Current and Upcoming Destiny Chapters',
  'Technical Jaimini Appendix',
  "if (['JAIMINI', 'LIFE_ATLAS', 'KP', 'NUMEROLOGY', 'SIGNATURE'].includes(reportFocus))",
  "return !['JAIMINI', 'KP', 'NADI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS'].includes(reportFocus)",
]) {
  assertIncludes(pdfSource, fragment, `PDF composition includes ${fragment}`);
}

for (const forbidden of [
  "case 'JAIMINI':\n      return buildNadiReportSections(kundli, mode);",
  "reportFocus === 'JAIMINI' ? ['D1'",
  "reportFocus === 'JAIMINI' ? ['D9'",
]) {
  assertNotIncludes(pdfSource, forbidden, `Jaimini PDF source avoids ${forbidden}`);
}

for (const fragment of [
  "reportFocus === 'JAIMINI'",
  'Jaimini destiny guidance',
  'Your Jaimini destiny reading begins here',
  'Jaimini prediction',
  'Jaimini soul charts',
  'Career dharma',
  'Relationship mirror',
  'Destiny timing',
  'Premium Jaimini',
  'Jaimini appendix',
  "['JAIMINI', 'KP', 'NADI', 'NUMEROLOGY', 'SIGNATURE']",
]) {
  assertIncludes(renderer, fragment, `PDF renderer handles Jaimini ${fragment}`);
}

for (const fragment of [
  '"JAIMINI"',
  '"JAIMINI APPENDIX"',
  '"Jaimini Soul Compass"',
  '"Full Chara Karaka Council"',
  '"Technical Jaimini Appendix"',
]) {
  assertIncludes(labels, fragment, `Jaimini report labels include ${fragment}`);
}

assertIncludes(
  packageJson,
  '"test:jaimini-phase-7": "node scripts/run-jaimini-phase-7-report-gate.mjs"',
  'package exposes Jaimini Phase 7 gate',
);

if (shouldGenerate) {
  const kundli = generateKundli();

  for (const artifact of artifacts) {
    const payload = {
      kundli,
      language: 'en',
      mode: artifact.mode,
      reportFocus: 'JAIMINI',
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
  assert.ok(pageCount >= (artifact.mode === 'PREMIUM' ? 10 : 7), `${artifact.id} has enough pages for a real report`);
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
    throw new Error(`Unable to generate Jaimini phase Kundli:\n${result.stdout}\n${result.stderr}`);
  }

  const kundli = JSON.parse(result.stdout);
  assert.equal(kundli.birthDetails.name, 'Bhaumik Mehta');
  assert.ok(kundli.planets?.length >= 7, 'Kundli includes enough grahas for Jaimini karakas');
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
    throw new Error(`Jaimini report route failed: ${response.status} ${await response.text()}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  assert.ok(contentType.includes('application/pdf'), 'Jaimini report route returns application/pdf');
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
  const previewPages = [0, Math.min(1, pageCount - 1), Math.min(3, pageCount - 1), pageCount - 1];
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
  for (const fragment of [
    'Jaimini',
    'Atmakaraka',
    'Karakamsha',
    'Swamsa',
    'Arudha',
    'Amatyakaraka',
    'Darakaraka',
    'Chara Dasha',
    'Jaimini Soul Compass',
    'Concise Jaimini Evidence Appendix',
  ]) {
    assert.ok(text.includes(fragment), `${id} text includes ${fragment}`);
  }

  if (mode === 'PREMIUM') {
    for (const fragment of [
      'Full Chara Karaka Council',
      'Chara Dasha Life Map',
      'Upapada Relationship Chapter',
      'Visible Reputation and Public Role',
      'Current and Upcoming Destiny Chapters',
      'Technical Jaimini Appendix',
    ]) {
      assert.ok(text.includes(fragment), `${id} premium text includes ${fragment}`);
    }
  }

  for (const forbidden of [
    'Nadi',
    'nadi',
    'PARASHARI',
    'Rashi Chart',
    'Navamsa Chart',
    'Fun chart note',
    'Prepared with birth chart, panchang, dasha, and classical Jyotish analysis',
  ]) {
    assert.ok(!text.includes(forbidden), `${id} text excludes ${forbidden}`);
  }

  pages.forEach((page, index) => {
    const normalized = page.replace(/\s+/g, ' ').trim();
    assert.ok(normalized.length > 180, `${id} page ${index + 1}/${pageCount} is not an orphan or empty page`);
  });
}

function renderVerification(manifest) {
  return [
    `# ${phaseName}`,
    '',
    'Status: GREEN after source gate, generated free and premium PDF artifacts, and extracted-text audit passed.',
    '',
    'Verified:',
    '- Jaimini reports use reportFocus JAIMINI and buildJaiminiReportSections.',
    '- Free report includes soul compass, Atmakaraka, Karakamsha/Swamsa, Arudha, Amatyakaraka, Darakaraka, Chara Dasha, and concise evidence appendix.',
    '- Premium report adds full karaka council, Chara Dasha life map, Upapada chapter, public role, current/upcoming chapters, practical guidance, and technical appendix.',
    '- Generated artifacts contain no Nadi language, no D1/D9 Parashari shell text, and no generic chart-note leftovers.',
    '- Every extracted page has substantial text, so no orphan/empty pages passed this gate.',
    '- Preview PNGs were rendered for cover, summary, reading, and final pages for both free and premium PDFs.',
    '',
    'Artifacts:',
    ...manifest.map(item => `- ${item.id}: ${item.pageCount} pages, ${item.bytes} bytes, ${item.mode}.`),
  ].join('\n');
}
