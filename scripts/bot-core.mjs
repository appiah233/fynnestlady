const ROLE_NAMES = ['ArchitectAgent', 'ProductAgent', 'DatabaseAgent', 'SecurityAgent', 'DesignAgent', 'TestingAgent'];
const REQUIRED_CHECKS = ['governance', 'scan', 'architecture-policy', 'quality-gate', 'security-gate', 'database-gate', 'accessibility-gate', 'evidence-gate'];
const FORBIDDEN = [
  [/\b(?:aws-sdk|@aws-sdk\/|aws-cdk|terraform-provider-aws)\b/i, 'AWS dependency'],
  [/\b(?:EC2|RDS|S3|AWS IAM|NGINX)\b/i, 'AWS infrastructure'],
  [/\b(?:prisma|@prisma\/client)\b/i, 'Prisma requires an approved ADR'],
  [/\b(?:next-auth|Auth\.js)\b/i, 'Auth.js requires an approved ADR'],
];

export function branchForIssue(number, title, type = 'feature') {
  if (!Number.isSafeInteger(Number(number)) || Number(number) < 1) throw new Error('A positive issue number is required');
  const prefix = ['feature', 'fix', 'security', 'chore'].includes(type) ? type : 'feature';
  const slug = String(title).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48).replace(/-$/g, '') || 'work';
  return `${prefix}/${number}-${slug}`;
}

export function architectureViolations(paths = [], texts = []) {
  const violations = [];
  const exempt = new Set([
    '.github/fynnestlady/architecture-policy.yml',
    '.gitignore',
    'scripts/bot-core.mjs',
    'tests/bot-cli.test.mjs',
    'tests/bot-core.test.mjs',
  ]);
  for (let i = 0; i < paths.length; i++) {
    const path = String(paths[i]).replace(/\\/g, '/');
    const text = String(texts[i] ?? '');
    if (exempt.has(path)) continue;
    if (/\.(?:md|txt)$/i.test(path) && !/requirements\.txt$/i.test(path)) continue;
    for (const [pattern, reason] of FORBIDDEN) if (pattern.test(text)) violations.push(`${path}: ${reason}`);
  }
  return [...new Set(violations)];
}

export function requiredReviews(paths = []) {
  const roles = new Set(['ArchitectAgent', 'ProductAgent', 'SecurityAgent', 'TestingAgent']);
  if (paths.some(p => /(?:^|\/)(?:supabase|migrations|schema|database)(?:\/|\b)|\.(?:sql|prisma)$/i.test(p))) roles.add('DatabaseAgent');
  if (paths.some(p => /(?:^|\/)(?:app|pages|components|public|styles)(?:\/|\b)|\.(?:tsx|css|scss)$/i.test(p))) roles.add('DesignAgent');
  return ROLE_NAMES.filter(r => roles.has(r));
}

export function validateEvidence(manifest, required = []) {
  const reasons = [];
  if (!manifest || typeof manifest !== 'object') return { ok: false, reasons: ['Evidence manifest missing'] };
  if (!/^[0-9a-f]{7,40}$/i.test(String(manifest.headSha ?? ''))) reasons.push('Head SHA missing');
  if (!Number.isSafeInteger(Number(manifest.issue)) || Number(manifest.issue) < 1) reasons.push('Linked issue missing');
  if (!String(manifest.rollback ?? '').trim()) reasons.push('Rollback instructions missing');
  if (!Array.isArray(manifest.tests) || manifest.tests.length === 0) reasons.push('Test evidence missing');
  if (manifest.architecture?.status !== 'pass' || manifest.architecture?.headSha !== manifest.headSha) reasons.push('Architecture review missing or stale');
  for (const role of required) {
    if (manifest.roles?.[role]?.status !== 'pass' || manifest.roles?.[role]?.headSha !== manifest.headSha) reasons.push(`${role} review missing or stale`);
  }
  return { ok: reasons.length === 0, reasons };
}

export function canMergeDev({ pr, checks = {}, evidence, requiredReviews: reviews = [], killSwitch = false } = {}) {
  const reasons = [];
  if (killSwitch) reasons.push('Kill switch enabled');
  if (pr?.base?.ref !== 'dev') reasons.push('Only dev PRs can auto-merge');
  if (!pr?.number || pr?.draft || pr?.state === 'closed') reasons.push('PR must be open and ready');
  if (pr?.head?.sha !== evidence?.headSha) reasons.push('Evidence does not match PR head');
  const checked = validateEvidence(evidence, reviews);
  reasons.push(...checked.reasons);
  for (const check of REQUIRED_CHECKS) if (checks[check] !== 'success') reasons.push(`${check} is not successful`);
  if (pr?.requested_reviewers?.length) reasons.push('Review requests remain');
  if (pr?.mergeable_state && pr.mergeable_state !== 'clean') reasons.push(`PR merge state is ${pr.mergeable_state}`);
  return { ok: reasons.length === 0, reasons };
}

export function nextRetry(attempts = [], signature) {
  if (!signature) return { allowed: false, reason: 'Failure signature missing' };
  if (attempts.length >= 3) return { allowed: false, reason: 'Three repair attempts exhausted' };
  if (attempts.some(a => a.signature === signature)) return { allowed: false, reason: 'Identical repair already attempted' };
  return { allowed: true, reason: 'New bounded attempt' };
}

export { REQUIRED_CHECKS };
