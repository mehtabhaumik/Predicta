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
  const {
    SIGNATURE_ANALYSIS_SAFETY_BOUNDARIES,
    buildSignaturePredictaPromptContext,
    composeSignatureAnalysisModel,
    extractSignatureTraitObservations,
    getSignatureTraitRules,
  } = await import(pathToFileURL(modulePath).href);

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
  assert.equal(observations[1].confidence, 'low');
  assert.equal(observations[2].confidence, 'medium');

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
  assert.ok(
    model.safetyBoundaries.some(item => item.includes('handwriting forensics')),
  );
  assert.ok(
    model.interpretationCards.every(card => !/definitely|guaranteed/i.test(card.plainMeaning)),
  );

  const context = buildSignaturePredictaPromptContext(model);
  assert.match(context, /Signature Predicta context/);
  assert.match(context, /identity verification/);
  assert.match(context, /Observed traits/);
  assert.match(context, /Writing rhythm/);
  assert.match(context, /Confidence expression/);
  assert.match(context, /Improvement plan/);

  console.log('Signature analysis model passed: 26 deterministic assertions.');
} finally {
  await rm(tempRoot, { force: true, recursive: true });
}
