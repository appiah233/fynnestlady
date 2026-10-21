# Agent Coordination

Every agent reads all coordination files before work. No blind parallel work is allowed. Never erase or rewrite another agent's history; append corrections and link the superseded entry.

## Start Protocol

Record UTC timestamp, agent, task ID, branch, role, objective, business outcome, scope, non-goals, expected files, dependencies, conflicts checked, and status in `ACTIVE_WORK.md` before changing files.

## Progress and Stop Protocol

Update material scope/status changes. Before stopping, append completed work, evidence, tests, risks, blockers, decisions required, next owner, and next action to `HANDOFFS.md`. Record decisions and blockers in their dedicated ledgers and PR reviews in `PR_INSPECTIONS.md`.

## Entry Template

```text
## [UTC timestamp] AgentName

Task ID:
Branch:
Role:
Objective:
Business outcome:
Scope:
Non-goals:
Files expected:
Dependencies:
Conflicts checked:
Status:
Completed:
Evidence:
Tests:
Risks:
Blockers:
Decisions required:
Next owner:
Next action:
```

Task owners coordinate overlaps before edits. A handoff transfers context, not merge or release authority.
