import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, normalize, resolve } from "node:path";

const root = resolve(process.cwd());
const required = [
  "RULES.md",
  "docs/governance/BUILDING_MEMO.md",
  "docs/governance/PROJECT_GOVERNANCE.md",
  "docs/brand/ABOUT_FYNNESTLADY.md",
  "docs/product/PRODUCT_VISION.md",
  "docs/architecture/ARCHITECTURE.md",
  "docs/architecture/DOMAIN_MODEL.md",
  "docs/architecture/DATA_MODEL.md",
  "docs/architecture/SECURITY_MODEL.md",
  "docs/architecture/THREAT_MODEL.md",
  "docs/testing/TEST_STRATEGY.md",
  "docs/coordination/ACTIVE_WORK.md",
  ".github/pull_request_template.md",
  ".github/workflows/foundation.yml",
  ".github/workflows/pr-inspection.yml",
];

const failures = [];
for (const path of required) {
  if (!existsSync(join(root, path))) failures.push(`Missing required file: ${path}`);
}

function files(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

const textFiles = files(root).filter((path) => !path.includes(`${join(root, ".git")}`) && /\.(md|yml|yaml|json|mjs)$/.test(path));
const forbidden = [
  [new RegExp(["pick", "sy"].join(""), "gi"), "legacy project reference"],
  [/AKIA[0-9A-Z]{16}/g, "possible AWS access key"],
  [/sk_(live|test)_[A-Za-z0-9]+/g, "possible provider secret"],
];

for (const file of textFiles) {
  const relative = file.slice(root.length + 1);
  const content = readFileSync(file, "utf8");
  for (const [pattern, label] of forbidden) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) failures.push(`${relative}: ${label}`);
  }
  if (file.endsWith(".md")) {
    for (const match of content.matchAll(/\[[^\]]+\]\((?!https?:|#|mailto:)([^)]+)\)/g)) {
      const raw = match[1].replace(/^<|>$/g, "").split("#")[0];
      if (!raw) continue;
      const target = normalize(join(dirname(file), decodeURIComponent(raw)));
      if (!existsSync(target)) failures.push(`${relative}: broken link ${match[1]}`);
    }
  }
}

const inspector = existsSync(join(root, "scripts/pr-inspection.mjs")) ? readFileSync(join(root, "scripts/pr-inspection.mjs"), "utf8") : "";
if (/Verdict:\s*\*\*(?:APPROVED FOR MERGE|AUTO MERGE|MERGED)\*\*/.test(inspector)) {
  failures.push("PR inspector contains a forbidden verdict output");
}

const rules = existsSync(join(root, "RULES.md")) ? readFileSync(join(root, "RULES.md"), "utf8") : "";
if (!rules.includes("Eric Appiah Owusu")) failures.push("RULES.md does not preserve owner authority");
if (!rules.includes("server controls prices")) failures.push("RULES.md lacks server-authoritative pricing rule");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Foundation validation passed for ${textFiles.length} text artifacts.`);
