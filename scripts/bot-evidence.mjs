#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { requiredReviews, validateEvidence } from './bot-core.mjs';

/**
 * Asserts that a required configuration value is present.
 * @param {string | undefined} value - Value to check.
 * @param {string} name - Environment variable name.
 * @returns {string} Non-empty value.
 */
function required(value, name) { if (!value) throw new Error(`${name} is required`); return value; }

/**
 * Resolves the list of changed files for the candidate commit.
 * @returns {string[]} Changed file paths.
 */
function changedFiles() {
  if (process.env.BOT_CHANGED_FILES) return JSON.parse(process.env.BOT_CHANGED_FILES);
  const target = required(process.env.BOT_TARGET_DIR, 'BOT_TARGET_DIR');
  const base = process.env.BOT_BASE_REF || 'dev';
  if (!['dev', 'main'].includes(base)) throw new Error('BOT_BASE_REF must be dev or main');
  return execFileSync('git', ['diff', '--name-only', `origin/${base}...HEAD`], { cwd: target, encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
}
try {
  if (process.argv[2] !== 'assemble') throw new Error('Expected assemble command');
  const headSha = required(process.env.BOT_HEAD_SHA, 'BOT_HEAD_SHA');
  if (!/^[0-9a-f]{40}$/i.test(headSha)) throw new Error('BOT_HEAD_SHA must be a full commit SHA');
  const issue = Number(required(process.env.BOT_ISSUE_NUMBER, 'BOT_ISSUE_NUMBER'));
  if (!Number.isSafeInteger(issue) || issue < 1) throw new Error('BOT_ISSUE_NUMBER must be positive');
  const reviewDir = resolve(required(process.env.BOT_REVIEW_DIR, 'BOT_REVIEW_DIR'));
  const outputPath = resolve(required(process.env.BOT_EVIDENCE_PATH, 'BOT_EVIDENCE_PATH'));
  const roles = requiredReviews(changedFiles());
  const reviews = {};
  for (const role of roles) {
    const value = JSON.parse(await readFile(join(reviewDir, `${role}.json`), 'utf8'));
    if (
      !['pass', 'fail'].includes(value.status) ||
      value.headSha !== headSha ||
      !Array.isArray(value.findings) ||
      value.findings.some(x => typeof x !== 'string') ||
      !Array.isArray(value.evidence) ||
      value.evidence.some(x => typeof x !== 'string')
    ) throw new Error(`Invalid ${role} review`);
    if (value.status !== 'pass') throw new Error(`${role} blocked: ${value.findings.join('; ')}`);
    reviews[role] = { status: 'pass', headSha: value.headSha, findings: value.findings, evidence: value.evidence, reviewType: value.reviewType || 'legacy' };
  }
  const manifest = {
    headSha,
    issue,
    roles: reviews,
    architecture: reviews.ArchitectAgent,
    rollback: required(process.env.BOT_ROLLBACK, 'BOT_ROLLBACK'),
    tests: JSON.parse(required(process.env.BOT_TEST_EVIDENCE, 'BOT_TEST_EVIDENCE')),
  };
  const verdict = validateEvidence(manifest, roles);
  if (!verdict.ok) throw new Error(verdict.reasons.join('; '));
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
  process.stdout.write(`Evidence assembled for ${headSha} with ${roles.length} automated role reports\n`);
} catch (error) {
  process.stderr.write(`Evidence assembly failed: ${error.message}\n`);
  process.exitCode = 1;
}
