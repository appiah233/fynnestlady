import test from 'node:test';
import assert from 'node:assert/strict';
import {
  architectureViolations,
  branchForIssue,
  canMergeDev,
  nextRetry,
  REQUIRED_CHECKS,
  requiredReviews,
  validateEvidence,
} from '../scripts/bot-core.mjs';

const HEAD = 'a'.repeat(40);
const ROLES = ['ArchitectAgent', 'SecurityAgent', 'TestingAgent'];

function passingEvidence() {
  return {
    headSha: HEAD,
    issue: 42,
    roles: Object.fromEntries(ROLES.map((role) => [role, { status: 'pass', headSha: HEAD }])),
    checks: Object.fromEntries(REQUIRED_CHECKS.map((check) => [check, 'success'])),
    rollback: 'Revert the squash commit on dev.',
    tests: ['node --test tests/*.test.mjs'],
    architecture: { status: 'pass', headSha: HEAD },
  };
}

function mergeInput() {
  return {
    pr: {
      number: 9,
      base: { ref: 'dev' },
      head: { sha: HEAD },
      draft: false,
      state: 'open',
      mergeable_state: 'clean',
      issue: 42,
    },
    checks: Object.fromEntries(REQUIRED_CHECKS.map((check) => [check, 'success'])),
    evidence: passingEvidence(),
    requiredReviews: ROLES,
    killSwitch: false,
  };
}

test('normal work branches are tied to an issue and do not escape the naming scheme', () => {
  const branch = branchForIssue(42, 'Accessible Product Shell!', 'feature');
  assert.match(branch, /^feature\/42-[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.doesNotMatch(branch, /[!\s]/);
});

test('architecture policy flags unapproved production dependencies', () => {
  for (const source of [
    'import { S3Client } from "@aws-sdk/client-s3"',
    'import { PrismaClient } from "@prisma/client"',
    'import NextAuth from "next-auth"',
  ]) {
    assert.notEqual(architectureViolations(['src/server/integration.ts'], [source]).length, 0, source);
  }
  assert.notEqual(
    architectureViolations(['infra/deployment.yml'], ['hosting: EC2\nstorage: S3']).length,
    0,
    'infrastructure YAML must not bypass the architecture gate',
  );
  assert.deepEqual(
    architectureViolations(['public/brand/logo.jpeg'], ['binary bytes containing EC2 and S3']),
    [],
    'binary brand assets must not be decoded as architecture text',
  );
});

test('frontend changes require independent design and testing review', () => {
  const roles = requiredReviews(['src/app/page.tsx', 'src/components/product-card.tsx']);
  assert.ok(roles.includes('DesignAgent'));
  assert.ok(roles.includes('TestingAgent'));
});

test('database changes require database, security, and testing review', () => {
  const roles = requiredReviews(['supabase/migrations/20261026000000_products.sql']);
  for (const role of ['DatabaseAgent', 'SecurityAgent', 'TestingAgent']) {
    assert.ok(roles.includes(role), `${role} must review migrations`);
  }
});

test('evidence is bound to the exact head and independent reviewer decisions', () => {
  const good = passingEvidence();
  assert.equal(validateEvidence(good, ROLES).ok, true);

  const stale = passingEvidence();
  stale.roles.TestingAgent.headSha = 'b'.repeat(40);
  assert.equal(validateEvidence(stale, ROLES).ok, false);

  const rejected = passingEvidence();
  rejected.roles.SecurityAgent.status = 'fail';
  assert.equal(validateEvidence(rejected, ROLES).ok, false);

  const missing = passingEvidence();
  delete missing.roles.TestingAgent;
  assert.equal(validateEvidence(missing, ROLES).ok, false);

  const noRollback = passingEvidence();
  noRollback.rollback = '';
  assert.equal(validateEvidence(noRollback, ROLES).ok, false);

  const noTests = passingEvidence();
  noTests.tests = [];
  assert.equal(validateEvidence(noTests, ROLES).ok, false);

  const staleArchitecture = passingEvidence();
  staleArchitecture.architecture.headSha = 'b'.repeat(40);
  assert.equal(validateEvidence(staleArchitecture, ROLES).ok, false);
});

test('merge controller fails closed for main, failed checks, missing evidence, and kill switch', () => {
  const valid = mergeInput();
  assert.equal(canMergeDev(valid).ok, true);

  const main = mergeInput();
  main.pr.base.ref = 'main';
  assert.equal(canMergeDev(main).ok, false);

  const failed = mergeInput();
  failed.checks['quality-gate'] = 'failure';
  assert.equal(canMergeDev(failed).ok, false);

  const unreported = mergeInput();
  delete unreported.checks['security-gate'];
  assert.equal(canMergeDev(unreported).ok, false);

  const stale = mergeInput();
  stale.pr.head.sha = 'b'.repeat(40);
  assert.equal(canMergeDev(stale).ok, false);

  const unresolved = mergeInput();
  unresolved.pr.requested_reviewers = [{ login: 'reviewer' }];
  assert.equal(canMergeDev(unresolved).ok, false);

  const draft = mergeInput();
  draft.pr.draft = true;
  assert.equal(canMergeDev(draft).ok, false);

  const unmergeable = mergeInput();
  unmergeable.pr.mergeable_state = 'dirty';
  assert.equal(canMergeDev(unmergeable).ok, false);

  const missing = mergeInput();
  missing.evidence = null;
  assert.equal(canMergeDev(missing).ok, false);

  const disabled = mergeInput();
  disabled.killSwitch = true;
  assert.equal(canMergeDev(disabled).ok, false);
});

test('retry controller caps attempts and rejects a repeated unsuccessful fix', () => {
  assert.equal(nextRetry([], 'fix-A').allowed, true);
  assert.equal(nextRetry([{ signature: 'fix-A' }], 'fix-A').allowed, false);
  assert.equal(nextRetry([
    { signature: 'fix-A' },
    { signature: 'fix-B' },
    { signature: 'fix-C' },
  ], 'fix-D').allowed, false);
});
