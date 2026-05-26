import { strict as assert } from 'node:assert';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const phaseName = 'PREDICTA_PRE_LIVE_PHASE_15_AUDIT_NOISE_DETERMINISM_AND_DEVELOPER_RUNBOOK';
const auditRoot = path.join(repoRoot, 'docs/audits', phaseName);
const runbookPath = path.join(auditRoot, 'developer-runbook.md');

const deterministicCommands = [
  {
    command: ['node', 'scripts/run-pre-live-phase-12-admin-owner-surface-gate.mjs'],
    label: 'Phase 12 admin owner surface source audit',
  },
  {
    command: ['node', 'scripts/run-pre-live-phase-13-report-composer-gate.mjs'],
    label: 'Phase 13 report composer source audit',
  },
];

mkdirSync(auditRoot, { recursive: true });

const packageJson = readWorkspaceFile('package.json');
const mobilePackageJson = readWorkspaceFile('apps/mobile/package.json');
const greenlightSource = readWorkspaceFile('scripts/run-public-testing-greenlight-audit.mjs');
const cleanTreeSource = readWorkspaceFile('scripts/assert-clean-working-tree.mjs');
const runbook = readWorkspaceFile(path.relative(repoRoot, runbookPath));

assertIncludes(packageJson, '"test:pre-live-phase-15"', 'root package exposes Phase 15 gate');
assertIncludes(
  greenlightSource,
  "import { assertCleanWorkingTree } from './assert-clean-working-tree.mjs';",
  'public greenlight imports clean-working-tree preflight',
);
assertIncludes(
  greenlightSource,
  "assertCleanWorkingTree({ label: 'Predicta public greenlight audit' });",
  'public greenlight runs clean-working-tree preflight before launch checks',
);
assertIncludes(cleanTreeSource, "git', ['status', '--porcelain=v1']", 'clean-tree preflight uses git porcelain status');
assertIncludes(
  cleanTreeSource,
  'PREDICTA_ALLOW_DIRTY_LAUNCH_AUDIT',
  'clean-tree preflight has explicit dirty-audit escape hatch',
);
assertIncludes(
  mobilePackageJson,
  'env -u NO_COLOR FORCE_COLOR=0 react-native bundle',
  'mobile Android bundle normalizes Metro color environment',
);

for (const fragment of [
  'http://127.0.0.1:3009',
  'corepack pnpm build:web',
  'PORT=3009 corepack pnpm --filter @pridicta/web exec next start',
  'corepack pnpm test:audit-server-preflight',
  'corepack pnpm test:public-greenlight',
  'corepack pnpm test:pre-live-phase-14',
  'corepack pnpm test:pre-live-phase-15',
  'corepack pnpm --filter @pridicta/mobile bundle:android',
  'git status --short',
  'rm -rf /tmp/pridicta.android.bundle /tmp/pridicta-assets',
  'PREDICTA_ALLOW_DIRTY_LAUNCH_AUDIT=1',
]) {
  assertIncludes(runbook, fragment, `runbook documents ${fragment}`);
}

const before = gitStatus();
const commandResults = [];

for (let round = 1; round <= 2; round += 1) {
  for (const item of deterministicCommands) {
    const result = runCommand(item.command);
    commandResults.push({
      command: item.command.join(' '),
      label: item.label,
      round,
      status: 'passed',
      stdoutPreview: result.stdout.trim().split('\n').slice(-4),
    });
  }
}

const after = gitStatus();
assert.equal(
  after,
  before,
  [
    'Read-only deterministic audit commands changed the working tree.',
    'Before:',
    before || '(clean)',
    'After:',
    after || '(clean)',
  ].join('\n'),
);

writeFileSync(
  path.join(auditRoot, 'determinism-summary.json'),
  `${JSON.stringify(
    {
      deterministicCommands: commandResults.map(({ command, label, round, status }) => ({
        command,
        label,
        round,
        status,
      })),
      metroWarningPolicy: 'apps/mobile package bundle script unsets NO_COLOR and sets FORCE_COLOR=0.',
      publicGreenlightPreflight: 'scripts/run-public-testing-greenlight-audit.mjs requires a clean git working tree before launch gates.',
      status: 'passed',
    },
    null,
    2,
  )}\n`,
);
writeFileSync(
  path.join(auditRoot, 'verification.txt'),
  [
    phaseName,
    '',
    'Verdict: GREEN after strict audit.',
    '',
    'Strict audit evidence:',
    '- Read-only source audit scripts were run twice and did not change git status.',
    '- Public greenlight has a clean-working-tree preflight before launch gates.',
    '- Mobile Android bundle command normalizes Metro color warning noise with env -u NO_COLOR FORCE_COLOR=0.',
    '- Developer runbook documents exact server start, audit gates, expected 3009 port, cleanup commands, and the dirty-audit escape hatch.',
    '- Local port expectations are unambiguous: launch audit uses http://127.0.0.1:3009, not localhost:3000.',
    '',
    'Commands exercised by this gate:',
    ...deterministicCommands.flatMap(item => [
      `- ${item.command.join(' ')}: PASS round 1`,
      `- ${item.command.join(' ')}: PASS round 2`,
    ]),
    '',
    'Companion verification commands:',
    '- corepack pnpm test:pre-live-phase-15',
    '- corepack pnpm --filter @pridicta/mobile bundle:android',
    '- git diff --check',
    '- git status --short',
  ].join('\n') + '\n',
);

console.log(
  JSON.stringify(
    {
      auditRoot: path.relative(repoRoot, auditRoot),
      deterministicCommandRuns: commandResults.length,
      status: 'passed',
    },
    null,
    2,
  ),
);

function readWorkspaceFile(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function assertIncludes(source, fragment, message) {
  assert.ok(source.includes(fragment), message);
}

function gitStatus() {
  return execFileSync('git', ['status', '--porcelain=v1'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

function runCommand(command) {
  const [bin, ...args] = command;
  const result = spawnSync(bin, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      FORCE_COLOR: '0',
    },
    maxBuffer: 20 * 1024 * 1024,
  });

  if (result.status !== 0) {
    throw new Error(
      [
        `${command.join(' ')} failed with exit code ${result.status ?? 'unknown'}.`,
        result.stdout,
        result.stderr,
      ].join('\n'),
    );
  }

  return result;
}
