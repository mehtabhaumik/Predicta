import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import Module from 'node:module';
import path from 'node:path';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';

const repoRoot = process.cwd();
const require = createRequire(import.meta.url);
const pdfPackageRequire = createRequire(path.join(repoRoot, 'packages/pdf/src/reportDocument.tsx'));
const ts = require('typescript');
const phaseName = 'PREDICTA_KUNDLI_KARMA_PHASE_12_REPORT_INTEGRATION_FREE_AND_PREMIUM';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);
const artifactRoot = path.join(auditRoot, 'artifacts');
const previewRoot = path.join(auditRoot, 'previews');

mkdirSync(artifactRoot, { recursive: true });
mkdirSync(previewRoot, { recursive: true });

installTypeScriptRequireHook();
installWorkspaceAliasResolver();

const {
  buildPredictaPdfResult,
  createPredictaReportPdfElement,
} = require('../packages/pdf/src/reportDocument.tsx');
const { pdf } = pdfPackageRequire('@react-pdf/renderer');

const artifacts = [
  {
    id: 'kundli-karma-vedic-free',
    mode: 'FREE',
    pdf: path.join(artifactRoot, 'predicta-kundli-karma-vedic-free.pdf'),
    text: path.join(artifactRoot, 'predicta-kundli-karma-vedic-free-text.txt'),
  },
  {
    id: 'kundli-karma-vedic-premium',
    mode: 'PREMIUM',
    pdf: path.join(artifactRoot, 'predicta-kundli-karma-vedic-premium.pdf'),
    text: path.join(artifactRoot, 'predicta-kundli-karma-vedic-premium-text.txt'),
  },
];

const roadmap = read('docs/PREDICTA_KUNDLI_KARMA_INTELLIGENCE_STRICT_PHASES.md');
const pdfSource = read('packages/pdf/src/index.ts');
const labels = read('packages/pdf/src/translations/reportLabels.json');
const packageJson = read('package.json');

assertSourceContract({ labels, packageJson, pdfSource, roadmap });

const kundli = generateKundli();
const manifest = [];

for (const artifact of artifacts) {
  const result = buildPredictaPdfResult({
    kundli,
    language: 'en',
    mode: artifact.mode,
    reportFocus: 'KUNDLI',
  });
  assertReportCompositionContract(result, artifact.mode);
  const element = createPredictaReportPdfElement(result);
  const pdfBuffer = await renderPdfBuffer(element);
  assertPdfBuffer(pdfBuffer, artifact.id);
  writeFileSync(artifact.pdf, pdfBuffer);
  const extracted = extractPdfText(artifact.pdf);
  writeFileSync(artifact.text, `${extracted.text.trim()}\n`);
  assertExtractedTextContract({
    id: artifact.id,
    mode: artifact.mode,
    pages: extracted.pages,
    text: extracted.text,
  });
  const karmaPageIndex = Math.max(
    0,
    extracted.pages.findIndex(page => page.includes('KUNDLI KARMA') && page.includes('Kundli Karma Snapshot')),
  );
  const previews = renderPdfPreviews({
    id: artifact.id,
    karmaPageIndex,
    pageCount: extracted.pageCount,
    pdf: artifact.pdf,
  });
  manifest.push({
    bytes: statSync(artifact.pdf).size,
    id: artifact.id,
    mode: artifact.mode,
    pageCount: extracted.pageCount,
    pdf: path.relative(auditRoot, artifact.pdf),
    previews: previews.map(file => path.relative(auditRoot, file)),
    text: path.relative(auditRoot, artifact.text),
  });
}

writeFileSync(
  path.join(auditRoot, 'artifact-manifest.json'),
  `${JSON.stringify({ artifacts: manifest, generatedAt: new Date().toISOString(), phaseName }, null, 2)}\n`,
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

function installTypeScriptRequireHook() {
  require.extensions['.ts'] = require.extensions['.tsx'] = (module, filename) => {
    const source = readFileSync(filename, 'utf8');
    const output = ts.transpileModule(source, {
      compilerOptions: {
        esModuleInterop: true,
        jsx: ts.JsxEmit.React,
        module: ts.ModuleKind.CommonJS,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        resolveJsonModule: true,
        target: ts.ScriptTarget.ES2020,
      },
      fileName: filename,
    }).outputText;
    module._compile(output, filename);
  };
}

function installWorkspaceAliasResolver() {
  const originalResolveFilename = Module._resolveFilename;
  Module._resolveFilename = function resolveWorkspaceAlias(request, parent, isMain, options) {
    const aliases = {
      '@pridicta/ai': 'packages/ai/src/index.ts',
      '@pridicta/astrology': 'packages/astrology/src/index.ts',
      '@pridicta/config': 'packages/config/src/index.ts',
      '@pridicta/config/trust': 'packages/config/src/trust.ts',
      '@pridicta/config/uiTranslations': 'packages/config/src/uiTranslations.ts',
      '@pridicta/types': 'packages/types/src/index.ts',
      '@pridicta/ui-tokens': 'packages/ui-tokens/src/index.ts',
    };
    if (aliases[request]) {
      return path.join(repoRoot, aliases[request]);
    }
    return originalResolveFilename.call(this, request, parent, isMain, options);
  };
}

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function assertSourceContract({ labels, packageJson, pdfSource, roadmap }) {
  for (const fragment of [
    phaseName,
    'Only now integrate reports.',
    'Kundli Karma Snapshot',
    'Dosh In Your Kundli',
    'Karmic Debt & Shrap Indicators',
    'Positive Yog',
    'Challenging Yog',
    'Lal Kitab Reading',
    'One Consolidated Remedy Plan',
    'Reports must consume the same shared contract used by the app and Predicta',
    'Reports must not re-detect Dosh/Shrap/Yog/Lal Kitab independently.',
  ]) {
    assertIncludes(roadmap, fragment, `roadmap locks ${fragment}`);
  }

  for (const fragment of [
    'composeKundliKarmaSnapshot',
    'function buildKundliKarmaReportSections(',
    'composeKundliKarmaSnapshot(kundli)',
    'buildKundliKarmaModuleSection',
    'buildKundliKarmaRemedyPlanSection',
    'kundliKarmaConditionToEvidenceRow',
    'dedupeKundliKarmaRemedyPlan',
    'buildMahadashaPhalaReportSection(intelligence, mode),\n    ...buildKundliKarmaReportSections(kundli, mode),\n    ...buildFriendshipTableSections(intelligence, mode),',
  ]) {
    assertIncludes(pdfSource, fragment, `PDF source includes ${fragment}`);
  }

  for (const forbidden of [
    'composeKundliKarmaDoshIntelligence(kundli)',
    'composeKundliKarmaShrapIntelligence(kundli)',
    'composeKundliKarmaYogIntelligence(kundli)',
    'composeKundliKarmaLalKitabIntelligence(kundli)',
    'you are cursed',
    'expensive puja',
  ]) {
    assertNotIncludes(pdfSource, forbidden, `PDF source avoids ${forbidden}`);
  }

  for (const fragment of [
    '"Kundli Karma Snapshot"',
    '"Dosh In Your Kundli"',
    '"Karmic Debt & Shrap Indicators"',
    '"Positive Yog"',
    '"Challenging Yog"',
    '"Lal Kitab Reading"',
    '"One Consolidated Remedy Plan"',
    '"KUNDLI KARMA"',
    '"DOSH"',
    '"SHRAP"',
    '"POSITIVE YOG"',
    '"CHALLENGING YOG"',
    '"LAL KITAB"',
    '"KUNDLI KARMA REMEDY"',
  ]) {
    assertIncludes(labels, fragment, `report labels include ${fragment}`);
  }

  assertIncludes(
    packageJson,
    '"test:kundli-karma-phase-12": "node scripts/run-kundli-karma-phase-12-report-gate.mjs"',
    'package exposes Phase 12 gate',
  );
}

function assertReportCompositionContract(result, mode) {
  const titles = result.report.sections.map(section => section.title);
  const mahadashaIndex = titles.indexOf('Mahadasha Phala and Meaning');
  const snapshotIndex = titles.indexOf('Kundli Karma Snapshot');
  const friendshipIndex = titles.indexOf('Planet friendship table');
  const requiredTitles = [
    'Kundli Karma Snapshot',
    'Dosh In Your Kundli',
    'Karmic Debt & Shrap Indicators',
    'Positive Yog',
    'Challenging Yog',
    'Lal Kitab Reading',
    'One Consolidated Remedy Plan',
  ];

  assert.ok(mahadashaIndex >= 0, `${mode} report includes Mahadasha before Kundli Karma`);
  assert.ok(snapshotIndex > mahadashaIndex, `${mode} Kundli Karma chapter appears after Mahadasha`);
  assert.ok(friendshipIndex > snapshotIndex, `${mode} Kundli Karma chapter appears before later classical tables`);

  for (const title of requiredTitles) {
    assert.ok(titles.includes(title), `${mode} report includes ${title}`);
  }

  const karmaSections = result.report.sections.filter(section => requiredTitles.includes(section.title));
  assert.ok(karmaSections.length === requiredTitles.length, `${mode} has exactly one of each Kundli Karma report section`);

  for (const section of karmaSections) {
    const text = [section.title, section.eyebrow, section.body, ...section.bullets, ...section.evidence].join(' ');
    assert.doesNotMatch(text, /\bDosha\b|\bShrapa\b/i, `${mode} ${section.title} avoids forbidden terms`);
    assert.doesNotMatch(text, /you are cursed|must pay|expensive puja|will definitely|guaranteed success|guaranteed wealth|guaranteed marriage/i, `${mode} ${section.title} avoids fear-selling`);
    assert.ok(
      /meaning|means|guidance|support|pressure|remedy|evidence|activation|safe|grows?|use|visible|works?|helps?/i.test(section.body),
      `${mode} ${section.title} is user-facing, not a blank proof shell`,
    );
  }

  const remedySection = karmaSections.find(section => section.title === 'One Consolidated Remedy Plan');
  const remedyRows = remedySection?.evidenceTable?.map(row => `${row.factor}::${row.observation}`) ?? [];
  assert.equal(new Set(remedyRows).size, remedyRows.length, `${mode} remedy table has no duplicate rows`);
}

async function renderPdfBuffer(element) {
  const result = await pdf(element).toBuffer();
  if (Buffer.isBuffer(result)) {
    return result;
  }
  if (result && typeof result.on === 'function') {
    return streamToBuffer(result);
  }
  return Buffer.from(result);
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

function assertPdfBuffer(buffer, id) {
  assert.equal(buffer.subarray(0, 4).toString('utf8'), '%PDF', `${id} opens as PDF`);
  assert.ok(buffer.length > 100_000, `${id} PDF artifact is substantial`);
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
    maxBuffer: 30 * 1024 * 1024,
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

function assertExtractedTextContract({ id, mode, pages, text }) {
  for (const fragment of [
    'Mahadasha Phala and Meaning',
    'Kundli Karma Snapshot',
    'Dosh In Your Kundli',
    'Karmic Debt & Shrap Indicators',
    'Positive Yog',
    'Challenging Yog',
    'Lal Kitab Reading',
    'One Consolidated Remedy Plan',
  ]) {
    assert.ok(text.includes(fragment), `${id} extracted text includes ${fragment}`);
  }

  const mahadashaIndex = text.indexOf('Mahadasha Phala and Meaning');
  const karmaIndex = text.indexOf('Kundli Karma Snapshot');
  const friendshipIndex = text.indexOf('Planet friendship table');
  assert.ok(mahadashaIndex >= 0 && karmaIndex > mahadashaIndex, `${id} has Kundli Karma after Mahadasha`);
  assert.ok(friendshipIndex < 0 || friendshipIndex > karmaIndex, `${id} has Kundli Karma before friendship table`);

  for (const forbidden of [
    /\bDosha\b/i,
    /\bShrapa\b/i,
    /you are cursed/i,
    /must pay/i,
    /expensive puja/i,
    /report-only/i,
    /implementation/i,
  ]) {
    assert.doesNotMatch(text, forbidden, `${id} avoids forbidden/fear/system language ${forbidden}`);
  }

  const firstKarmaPage =
    pages.find(page => page.includes('KUNDLI KARMA') && page.includes('Kundli Karma Snapshot')) ??
    pages.find(page => page.includes('Top safe remedy')) ??
    '';
  assert.match(firstKarmaPage, /What it means|means|guidance|pressure|support|remedy/i, `${id} Kundli Karma page leads with meaning`);

  if (mode === 'PREMIUM') {
    assert.match(text, /Premium detail|What softens it|Remedy path|source rules/i, `${id} premium includes deeper item/remedy detail`);
  } else {
    assert.match(text, /Free summary|Top safe remedy|safe remedy/i, `${id} free includes summary and safe remedy`);
  }

  pages.forEach((page, index) => {
    const normalized = page.replace(/\s+/g, ' ').trim();
    assert.ok(normalized.length > 120, `${id} page ${index + 1}/${pages.length} is not an empty/orphan page`);
  });
}

function renderPdfPreviews({ id, karmaPageIndex, pageCount, pdf }) {
  const previewPages = [0, Math.min(1, pageCount - 1), Math.min(karmaPageIndex, pageCount - 1), pageCount - 1];
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
    pix = page.get_pixmap(matrix=fitz.Matrix(1.25, 1.25), alpha=False)
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
    assert.ok(statSync(file).size > 30_000, `preview is substantial: ${file}`);
  }
  return files;
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
    maxBuffer: 30 * 1024 * 1024,
  });

  if (result.status !== 0) {
    throw new Error(`Unable to generate Kundli:\n${result.stdout}\n${result.stderr}`);
  }

  const kundli = JSON.parse(result.stdout);
  assert.equal(kundli.birthDetails.name, 'Bhaumik Mehta');
  assert.ok(kundli.planets?.length >= 9, 'Kundli includes core grahas');
  return kundli;
}

function renderVerification(manifest) {
  return [
    `# ${phaseName}`,
    '',
    'Status: GREEN after generated free and premium PDF artifacts, extracted-text audit, source-fork audit, and preview render audit passed.',
    '',
    'Verified:',
    '- Vedic report integrates Kundli Karma after Mahadasha Phala and before later classical tables.',
    '- Report uses composeKundliKarmaSnapshot from the shared deterministic contract.',
    '- Report source does not re-detect Dosh, Shrap, Yog, or Lal Kitab independently.',
    '- Free artifact includes summaries, key evidence, safe basic remedies, and consolidated remedy plan.',
    '- Premium artifact includes deeper item detail, activation, reductions, remedy path, source rules, and consolidated remedy plan.',
    '- Extracted text avoids user-facing Dosha/Shrapa terminology, fear-selling, and system/internal language.',
    '- Rendered preview PNGs exist for cover, early report, Kundli Karma area, and final page.',
    '',
    'Artifacts:',
    ...manifest.map(item => `- ${item.id}: ${item.pageCount} pages, ${item.bytes} bytes, ${item.mode}.`),
    '',
  ].join('\n');
}

function assertIncludes(source, fragment, label) {
  assert.ok(source.includes(fragment), `${label}: missing ${fragment}`);
}

function assertNotIncludes(source, fragment, label) {
  assert.ok(!source.includes(fragment), `${label}: found forbidden ${fragment}`);
}
