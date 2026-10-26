import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const HEAD = 'c'.repeat(40);
const ROLES = ['ArchitectAgent', 'ProductAgent', 'SecurityAgent', 'DesignAgent', 'TestingAgent'];

function removeFixture(directory) {
  const absolute = resolve(directory);
  assert.equal(dirname(absolute).toLowerCase(), resolve(tmpdir()).toLowerCase());
  assert.match(basename(absolute), /^fynnestlady-review-fixture-/);
  rmSync(absolute, { recursive: true, force: true });
}

function assemble(reviewDir, outputPath) {
  return spawnSync(process.execPath, ['scripts/bot-evidence.mjs', 'assemble'], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      BOT_CHANGED_FILES: JSON.stringify(['src/app/page.tsx']),
      BOT_HEAD_SHA: HEAD,
      BOT_ISSUE_NUMBER: '42',
      BOT_REVIEW_DIR: reviewDir,
      BOT_EVIDENCE_PATH: outputPath,
      BOT_ROLLBACK: 'Revert the squash commit.',
      BOT_TEST_EVIDENCE: JSON.stringify([{ name: 'quality-gate', sha: HEAD }]),
    },
  });
}

test('assembler requires every applicable independent verdict before publishing evidence', () => {
  const directory = mkdtempSync(join(tmpdir(), 'fynnestlady-review-fixture-'));
  try {
    for (const role of ROLES) writeFileSync(join(directory, `${role}.json`), JSON.stringify({ status: 'pass', findings: [] }));
    const outputPath = join(directory, 'evidence.json');
    const passed = assemble(directory, outputPath);
    assert.equal(passed.status, 0, passed.stderr);
    const manifest = JSON.parse(readFileSync(outputPath, 'utf8'));
    assert.equal(manifest.headSha, HEAD);
    for (const role of ROLES) assert.equal(manifest.roles[role].headSha, HEAD);

    writeFileSync(join(directory, 'TestingAgent.json'), JSON.stringify({ status: 'fail', findings: ['Regression remains'] }));
    const rejected = assemble(directory, join(directory, 'rejected.json'));
    assert.notEqual(rejected.status, 0);
    assert.match(rejected.stderr, /TestingAgent blocked/);

    rmSync(join(directory, 'DesignAgent.json'));
    const missing = assemble(directory, join(directory, 'missing.json'));
    assert.notEqual(missing.status, 0);
  } finally {
    removeFixture(directory);
  }
});
