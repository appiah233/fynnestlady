import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const ignored = new Set([".git", "node_modules", ".next", "coverage"]);
const patterns = [
  [/AKIA[0-9A-Z]{16}/g, "AWS access key"],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, "private key"],
  [/sk_(?:live|test)_[A-Za-z0-9]{12,}/g, "payment secret key"],
  [/gh[pousr]_[A-Za-z0-9]{20,}/g, "GitHub token"],
];

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    if (ignored.has(name)) return [];
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const findings = [];
for (const file of walk(root)) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const [pattern, label] of patterns) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) findings.push(`${file.slice(root.length + 1)}: possible ${label}`);
  }
}

if (findings.length) {
  console.error(findings.join("\n"));
  process.exit(1);
}
console.log("High-confidence secret patterns not detected.");
