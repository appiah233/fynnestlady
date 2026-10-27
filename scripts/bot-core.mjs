const ROLE_NAMES = ['ArchitectAgent', 'ProductAgent', 'DatabaseAgent', 'SecurityAgent', 'DesignAgent', 'TestingAgent'];
const REQUIRED_CHECKS = ['governance', 'scan', 'architecture-policy', 'quality-gate', 'security-gate', 'database-gate', 'accessibility-gate', 'evidence-gate'];
const FORBIDDEN = [
  [/\b(?:aws-sdk|@aws-sdk\/|aws-cdk|terraform-provider-aws)\b/i, 'AWS dependency'],
  [/\b(?:EC2|RDS|S3|AWS IAM|NGINX)\b/i, 'AWS infrastructure'],
  [/\b(?:prisma|@prisma\/client)\b/i, 'Prisma requires an approved ADR'],
  [/\b(?:next-auth|Auth\.js)\b/i, 'Auth.js requires an approved ADR'],
];

/**
 * Builds a deterministic bot work branch name for an issue.
 * @param {number} number - Issue number.
 * @param {string} title - Issue title.
 * @param {string} [type='feature'] - Branch prefix category.
 * @returns {string} Branch name in `<type>/<number>-<slug>` format.
 */
export function branchForIssue(number, title, type = 'feature') {
  if (!Number.isSafeInteger(Number(number)) || Number(number) < 1) throw new Error('A positive issue number is required');
  const prefix = ['feature', 'fix', 'security', 'chore'].includes(type) ? type : 'feature';
  const slug = String(title).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48).replace(/-$/g, '') || 'work';
  return `${prefix}/${number}-${slug}`;
}

/**
 * Checks changed file paths and contents against the Fynnestlady architecture policy.
 * @param {string[]} [paths=[]] - Relative file paths.
 * @param {string[]} [texts=[]] - File text contents matching `paths`.
 * @returns {string[]} List of policy violations found.
 */
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
    if (/\.(?:avif|gif|ico|jpe?g|png|webp|woff2?|ttf|otf|pdf|mp4|webm)$/i.test(path)) continue;
    if (/\.(?:md|txt)$/i.test(path) && !/requirements\.txt$/i.test(path)) continue;
    for (const [pattern, reason] of FORBIDDEN) if (pattern.test(text)) violations.push(`${path}: ${reason}`);
  }
  return [...new Set(violations)];
}

/**
 * Evaluates proposed file changes for platform-endangering or non-compliant patterns
 * across architecture, authentication (Clerk-only), database migrations, client/server
 * boundaries, secret hygiene, XSS/code-execution, and core governance rules.
 * @param {string[]} [paths=[]] - Relative file paths.
 * @param {string[]} [texts=[]] - File text contents matching `paths`.
 * @returns {string[]} List of platform safety and compliance violations found.
 */
export function platformSafetyViolations(paths = [], texts = []) {
  const violations = [...architectureViolations(paths, texts)];
  const exempt = new Set([
    'scripts/bot-core.mjs',
    'scripts/pr-inspection.mjs',
    'scripts/scan-secrets.mjs',
    'scripts/validate-foundation.mjs',
    'tests/bot-cli.test.mjs',
    'tests/bot-core.test.mjs',
    'tests/security/browser-boundary.test.mjs',
  ]);

  for (let i = 0; i < paths.length; i++) {
    const path = String(paths[i]).replace(/\\/g, '/');
    const text = String(texts[i] ?? '');
    if (exempt.has(path)) continue;

    // 1. Committed secret or credential files
    if (/(?:^|\/)\.env(?:\.(?!example$)[a-z0-9._-]+)?$|\.(?:pem|key|p12|pfx)$/i.test(path)) {
      violations.push(`${path}: Forbidden credential or environment file tracked in repository`);
    }

    // 2. Governance & owner authority protection
    if (path === 'RULES.md') {
      if (!text.includes('Eric Appiah Owusu')) {
        violations.push('RULES.md: Owner authority (Eric Appiah Owusu) must not be removed');
      }
      if (!text.includes('server controls prices')) {
        violations.push('RULES.md: Server-authoritative pricing rule must not be removed');
      }
      if (!text.includes('`main` is the production branch; `dev` is the integration branch')) {
        violations.push('RULES.md: Permanent branch model (main/dev) must not be removed');
      }
    }

    // 3. Database migration safety (no destructive DDL/DML or disabling RLS)
    if (/(?:^|\/)(?:supabase\/migrations|migrations)\/.*\.sql$/i.test(path)) {
      if (/\bDROP\s+(?:TABLE|SCHEMA|DATABASE)\b/i.test(text)) {
        violations.push(`${path}: Destructive SQL (DROP TABLE/SCHEMA/DATABASE) is prohibited in migrations`);
      }
      if (/\bTRUNCATE\s+TABLE\b|\bTRUNCATE\s+[a-z0-9_."]+/i.test(text)) {
        violations.push(`${path}: Destructive SQL (TRUNCATE) is prohibited in migrations`);
      }
      if (/\bDISABLE\s+ROW\s+LEVEL\s+SECURITY\b/i.test(text)) {
        violations.push(`${path}: Disabling Row-Level Security (RLS) is prohibited`);
      }
      if (/\bDELETE\s+FROM\s+[a-z0-9_."]+\s*;/i.test(text)) {
        violations.push(`${path}: Unqualified DELETE FROM without WHERE clause is prohibited`);
      }
    }

    // 4. Application code compliance (src/**)
    if (/^src\/.*\.(?:ts|tsx|js|jsx|mjs)$/i.test(path)) {
      // Clerk-only authentication compliance (ADR-006)
      if (/\bsupabase\.auth\.(?:signIn|signUp|signOut|exchangeCodeForSession|setSession)|@supabase\/auth-helpers/i.test(text)) {
        violations.push(`${path}: Supabase Auth is prohibited (Clerk is the sole authentication provider per ADR-006)`);
      }

      // Unsafe execution / XSS
      if (/\bdangerouslySetInnerHTML\b|\beval\s*\(|\bnew\s+Function\s*\(/.test(text)) {
        violations.push(`${path}: Unsafe code execution or dangerouslySetInnerHTML is prohibited`);
      }

      // Client/browser boundary protection
      const isClientModule =
        /^\s*["']use client["']/m.test(text) || /^src\/lib\/supabase\/browser\.ts$/i.test(path);
      if (isClientModule) {
        if (/\b(?:SUPABASE_SERVICE_ROLE_KEY|CLERK_SECRET_KEY|PAYSTACK_SECRET_KEY|DATABASE_URL)\b/.test(text)) {
          violations.push(`${path}: Client module references server-only secret environment variable`);
        }
        if (/from\s+["'](?:@\/lib\/supabase\/server|server-only)["']/.test(text)) {
          violations.push(`${path}: Client module imports server-only module`);
        }
      }
    }
  }

  return [...new Set(violations)];
}

/**
 * Determines which specialist review roles are required for the given changed file paths.
 * @param {string[]} [paths=[]] - Relative file paths.
 * @returns {string[]} Ordered list of required specialist agent role names.
 */
export function requiredReviews(paths = []) {
  const roles = new Set(['ArchitectAgent', 'ProductAgent', 'SecurityAgent', 'TestingAgent']);
  if (paths.some(p => /(?:^|\/)(?:supabase|migrations|schema|database)(?:\/|\b)|\.(?:sql|prisma)$/i.test(p))) roles.add('DatabaseAgent');
  if (paths.some(p => /(?:^|\/)(?:app|pages|components|public|styles)(?:\/|\b)|\.(?:tsx|css|scss)$/i.test(p))) roles.add('DesignAgent');
  return ROLE_NAMES.filter(r => roles.has(r));
}

/**
 * Validates a bot evidence manifest against required specialist review roles.
 * @param {object} manifest - Assembled evidence manifest.
 * @param {string[]} [required=[]] - Required role names.
 * @returns {{ok: boolean, reasons: string[]}} Validation result.
 */
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

/**
 * Evaluates whether a pull request targeting `dev` satisfies all merge gates.
 * @param {object} [params={}] - Merge evaluation parameters.
 * @returns {{ok: boolean, reasons: string[]}} Merge eligibility verdict.
 */
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
  if (Array.isArray(pr?.reviews) && pr.reviews.some(r => r?.state === 'CHANGES_REQUESTED')) {
    reasons.push('Changes requested in review');
  }
  if (pr?.mergeable_state && pr.mergeable_state !== 'clean') reasons.push(`PR merge state is ${pr.mergeable_state}`);
  return { ok: reasons.length === 0, reasons };
}

/**
 * Determines whether a new automated repair attempt is permitted within the 3-attempt bound.
 * @param {Array<{signature: string}>} [attempts=[]] - Previous repair attempt records.
 * @param {string} signature - Current failure signature.
 * @returns {{allowed: boolean, reason: string}} Retry verdict.
 */
export function nextRetry(attempts = [], signature) {
  if (!signature) return { allowed: false, reason: 'Failure signature missing' };
  if (attempts.length >= 3) return { allowed: false, reason: 'Three repair attempts exhausted' };
  if (attempts.some(a => a.signature === signature)) return { allowed: false, reason: 'Identical repair already attempted' };
  return { allowed: true, reason: 'New bounded attempt' };
}

export { REQUIRED_CHECKS };
