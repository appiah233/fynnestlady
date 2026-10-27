import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const databaseUrl = process.env.DATABASE_TEST_URL;

function psqlFile(path) {
  const result = spawnSync('psql', ['-X', '-v', 'ON_ERROR_STOP=1', '--dbname', databaseUrl, '-f', resolve(root, path)], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, PGPASSWORD: undefined },
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, `PostgreSQL verification failed in ${path}: ${result.stderr}`);
}

test('fresh disposable PostgreSQL applies migrations and enforces domain/RLS assertions', {
  skip: databaseUrl ? false : 'DATABASE_TEST_URL is not configured outside the database gate',
}, () => {
  assert.equal(process.env.FYNNESTLADY_DATABASE_TEST_DISPOSABLE, '1', 'Explicit disposable database flag required');
  assert.ok(databaseUrl, 'DATABASE_TEST_URL is required; database verification cannot be skipped');
  const parsed = new URL(databaseUrl);
  assert.ok(['postgres:', 'postgresql:'].includes(parsed.protocol), 'DATABASE_TEST_URL must be PostgreSQL');
  assert.ok(['localhost', '127.0.0.1'].includes(parsed.hostname), 'Database test must target local PostgreSQL');
  assert.match(parsed.pathname, /(?:test|fixture)/i, 'Database name must identify an isolated test database');

  psqlFile('supabase/tests/bootstrap_local.sql');
  const migrations = readdirSync(resolve(root, 'supabase/migrations'))
    .filter(name => /^\d+_[a-z0-9_]+\.sql$/.test(name)).sort();
  assert.ok(migrations.length > 0, 'At least one migration required');
  for (const migration of migrations) psqlFile(`supabase/migrations/${migration}`);
  psqlFile('supabase/tests/domain_foundation.sql');
});
