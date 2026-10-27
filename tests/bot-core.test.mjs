import test from 'node:test';
import assert from 'node:assert/strict';
import {
  architectureViolations,
  branchForIssue,
  canMergeDev,  canMergeOldPr,  latestReviewStates,  nextRetry,
  platformSafetyViolations,
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

test('platform safety guard blocks destructive SQL, Supabase Auth, client secret leaks, unsafe XSS, and RULES.md tampering', () => {
  assert.notEqual(
    platformSafetyViolations(
      ['supabase/migrations/20261028000000_bad.sql'],
      ['DROP TABLE public.products;']
    ).length,
    0,
    'destructive DROP TABLE in migrations must be blocked'
  );
  assert.notEqual(
    platformSafetyViolations(
      ['supabase/migrations/20261028000000_bad_rls.sql'],
      ['ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;']
    ).length,
    0,
    'disabling RLS in migrations must be blocked'
  );
  assert.notEqual(
    platformSafetyViolations(
      ['src/components/login.tsx'],
      ['"use client";\nsupabase.auth.signInWithPassword({ email, password });']
    ).length,
    0,
    'Supabase Auth usage must be blocked under Clerk-only policy'
  );
  assert.notEqual(
    platformSafetyViolations(
      ['src/components/bad-client.tsx'],
      ['"use client";\nconst key = process.env.CLERK_SECRET_KEY;']
    ).length,
    0,
    'client reference to server secret must be blocked'
  );
  assert.notEqual(
    platformSafetyViolations(
      ['src/components/xss.tsx'],
      ['export const X = () => <div dangerouslySetInnerHTML={{ __html: raw }} />;']
    ).length,
    0,
    'dangerouslySetInnerHTML must be blocked'
  );
  assert.notEqual(
    platformSafetyViolations(['.env.production'], ['KEY=val']).length,
    0,
    'tracked .env files must be blocked'
  );
  assert.notEqual(
    platformSafetyViolations(['RULES.md'], ['# Weakened rules without owner']).length,
    0,
    'RULES.md tampering must be blocked'
  );
  const blockedReview = mergeInput();
  blockedReview.pr.reviews = [{ state: 'CHANGES_REQUESTED' }];
  assert.equal(canMergeDev(blockedReview).ok, false);
});

test('latest review per reviewer decides merge: a bot change request blocks, a later approval clears it', () => {
  const bot = { login: 'fynnestlady-engineering-bot[bot]' };
  const blocked = latestReviewStates([
    { user: bot, state: 'APPROVED', submitted_at: '2026-10-27T10:00:00Z' },
    { user: bot, state: 'CHANGES_REQUESTED', submitted_at: '2026-10-27T11:00:00Z' },
    { user: bot, state: 'COMMENTED', submitted_at: '2026-10-27T12:00:00Z' },
  ]);
  assert.deepEqual(blocked, [{ login: bot.login, state: 'CHANGES_REQUESTED' }]);
  const blockedMerge = mergeInput();
  blockedMerge.pr.reviews = blocked;
  assert.equal(canMergeDev(blockedMerge).ok, false);

  const cleared = latestReviewStates([
    { user: bot, state: 'CHANGES_REQUESTED', submitted_at: '2026-10-27T11:00:00Z' },
    { user: bot, state: 'APPROVED', submitted_at: '2026-10-27T13:00:00Z' },
  ]);
  const clearedMerge = mergeInput();
  clearedMerge.pr.reviews = cleared;
  assert.equal(canMergeDev(clearedMerge).ok, true);
});

test('canMergeOldPr safely allows merge only if it does not harm current application status', () => {
  const validPr = {
    number: 7,
    base: { ref: 'dev' },
    head: { sha: HEAD },
    draft: false,
    state: 'open',
    mergeable: true,
    mergeable_state: 'clean',
  };

  // Safe clean PR
  const safeResult = canMergeOldPr({
    pr: validPr,
    files: [{ filename: 'docs/guide.md', status: 'modified' }],
    fileContents: ['Safe documentation update'],
  });
  assert.equal(safeResult.ok, true);

  // Blocked if PR has merge conflicts with current dev
  const conflictPr = { ...validPr, mergeable: false, mergeable_state: 'dirty' };
  assert.equal(canMergeOldPr({ pr: conflictPr }).ok, false);

  // Blocked if PR deletes critical application files (e.g. src/app/page.tsx or package.json)
  const deletingPr = canMergeOldPr({
    pr: validPr,
    files: [{ filename: 'src/app/page.tsx', status: 'removed' }],
  });
  assert.equal(deletingPr.ok, false);
  assert.match(deletingPr.reasons.join(' '), /deletes critical application files/);

  // Blocked if PR introduces platform safety violations (e.g. destructive SQL or Supabase Auth)
  const unsafePr = canMergeOldPr({
    pr: validPr,
    files: [{ filename: 'supabase/migrations/bad.sql', status: 'added' }],
    fileContents: ['DROP TABLE public.products;'],
  });
  assert.equal(unsafePr.ok, false);
  assert.match(unsafePr.reasons.join(' '), /Destructive SQL/);

  // Blocked if PR has standing CHANGES_REQUESTED review
  const requestedChangesPr = {
    ...validPr,
    reviews: [{ state: 'CHANGES_REQUESTED' }],
  };
  assert.equal(canMergeOldPr({ pr: requestedChangesPr }).ok, false);
});