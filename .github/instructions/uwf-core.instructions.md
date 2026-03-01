---
name: "UWF Core Workflow Rules"
description: "Stage gates, artifact expectations, and workflow discipline."
applyTo: "**"
---
# UWF Stage Gates

UWF is organized into three composable workflow bundles. Import only the bundles relevant to your use case.

- **core** (`uwf-core-*`) — Generic, orchestrator-agnostic agents reusable across any workflow type.
- **issues** (`uwf-issues-*`, `uwf-issue-*`) — Agents for driving individual work items from intake through implementation and acceptance.
- **project** (`uwf-project-*`) — Agents for macro-level scoping, roadmap creation, and backlog scaffolding.

Agents follow the naming convention `{role}-{job}.agent.md`. Skills (`uwf-{name}/SKILL.md`) encapsulate swappable behaviors. To change where work items are tracked, swap the tracking skill (e.g. `uwf-local-tracking` → `uwf-github-track`) without modifying any agent.

Keep `docs/workflow/*.md` as read-only example templates. Write active workflow artifacts under `tmp/workflow-artifacts/*.md`.

---

## Core Workflow Gates

These gates are generic and can be invoked by any orchestrator regardless of bundle.

### Gate: Discovery
Must produce: `tmp/workflow-artifacts/discovery.md`
Must include: current-state summary, constraints, unknowns, recommended artifacts.
Must also: update `tmp/workflow-artifacts/intake.md` with any facts that change scope or assumptions.

### Gate: Security Planning
Must produce: `tmp/workflow-artifacts/security-plan.md`
Must include: threat model (via `uwf-threat-model` skill), controls, secrets handling, verification checklist.
Skip only if the scope has zero security surface; document the reason when skipping.

### Gate: Test Planning
Must produce: `tmp/workflow-artifacts/test-plan.md`
Must include: unit test stubs, integration scenarios, security-specific tests, coverage target, and verification command.
Tests are defined **before** implementation begins. Stubs must map to acceptance criteria and security controls.
Skip only for work with no testable behaviour; document the reason when skipping.

### Gate: Implementation
Only begin after both `tmp/workflow-artifacts/intake.md` and `tmp/workflow-artifacts/plan.md` exist for the active scope.
The work plan must list test implementation steps **before** feature implementation steps.
All code/infra changes must trace back to a requirement or ADR.

### Gate: Acceptance
Must produce: `tmp/workflow-artifacts/acceptance.md`
Must include: final checks, known issues, follow-up items.
After acceptance: the acceptance agent moves the work item file from `active/` to `closed/` and documents completion.

---

## Project Workflow Gates

Run once per large objective; produces the roadmap and backlog structure, then hands off to the orchestrator.

### Gate: Project Intake
Must produce: `tmp/workflow-artifacts/intake.md`
Must include: goal, non-goals, constraints, success metrics, stakeholders, target environment, risk tolerance, and the intended work-breakdown strategy (which of milestones / epics / sprints / issues / tasks apply and why).

### Gate: Timeline Planning
Must produce:
- `tmp/workflow-artifacts/plan.md` — the sequenced roadmap (milestones/epics → sprints → issues/tasks). This is **not** an implementation plan.
- `state/<milestone>/<sprint>/{open,active,closed}/` — one directory triplet per sprint. Each issue created as a file under `open/` with id, title, parent, depends-on, and acceptance-criteria stub in YAML frontmatter.

Must then: hand off to the orchestrator. Do **not** begin implementation. When changing state, move the file — do not copy or leave it in its original location.

---

## Issues Workflow Gates

Run per work item, orchestrator-driven.

### Gate: Issue Intake
Input: the active issue file from `state/<milestone>/<sprint>/active/<issue-id>.md`.
Must produce: reset `tmp/workflow-artifacts/intake.md` scoped to this issue.
Must include: issue goal, acceptance criteria, constraints, out-of-scope items.

All subsequent gates (Discovery, Security Planning, Test Planning, Implementation, Acceptance) follow the Core Workflow Gates above, scoped to this issue.

---

## Orchestrator State-Management Rules

- After Timeline Planning completes, the orchestrator:
  1. Scans all `state/*/*/open/*.md` files; picks the first eligible issue (all `depends-on` ids present in a `closed/` directory).
  2. Moves `state/<M>/<S>/open/<id>.md` → `state/<M>/<S>/active/<id>.md`.
  3. Resets `tmp/workflow-artifacts/` documents (intake, discovery, plan, acceptance) to blank templates scoped to the new issue.
  4. Starts Issue Intake for that issue.
- On issue completion: the acceptance agent moves `state/<M>/<S>/active/<id>.md` → `state/<M>/<S>/closed/<id>.md` once all acceptance criteria are met.
- On issue skip: move `state/<M>/<S>/open/<id>.md` → `state/<M>/<S>/closed/<id>.md`; prepend a `## Skip reason` section.
- Parallel issues are allowed when eligible issues share no `depends-on` relationship with each other.
- Unplanned work discovered during any stage: create a spike file at `state/ungroomed/open/<id>.md`. Do not implement it in the current issue.

---

## Artifact Locations

| Artifact | Path |
|---|---|
| Workflow templates (read-only) | `docs/workflow/*.md` |
| Intake | `tmp/workflow-artifacts/intake.md` |
| Discovery | `tmp/workflow-artifacts/discovery.md` |
| Security plan | `tmp/workflow-artifacts/security-plan.md` |
| Test plan | `tmp/workflow-artifacts/test-plan.md` |
| Implementation plan / roadmap | `tmp/workflow-artifacts/plan.md` |
| Acceptance results | `tmp/workflow-artifacts/acceptance.md` |
| Open work items | `state/<milestone>/<sprint>/open/<issue-id>.md` |
| Active work items | `state/<milestone>/<sprint>/active/<issue-id>.md` |
| Closed work items | `state/<milestone>/<sprint>/closed/<issue-id>.md` |
| Ungroomed / unplanned work | `state/ungroomed/open/<id>.md` |
| ADRs | `docs/adr/ADR-####-<slug>.md` |
