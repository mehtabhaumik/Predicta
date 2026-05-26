import { spawnSync } from 'node:child_process';
import { strict as assert } from 'node:assert';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const tempRoot = await mkdtemp(path.join(tmpdir(), 'predicta-signature-model-'));
const tempConfig = path.join(tempRoot, 'tsconfig.json');
const outDir = path.join(tempRoot, 'dist');

await writeFile(
  tempConfig,
  JSON.stringify(
    {
      extends: path.join(repoRoot, 'packages/astrology/tsconfig.json'),
      compilerOptions: {
        declaration: false,
        module: 'CommonJS',
        moduleResolution: 'Node',
        noEmit: false,
        outDir,
        rootDir: repoRoot,
      },
      include: [
        path.join(repoRoot, 'packages/astrology/src/**/*.ts'),
        path.join(repoRoot, 'packages/types/src/**/*.ts'),
      ],
    },
    null,
    2,
  ),
);

try {
  const compile = spawnSync('corepack', ['pnpm', 'exec', 'tsc', '-p', tempConfig], {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (compile.status !== 0) {
    process.stderr.write(compile.stdout);
    process.stderr.write(compile.stderr);
    process.exit(compile.status ?? 1);
  }

  const modulePath = path.join(
    outDir,
    'packages/astrology/src/signatureAnalysisModel.js',
  );
  const detectorModulePath = path.join(
    outDir,
    'packages/astrology/src/signatureTraitDetector.js',
  );
  const {
    SIGNATURE_ANALYSIS_SAFETY_BOUNDARIES,
    buildSignaturePredictaPromptContext,
    composeSignatureAnalysisModel,
    extractSignatureTraitObservations,
    getSignatureTraitRules,
  } = await import(pathToFileURL(modulePath).href);
  const { detectSignatureTraitsFromPixels } = await import(
    pathToFileURL(detectorModulePath).href
  );

  assert.ok(SIGNATURE_ANALYSIS_SAFETY_BOUNDARIES.length >= 4);
  assert.ok(
    SIGNATURE_ANALYSIS_SAFETY_BOUNDARIES.some(boundary =>
      boundary.includes('identity verification'),
    ),
  );

  const pending = composeSignatureAnalysisModel();
  assert.equal(pending.status, 'pending');
  assert.match(pending.summary, /waiting/i);

  const rules = getSignatureTraitRules();
  assert.ok(rules.baseline.values.upward);
  assert.ok(rules.legibility.values.abstract);
  assert.ok(rules.pressure.values.heavy);

  const observations = extractSignatureTraitObservations({
    baseline: 'upward',
    legibility: 'abstract',
    pressure: 'heavy',
    slant: 'right',
  });
  assert.equal(observations.length, 4);
  assert.equal(observations[0].key, 'baseline');
  assert.equal(observations[0].confirmationState, 'confirmed');
  assert.equal(observations[1].confidence, 'uncertain');
  assert.equal(observations[2].confidence, 'partial');

  const model = composeSignatureAnalysisModel({
    inputSource: 'drawn-signature',
    observedTraits: {
      baseline: 'upward',
      flourish: 'moderate',
      legibility: 'partial',
      pressure: 'heavy',
      slant: 'right',
      spacing: 'balanced',
      underline: 'single',
    },
  });

  assert.equal(model.status, 'ready');
  assert.equal(model.inputSource, 'drawn-signature');
  assert.equal(model.observedTraits.length, 7);
  assert.equal(model.interpretationCards.length, 7);
  assert.ok(model.strengths.includes('ambition'));
  assert.ok(model.cautions.length >= 3);
  assert.equal(model.rhythm.pace, 'fast');
  assert.equal(model.confidenceExpression.level, 'balanced');
  assert.equal(model.consistency.level, 'flexible');
  assert.ok(model.improvementPlan.length >= 4);
  assert.match(model.improvementPlan.join(' '), /natural/i);
  assert.match(model.synthesisReadiness.rule, /separate/i);
  assert.ok(model.practicePrompts.length >= 2);
  assert.ok(model.limitations.some(item => item.includes('does not verify identity')));
  assert.equal(model.privacy.storage, 'raw-image-not-stored');
  assert.match(model.privacy.reportCopy, /did not store your signature image/);
  assert.ok(model.canAndCannotTellYou.some(item => item.includes('not forensic proof')));
  assert.ok(
    model.safetyBoundaries.some(item => item.includes('handwriting forensics')),
  );
  assert.ok(
    model.interpretationCards.every(card => !/definitely|guaranteed/i.test(card.plainMeaning)),
  );

  const blank = createCanvasPixels(140, 70);
  const blankDetection = detectSignatureTraitsFromPixels(blank);
  assert.equal(blankDetection.hasVisibleSignature, false);
  assert.equal(Object.keys(blankDetection.traits).length, 0);

  const dot = createCanvasPixels(140, 70);
  drawDot(dot, 70, 35, 2);
  const dotDetection = detectSignatureTraitsFromPixels(dot);
  assert.equal(dotDetection.hasVisibleSignature, false);

  const upwardSignature = createCanvasPixels(180, 80);
  drawLine(upwardSignature, 18, 56, 150, 28, 3);
  drawLine(upwardSignature, 150, 28, 168, 24, 2);
  const upwardDetection = detectSignatureTraitsFromPixels(upwardSignature);
  assert.equal(upwardDetection.hasVisibleSignature, true);
  assert.equal(upwardDetection.traits.baseline, 'upward');
  assert.ok(upwardDetection.traits.pressure);

  const downwardSignature = createCanvasPixels(180, 80);
  drawLine(downwardSignature, 18, 28, 150, 56, 3);
  const downwardDetection = detectSignatureTraitsFromPixels(downwardSignature);
  assert.equal(downwardDetection.hasVisibleSignature, true);
  assert.equal(downwardDetection.traits.baseline, 'downward');
  assert.notDeepEqual(upwardDetection.traits, downwardDetection.traits);

  const context = buildSignaturePredictaPromptContext(model);
  assert.match(context, /Signature Predicta context/);
  assert.match(context, /identity verification/);
  assert.match(context, /Observed traits/);
  assert.match(context, /Writing rhythm/);
  assert.match(context, /Confidence expression/);
  assert.match(context, /Improvement plan/);
  assert.match(context, /What this can and cannot tell you/);

  console.log('Signature analysis model passed: deterministic model and real-input detector assertions.');
} finally {
  await rm(tempRoot, { force: true, recursive: true });
}

function createCanvasPixels(width, height) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < data.length; index += 4) {
    data[index] = 255;
    data[index + 1] = 255;
    data[index + 2] = 255;
    data[index + 3] = 255;
  }

  return { data, height, width };
}

function drawDot(canvas, centerX, centerY, radius) {
  for (let y = centerY - radius; y <= centerY + radius; y += 1) {
    for (let x = centerX - radius; x <= centerX + radius; x += 1) {
      if ((x - centerX) ** 2 + (y - centerY) ** 2 <= radius ** 2) {
        setPixel(canvas, x, y);
      }
    }
  }
}

function drawLine(canvas, x1, y1, x2, y2, thickness = 2) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  for (let step = 0; step <= steps; step += 1) {
    const t = step / Math.max(1, steps);
    const x = Math.round(x1 + (x2 - x1) * t);
    const y = Math.round(y1 + (y2 - y1) * t);
    drawDot(canvas, x, y, thickness);
  }
}

function setPixel(canvas, x, y) {
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
    return;
  }

  const index = (y * canvas.width + x) * 4;
  canvas.data[index] = 15;
  canvas.data[index + 1] = 15;
  canvas.data[index + 2] = 15;
  canvas.data[index + 3] = 255;
}
