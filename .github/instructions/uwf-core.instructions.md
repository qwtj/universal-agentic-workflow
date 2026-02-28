---
name: "UWF Core Workflow Rules"
description: "Stage gates, artifact expectations, and workflow discipline."
applyTo: "**"
---
# UWF Stage Gates

UWF has two operating modes that share the same stage gate names but differ in scope:
- **Project Mode** — runs once per large objective; produces the timeline and issue file-system state structure, then hands off to the orchestrator.
- **Issue Mode** — runs for each individual work item (issue file) the orchestrator picks from an `open/` directory.

Determine mode by checking whether any `tmp/state/*/*` directory path exists:
- **No such path** → Project Mode (first run).
- **Path exists** → Issue Mode (scan `tmp/state/*/*/open/` for next eligible issue).

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
- `tmp/state/<milestone>/<sprint>/{open,active,closed}/` — one directory triplet per sprint; each issue/task created as a file under `open/` with id, title, parent, depends-on, and acceptance-criteria stub in YAML frontmatter.
Must then: hand off to the orchestrator. Do **not** begin implementation.

---

## Issue Mode Gates (run per work item, orchestrator-driven)

### Gate: Issue Intake
Input: the active issue file from `tmp/state/<milestone>/<sprint>/active/<issue-id>.md`.
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
Must include: final checks, known issues, follow-up items.
After acceptance: orchestrator moves issue file from `tmp/state/<M>/<S>/active/` to `tmp/state/<M>/<S>/closed/`.

---

## Orchestrator State-Management Rules

- After Timeline Planning completes, the orchestrator:
  1. Scans all `tmp/state/*/*/open/*.md` files; picks the first eligible issue (all `depends-on` ids present in a `closed/` directory).
  2. Moves `tmp/state/<M>/<S>/open/<id>.md` → `tmp/state/<M>/<S>/active/<id>.md`.
  3. Resets `docs/workflow/` documents (intake, discovery, plan, acceptance) to blank templates scoped to the new issue.
  4. Starts Issue Intake for that issue.
- On issue completion (close): move `tmp/state/<M>/<S>/active/<id>.md` → `tmp/state/<M>/<S>/closed/<id>.md`.
- On issue skip: move `tmp/state/<M>/<S>/open/<id>.md` → `tmp/state/<M>/<S>/closed/<id>.md`; prepend a `## Skip reason` section.
- Parallel issues are allowed when eligible issues share no `depends-on` relationship with each other.

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
| Open (not started) issues | `tmp/state/<milestone>/<sprint>/open/<issue-id>.md` |
| Active (in-progress) issues | `tmp/state/<milestone>/<sprint>/active/<issue-id>.md` |
| Closed issues | `tmp/state/<milestone>/<sprint>/closed/<issue-id>.md` |
| ADRs | `docs/adr/ADR-####-<slug>.md` |
