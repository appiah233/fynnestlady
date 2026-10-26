#!/usr/bin/env node
import { readFile, writeFile, appendFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { architectureViolations, branchForIssue, canMergeDev, nextRetry, requiredReviews, validateEvidence } from './bot-core.mjs';

const command = process.argv[2];
const repository = process.env.GITHUB_REPOSITORY || 'appiah233/fynnestlady';
const [owner, repo] = repository.split('/');
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const enabled = process.env.FYNNESTLADY_BOT_ENABLED === 'true';
const productionEnabled = process.env.FYNNESTLADY_PRODUCTION_ENABLED === 'true';
const firstTitle = 'Architecture Remediation and Fynnestlady Application Foundation';
const targetDir = resolve(process.env.BOT_TARGET_DIR || process.cwd());
const controlDir = resolve(fileURLToPath(new URL('.', import.meta.url)));

function output(name, value) {
  if (process.env.GITHUB_OUTPUT) return appendFile(process.env.GITHUB_OUTPUT, `${name}=${String(value).replace(/[\r\n]/g, ' ')}\n`);
  process.stdout.write(`${name}=${value}\n`);
}
function assert(condition, message) { if (!condition) throw new Error(message); }
function active() { assert(enabled, 'Bot kill switch is disabled: set FYNNESTLADY_BOT_ENABLED=true after setup'); }
function production() { assert(productionEnabled, 'Production automation remains disabled during initial control-plane validation'); }
function run(file, args, options = {}) { return execFileSync(file, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim(); }
function targetGit(args) { return run('git', args, { cwd: targetDir }); }
function appComment(comment) {
  const slug = process.env.FYNNESTLADY_APP_SLUG || 'fynnestlady-engineering-bot';
  return comment.performed_via_github_app?.slug === slug || comment.user?.login === `${slug}[bot]`;
}
async function repairRecords(number, kind) {
  const comments = await api(`issues/${number}/comments?per_page=100`);
  return comments.filter(appComment).map(c => {
    const match = new RegExp(`<!-- fynnestlady-${kind}: ([^>]+) -->`).exec(c.body || '');
    try { return match ? JSON.parse(match[1]) : null; } catch { return null; }
  }).filter(Boolean);
}
function fileList() {
  try { return targetGit(['diff', '--name-only', '--diff-filter=ACMR', 'origin/dev...HEAD']).split(/\r?\n/).filter(Boolean); }
  catch { return targetGit(['diff', '--name-only', '--diff-filter=ACMR', 'HEAD^', 'HEAD']).split(/\r?\n/).filter(Boolean); }
}
async function event() { return process.env.GITHUB_EVENT_PATH && existsSync(process.env.GITHUB_EVENT_PATH) ? JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8')) : {}; }
function issueNumber(e) {
  const ref = process.env.BOT_BRANCH_NAME || process.env.GITHUB_REF_NAME || '';
  return Number(process.env.BOT_ISSUE_NUMBER || e.issue?.number || e.inputs?.issue_number || e.workflow_dispatch?.inputs?.issue_number || /^(?:feature|fix|security|chore)\/(\d+)-/.exec(ref)?.[1]);
}
function prNumber(e) { return Number(process.env.BOT_PR_NUMBER || e.pull_request?.number || e.inputs?.pr_number || e.workflow_dispatch?.inputs?.pr_number); }
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
async function branch(name) { return api(`branches/${encodeURIComponent(name)}`); }
async function checksFor(sha) {
  const checks = await api(`commits/${sha}/check-runs?per_page=100`);
  return Object.fromEntries((checks.check_runs || []).map(c => [c.name, c.status === 'completed' ? c.conclusion : c.status]));
}
async function ensureHealthyDev() {
  const b = await branch('dev');
  const checks = await checksFor(b.commit.sha);
  assert(checks.governance === 'success' && checks.scan === 'success', 'dev is not healthy: governance and scan must pass');
  return b;
}
async function ensureLabels(names) {
  const known = await api('labels?per_page=100');
  const existing = new Set(known.map(x => x.name));
  for (const name of names.filter(n => !existing.has(n))) await api('labels', { method: 'POST', body: { name, color: name === 'automation-blocked' ? 'b60205' : '0e8a16', description: 'Fynnestlady Engineering Bot control label' } });
}
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
async function openPr(e) {
  active();
  const number = issueNumber(e);
  assert(Number.isSafeInteger(number) && number > 0, 'Issue number is required');
  const issue = await api(`issues/${number}`);
  const ref = process.env.BOT_BRANCH_NAME || process.env.GITHUB_REF_NAME || '';
  const name = /^(?:feature|fix|security|chore)\/\d+-[a-z0-9-]+$/.test(ref) ? ref : branchForIssue(number, issue.title, issue.labels.some(x => x.name === 'bug') ? 'fix' : 'feature');
  assert(new RegExp(`^(?:feature|fix|security|chore)/${number}-`).test(name), 'Branch does not match linked issue');
  await branch(name);
  const existing = await api('pulls?state=open&base=dev&per_page=100');
  let pr = existing.find(x => x.head.ref === name);
  if (!pr) pr = await api('pulls', { method: 'POST', body: {
    title: issue.title,
    head: name,
    base: 'dev',
    draft: false,
    body: `Closes #${number}\n\n## Outcome\n${issue.title}\n\n## Evidence\nBot evidence manifest and independent reviews are required before merge.\n\n## Rollback\nRevert the squash commit after checking for external and database effects.\n`,
  } });
  await output('pr_number', pr.number);
}
async function loadEvidence() {
  const path = process.env.BOT_EVIDENCE_PATH;
  assert(path && !resolve(path).startsWith(`${targetDir}${sep}`), 'Evidence must come from an explicit trusted artifact outside the candidate checkout');
  assert(existsSync(path), `Evidence manifest missing: ${path}`);
  return JSON.parse(await readFile(path, 'utf8'));
}
async function mergeDev(e) {
  active();
  const number = prNumber(e);
  assert(Number.isSafeInteger(number) && number > 0, 'PR number is required');
  const pr = await api(`pulls/${number}`);
  const evidence = await loadEvidence();
  const issue = await api(`issues/${evidence.issue}`);
  assert(issue.state === 'open' && !issue.pull_request, 'Linked issue does not exist as an open issue');
  const files = await api(`pulls/${number}/files?per_page=100`);
  const roles = requiredReviews(files.map(f => f.filename));
  const checks = await checksFor(pr.head.sha);
  const verdict = canMergeDev({ pr, checks, evidence, requiredReviews: roles, killSwitch: !enabled });
  assert(verdict.ok, `Merge blocked: ${verdict.reasons.join('; ')}`);
  const reviews = await api(`pulls/${number}/reviews?per_page=100`);
  assert(reviews.some(r => r.state === 'APPROVED' && r.commit_id === pr.head.sha && r.user?.login !== pr.user?.login), 'Independent GitHub review missing');
  assert(pr.mergeable === true, 'GitHub has not established mergeability');
  await api(`pulls/${number}/merge`, { method: 'PUT', body: { merge_method: 'squash', sha: pr.head.sha, commit_title: `${pr.title} (#${number})` } });
  const merged = await api(`pulls/${number}`);
  assert(merged.merged === true, 'Merge API did not confirm merged state');
  await api(`git/refs/heads/${encodeURIComponent(pr.head.ref)}`, { method: 'DELETE' });
  await output('merged_pr', number);
}
async function checkPolicy() {
  const paths = fileList();
  const texts = await Promise.all(paths.map(async p => existsSync(join(targetDir, p)) ? readFile(join(targetDir, p), 'utf8').catch(() => '') : ''));
  const violations = architectureViolations(paths, texts);
  assert(violations.length === 0, `Architecture policy violations:\n${violations.join('\n')}`);
  process.stdout.write(`Architecture policy passed for ${paths.length} changed files\n`);
}
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
async function security() { run('node', [join(controlDir, 'scan-secrets.mjs')], { cwd: targetDir }); process.stdout.write('Secret scan passed\n'); }
async function database() {
  const paths = fileList();
  if (paths.some(p => /(?:^|\/)(?:supabase|migrations)(?:\/|\b)|\.sql$/i.test(p))) {
    assert(existsSync(join(targetDir, 'supabase/config.toml')), 'Database change requires Supabase development configuration');
    assert(existsSync(join(targetDir, 'tests/database.test.mjs')), 'Database change requires executable database/RLS tests');
    run('node', ['--test', 'tests/database.test.mjs'], { cwd: targetDir });
  }
  process.stdout.write('Database gate passed or not applicable\n');
}
async function accessibility() {
  const paths = fileList();
  if (paths.some(p => /(?:^|\/)(?:app|pages|components)(?:\/|\b)|\.(?:tsx|css)$/i.test(p))) {
    assert(existsSync(join(targetDir, 'package.json')) && existsSync(join(targetDir, 'playwright.config.ts')), 'UI change requires Playwright accessibility configuration');
    run('npm', ['run', 'test:e2e'], { cwd: targetDir });
  }
  process.stdout.write('Accessibility gate passed or not applicable\n');
}
async function evidenceGate() {
  const manifest = await loadEvidence();
  const required = requiredReviews(fileList());
  const result = validateEvidence(manifest, required);
  assert(result.ok, `Evidence gate blocked: ${result.reasons.join('; ')}`);
  process.stdout.write('Evidence gate passed\n');
}
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
async function devHealth() {
  active();
  const dev = await branch('dev');
  const checks = await checksFor(dev.commit.sha);
  assert(checks.governance === 'success' && checks.scan === 'success', 'dev health failed: required checks incomplete or failing');
  await output('dev_sha', dev.commit.sha);
}
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
async function productionGate() { production(); await evidenceGate(); await database(); await security(); await accessibility(); }
async function smoke() {
  const url = process.env.BOT_DEPLOYMENT_URL;
  assert(url && /^https:\/\//.test(url), 'Verified HTTPS deployment URL required');
  const response = await fetch(new URL('/api/health', url), { redirect: 'error', signal: AbortSignal.timeout(10000) });
  assert(response.ok, `Deployment health failed: HTTP ${response.status}`);
  await output('smoke', 'success');
}
async function rollback() {
  production();
  throw new Error('Automatic rollback requires a verified previous deployment ID and a no-migration impact decision');
}
async function dependency() {
  active();
  const pulls = await api('pulls?state=open&base=dev&per_page=100');
  await output('dependabot_prs', pulls.filter(p => p.user?.login === 'dependabot[bot]').length);
}
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
  const raw = targetGit(['apply', '--numstat', resolve(patch)]);
  const paths = raw.split(/\r?\n/).filter(Boolean).map(line => line.split('\t').at(-1));
  assert(paths.length > 0 && paths.every(p => !p.startsWith('/') && !p.includes('..') && !p.startsWith('.git/')), 'Patch contains unsafe paths');
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

async function roleReview() {
  const role = process.env.BOT_REVIEW_ROLE;
  assert(role, 'BOT_REVIEW_ROLE is required');
  const outFile = resolve(process.env.BOT_REVIEW_FILE || `reviews/${role}.json`);
  const geminiOut = (process.env.GEMINI_REVIEW_OUTPUT || '').trim();
  if (geminiOut) {
    const match = geminiOut.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (['pass', 'fail'].includes(parsed.status) && Array.isArray(parsed.findings)) {
        await mkdir(resolve(outFile, '..'), { recursive: true });
        await writeFile(outFile, `${JSON.stringify(parsed, null, 2)}\n`);
        return;
      }
    }
  }
  const paths = fileList();
  const findings = [];
  if (role === 'ArchitectAgent') {
    const texts = await Promise.all(paths.map(async p => existsSync(join(targetDir, p)) ? readFile(join(targetDir, p), 'utf8').catch(() => '') : ''));
    findings.push(...architectureViolations(paths, texts));
  } else if (role === 'SecurityAgent') {
    try { run('node', [join(controlDir, 'scan-secrets.mjs')], { cwd: targetDir }); }
    catch (err) { findings.push(`Secret scan failed: ${err.message}`); }
  } else if (role === 'DatabaseAgent') {
    if (paths.some(p => /(?:^|\/)(?:supabase|migrations)(?:\/|\b)|\.sql$/i.test(p)) && (!existsSync(join(targetDir, 'supabase/config.toml')) || !existsSync(join(targetDir, 'tests/database.test.mjs')))) {
      findings.push('Database change missing Supabase config or database tests');
    }
  } else if (role === 'DesignAgent') {
    if (paths.some(p => /(?:^|\/)(?:app|pages|components)(?:\/|\b)|\.(?:tsx|css)$/i.test(p)) && !existsSync(join(targetDir, 'playwright.config.ts'))) {
      findings.push('UI change missing Playwright accessibility configuration');
    }
  } else if (role === 'TestingAgent') {
    try {
      run('node', [join(controlDir, 'validate-foundation.mjs')], { cwd: targetDir });
      run('node', ['--test', join(controlDir, '..', 'tests', 'bot-core.test.mjs')], { cwd: targetDir });
    } catch (err) { findings.push(`Verification tests failed: ${err.message}`); }
  } else if (role === 'ProductAgent') {
    if (paths.length === 0) findings.push('No changed files in candidate');
  }
  const verdict = { status: findings.length === 0 ? 'pass' : 'fail', findings };
  await mkdir(resolve(outFile, '..'), { recursive: true });
  await writeFile(outFile, `${JSON.stringify(verdict, null, 2)}\n`);
}

const handlers = { intake, branch: createBranch, 'task-context': taskContext, 'open-pr': openPr, 'merge-dev': mergeDev, policy: checkPolicy, quality, security, database, accessibility, evidence: evidenceGate, remediate, 'dev-health': devHealth, release, 'production-gate': productionGate, 'post-deployment-smoke': smoke, rollback, dependency, 'publish-patch': publishPatch, 'role-review': roleReview };
try {
  assert(command in handlers, `Unknown bot command: ${command}`);
  await handlers[command](await event());
} catch (error) {
  process.stderr.write(`Fynnestlady bot ${command}: ${error.message}\n`);
  process.exitCode = 1;
}
