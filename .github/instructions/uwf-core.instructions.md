---
name: "UWF Core Workflow Rules"
description: "Stage gates, artifact expectations, and workflow discipline."
applyTo: "**"
---
# UWF Stage Gates

UWF has two operating modes that share the same stage gate names but differ in scope:
- **Project Mode** — runs once per large objective; produces the backlog and timeline, then hands off to the orchestrator.
- **Issue Mode** — runs for each individual work item (issue/task) from the backlog; the orchestrator drives this cycle.

Determine mode by checking `tmp/state/backlog.md`:
- File **absent** → Project Mode (first run).
- File **present** → Issue Mode (select next `open` item from backlog).

---

## Project Mode Gates (run once per project / major objective)

### Gate: Project Intake
Must produce: `docs/workflow/intake.md`
Must include: goal, non-goals, constraints, success metrics, stakeholders, target environment, risk tolerance, **and** the intended work-breakdown strategy (which of milestones / epics / sprints / issues / tasks apply and why).

### Gate: Project Discovery
Must produce: `docs/workflow/discovery.md`
Must include: current-state summary, constraints, unknowns, recommended artifacts.
Must also: update `docs/workflow/intake.md` with any facts discovered that change scope or assumptions.

### Gate: Timeline Planning
Must produce:
- `docs/workflow/plan.md` — the timeline of goals (milestones/epics → sprints → issues/user stories → tasks). This is NOT an implementation plan; it is a sequenced roadmap.
- `tmp/state/backlog.md` — the master ordered list of every work item with id, type, title, parent, status (`open` / `active` / `complete` / `skipped`), and acceptance criteria stub.
Must then: hand off to the orchestrator. Do **not** begin implementation.

---

## Issue Mode Gates (run per work item, orchestrator-driven)

### Gate: Issue Intake
Input: the active issue file from `tmp/state/active/<issue-id>.md`.
Must produce: reset `docs/workflow/intake.md` scoped to this issue.
Must include: issue goal, acceptance criteria, constraints, out-of-scope items.

### Gate: Issue Discovery
Must produce: reset `docs/workflow/discovery.md` scoped to this issue.
Must also: update `docs/workflow/intake.md` if discovery changes scope.

### Gate: Security Planning
Must produce: `docs/workflow/security-plan.md` scoped to this issue.
Must include: threat model, controls, secrets handling, verification checklist.
Skip only if the issue has zero security surface and document the reason.

### Gate: Test Planning
Must produce: `docs/workflow/test-plan.md` scoped to this issue.
Must include: unit test stubs, integration scenarios, security-specific tests, coverage target and verification command.
Tests are defined **before** implementation begins. Stubs must map to acceptance criteria and security controls.
Skip only for issues with no testable behaviour and document the reason.

### Gate: Implementation
Only begin after both `docs/workflow/intake.md` and `docs/workflow/plan.md` exist for the current issue.
The work plan must list test implementation steps **before** feature implementation steps.
All code/infra changes must trace back to a requirement or ADR.

### Gate: Acceptance
Must produce: `docs/workflow/acceptance.md`
Must include: final checks, known issues, follow-up backlog items.
After acceptance: orchestrator moves issue file from `tmp/state/active/` to `tmp/state/complete/` and updates `tmp/state/backlog.md` status to `complete`.

---

## Orchestrator State-Management Rules

- After Timeline Planning completes, the orchestrator:
  1. Picks the next `open` item from `tmp/state/backlog.md`.
  2. Creates `tmp/state/active/<issue-id>.md` with the issue context.
  3. Resets `docs/workflow/` documents (intake, discovery, plan, acceptance) to blank templates scoped to the new issue.
  4. Starts Issue Intake for that issue.
- On issue completion: move `tmp/state/active/<issue-id>.md` → `tmp/state/complete/<issue-id>.md`, update backlog status.
- On issue skip: move to `tmp/state/skipped/<issue-id>.md`, update backlog status.
- Parallel issues are allowed when the backlog marks items as independent (no blocking dependency).

---

## Artifact Locations

| Artifact | Path |
|---|---|
| Project & issue intake | `docs/workflow/intake.md` |
| Project & issue discovery | `docs/workflow/discovery.md` |
| Security plan | `docs/workflow/security-plan.md` |
| Test plan | `docs/workflow/test-plan.md` |
| Issue plan | `docs/workflow/plan.md` |
| Acceptance results | `docs/workflow/acceptance.md` |
| Master backlog | `tmp/state/backlog.md` |
| Active issue context | `tmp/state/active/<issue-id>.md` |
| Completed issues | `tmp/state/complete/<issue-id>.md` |
| Skipped issues | `tmp/state/skipped/<issue-id>.md` |
| ADRs | `docs/adr/ADR-####-<slug>.md` |
