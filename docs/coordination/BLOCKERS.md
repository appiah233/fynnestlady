# Blockers

## GITHUB-BOOTSTRAP-001

Status: Open  
Observed: 2026-10-21  
Evidence: Remote heads contain `docs/project-foundation` and automated Dependabot branches, but no `dev` or `main`; GitHub reports `docs/project-foundation` as the default branch.  
Impact: A compliant foundation PR cannot target `dev`, and a release PR cannot target `main`.  
Required owner action: Establish `main` and `dev` through an explicitly approved bootstrap procedure, set the intended default branch, and configure rulesets that prohibit direct changes, force pushes, deletion, and non-owner merges while requiring approved checks.  
Agent constraint: Do not create or populate either permanent branch from unreviewed agent work merely to make a PR possible.

Milestone 1 remains blocked pending owner review, branch bootstrap, and the decisions in `DECISIONS.md`.
