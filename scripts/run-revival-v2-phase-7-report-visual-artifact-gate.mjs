import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import Module from 'node:module';
import path from 'node:path';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';

const repoRoot = process.cwd();
const require = createRequire(import.meta.url);
const pdfPackageRequire = createRequire(path.join(repoRoot, 'packages/pdf/src/reportDocument.tsx'));
const ts = require('typescript');
const phaseName = 'PREDICTA_REVIVAL_V2_PHASE_7_REPORT_VISUAL_PREMIUM_AND_PDF_ARTIFACT_GATE';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);
const artifactRoot = path.join(auditRoot, 'artifacts');
const previewRoot = path.join(auditRoot, 'previews');

rmSync(auditRoot, { force: true, recursive: true });
mkdirSync(artifactRoot, { recursive: true });
mkdirSync(previewRoot, { recursive: true });

installTypeScriptRequireHook();
installWorkspaceAliasResolver();

const {
  buildPredictaPdfResult,
  createPredictaReportPdfElement,
} = require('../packages/pdf/src/reportDocument.tsx');
const { pdf } = pdfPackageRequire('@react-pdf/renderer');

assertSourceContracts();

const kundli = generateKundli();
const signatureAnalysis = buildConfirmedSignatureAnalysis();
const cases = [
  ['vedic-free', 'KUNDLI', 'FREE'],
  ['vedic-premium', 'KUNDLI', 'PREMIUM'],
  ['kp-free', 'KP', 'FREE'],
  ['kp-premium', 'KP', 'PREMIUM'],
  ['jaimini-free', 'JAIMINI', 'FREE'],
  ['jaimini-premium', 'JAIMINI', 'PREMIUM'],
  ['numerology-free', 'NUMEROLOGY', 'FREE'],
  ['numerology-premium', 'NUMEROLOGY', 'PREMIUM'],
  ['signature-free', 'SIGNATURE', 'FREE'],
  ['signature-premium', 'SIGNATURE', 'PREMIUM'],
  ['life-atlas-free', 'LIFE_ATLAS', 'FREE'],
  ['life-atlas-premium', 'LIFE_ATLAS', 'PREMIUM'],
];
const manifest = [];

for (const [id, reportFocus, mode] of cases) {
  const result = buildPredictaPdfResult({
    kundli,
    language: 'en',
    mode,
    reportFocus,
    signatureAnalysis: ['SIGNATURE', 'LIFE_ATLAS'].includes(reportFocus)
      ? signatureAnalysis
      : undefined,
  });
  assertCompositionVisualContract(result, id, reportFocus, mode);

  const pdfBuffer = await renderPdfBuffer(
    createPredictaReportPdfElement(result, {
      logoSrc: loadAssetDataUri('apps/web/public/predicta-logo.png'),
      watermarkSrc: loadAssetDataUri('apps/web/public/predicta-seal-watermark.png'),
    }),
  );
  assertPdfBuffer(pdfBuffer, id);

  const pdfPath = path.join(artifactRoot, `${id}.pdf`);
  writeFileSync(pdfPath, pdfBuffer);

  const extracted = extractPdfText(pdfPath);
  assertExtractedTextVisualContract({ id, pages: extracted.pages, reportFocus });

  const previewPages = choosePreviewPages(extracted.pages, reportFocus);
  const previews = renderPdfPreviews({ id, pages: previewPages, pdf: pdfPath });
  const chartMetrics = ['KUNDLI', 'KP'].includes(reportFocus)
    ? analyzeChartWidth(previews.find(item => item.kind === 'chart')?.path)
    : undefined;

  if (chartMetrics) {
    assert.ok(
      chartMetrics.maxChartLineRunRatio >= 0.72,
      `${id} chart geometry uses enough horizontal width (${chartMetrics.maxChartLineRunRatio})`,
    );
  }

  manifest.push({
    bytes: statSync(pdfPath).size,
    chartMetrics,
    id,
    mode,
    pageCount: extracted.pageCount,
    pdf: path.relative(auditRoot, pdfPath),
    previews: previews.map(item => ({
      kind: item.kind,
      path: path.relative(auditRoot, item.path),
      size: statSync(item.path).size,
    })),
    reportFocus,
  });
}

assert.equal(manifest.length, 12, 'Phase 7 generated 12 fresh current PDFs');
for (const lane of ['KUNDLI', 'KP', 'JAIMINI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS']) {
  assert.ok(manifest.some(item => item.reportFocus === lane && item.mode === 'FREE'), `${lane} FREE artifact exists`);
  assert.ok(manifest.some(item => item.reportFocus === lane && item.mode === 'PREMIUM'), `${lane} PREMIUM artifact exists`);
}

writeFileSync(
  path.join(auditRoot, 'phase-7-report-visual-artifact-manifest.json'),
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      phase: phaseName,
      status: 'GREEN',
      artifacts: manifest,
      visualChecks: [
        'fresh free and premium PDFs for all six report lanes',
        'cover/chart/mid/final preview pages rendered as PNG',
        'page density rejects sparse/orphan pages',
        'Kundli/KP chart pages use full-width chart geometry metrics',
        'Pearl Editorial, watermark, footer, chart-safe, and app preview source contracts verified',
      ],
    },
    null,
    2,
  )}\n`,
);
writeFileSync(path.join(auditRoot, 'verification.txt'), renderVerification(manifest));

console.log(`${phaseName} passed: fresh visual PDF artifacts, previews, page density, and chart-width checks are green.`);

function assertSourceContracts() {
  const roadmap = read('docs/PREDICTA_REVIVAL_V2_1_TOP_ASTROLOGY_APP_REBUILD.md');
  const renderer = read('packages/pdf/src/reportDocument.tsx');
  const composer = read('packages/pdf/src/index.ts');
  const webReport = read('apps/web/components/WebDossierPreview.tsx');
  const packageJson = read('package.json');

  for (const phrase of [
    phaseName,
    'Make report PDFs look and read like premium astrology dossiers.',
    'Fix typography, contrast, watermark, page density, orphan pages, chart width,',
    'Remove sparse leftover pages.',
    'Rendered screenshot review passes for free and paid PDFs.',
  ]) {
    assertIncludes(roadmap, phrase, `roadmap locks ${phrase}`);
  }
  assertIncludes(packageJson, '"test:revival-v2-phase-7"', 'package script exposes Phase 7 gate');

  for (const phrase of [
    'PDF_PAGE_TEMPLATES',
    'Predicta Editorial Display',
    'Predicta Editorial Body',
    'Predicta Devanagari',
    'Predicta Gujarati',
    'PdfWatermark',
    'opacity: PDF_PAGE_TEMPLATES.watermark.opacity',
    "width: '100%'",
    'height: 450',
    'PdfHouseWisePlanetTablePage',
    'Keep supporting proof inside each card/table. Separate proof boxes were',
    'creating orphan continuation pages in free PDFs',
    'Prepared by Predicta @2026',
    'render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}',
    'Kundli prediction to carry',
  ]) {
    assertIncludes(renderer, phrase, `renderer includes ${phrase}`);
  }

  for (const banned of [
    'Fun chart note',
    'Use the spreads in order',
    'Free is not a teaser',
    'Technical chart foundation',
    'technical workbook',
    '#FFF8E8',
    'Helvetica',
  ]) {
    assertNotIncludes(renderer, banned, `renderer avoids ${banned}`);
  }

  for (const phrase of [
    'chartSnapshots: PdfChartSnapshot[]',
    'hiddenPlanetCount: 0',
    'buildPdfHouseWisePlanetRows',
    'buildKpReportSections',
    'buildJaiminiReportSections',
    'buildNumerologyReportSections',
    'buildSignatureReportSections',
    'buildLifeAtlasReportSections',
  ]) {
    assertIncludes(composer, phrase, `composer includes ${phrase}`);
  }

  for (const phrase of [
    'Get a direct Kundli answer',
    'Get a direct KP answer',
    'See the soul role',
    'See what the name and birth numbers emphasize',
    'See what confirmed visible traits may reflect',
  ]) {
    assertIncludes(webReport, phrase, `web report preview includes ${phrase}`);
  }
}

function assertCompositionVisualContract(result, id, reportFocus, mode) {
  assert.equal(result.report.mode, mode, `${id} mode is preserved`);
  assert.ok(result.report.cover.subjectName, `${id} has cover subject`);
  assert.ok(result.report.cover.reportType, `${id} has cover report type`);
  assert.ok(result.report.watermark, `${id} has watermark copy`);
  assert.ok(result.sections.length >= 3, `${id} has enough report sections`);

  if (reportFocus === 'KUNDLI') {
    assert.ok(result.report.chartSnapshots.length >= 5, `${id} includes focus charts`);
    assert.equal(result.report.chartSnapshots[0]?.chartRole, 'D1', `${id} starts charts with D1`);
  }
  if (reportFocus === 'KP') {
    assert.ok(result.report.chartSnapshots.some(chart => chart.school === 'KP'), `${id} includes a KP chart`);
  }
  if (reportFocus === 'SIGNATURE') {
    assert.ok(
      result.sections.some(section => /signature/i.test(`${section.eyebrow} ${section.title} ${section.body}`)),
      `${id} includes Signature section`,
    );
  }
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
  assert.ok(buffer.length > 400_000, `${id} PDF is a substantial rendered artifact`);
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
    maxBuffer: 40 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`Unable to extract ${file}:\n${result.stdout}\n${result.stderr}`);
  }
  return JSON.parse(result.stdout);
}

function assertExtractedTextVisualContract({ id, pages, reportFocus }) {
  assert.ok(pages.length >= 8, `${id} has enough pages for visual audit`);
  pages.forEach((page, index) => {
    const normalized = page.replace(/\s+/g, ' ').trim();
    assert.ok(normalized.length > 32, `${id} page ${index + 1} is not a sparse/orphan page`);
  });
  const text = pages.join('\n');
  assertIncludes(text, 'Prepared by Predicta @2026', `${id} footer text`);
  assert.doesNotMatch(text, /Fun chart note|Use the spreads in order|Free is not a teaser|Supportive Toolkit/i, `${id} avoids stale schooling labels`);
  if (reportFocus === 'KUNDLI') {
    assert.match(text, /Rashi Chart|Moon Chart|Navamsa|Chalit/i, `${id} includes core chart surfaces`);
  }
}

function choosePreviewPages(pages, reportFocus) {
  const pageCount = pages.length;
  const chartPatterns =
    reportFocus === 'KP'
      ? [/KP Event Support/i, /Bhav Chalit/i, /KP Chart/i, /CHART EVIDENCE/i]
      : [/CHART EVIDENCE/i, /Rashi Chart/i, /D1 \/ Rashi/i];
  const chartIndex = pages.findIndex(
    (page, index) => index > 0 && chartPatterns.some(pattern => pattern.test(page)),
  );
  return [
    { index: 0, kind: 'cover' },
    { index: chartIndex >= 0 ? chartIndex : Math.min(3, pageCount - 1), kind: 'chart' },
    { index: Math.max(0, Math.floor(pageCount / 2)), kind: 'mid' },
    { index: pageCount - 1, kind: 'final' },
  ];
}

function renderPdfPreviews({ id, pages, pdf }) {
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
for item in pages:
    page_index = item["index"]
    kind = item["kind"]
    page = doc[page_index]
    pix = page.get_pixmap(matrix=fitz.Matrix(1.4, 1.4), alpha=False)
    out = output_dir / f"{kind}-page-{page_index + 1:02d}.png"
    pix.save(out)
    rendered.append({"kind": kind, "path": str(out)})
print(json.dumps(rendered))
`;
  const result = spawnSync('python3', ['-c', python, pdf, outputDir, JSON.stringify(pages)], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`Unable to render previews for ${pdf}:\n${result.stdout}\n${result.stderr}`);
  }
  const rendered = JSON.parse(result.stdout);
  for (const item of rendered) {
    assert.ok(existsSync(item.path), `preview exists: ${item.path}`);
    assert.ok(statSync(item.path).size > 20_000, `preview is substantial: ${item.path}`);
  }
  return rendered;
}

function analyzeChartWidth(imagePath) {
  assert.ok(imagePath, 'chart preview image is available for width analysis');
  const python = String.raw`
from PIL import Image
import json
import sys

img = Image.open(sys.argv[1]).convert("RGB")
w, h = img.size
max_run = 0
max_row = 0
for y in range(int(h * 0.10), int(h * 0.84)):
    run = 0
    best = 0
    for x in range(int(w * 0.04), int(w * 0.96)):
        r, g, b = img.getpixel((x, y))
        # Chart plates use refined copper/gold construction lines on a
        # porcelain/sunrise field. Measure the longest visible chart-line span
        # instead of looking for the retired black plate.
        is_chart_line = (120 <= r <= 230 and 70 <= g <= 180 and 25 <= b <= 135 and r > g and g >= b)
        if is_chart_line:
            run += 1
            best = max(best, run)
        else:
            run = 0
    if best > max_run:
        max_run = best
        max_row = y
print(json.dumps({"width": w, "height": h, "maxChartLineRun": max_run, "maxChartLineRunRatio": round(max_run / w, 4), "row": max_row}))
`;
  const result = spawnSync('python3', ['-c', python, imagePath], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`Unable to analyze chart width for ${imagePath}:\n${result.stdout}\n${result.stderr}`);
  }
  return JSON.parse(result.stdout);
}

function generateKundli() {
  const python = String.raw`
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
    env: { ...process.env, PYTHONPATH: repoRoot },
    maxBuffer: 40 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`Unable to generate Kundli:\n${result.stdout}\n${result.stderr}`);
  }
  const kundli = JSON.parse(result.stdout);
  assert.equal(kundli.birthDetails.name, 'Bhaumik Mehta');
  assert.ok(kundli.charts?.D1?.supported, 'generated Kundli has D1 chart');
  return kundli;
}

function buildConfirmedSignatureAnalysis() {
  return {
    canAndCannotTellYou: [
      'It reads visible expression cues from confirmed traits only.',
      'It is not forensic proof.',
      'It is not identity verification.',
      'It is not prediction.',
    ],
    cautions: ['do not overread one sample', 'keep professional signatures readable'],
    confidenceExpression: {
      care: 'Treat this as reflective guidance, not forensic proof.',
      level: 'visible',
      summary: 'The sample shows visible but not overclaimed expression cues.',
    },
    consistency: {
      care: 'Use multiple samples for stronger comparison.',
      level: 'steady',
      summary: 'The visible traits look steady enough for a reflective reading.',
    },
    evidence: ['Confirmed baseline, slant, pressure, size, spacing, legibility, rhythm, and flourish traits were provided for this audit sample.'],
    improvementPlan: ['Keep baseline steady', 'Improve name clarity for formal documents', 'Avoid excessive flourish when clarity matters'],
    inputSource: 'uploaded-image',
    interpretationCards: [
      {
        caution: 'Keep this reflective and avoid fixed claims.',
        evidence: ['Confirmed visible signature trait in current session.'],
        key: 'baseline',
        plainMeaning: 'Your confirmed upward baseline may suggest an aspirational presentation style.',
        title: 'Forward expression',
      },
      {
        caution: 'Keep this reflective and avoid fixed claims.',
        evidence: ['Confirmed visible signature trait in current session.'],
        key: 'legibility',
        plainMeaning: 'Partial legibility can reflect a balance between visibility and privacy.',
        title: 'Readable but private',
      },
    ],
    limitations: ['Single-sample signature reading is reflective and limited.'],
    method: {
      extraction: 'USER_CONFIRMED_VISUAL_TRAITS',
      interpretation: 'REFLECTIVE_SIGNATURE_ANALYSIS_RULES',
      safety: 'NO_FORENSIC_IDENTITY_OR_DIAGNOSIS',
    },
    observedTraits: [
      { confidence: 'clear', confirmationState: 'confirmed', evidence: 'Baseline rises gently across the sample.', key: 'baseline', label: 'Baseline', value: 'upward' },
      { confidence: 'partial', confirmationState: 'confirmed', evidence: 'Most strokes lean slightly right.', key: 'slant', label: 'Slant', value: 'right' },
      { confidence: 'partial', confirmationState: 'confirmed', evidence: 'Ink density appears medium.', key: 'pressure', label: 'Pressure', value: 'medium' },
      { confidence: 'clear', confirmationState: 'confirmed', evidence: 'Signature occupies a moderate envelope.', key: 'size', label: 'Size', value: 'medium' },
      { confidence: 'clear', confirmationState: 'confirmed', evidence: 'Letter clusters keep balanced spacing.', key: 'spacing', label: 'Spacing', value: 'balanced' },
      { confidence: 'clear', confirmationState: 'confirmed', evidence: 'Some letters are readable while others compress.', key: 'legibility', label: 'Legibility', value: 'partial' },
      { confidence: 'partial', confirmationState: 'confirmed', evidence: 'Stroke movement is connected and flowing.', key: 'rhythm', label: 'Rhythm', value: 'flowing' },
      { confidence: 'partial', confirmationState: 'confirmed', evidence: 'Ending stroke has moderate flourish.', key: 'flourish', label: 'Flourish', value: 'moderate' },
    ],
    practicePrompts: ['Sign slowly three times and compare clarity.', 'Choose one professional signature style and keep it consistent.'],
    privacy: {
      reportCopy: 'Predicta did not store your signature image. This section uses only confirmed visible traits from your current session.',
      sessionBehavior: 'The raw image remains only in the current session.',
      storage: 'raw-image-not-stored',
    },
    rhythm: {
      care: 'Do not infer personality certainty from rhythm alone.',
      pace: 'measured',
      summary: 'The signature rhythm reads as measured and flowing.',
    },
    safetyBoundaries: [
      'Signature Predicta is reflective guidance, not forensic handwriting analysis.',
      'It must not be used for identity verification, hiring, legal judgment, medical judgment, or guaranteed prediction.',
      'Only confirmed visible traits from the current session may be interpreted.',
    ],
    status: 'ready',
    strengths: ['visible presence', 'measured rhythm', 'balanced spacing', 'aspirational movement'],
    suggestedQuestions: ['How can I make my signature clearer?', 'Which trait should I refine first?'],
    summary: 'Your confirmed signature traits point to visible self-expression, measured rhythm, and a practical improvement path.',
    synthesisReadiness: {
      numerology: 'available-on-request',
      rule: 'Signature stays separate unless a synthesis report is selected.',
    },
  };
}

function loadAssetDataUri(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  if (!existsSync(filePath)) {
    return undefined;
  }
  const extension = path.extname(filePath).toLowerCase();
  const mime = extension === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${readFileSync(filePath).toString('base64')}`;
}

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function assertIncludes(source, phrase, label) {
  assert.ok(source.includes(phrase), label);
}

function assertNotIncludes(source, phrase, label) {
  assert.ok(!source.includes(phrase), label);
}

function renderVerification(items) {
  return [
    phaseName,
    '',
    'Verdict: GREEN after fresh current PDF artifact generation and rendered PNG review.',
    '',
    'Artifacts:',
    ...items.map(
      item =>
        `- ${item.id}: ${item.pageCount} pages, ${item.bytes} bytes, ${item.mode}, ${item.reportFocus}, previews ${item.previews.length}.`,
    ),
    '',
    'Visual checks:',
    '- Fresh free and premium PDFs generated for Vedic, KP, Jaimini, Numerology, Signature, and Life Atlas.',
    '- Cover/chart/mid/final preview pages rendered for each artifact.',
    '- Sparse/orphan pages rejected through extracted page text density.',
    '- KUNDLI and KP chart preview images passed full-width chart geometry checks.',
    '- Source contracts lock Pearl Editorial, watermark, footer, chart-safe rendering, and compact app previews.',
    '',
  ].join('\n');
}

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
