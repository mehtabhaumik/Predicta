import { spawn } from 'node:child_process';
import { assertCleanWorkingTree } from './assert-clean-working-tree.mjs';
import { assertPredictaAuditServerReady } from './assert-predicta-audit-server-ready.mjs';

const baseUrl = process.env.PREDICTA_GREENLIGHT_BASE_URL ?? 'http://127.0.0.1:3009';

const steps = [
  {
    command: ['corepack', 'pnpm', '--filter', '@pridicta/web', 'typecheck'],
    label: 'Web typecheck',
  },
  {
    command: ['corepack', 'pnpm', '--filter', '@pridicta/pdf', 'typecheck'],
    label: 'PDF package typecheck',
  },
  {
    command: ['corepack', 'pnpm', 'test:charts'],
    label: 'North Indian chart and stress suite',
  },
  {
    command: ['corepack', 'pnpm', 'test:predicta-context'],
    label: 'Predicta context reliability suite',
  },
  {
    command: ['corepack', 'pnpm', 'test:pdf-golden'],
    label: 'PDF report golden output gate',
  },
  {
    command: ['corepack', 'pnpm', 'test:visual-proof'],
    env: {
      PREDICTA_VISUAL_BASE_URL: baseUrl,
    },
    label: 'Mobile and tablet visual proof gate',
  },
  {
    command: ['corepack', 'pnpm', 'test:buyer-rejection'],
    env: {
      PREDICTA_BUYER_BASE_URL: baseUrl,
    },
    label: 'End-to-end buyer rejection gate',
  },
  {
    command: ['git', 'diff', '--check'],
    label: 'Git diff hygiene',
  },
];

assertCleanWorkingTree({ label: 'Predicta public greenlight audit' });
await assertServerReady(baseUrl);

const startedAt = Date.now();
const results = [];

for (const step of steps) {
  const stepStartedAt = Date.now();
  console.log(`\n=== ${step.label} ===`);
  await runStep(step);
  results.push({
    durationSeconds: Number(((Date.now() - stepStartedAt) / 1000).toFixed(1)),
    label: step.label,
    status: 'passed',
  });
}

console.table(results);
console.log(
  `Public testing greenlight audit passed in ${Number(((Date.now() - startedAt) / 1000).toFixed(1))}s against ${baseUrl}.`,
);

async function assertServerReady(url) {
  try {
    const result = await assertPredictaAuditServerReady(url);
    console.log(
      `Predicta audit server preflight passed for ${result.routeChecks.length} routes and ${result.assetChecks.length} assets at ${result.baseUrl}.`,
    );
  } catch (error) {
    console.error(`Predicta production-like audit server must be healthy before the public greenlight audit: ${url}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function runStep(step) {
  const [bin, ...args] = step.command;

  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, {
      env: {
        ...process.env,
        ...(step.env ?? {}),
      },
      shell: false,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${step.label} failed with exit code ${code ?? 'unknown'}.`));
    });
  }).catch(error => {
    console.error(`\nPublic testing greenlight audit stopped at: ${step.label}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
