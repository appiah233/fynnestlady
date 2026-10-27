import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');

function removeFixture(directory) {
  const absolute = resolve(directory);
  assert.equal(dirname(absolute).toLowerCase(), resolve(tmpdir()).toLowerCase());
  assert.match(basename(absolute), /^fynnestlady-bot-/);
  rmSync(absolute, { recursive: true, force: true });
}

function git(cwd, ...args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, `git ${args.join(' ')} failed: ${result.stderr}`);
}

function gitOutput(cwd, ...args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, `git ${args.join(' ')} failed: ${result.stderr}`);
  return result.stdout.trim();
}

test('quality gate validates the candidate tree selected by BOT_TARGET_DIR', () => {
  const candidate = mkdtempSync(join(tmpdir(), 'fynnestlady-bot-candidate-'));
  try {
    mkdirSync(join(candidate, 'src'));
    const result = spawnSync(process.execPath, ['scripts/bot.mjs', 'quality'], {
      cwd: root,
      env: { ...process.env, BOT_TARGET_DIR: candidate },
      encoding: 'utf8',
    });
    assert.notEqual(result.status, 0, `Candidate source without package.json must fail. Output: ${result.stdout}${result.stderr}`);
  } finally {
    removeFixture(candidate);
  }
});

test('policy gate catches forbidden infrastructure in a candidate commit', () => {
  const candidate = mkdtempSync(join(tmpdir(), 'fynnestlady-bot-policy-'));
  try {
    git(candidate, 'init', '-q');
    git(candidate, 'config', 'user.email', 'testing@example.invalid');
    git(candidate, 'config', 'user.name', 'Testing Agent');
    git(candidate, 'commit', '--allow-empty', '-qm', 'baseline');
    mkdirSync(join(candidate, 'infra'));
    writeFileSync(join(candidate, 'infra', 'deployment.yml'), 'hosting: EC2\nstorage: S3\n');
    git(candidate, 'add', 'infra/deployment.yml');
    git(candidate, 'commit', '-qm', 'unapproved infrastructure');
    const result = spawnSync(process.execPath, ['scripts/bot.mjs', 'policy'], {
      cwd: root,
      env: { ...process.env, BOT_TARGET_DIR: candidate },
      encoding: 'utf8',
    });
    assert.notEqual(result.status, 0, 'Unapproved infrastructure must fail the policy gate');
    assert.match(result.stderr, /Architecture policy violations/);
  } finally {
    removeFixture(candidate);
  }
});

test('evidence gate requires an explicit trusted manifest outside the candidate tree', () => {
  const candidate = mkdtempSync(join(tmpdir(), 'fynnestlady-bot-evidence-'));
  const evidenceDir = mkdtempSync(join(tmpdir(), 'fynnestlady-bot-trusted-evidence-'));
  try {
    git(candidate, 'init', '-q');
    git(candidate, 'config', 'user.email', 'testing@example.invalid');
    git(candidate, 'config', 'user.name', 'Testing Agent');
    git(candidate, 'commit', '--allow-empty', '-qm', 'baseline');
    writeFileSync(join(candidate, 'README.md'), '# Candidate\n');
    git(candidate, 'add', 'README.md');
    git(candidate, 'commit', '-qm', 'candidate');
    const headSha = gitOutput(candidate, 'rev-parse', 'HEAD');
    const roles = ['ArchitectAgent', 'ProductAgent', 'SecurityAgent', 'TestingAgent'];
    const evidencePath = join(evidenceDir, 'evidence.json');
    writeFileSync(evidencePath, JSON.stringify({
      headSha,
      issue: 42,
      roles: Object.fromEntries(roles.map((role) => [role, { status: 'pass', headSha }])),
      tests: ['node --test'],
      rollback: 'Revert the candidate commit.',
      architecture: { status: 'pass', headSha },
    }));
    const result = spawnSync(process.execPath, ['scripts/bot.mjs', 'evidence'], {
      cwd: root,
      env: { ...process.env, BOT_TARGET_DIR: candidate, BOT_EVIDENCE_PATH: evidencePath },
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, `Matching evidence fixture must pass. Output: ${result.stdout}${result.stderr}`);

    const untrustedPath = join(candidate, '.bot', 'evidence.json');
    mkdirSync(join(candidate, '.bot'));
    writeFileSync(untrustedPath, '{}');
    const withoutTrustedPath = spawnSync(process.execPath, ['scripts/bot.mjs', 'evidence'], {
      cwd: root,
      env: { ...process.env, BOT_TARGET_DIR: candidate, BOT_EVIDENCE_PATH: '' },
      encoding: 'utf8',
    });
    assert.notEqual(withoutTrustedPath.status, 0, 'Candidate-provided evidence must not be trusted by default');
  } finally {
    removeFixture(candidate);
    removeFixture(evidenceDir);
  }
});

test('security gate blocks synthetic credentials without printing their values', () => {
  const candidate = mkdtempSync(join(tmpdir(), 'fynnestlady-bot-secret-'));
  try {
    const synthetic = [
      `PAYSTACK_SECRET=${['sk', 'live', 'Z'.repeat(24)].join('_')}`,
      `GEMINI_API_KEY=${['AIzaSy', 'G'.repeat(33)].join('')}`,
      `OPENAI_API_KEY=${['sk', 'proj', 'A'.repeat(32)].join('-')}`,
      `SUPABASE_SERVICE_ROLE_KEY=${['eyJhbGciOiJIUzI1NiJ9', 'eyJyb2xlIjoic2VydmljZV9yb2xlIn0', 'B'.repeat(32)].join('.')}`,
      `VERCEL_TOKEN=${'v'.repeat(32)}`,
      ['-----BEGIN', 'PRIVATE KEY-----'].join(' '),
    ];
    for (const value of synthetic) {
      writeFileSync(join(candidate, 'config.txt'), `${value}\n`);
      const result = spawnSync(process.execPath, ['scripts/bot.mjs', 'security'], {
        cwd: root,
        env: { ...process.env, BOT_TARGET_DIR: candidate },
        encoding: 'utf8',
      });
      assert.notEqual(result.status, 0, `Synthetic ${value.split('=')[0]} must block the candidate`);
      assert.doesNotMatch(`${result.stdout}${result.stderr}`, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
  } finally {
    removeFixture(candidate);
  }
});
