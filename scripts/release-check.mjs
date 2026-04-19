#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const args = new Set(process.argv.slice(2));
const includeAndroidBuild = args.has('--android-build');

const releaseEnvGuards = [
  'PRIDICTA_ENABLE_MOCK_BILLING',
  'PRIDICTA_ENABLE_MOCK_AI',
];

for (const envName of releaseEnvGuards) {
  if (process.env[envName] === 'true') {
    console.error(
      `Release check refused to continue because ${envName}=true. Disable mock-only flags before release verification.`,
    );
    process.exit(1);
  }
}

const checks = [
  {
    args: ['pnpm', 'typecheck'],
    command: 'corepack',
    label: 'Workspace typecheck',
  },
  {
    args: ['pnpm', 'lint'],
    command: 'corepack',
    label: 'Workspace lint',
  },
  {
    args: ['pnpm', 'test'],
    command: 'corepack',
    label: 'Workspace tests',
  },
  {
    args: ['-m', 'pytest', 'backend/tests'],
    command: 'python3',
    label: 'Backend tests',
  },
  {
    args: ['pnpm', '--filter', '@pridicta/web', 'build'],
    command: 'corepack',
    label: 'Web production build',
  },
  {
    args: ['pnpm', '--filter', '@pridicta/mobile', 'bundle:android'],
    command: 'corepack',
    label: 'Android JS bundle',
  },
];

if (includeAndroidBuild) {
  checks.push({
    args: ['pnpm', '--filter', '@pridicta/mobile', 'build:android'],
    command: 'corepack',
    label: 'Android debug build',
  });
}

for (const check of checks) {
  console.log(`\n==> ${check.label}`);
  const result = spawnSync(check.command, check.args, {
    env: process.env,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    console.error(`\nRelease check failed at: ${check.label}`);
    process.exit(result.status ?? 1);
  }
}

console.log('\nRelease check completed successfully.');
