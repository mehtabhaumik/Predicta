import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export function assertCleanWorkingTree({
  label = 'Predicta launch audit',
  allowDirtyEnv = 'PREDICTA_ALLOW_DIRTY_LAUNCH_AUDIT',
} = {}) {
  if (process.env[allowDirtyEnv] === '1') {
    return {
      clean: false,
      skipped: true,
      status: '',
    };
  }

  const status = execFileSync('git', ['status', '--porcelain=v1'], {
    encoding: 'utf8',
  }).trim();

  if (status) {
    throw new Error(
      [
        `${label} requires a clean working tree before running launch gates.`,
        'Commit, stash, or deliberately park local changes first so audit output is not confused with product changes.',
        '',
        status,
      ].join('\n'),
    );
  }

  return {
    clean: true,
    skipped: false,
    status,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const result = assertCleanWorkingTree({
      label: process.argv[2] ?? 'Predicta launch audit',
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
