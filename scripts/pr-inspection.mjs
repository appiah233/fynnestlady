import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { platformSafetyViolations } from "./bot-core.mjs";

const root = resolve(process.cwd());
const eventPath = process.env.GITHUB_EVENT_PATH;
const event =
  eventPath && existsSync(eventPath)
    ? JSON.parse(readFileSync(eventPath, "utf8"))
    : {};
const pr = event.pull_request ?? {};
const body = pr.body ?? process.env.BOT_PR_BODY ?? "";
const authorLogin = pr.user?.login ?? "";
const isDependabot =
  authorLogin === "dependabot[bot]" || authorLogin === "app/dependabot";

const requiredSections = [
  "Problem",
  "Business value",
  "Scope",
  "Non-goals",
  "Security impact",
  "Tests added",
  "Rollback",
  "Coordination entry",
];
const missing = isDependabot
  ? []
  : requiredSections.filter(
      (section) => !new RegExp(`^# +${section}$`, "im").test(body)
    );

const hasLinkedIssue =
  isDependabot ||
  /(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?|refs?|issue)\s+#(\d+)/i.test(body);

function getChangedFiles() {
  const requestedBase = ["dev", "main"].includes(pr.base?.ref) ? pr.base.ref : null;
  const bases = requestedBase ? [`origin/${requestedBase}`, requestedBase] : ["origin/dev", "dev", "HEAD^"];
  for (const base of bases) {
    try {
      const mergeBase = execFileSync("git", ["merge-base", base, "HEAD"], {
        cwd: root,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      if (mergeBase) {
        const out = execFileSync(
          "git",
          [
            "-c",
            "core.quotepath=off",
            "diff",
            "--name-only",
            "--no-renames",
            "--diff-filter=ACMR",
            mergeBase,
          ],
          { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
        ).trim();
        return out ? out.split(/\r?\n/).filter(Boolean) : [];
      }
    } catch {
      // try next base candidate
    }
  }
  if (requestedBase) throw new Error(`Cannot resolve candidate diff against ${requestedBase}`);
  return [];
}

const changedPaths = getChangedFiles();
const changedTexts = changedPaths.map((rel) => {
  const full = join(root, rel);
  return existsSync(full) ? readFileSync(full, "utf8") : "";
});

const safetyViolations = platformSafetyViolations(changedPaths, changedTexts);

let foundationOk = true;
let foundationError = "";
try {
  execFileSync("node", [join(root, "scripts/validate-foundation.mjs")], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (err) {
  foundationOk = false;
  foundationError = String(err.stderr || err.message || "Foundation validation failed").trim();
}

let secretsOk = true;
let secretsError = "";
try {
  execFileSync("node", [join(root, "scripts/scan-secrets.mjs")], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (err) {
  secretsOk = false;
  secretsError = String(err.stderr || err.message || "Secret scan failed").trim();
}

const allIssues = [
  ...missing.map((s) => `Missing required PR section: \`# ${s}\``),
  ...(hasLinkedIssue ? [] : ["Missing linked issue reference (e.g., `Refs #<id>` or `Closes #<id>`)"]),
  ...(foundationOk ? [] : [`Foundation integrity violation: ${foundationError}`]),
  ...(secretsOk ? [] : [`Secret scan violation: ${secretsError}`]),
  ...safetyViolations.map((v) => `Platform safety / compliance violation: ${v}`),
];

const verdict = allIssues.length === 0 ? "PASS FOR OWNER REVIEW" : "INSUFFICIENT EVIDENCE";

const lines = [
  "# FynnestladyPRBot Platform Safety & Compliance Inspection",
  "",
  `Verdict: **${verdict}**`,
  "",
  "## Compliance Checklist",
  `- **PR Evidence Sections:** ${missing.length === 0 ? "PASS" : `FAIL (Missing: ${missing.join(", ")})`}`,
  `- **Linked Issue Traceability:** ${hasLinkedIssue ? "PASS" : "FAIL (No issue reference found)"}`,
  `- **Foundation & Governance Integrity:** ${foundationOk ? "PASS" : "FAIL"}`,
  `- **Secret & Credential Hygiene:** ${secretsOk ? "PASS" : "FAIL"}`,
  `- **Platform Safety & Architecture Compliance (${changedPaths.length} changed files inspected):** ${safetyViolations.length === 0 ? "PASS" : `FAIL (${safetyViolations.length} violation(s))`}`,
  "",
  ...(allIssues.length > 0
    ? [
        "## Blocking Findings",
        ...allIssues.map((item) => `- ${item}`),
        "",
      ]
    : [
        "All deterministic platform safety, architecture, authentication (Clerk-only), database RLS/migration safety, client/server boundary, and governance checks passed.",
        "",
      ]),
  "This deterministic foundation check does not replace Architecture, Product, Database, Security, Design, Testing, or human content review.",
  "",
  "Inspection complete. This inspector does not merge. The dedicated Engineering Bot may merge eligible work only after all independent gates and branch protection pass.",
];

console.log(lines.join("\n"));

// Machine-readable findings so the final bot review can explain exactly why it blocks a PR.
if (process.env.INSPECTION_FINDINGS_PATH) {
  writeFileSync(
    process.env.INSPECTION_FINDINGS_PATH,
    `${JSON.stringify({ verdict, findings: allIssues, changedFiles: changedPaths.length }, null, 2)}\n`
  );
}

if (allIssues.length > 0) process.exitCode = 1;
