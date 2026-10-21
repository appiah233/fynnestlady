import { readFileSync } from "node:fs";

const eventPath = process.env.GITHUB_EVENT_PATH;
const event = eventPath ? JSON.parse(readFileSync(eventPath, "utf8")) : {};
const body = event.pull_request?.body ?? "";
const requiredSections = ["Problem", "Business value", "Scope", "Non-goals", "Security impact", "Tests added", "Rollback", "Coordination entry"];
const missing = requiredSections.filter((section) => !new RegExp(`^# +${section}$`, "im").test(body));
const verdict = missing.length ? "INSUFFICIENT EVIDENCE" : "PASS FOR OWNER REVIEW";
const lines = [
  "# FynnestladyPRBot foundation inspection",
  "",
  `Verdict: **${verdict}**`,
  "",
  missing.length ? `Missing PR sections: ${missing.join(", ")}` : "Required PR evidence sections are present.",
  "",
  "This deterministic foundation check does not replace Architecture, Product, Database, Security, Design, Testing, or human content review.",
  "",
  "Inspection complete. Merge authority remains exclusively with Eric Appiah Owusu. FynnestladyPRBot has not merged this pull request.",
];
console.log(lines.join("\n"));
