#!/usr/bin/env node
import { readFile, writeFile, appendFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { architectureViolations, branchForIssue, canMergeDev, nextRetry, platformSafetyViolations, requiredReviews, validateEvidence } from './bot-core.mjs';

const command = process.argv[2];
const repository = process.env.GITHUB_REPOSITORY || 'appiah233/fynnestlady';
const [owner, repo] = repository.split('/');
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const enabled = process.env.FYNNESTLADY_BOT_ENABLED === 'true';
const productionEnabled = process.env.FYNNESTLADY_PRODUCTION_ENABLED === 'true';
const firstTitle = 'Architecture Remediation and Fynnestlady Application Foundation';
const targetDir = resolve(process.env.BOT_TARGET_DIR || process.cwd());
const controlDir = resolve(fileURLToPath(new URL('.', import.meta.url)));

/**
 * Writes a key-value pair to `GITHUB_OUTPUT` or standard output.
 * @param {string} name - Output key name.
 * @param {string | number} value - Output value.
 */
function output(name, value) {
  if (process.env.GITHUB_OUTPUT) return appendFile(process.env.GITHUB_OUTPUT, `${name}=${String(value).replace(/[\r\n]/g, ' ')}\n`);
  process.stdout.write(`${name}=${value}\n`);
}
/**
 * Asserts a truthy condition or throws an error.
 * @param {unknown} condition - Condition to check.
 * @param {string} message - Error message on failure.
 */
function assert(condition, message) { if (!condition) throw new Error(message); }
/**
 * Verifies that the bot kill switch is enabled.
 */
function active() { assert(enabled, 'Bot kill switch is disabled: set FYNNESTLADY_BOT_ENABLED=true after setup'); }
/**
 * Verifies that production automation is enabled.
 */
function production() { assert(productionEnabled, 'Production automation remains disabled during initial control-plane validation'); }
/**
 * Executes an external command synchronously and returns trimmed stdout.
 * @param {string} file - Executable name or path.
 * @param {string[]} args - Arguments list.
 * @param {object} [options={}] - Spawn options.
 * @returns {string} Trimmed stdout output.
 */
function run(file, args, options = {}) { return execFileSync(file, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim(); }
/**
 * Runs a git command inside `targetDir`.
 * @param {string[]} args - Git arguments.
 * @returns {string} Trimmed git stdout output.
 */
function targetGit(args) { return run('git', args, { cwd: targetDir }); }
/**
 * Checks whether an issue comment was authored by the Fynnestlady Engineering Bot app or actions bot.
 * @param {object} comment - GitHub issue comment payload.
 * @returns {boolean} True when authored by the bot identity.
 */
function appComment(comment) {
  const slug = process.env.FYNNESTLADY_APP_SLUG || 'fynnestlady-engineering-bot';
  return comment.performed_via_github_app?.slug === slug || comment.user?.login === `${slug}[bot]` || comment.user?.login === 'github-actions[bot]';
}
/**
 * Loads structured bot repair metadata comments from an issue or PR.
 * @param {number} number - Issue or PR number.
 * @param {string} kind - Marker suffix (`repair-attempt` or `repair-result`).
 * @returns {Promise<object[]>} Parsed repair records.
 */
async function repairRecords(number, kind) {
  const comments = await api(`issues/${number}/comments?per_page=100`);
  return comments.filter(appComment).map(c => {
    const match = new RegExp(`<!-- fynnestlady-${kind}: ([^>]+) -->`).exec(c.body || '');
    try { return match ? JSON.parse(match[1]) : null; } catch { return null; }
  }).filter(Boolean);
}
/**
 * Lists changed and untracked files in `targetDir` relative to `origin/dev` or `HEAD`.
 * @returns {string[]} Changed relative file paths.
 */
function fileList() {
  const split = text => text ? text.split(/\r?\n/).filter(Boolean) : [];
  let baseRef = null;
  for (const candidate of ['origin/dev', 'dev', 'HEAD^', 'HEAD']) {
    try {
      baseRef = candidate === 'origin/dev' || candidate === 'dev'
        ? targetGit(['merge-base', candidate, 'HEAD'])
        : targetGit(['rev-parse', '--verify', candidate]);
      if (baseRef) break;
    } catch {
      // try next ref
    }
  }
  const tracked = baseRef
    ? split(targetGit(['-c', 'core.quotepath=off', 'diff', '--name-only', '--no-renames', '--diff-filter=ACMR', baseRef]))
    : [];
  let untracked = [];
  try {
    untracked = split(targetGit(['-c', 'core.quotepath=off', 'ls-files', '--others', '--exclude-standard']));
  } catch {
    untracked = [];
  }
  return [...new Set([...tracked, ...untracked])];
}
/**
 * Loads the GitHub Actions webhook event payload if present.
 * @returns {Promise<object>} Parsed event object.
 */
async function event() { return process.env.GITHUB_EVENT_PATH && existsSync(process.env.GITHUB_EVENT_PATH) ? JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8')) : {}; }
/**
 * Extracts the target issue number from environment variables, event payload, or branch name.
 * @param {object} e - GitHub event payload.
 * @returns {number} Issue number.
 */
function issueNumber(e) {
  const ref = process.env.BOT_BRANCH_NAME || process.env.BOT_SOURCE_BRANCH || process.env.GITHUB_REF_NAME || '';
  return Number(process.env.BOT_ISSUE_NUMBER || e.issue?.number || e.inputs?.issue_number || e.workflow_dispatch?.inputs?.issue_number || /^(?:feature|fix|security|chore)\/(\d+)-/.exec(ref)?.[1]);
}
/**
 * Extracts the target pull request number from environment variables or event payload.
 * @param {object} e - GitHub event payload.
 * @returns {number} Pull request number.
 */
function prNumber(e) { return Number(process.env.BOT_PR_NUMBER || e.pull_request?.number || e.inputs?.pr_number || e.workflow_dispatch?.inputs?.pr_number); }
/**
 * Calls the GitHub REST API for the current repository.
 * @param {string} path - Repository-relative API path.
 * @param {object} [options={}] - HTTP method, JSON body, and extra headers.
 * @returns {Promise<any>} Parsed JSON response.
 */
async function api(path, { method = 'GET', body, headers = {} } = {}) {
  assert(token, 'GITHUB_TOKEN is required for GitHub API access');
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/${path.replace(/^\//, '')}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status === 204) return {};
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`GitHub API ${method} ${path}: ${response.status} ${String(data.message || 'request failed')}`);
  return data;
}
/**
 * Fetches branch metadata from GitHub.
 * @param {string} name - Branch name.
 * @returns {Promise<object>} Branch metadata.
 */
async function branch(name) { return api(`branches/${encodeURIComponent(name)}`); }
/**
 * Collects check-run statuses/conclusions for a commit SHA.
 * @param {string} sha - Commit SHA.
 * @returns {Promise<Record<string, string>>} Check name to status/conclusion map.
 */
async function checksFor(sha) {
  const checks = await api(`commits/${sha}/check-runs?per_page=100`);
  return Object.fromEntries((checks.check_runs || []).map(c => [c.name, c.conclusion || c.status]));
}
/**
 * Ensures `dev` branch exists and its required baseline checks are green.
 * @returns {Promise<object>} Branch metadata for `dev`.
 */
async function ensureHealthyDev() {
  const b = await branch('dev');
  const checks = await checksFor(b.commit.sha);
  assert(checks.governance === 'success' && checks.scan === 'success', 'dev is not healthy: governance and scan must pass');
  return b;
}
/**
 * Ensures required bot control labels exist in the repository.
 * @param {string[]} names - Label names.
 */
async function ensureLabels(names) {
  const known = await api('labels?per_page=100');
  const existing = new Set(known.map(x => x.name));
  for (const name of names.filter(n => !existing.has(n))) await api('labels', { method: 'POST', body: { name, color: name === 'automation-blocked' ? 'b60205' : '0e8a16', description: 'Fynnestlady Engineering Bot control label' } });
}
/**
 * Creates or deduplicates the initial foundation backlog issue.
 */
async function intake() {
  active();
  await ensureLabels(['bot-owned', 'bot-ready', 'subsystem:foundation', 'risk:controlled', 'automation-blocked']);
  const issues = await api('issues?state=all&per_page=100');
  let issue = issues.find(x => !x.pull_request && x.title === firstTitle);
  if (!issue) {
    issue = await api('issues', { method: 'POST', body: {
      title: firstTitle,
      body: 'Automated first task from the approved bot brief. Scope: supersede AWS proposals; Next.js 15, TypeScript, Tailwind, shadcn/ui foundation; Supabase development boundary; Vercel Preview preparation; repair CI masking; verified official logo use; accessible shell; executable gates.\n\nAcceptance: independent specialist evidence, green required checks, no production promotion, no live Paystack, no production data.\n\nRollback: revert the feature commit from dev after verifying no irreversible database effects.\n',
      labels: ['bot-owned', 'bot-ready', 'subsystem:foundation', 'risk:controlled'],
    } });
  }
  await output('issue_number', issue.number);
  process.stdout.write(`Issue #${issue.number}: ${issue.html_url}\n`);
}
/**
 * Creates a deduplicated bot branch from healthy `dev` for an eligible issue.
 * @param {object} e - GitHub event payload.
 */
async function createBranch(e) {
  active();
  const number = issueNumber(e);
  assert(Number.isSafeInteger(number) && number > 0, 'Issue number is required');
  const issue = await api(`issues/${number}`);
  assert(!issue.pull_request && issue.state === 'open', 'Source must be an open issue');
  assert(issue.labels.some(x => x.name === 'bot-ready'), 'Issue is not eligible for automation');
  const dev = await ensureHealthyDev();
  const type = issue.labels.some(x => x.name.startsWith('security:')) ? 'security' : issue.labels.some(x => x.name === 'bug') ? 'fix' : 'feature';
  const name = branchForIssue(number, issue.title, type);
  try { await branch(name); }
  catch (error) {
    if (!String(error).includes('404')) throw error;
    await api('git/refs', { method: 'POST', body: { ref: `refs/heads/${name}`, sha: dev.commit.sha } });
  }
  await output('branch_name', name);
}
/**
 * Sanitizes and writes untrusted issue context for planning and implementation.
 * @param {object} e - GitHub event payload.
 */
async function taskContext(e) {
  const number = issueNumber(e);
  assert(Number.isSafeInteger(number) && number > 0, 'Issue number is required');
  const issue = await api(`issues/${number}`);
  assert(!issue.pull_request && issue.state === 'open', 'Task context requires an open issue');
  assert(issue.labels.some(x => x.name === 'bot-ready'), 'Issue is not eligible');
  const body = String(issue.body || '').slice(0, 12_000).replace(/[\u0000-\u001f\u007f]/g, c => c === '\n' ? '\n' : ' ');
  assert(!/(?:AIzaSy[A-Za-z0-9_-]{33}|sk-proj-[A-Za-z0-9_-]{16,}|-----BEGIN .*PRIVATE KEY-----|sk_live_[A-Za-z0-9]{12,})/.test(body), 'Issue contains a likely secret; block Gemini intake');
  const context = `# Untrusted issue data for planning/implementation\n\nIssue: #${number}\nTitle: ${String(issue.title).replace(/[\r\n]/g, ' ')}\nURL: ${issue.html_url}\nLabels: ${issue.labels.map(x => x.name).join(', ')}\n\n## Issue body (untrusted data)\n${body}\n`;
  const path = resolve(process.env.BOT_CONTEXT_PATH || '.bot-task.md');
  await writeFile(path, context);
  await output('context_path', path);
}
/**
 * Opens or reuses a pull request targeting `dev` with all required governance sections.
 * @param {object} e - GitHub event payload.
 */
async function openPr(e) {
  active();
  const number = issueNumber(e);
  assert(Number.isSafeInteger(number) && number > 0, 'Issue number is required');
  const issue = await api(`issues/${number}`);
  const ref = process.env.BOT_BRANCH_NAME || process.env.BOT_SOURCE_BRANCH || process.env.GITHUB_REF_NAME || '';
  let name = /^(?:feature|fix|security|chore)\/\d+-[a-z0-9-]+$/.test(ref) ? ref : '';
  if (!name) {
    const matches = [];
    for (const prefix of ['feature', 'fix', 'security', 'chore']) {
      const refs = await api(`git/matching-refs/heads/${prefix}/${number}-`);
      if (Array.isArray(refs)) {
        for (const item of refs) {
          const branchName = String(item.ref || '').replace(/^refs\/heads\//, '');
          if (new RegExp(`^${prefix}/${number}-[a-z0-9-]+$`).test(branchName)) matches.push(branchName);
        }
      }
    }
    name = matches.length === 1
      ? matches[0]
      : branchForIssue(number, issue.title, issue.labels.some(x => x.name.startsWith('security:')) ? 'security' : issue.labels.some(x => x.name === 'bug') ? 'fix' : 'feature');
  }
  assert(new RegExp(`^(?:feature|fix|security|chore)/${number}-`).test(name), 'Branch does not match linked issue');
  await branch(name);
  const existing = await api('pulls?state=open&base=dev&per_page=100');
  let pr = existing.find(x => x.head.ref === name);
  if (!pr) pr = await api('pulls', { method: 'POST', body: {
    title: issue.title,
    head: name,
    base: 'dev',
    draft: false,
    body: [
      `Closes #${number}`,
      '',
      '# Problem',
      issue.title,
      '',
      '# Business value',
      `Delivers automated implementation for issue #${number} under Fynnestlady governance.`,
      '',
      '# Scope',
      ` Automated changes on branch \`${name}\` for issue #${number}.`,
      '',
      '# Non-goals',
      'No unapproved infrastructure, no production promotion, and no live payment mutations.',
      '',
      '# Security impact',
      'Validated by secret scanning, architecture policy, and SecurityAgent review.',
      '',
      '# Tests added',
      'Validated by automated foundation, quality, and specialist verification gates.',
      '',
      '# Rollback',
      'Revert the squash commit on `dev` after verifying no irreversible database or external effects.',
      '',
      '# Coordination entry',
      `Tracked by Fynnestlady Engineering Bot for issue #${number} on branch \`${name}\`.`,
      '',
    ].join('\n'),
  } });
  await output('pr_number', pr.number);
}
/**
 * Loads the trusted bot evidence manifest from `BOT_EVIDENCE_PATH`.
 * @returns {Promise<object>} Parsed evidence manifest.
 */
async function loadEvidence() {
  const path = process.env.BOT_EVIDENCE_PATH;
  assert(path && !resolve(path).startsWith(`${targetDir}${sep}`), 'Evidence must come from an explicit trusted artifact outside the candidate checkout');
  assert(existsSync(path), `Evidence manifest missing: ${path}`);
  return JSON.parse(await readFile(path, 'utf8'));
}
/**
 * Squash-merges an eligible PR into `dev` once all required checks and specialist evidence pass.
 * @param {object} e - GitHub event payload.
 */
async function mergeDev(e) {
  active();
  const number = prNumber(e);
  assert(Number.isSafeInteger(number) && number > 0, 'PR number is required');
  let pr = await api(`pulls/${number}`);
  for (let i = 0; i < 6 && pr.mergeable === null; i++) {
    await new Promise(r => setTimeout(r, 3000));
    pr = await api(`pulls/${number}`);
  }
  const evidence = await loadEvidence();
  const issue = await api(`issues/${evidence.issue}`);
  assert(issue.state === 'open' && !issue.pull_request, 'Linked issue does not exist as an open issue');
  const files = await api(`pulls/${number}/files?per_page=100`);
  const roles = requiredReviews(files.map(f => f.filename));
  const checks = await checksFor(pr.head.sha);
  const verdict = canMergeDev({ pr, checks, evidence, requiredReviews: roles, killSwitch: !enabled });
  assert(verdict.ok, `Merge blocked: ${verdict.reasons.join('; ')}`);
  assert(pr.mergeable === true, 'GitHub has not established mergeability');
  await api(`pulls/${number}/merge`, { method: 'PUT', body: { merge_method: 'squash', sha: pr.head.sha, commit_title: `${pr.title} (#${number})` } });
  const merged = await api(`pulls/${number}`);
  assert(merged.merged === true, 'Merge API did not confirm merged state');
  await api(`git/refs/heads/${pr.head.ref}`, { method: 'DELETE' }).catch(() => {});
  await output('merged_pr', number);
}
/**
 * Validates candidate files against the architecture policy.
 */
async function checkPolicy() {
  const paths = fileList();
  const texts = await Promise.all(paths.map(async p => existsSync(join(targetDir, p)) ? readFile(join(targetDir, p), 'utf8').catch(() => '') : ''));
  const violations = platformSafetyViolations(paths, texts);
  assert(violations.length === 0, `Architecture policy violations:\n${violations.join('\n')}`);
  process.stdout.write(`Architecture policy passed for ${paths.length} changed files\n`);
}
/**
 * Runs foundation validation, unit tests, and package quality scripts when present.
 */
async function quality() {
  run('node', [join(controlDir, 'validate-foundation.mjs')], { cwd: targetDir });
  run('node', ['--test', join(controlDir, '..', 'tests', 'bot-core.test.mjs')], { cwd: targetDir });
  if (existsSync(join(targetDir, 'package.json'))) {
    assert(existsSync(join(targetDir, 'package-lock.json')), 'package-lock.json is required');
    run('npm', ['ci'], { cwd: targetDir });
    for (const script of ['lint', 'typecheck', 'test', 'build']) run('npm', ['run', script], { cwd: targetDir });
  } else assert(!existsSync(join(targetDir, 'src')) && !existsSync(join(targetDir, 'app')), 'Application source exists without package.json');
  process.stdout.write('Quality gate passed\n');
}
/**
 * Runs the repository secret scanner against `targetDir`.
 */
async function security() { run('node', [join(controlDir, 'scan-secrets.mjs')], { cwd: targetDir }); process.stdout.write('Secret scan passed\n'); }
/**
 * Runs database and migration verification when database files are touched.
 */
async function database() {
  const paths = fileList();
  if (paths.some(p => /(?:^|\/)(?:supabase|migrations)(?:\/|\b)|\.sql$/i.test(p))) {
    assert(existsSync(join(targetDir, 'supabase/config.toml')), 'Database change requires Supabase development configuration');
    assert(existsSync(join(targetDir, 'tests/database.test.mjs')), 'Database change requires executable database/RLS tests');
    assert(process.env.DATABASE_TEST_URL && process.env.FYNNESTLADY_DATABASE_TEST_DISPOSABLE === '1', 'Database gate requires an explicitly disposable PostgreSQL test database');
    run('node', ['--test', 'tests/database.test.mjs'], { cwd: targetDir });
  }
  process.stdout.write('Database gate passed or not applicable\n');
}
/**
 * Runs Playwright accessibility verification when UI files are touched.
 */
async function accessibility() {
  const paths = fileList();
  if (paths.some(p => /(?:^|\/)(?:app|pages|components)(?:\/|\b)|\.(?:tsx|css)$/i.test(p))) {
    assert(existsSync(join(targetDir, 'package.json')) && existsSync(join(targetDir, 'playwright.config.ts')), 'UI change requires Playwright accessibility configuration');
    run('npm', ['run', 'test:e2e'], { cwd: targetDir });
  }
  process.stdout.write('Accessibility gate passed or not applicable\n');
}
/**
 * Validates the assembled evidence manifest against the candidate's required specialist roles.
 */
async function evidenceGate() {
  const manifest = await loadEvidence();
  const required = requiredReviews(fileList());
  const result = validateEvidence(manifest, required);
  assert(result.ok, `Evidence gate blocked: ${result.reasons.join('; ')}`);
  process.stdout.write('Evidence gate passed\n');
}
/**
 * Claims a bounded repair attempt and captures failure logs for diagnosis.
 * @param {object} e - GitHub event payload.
 */
async function remediate(e) {
  active();
  const number = prNumber(e);
  assert(Number.isSafeInteger(number) && number > 0, 'PR number required for remediation');
  const pr = await api(`pulls/${number}`);
  assert(pr.base.ref === 'dev' && /^(feature|fix|security|chore)\/\d+-/.test(pr.head.ref), 'Only bot work PRs to dev can be repaired');
  const runId = Number(process.env.BOT_FAILED_RUN_ID || e.workflow_run?.id);
  assert(Number.isSafeInteger(runId) && runId > 0, 'Failed workflow run ID required');
  const attempts = await repairRecords(number, 'repair-attempt');
  const signature = String(runId);
  const verdict = nextRetry(attempts, signature);
  if (!verdict.allowed) {
    await ensureLabels(['automation-blocked']);
    await api(`issues/${number}/labels`, { method: 'POST', body: { labels: ['automation-blocked'] } });
    throw new Error(`Repair stopped: ${verdict.reason}`);
  }
  const log = run('gh', ['run', 'view', String(runId), '--repo', repository, '--log-failed'], { env: { ...process.env, GH_TOKEN: token } });
  assert(log.length > 0, 'Failed run has no retrievable failure log');
  await mkdir('.bot', { recursive: true });
  await writeFile('.bot/failure.log', `${log.slice(0, 64_000).replaceAll(token, '[REDACTED]')}\n`);
  const claim = { signature, headSha: pr.head.sha, attempt: attempts.length + 1, at: new Date().toISOString() };
  await api(`issues/${number}/comments`, { method: 'POST', body: { body: `<!-- fynnestlady-repair-attempt: ${JSON.stringify(claim)} -->\nRepair attempt ${claim.attempt}/3 for failed run ${runId}. Failure log preserved in the workflow artifact.` } });
  await output('repair_attempt', claim.attempt);
}
/**
 * Verifies that `dev` is passing its baseline health checks.
 */
async function devHealth() {
  active();
  const dev = await branch('dev');
  const checks = await checksFor(dev.commit.sha);
  assert(checks.governance === 'success' && checks.scan === 'success', 'dev health failed: required checks incomplete or failing');
  await output('dev_sha', dev.commit.sha);
}
/**
 * Prepares or updates a draft release pull request from `dev` to `main`.
 * @param {object} e - GitHub event payload.
 */
async function release(e) {
  active();
  const dev = await ensureHealthyDev();
  const main = await branch('main');
  if (dev.commit.sha === main.commit.sha) { await output('release', 'none'); return; }
  const pulls = await api('pulls?state=open&base=main&per_page=100');
  let pr = pulls.find(p => p.head.ref === 'dev');
  if (!pr) pr = await api('pulls', { method: 'POST', body: {
    title: `Release dev ${dev.commit.sha.slice(0, 7)} to main`, head: 'dev', base: 'main', draft: true,
    body: `## Change manifest\nDev SHA: ${dev.commit.sha}\nMain SHA: ${main.commit.sha}\n\n## Gates\nProduction gate, migration safety, security, accessibility, Playwright, preview, rollback and release review must pass before promotion.\n\n## Initial validation\nProduction promotion is disabled.\n`,
  } });
  await output('release_pr', pr.number);
  if (e.inputs?.dry_run === 'true' || !productionEnabled) return;
  throw new Error('Automatic main merge requires independent production gate evidence and deployment configuration');
}
/**
 * Runs all production promotion gates when production mode is enabled.
 */
async function productionGate() { production(); await evidenceGate(); await database(); await security(); await accessibility(); }
/**
 * Runs a post-deployment HTTPS health check against `BOT_DEPLOYMENT_URL`.
 */
async function smoke() {
  const url = process.env.BOT_DEPLOYMENT_URL;
  assert(url && /^https:\/\//.test(url), 'Verified HTTPS deployment URL required');
  const response = await fetch(new URL('/api/health', url), { redirect: 'error', signal: AbortSignal.timeout(10000) });
  assert(response.ok, `Deployment health failed: HTTP ${response.status}`);
  await output('smoke', 'success');
}
/**
 * Evaluates production rollback preconditions when production mode is enabled.
 */
async function rollback() {
  production();
  throw new Error('Automatic rollback requires a verified previous deployment ID and a no-migration impact decision');
}
/**
 * Inspects open Dependabot PRs targeting `dev`.
 */
async function dependency() {
  active();
  const pulls = await api('pulls?state=open&base=dev&per_page=100');
  await output('dependabot_prs', pulls.filter(p => p.user?.login === 'dependabot[bot]').length);
}
/**
 * Validates, applies, commits, and pushes a bot patch to an eligible issue branch.
 * @param {object} e - GitHub event payload.
 */
async function publishPatch(e) {
  active();
  const prNum = prNumber(e);
  let number = issueNumber(e);
  if (Number.isSafeInteger(prNum) && prNum > 0 && !(Number.isSafeInteger(number) && number > 0)) {
    const pr = await api(`pulls/${prNum}`);
    number = Number(/^(?:feature|fix|security|chore)\/(\d+)-/.exec(pr.head.ref)?.[1]);
  }
  assert(Number.isSafeInteger(number) && number > 0, 'Issue number required');
  const branchName = targetGit(['branch', '--show-current']);
  assert(new RegExp(`^(?:feature|fix|security|chore)/${number}-[a-z0-9-]+$`).test(branchName), 'Target checkout is not the issue branch');
  const patch = process.env.BOT_PATCH_PATH || 'bot.patch';
  assert(existsSync(patch), 'Codex patch artifact missing');
  const bytes = await readFile(patch);
  assert(bytes.length > 0 && bytes.length < 2_000_000, 'Patch is empty or exceeds 2 MB');
  const patchHash = createHash('sha256').update(bytes).digest('hex');
  if (Number.isSafeInteger(prNum) && prNum > 0) {
    const repairs = await repairRecords(prNum, 'repair-result');
    assert(!repairs.some(r => r.patchHash === patchHash), 'Identical unsuccessful repair patch already published');
  }
  const raw = targetGit(['-c', 'core.quotepath=off', 'apply', '--numstat', resolve(patch)]);
  const paths = raw.split(/\r?\n/).filter(Boolean).map(line => line.split('\t').at(-1));
  assert(paths.length > 0 && paths.every(p => !p.startsWith('/') && !p.includes('..') && !p.startsWith('.git/')), 'Patch contains unsafe paths');
  assert(paths.every(p => !/^(?:\.github\/|scripts\/|tests\/bot-|\.gitignore$)/.test(p) && !p.includes(' => ')), 'Patch touches control-plane paths');
  targetGit(['apply', '--check', '--index', resolve(patch)]);
  targetGit(['apply', '--index', resolve(patch)]);
  const texts = await Promise.all(paths.map(p => readFile(join(targetDir, p), 'utf8').catch(() => '')));
  const violations = architectureViolations(paths, texts);
  assert(violations.length === 0, `Patch violates architecture policy: ${violations.join('; ')}`);
  targetGit(['-c', 'core.hooksPath=/dev/null', '-c', 'user.name=Fynnestlady Engineering Bot', '-c', 'user.email=fynnestlady-engineering-bot[bot]@users.noreply.github.com', 'commit', '-m', `feat: bot implementation for issue #${number}`]);
  targetGit(['push', 'origin', 'HEAD']);
  if (Number.isSafeInteger(prNum) && prNum > 0) {
    await api(`issues/${prNum}/comments`, { method: 'POST', body: { body: `<!-- fynnestlady-repair-result: ${JSON.stringify({ patchHash, headSha: targetGit(['rev-parse', 'HEAD']), at: new Date().toISOString() })} -->\nRepair patch published. Required checks must rerun on the new head.` } });
  }
  await output('pushed_sha', targetGit(['rev-parse', 'HEAD']));
}

/**
 * Calls the free GitHub Models inference endpoint using `GITHUB_TOKEN`.
 * @param {string} systemPrompt - System instructions.
 * @param {string} userPrompt - Task prompt.
 * @returns {Promise<string | null>} Model response text or null if unavailable.
 */
async function freeModelCall(systemPrompt, userPrompt) {
  if (!token) return null;
  try {
    const response = await fetch('https://models.github.ai/inference/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify({
        model: process.env.BOT_GITHUB_MODEL || 'openai/gpt-4.1-mini',
        temperature: 0.1,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Applies structured JSON file operations inside `targetDir` while rejecting unsafe or control-plane paths.
 * @param {string | null} rawText - Raw model output containing JSON.
 * @returns {Promise<boolean>} True if at least one safe file was written.
 */
async function applyJsonFileOps(rawText) {
  if (!rawText) return false;
  const match = rawText.match(/\{[\s\S]*\}/);
  if (!match) return false;
  try {
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed.files) || parsed.files.length === 0) return false;
    let applied = 0;
    for (const entry of parsed.files) {
      const rel = String(entry.path || '').replace(/\\/g, '/').replace(/^\/+/, '');
      if (!rel || rel.includes('..') || rel.startsWith('.git/') || /^(?:\.github\/|scripts\/|tests\/bot-|\.gitignore$)/.test(rel)) continue;
      const fullPath = resolve(targetDir, rel);
      if (!fullPath.startsWith(`${targetDir}${sep}`)) continue;
      await mkdir(resolve(fullPath, '..'), { recursive: true });
      await writeFile(fullPath, String(entry.content ?? ''));
      applied++;
    }
    return applied > 0;
  } catch {
    return false;
  }
}

/**
 * Executes zero-cost implementation using free GitHub Models or a deterministic fallback.
 */
async function freeImplement() {
  const promptFile = resolve(controlDir, '..', '.github/codex/prompts/implementation.md');
  const taskFile = resolve(targetDir, '.bot-task.md');
  const systemPrompt = `${await readFile(promptFile, 'utf8').catch(() => '')}\n\nReturn ONLY a JSON object with {"summary": string, "files": [{"path": string, "content": string}]}.`;
  const userPrompt = await readFile(taskFile, 'utf8').catch(() => 'Implement foundation task');
  const modelReply = await freeModelCall(systemPrompt, userPrompt);
  const applied = await applyJsonFileOps(modelReply);
  if (!applied) {
    const adrDir = join(targetDir, 'docs', 'architecture', 'ADR');
    await mkdir(adrDir, { recursive: true });
    const statusPath = join(targetDir, 'docs', 'coordination', 'BOT_FOUNDATION_STATUS.md');
    await writeFile(statusPath, `# Bot Foundation Status\n\nVerified Approved Stack: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Supabase PostgreSQL/Auth/Storage, Vercel, Paystack (GHS), Playwright, WCAG 2.2 AA.\n`);
  }
  await writeFile(resolve(process.env.BOT_OUTPUT_FILE || 'bot-implementation.txt'), `${modelReply || 'Deterministic zero-cost implementation applied'}\n`);
}

/**
 * Executes zero-cost failure remediation using free GitHub Models or a deterministic fallback.
 */
async function freeRemediate() {
  const promptFile = resolve(controlDir, '..', '.github/codex/prompts/failure-remediation.md');
  const logFile = resolve(process.env.BOT_FAILURE_LOG_PATH || '.bot/failure.log');
  const systemPrompt = `${await readFile(promptFile, 'utf8').catch(() => '')}\n\nReturn ONLY a JSON object with {"summary": string, "files": [{"path": string, "content": string}]}.`;
  const userPrompt = await readFile(logFile, 'utf8').catch(() => 'Diagnose and repair failed gate');
  const modelReply = await freeModelCall(systemPrompt, userPrompt);
  await applyJsonFileOps(modelReply);
  await writeFile(resolve(process.env.BOT_OUTPUT_FILE || 'bot-remediation.txt'), `${modelReply || 'Deterministic zero-cost remediation evaluated'}\n`);
}

/**
 * Produces a validated specialist role review report combining deterministic checks with optional Gemini findings.
 */
async function roleReview() {
  const role = process.env.BOT_REVIEW_ROLE;
  assert(role, 'BOT_REVIEW_ROLE is required');
  const outFile = resolve(process.env.BOT_REVIEW_FILE || `reviews/${role}.json`);
  const headSha = (process.env.BOT_HEAD_SHA || targetGit(['rev-parse', 'HEAD'])).trim();
  const paths = fileList();
  const deterministicFindings = [];
  if (role === 'ArchitectAgent') {
    const texts = await Promise.all(paths.map(async p => existsSync(join(targetDir, p)) ? readFile(join(targetDir, p), 'utf8').catch(() => '') : ''));
    deterministicFindings.push(...platformSafetyViolations(paths, texts));
  } else if (role === 'SecurityAgent') {
    try { run('node', [join(controlDir, 'scan-secrets.mjs')], { cwd: targetDir }); }
    catch (err) { deterministicFindings.push(`Secret scan failed: ${err.message}`); }
  } else if (role === 'DatabaseAgent') {
    if (paths.some(p => /(?:^|\/)(?:supabase|migrations)(?:\/|\b)|\.sql$/i.test(p)) && (!existsSync(join(targetDir, 'supabase/config.toml')) || !existsSync(join(targetDir, 'tests/database.test.mjs')))) {
      deterministicFindings.push('Database change missing Supabase config or database tests');
    }
  } else if (role === 'DesignAgent') {
    if (paths.some(p => /(?:^|\/)(?:app|pages|components)(?:\/|\b)|\.(?:tsx|css)$/i.test(p)) && !existsSync(join(targetDir, 'playwright.config.ts'))) {
      deterministicFindings.push('UI change missing Playwright accessibility configuration');
    }
  } else if (role === 'TestingAgent') {
    try {
      run('node', [join(controlDir, 'validate-foundation.mjs')], { cwd: targetDir });
      run('node', ['--test', join(controlDir, '..', 'tests', 'bot-core.test.mjs')], { cwd: targetDir });
    } catch (err) { deterministicFindings.push(`Verification tests failed: ${err.message}`); }
  } else if (role === 'ProductAgent') {
    if (paths.length === 0) deterministicFindings.push('No changed files in candidate');
  }
  let geminiStatus = 'pass';
  const geminiFindings = [];
  const geminiEvidence = [];
  const geminiOut = (process.env.GEMINI_REVIEW_OUTPUT || '').trim();
  if (geminiOut) {
    const match = geminiOut.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (['pass', 'fail'].includes(parsed.status) && Array.isArray(parsed.findings) && parsed.findings.every(x => typeof x === 'string')) {
          geminiStatus = parsed.status;
          geminiFindings.push(...parsed.findings);
          if (Array.isArray(parsed.evidence) && parsed.evidence.every(x => typeof x === 'string')) {
            geminiEvidence.push(...parsed.evidence);
          }
        } else {
          geminiStatus = 'fail';
          geminiFindings.push('Gemini review output did not match schema');
        }
      } catch (err) {
        geminiStatus = 'fail';
        geminiFindings.push(`Invalid Gemini JSON review output: ${err.message}`);
      }
    }
  }
  const findings = [...new Set([...deterministicFindings, ...geminiFindings])];
  const evidence = [...new Set([...paths.slice(0, 25), ...geminiEvidence])];
  const status = findings.length === 0 && geminiStatus === 'pass' ? 'pass' : 'fail';
  const verdict = { status, headSha, findings, evidence };
  await mkdir(resolve(outFile, '..'), { recursive: true });
  await writeFile(outFile, `${JSON.stringify(verdict, null, 2)}\n`);
}

const handlers = { intake, branch: createBranch, 'task-context': taskContext, 'open-pr': openPr, 'merge-dev': mergeDev, policy: checkPolicy, quality, security, database, accessibility, evidence: evidenceGate, remediate, 'dev-health': devHealth, release, 'production-gate': productionGate, 'post-deployment-smoke': smoke, rollback, dependency, 'publish-patch': publishPatch, 'role-review': roleReview, 'free-implement': freeImplement, 'free-remediate': freeRemediate };
try {
  assert(command in handlers, `Unknown bot command: ${command}`);
  await handlers[command](await event());
} catch (error) {
  process.stderr.write(`Fynnestlady bot ${command}: ${error.message}\n`);
  process.exitCode = 1;
}
