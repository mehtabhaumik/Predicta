import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const auditRoot = 'docs/audits/PREDICTA_AUDIT_1_ENTERPRISE_UI_UX';
const phaseRoot = join(auditRoot, 'phase-0-evidence-lock');
const logRoot = join(phaseRoot, 'logs');
const screenshotRoot = join(phaseRoot, 'screenshots');
const canonicalBaseUrl = 'http://127.0.0.1:3009';
const observedBaseUrl = 'http://127.0.0.1:3016';

mkdirSync(logRoot, { recursive: true });
mkdirSync(screenshotRoot, { recursive: true });

const commands = [
  {
    args: ['pnpm', 'test:audit-server-preflight'],
    env: { PREDICTA_AUDIT_BASE_URL: canonicalBaseUrl },
    name: 'canonical-3009-audit-server-preflight',
  },
  {
    args: ['pnpm', 'test:audit-server-preflight'],
    env: { PREDICTA_AUDIT_BASE_URL: observedBaseUrl },
    name: 'observed-3016-audit-server-preflight',
  },
  {
    args: ['pnpm', 'test:ui-text-overflow'],
    env: { PREDICTA_UI_OVERFLOW_BASE_URL: observedBaseUrl },
    name: 'observed-3016-ui-text-overflow',
  },
  {
    args: ['pnpm', 'test:visual-proof'],
    env: {
      PREDICTA_VISUAL_BASE_URL: observedBaseUrl,
      PREDICTA_VISUAL_OUTPUT_DIR: screenshotRoot,
    },
    name: 'observed-3016-visual-proof',
  },
  {
    args: ['pnpm', 'test:buyer-rejection'],
    env: { PREDICTA_BUYER_BASE_URL: observedBaseUrl },
    name: 'observed-3016-buyer-rejection',
  },
];

const startedAt = new Date().toISOString();
const results = [];

for (const command of commands) {
  const result = spawnSync('corepack', command.args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: {
      ...process.env,
      ...command.env,
    },
    maxBuffer: 1024 * 1024 * 30,
    timeout: 240_000,
  });

  const status = result.status ?? 1;
  const logLines = [
    `name: ${command.name}`,
    `cwd: ${process.cwd()}`,
    `command: corepack ${command.args.join(' ')}`,
    `env: ${JSON.stringify(command.env)}`,
    `exitStatus: ${status}`,
    '',
    '--- stdout ---',
    result.stdout || '',
    '',
    '--- stderr ---',
    result.stderr || '',
    '',
  ];

  if (result.error) {
    logLines.push(`error: ${result.error.message}`);
  }

  const log = `${logLines.join('\n').trimEnd()}\n`;

  writeFileSync(join(logRoot, `${command.name}.log`), log);
  results.push({
    command: `corepack ${command.args.join(' ')}`,
    env: command.env,
    log: `${logRoot}/${command.name}.log`,
    name: command.name,
    status,
    timedOut: Boolean(result.error && /timed out/i.test(result.error.message)),
  });
}

const manifest = {
  auditRoot,
  canonicalBaseUrl,
  generatedAt: startedAt,
  observedBaseUrl,
  phase: 'PREDICTA_AUDIT_1_PHASE_0_EVIDENCE_LOCK_AND_AUDIT_SERVER_TRUTH',
  results,
  screenshotRoot,
  status: 'evidence-locked',
};

writeFileSync(join(phaseRoot, 'phase-0-evidence-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(JSON.stringify(manifest, null, 2));
