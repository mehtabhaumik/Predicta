import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { assertPredictaAuditServerReady } from './assert-predicta-audit-server-ready.mjs';

const repoRoot = process.cwd();
const phaseName =
  'PREDICTA_REVIVAL_V2_PHASE_10_PERFORMANCE_LINK_AND_GOLDEN_JOURNEY_GATE';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);
const port = Number(process.env.PREDICTA_REVIVAL_V2_PHASE_10_PORT ?? 3910);
const baseUrl = `http://127.0.0.1:${port}`;

const sourceAndBuildGates = [
  ['config typecheck', ['corepack', 'pnpm', '--filter', '@pridicta/config', 'typecheck']],
  ['astrology typecheck', ['corepack', 'pnpm', '--filter', '@pridicta/astrology', 'typecheck']],
  ['web typecheck', ['corepack', 'pnpm', '--filter', '@pridicta/web', 'typecheck']],
  ['mobile typecheck', ['corepack', 'pnpm', '--filter', '@pridicta/mobile', 'exec', 'tsc', '--noEmit']],
  ['pdf typecheck', ['corepack', 'pnpm', '--filter', '@pridicta/pdf', 'typecheck']],
  ['web production build', ['corepack', 'pnpm', 'build:web']],
  ['translation zero leak', ['corepack', 'pnpm', 'test:revival-v2-phase-9']],
  ['chart containment', ['corepack', 'pnpm', 'test:revival-v2-phase-5']],
  ['chart stress', ['corepack', 'pnpm', 'test:charts']],
  ['report PDF golden', ['corepack', 'pnpm', 'test:pdf-golden']],
  ['report final no-go reaudit', ['corepack', 'pnpm', 'test:report-final-phase-12']],
  ['Predicta golden chat experience', ['corepack', 'pnpm', 'test:predicta-intelligence-phase-10']],
  ['git diff hygiene', ['git', 'diff', '--check']],
];

const serverBackedGates = [
  [
    'link reliability',
    ['corepack', 'pnpm', 'test:app-revival-phase-7'],
    { PREDICTA_LINK_RELIABILITY_BASE_URL: baseUrl },
  ],
  [
    'overflow audit',
    ['corepack', 'pnpm', 'test:ui-text-overflow'],
    { PREDICTA_UI_OVERFLOW_BASE_URL: baseUrl },
  ],
  [
    'spacing personal-space audit',
    ['corepack', 'pnpm', 'test:ui-personal-space'],
    { PREDICTA_PERSONAL_SPACE_BASE_URL: baseUrl },
  ],
  [
    'mobile tablet visual proof',
    ['corepack', 'pnpm', 'test:visual-proof'],
    { PREDICTA_VISUAL_BASE_URL: baseUrl },
  ],
  [
    'full user golden journey',
    ['corepack', 'pnpm', 'test:app-revival-phase-9'],
    { PREDICTA_FULL_JOURNEY_BASE_URL: baseUrl },
  ],
];

const delegatedArtifactPaths = [
  'docs/audits/PREDICTA_APP_REVIVAL_PHASE_7_LINK_CLICK_LATENCY_AND_NAVIGATION_RELIABILITY',
  'docs/audits/PREDICTA_APP_REVIVAL_PHASE_9_FULL_USER_JOURNEY_GOLDEN_NO_GO_AUDIT',
  'docs/audits/PREDICTA_INTELLIGENCE_PHASE_10_GOLDEN_CHAT_EXPERIENCE_AUDIT',
  'docs/audits/PREDICTA_REPORT_FINAL_PHASE_12_GOLDEN_ARTIFACT_AND_NO_GO_REAUDIT',
  'docs/audits/PREDICTA_REPORT_PDF_PHASE_9_GOLDEN_ARTIFACT_RELEASE_AUDIT',
  'docs/audits/PREDICTA_REVIVAL_V2_PHASE_5_KUNDLI_CHART_RENDERING_CONTAINMENT_LOCK',
  'docs/audits/PREDICTA_REVIVAL_V2_PHASE_9_TRANSLATION_ZERO_LEAK_SWEEP',
];

const failures = [];
const results = [];
const startedAt = Date.now();
const preservedArtifacts = preserveArtifacts(delegatedArtifactPaths);

assertRoadmapContract();

for (const [label, command] of sourceAndBuildGates) {
  await runGate(label, command);
}

const server = spawn('corepack', [
  'pnpm',
  '--filter',
  '@pridicta/web',
  'exec',
  'next',
  'start',
  '-p',
  String(port),
  '-H',
  '127.0.0.1',
], {
  cwd: repoRoot,
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverOutput = '';
server.stdout.on('data', chunk => {
  serverOutput += chunk.toString();
});
server.stderr.on('data', chunk => {
  serverOutput += chunk.toString();
});

try {
  await waitForServer(baseUrl);
  for (const [label, command, env] of serverBackedGates) {
    await runGate(label, command, env);
  }
} finally {
  server.kill('SIGTERM');
  await waitForExit(server, 5_000).catch(() => {
    server.kill('SIGKILL');
  });
  restoreArtifacts(preservedArtifacts);
}

if (failures.length) {
  throw new assert.AssertionError({
    message: `${phaseName} failed:\n- ${failures.join('\n- ')}`,
  });
}

mkdirSync(auditRoot, { recursive: true });
writeFileSync(
  path.join(auditRoot, 'phase-10-manifest.json'),
  `${JSON.stringify(
    {
      baseUrl,
      durationSeconds: Number(((Date.now() - startedAt) / 1000).toFixed(1)),
      phase: phaseName,
      serverOutputTail: serverOutput.split(/\r?\n/).filter(Boolean).slice(-10),
      status: 'GREEN',
      strictAudit: true,
      testedJourneys: [
        'new user asks a question',
        'new user creates Kundli from chat',
        'returning user asks a prediction',
        'user opens Vedic/KP/Jaimini evidence from Predicta',
        'user downloads a report',
        'user redeems or reaches the signed-out redeem-pass lock correctly',
        'user exhausts credits and still receives deterministic help',
        'user switches English, Hindi, and Gujarati',
      ],
      results,
    },
    null,
  )}\n`,
);
writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    `${phaseName}: GREEN`,
    '',
    `Verified against ${baseUrl}.`,
    'The gate ran build, typecheck, link reliability, mobile/tablet visual proof, overflow, spacing, translation, chart, report, PDF, Predicta chat, and golden journey checks.',
    'Delegated historical audit artifacts were preserved to prevent timestamp/screenshot noise while still executing their gates.',
    '',
  ].join('\n'),
);

console.log(
  `${phaseName} passed: performance, link reliability, reports, translation, chart, mobile, and golden journeys are green.`,
);

function assertRoadmapContract() {
  const roadmap = read('docs/PREDICTA_REVIVAL_V2_1_TOP_ASTROLOGY_APP_REBUILD.md');
  const packageJson = JSON.parse(read('package.json'));

  [
    phaseName,
    'Prove the revived app is fast, reliable, premium, and easy.',
    'New user asks a question.',
    'New user creates Kundli from chat.',
    'Returning user asks a prediction.',
    'User opens Vedic/KP/Jaimini evidence from Predicta.',
    'User downloads a report.',
    'User redeems a pass.',
    'User exhausts credits and still receives deterministic help.',
    'User switches English, Hindi, and Gujarati.',
    'Build, typecheck, link, mobile, overflow, spacing, translation, chart, report,',
    'and golden journey gates pass.',
  ].forEach(fragment =>
    assertGate(roadmap.includes(fragment), `roadmap missing ${fragment}`),
  );

  assertGate(
    packageJson.scripts?.['test:revival-v2-phase-10'] ===
      'node scripts/run-revival-v2-phase-10-performance-link-golden-journey-gate.mjs',
    'package.json must expose test:revival-v2-phase-10',
  );
}

async function runGate(label, command, env = {}) {
  const started = Date.now();
  try {
    const { output } = await runCommand(command, env);
    results.push({
      durationSeconds: Number(((Date.now() - started) / 1000).toFixed(1)),
      label,
      status: 'passed',
      summary: lastOutputLine(output),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push(`${label}: ${message}`);
    results.push({
      durationSeconds: Number(((Date.now() - started) / 1000).toFixed(1)),
      label,
      status: 'failed',
      summary: message,
    });
  }
}

function runCommand(command, env = {}) {
  const [bin, ...args] = command;
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, {
      cwd: repoRoot,
      env: {
        ...process.env,
        ...env,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', chunk => {
      output += chunk.toString();
    });
    child.stderr.on('data', chunk => {
      output += chunk.toString();
    });
    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) {
        resolve({ output });
        return;
      }
      reject(new Error(`${command.join(' ')} failed with exit code ${code ?? 'unknown'}.\n${output}`));
    });
  });
}

async function waitForServer(url) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < 45_000) {
    try {
      await assertPredictaAuditServerReady(url);
      return;
    } catch (error) {
      lastError = error;
      await delay(750);
    }
  }
  throw new Error(`server did not become ready at ${url}: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

function preserveArtifacts(paths) {
  return paths.map(relativePath => ({
    existed: existsSync(path.join(repoRoot, relativePath)),
    relativePath,
    snapshot: existsSync(path.join(repoRoot, relativePath))
      ? snapshotPath(path.join(repoRoot, relativePath))
      : undefined,
  }));
}

function restoreArtifacts(artifacts) {
  for (const artifact of artifacts) {
    const absolutePath = path.join(repoRoot, artifact.relativePath);
    rmSync(absolutePath, { force: true, recursive: true });
    if (artifact.existed && artifact.snapshot) {
      restoreSnapshot(absolutePath, artifact.snapshot);
    }
  }
}

function snapshotPath(absolutePath) {
  const stat = statSync(absolutePath);
  if (stat.isDirectory()) {
    return {
      entries: readdirSync(absolutePath).map(entry => ({
        name: entry,
        snapshot: snapshotPath(path.join(absolutePath, entry)),
      })),
      type: 'directory',
    };
  }
  return {
    content: readFileSync(absolutePath),
    type: 'file',
  };
}

function restoreSnapshot(absolutePath, snapshot) {
  if (snapshot.type === 'directory') {
    mkdirSync(absolutePath, { recursive: true });
    for (const entry of snapshot.entries) {
      restoreSnapshot(path.join(absolutePath, entry.name), entry.snapshot);
    }
    return;
  }
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, snapshot.content);
}

function waitForExit(child, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server did not exit')), timeoutMs);
    child.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

function read(file) {
  return readFileSync(path.join(repoRoot, file), 'utf8');
}

function assertGate(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

function lastOutputLine(output) {
  return output.split(/\r?\n/).filter(Boolean).at(-1) ?? '';
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
