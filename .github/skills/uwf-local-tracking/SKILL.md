---
name: uwf-local-tracking
description: "Canonical issue-management procedures for UWF state transitions, eligibility, backlog triage, and issue-mode orchestration."
---
# UWF Local Tracking Skill

## Optional Inputs:
-  Existing issues in backlog with milestone and sprint can be found in `./tmp/workflow-artifacts/issues-backlog.md` if present.
-  Existing project roadmap for deliverables and milestones can be found in `./tmp/workflow-artifacts/project-roadmap.md` if present.

## When to use
Invoke this skill whenever an agent needs to perform or reason about issue-management behavior, including:
- Detecting Project Mode vs Issue Mode
- Choosing the next eligible issue from `state/*/*/open/*.md`
- Activating work (`open/` → `active/`)
- Closing or skipping work (`active/` or `open/` → `closed/`)
- Resetting per-issue workflow artifacts
- Backlog triage and ungroomed issue creation during intake

This skill is the canonical procedural source for issue-management behavior used by custom agents.

## Canonical state model
Issue files are tracked under:

```
state/
	<milestone-id>/
		<sprint-id>/
			open/
			active/
			closed/
```

Additional ungroomed backlog intake can use:

```
state/ungroomed/open/
```

## Procedures

### 1) Determine operating mode
1. Check whether any path matching `state/*/*` exists.
2. If no such path exists, return **Project Mode**.
3. If a path exists, return **Issue Mode**.

### 2) Find next eligible issue (Issue Mode)
1. Scan all `state/*/*/open/*.md` files.
2. For each candidate, read `depends-on` from frontmatter.
3. An issue is eligible only if every dependency id exists in any `*/closed/` directory.
4. Pick the first eligible issue by deterministic order: milestone directory, sprint directory, then filename.
5. If multiple issues are eligible and independent, return them as parallelizable candidates.

### 3) Activate issue and prepare artifacts
When an issue is selected:
1. Move `state/<M>/<S>/open/<id>.md` to `state/<M>/<S>/active/<id>.md`.
2. Reset per-issue workflow docs in `tmp/workflow-artifacts/`:
	 - `intake.md`
	 - `discovery.md`
	 - `plan.md`
	 - `acceptance.md`
3. Return the active issue path and a short activation summary.

### 4) Intake triage and backlog grooming support
Before or during issue intake:
1. Scan `state/*/*/open/*.md` and `state/*/*/active/*.md` for potential duplicates of the incoming request.
2. If no matching backlog item exists, create a backlog stub in `state/ungroomed/open/`.
3. Check sprint placement fit and recommend move-to-active behavior when immediate execution is intended.
4. Recommend ordering updates (`order:` field, filename ordering, or `depends-on` edits) when priorities shift.
5. Return all generated recommendations so intake can record them in `tmp/workflow-artifacts/intake.md`.

### 5) Close and skip transitions
- **Close after acceptance:** move `state/<M>/<S>/active/<id>.md` to `state/<M>/<S>/closed/<id>.md`.
- **Skip before start:** move `state/<M>/<S>/open/<id>.md` to `state/<M>/<S>/closed/<id>.md` and prepend a `## Skip reason` section.

### 6) End-of-queue behavior
If no eligible `open/` issues remain:
- Report queue exhaustion and indicate that issue execution is complete for current backlog state.
- Recommend project completion summary and retrospective.

## Required output from skill invocations
Whenever invoked, return a concise issue-management report with:
- Detected mode
- Files scanned
- Transitions performed (if any)
- Recommendations generated (if any)
- Next action for caller agent

## Orgnanization and lifecycle
### 1. `./tmp/workflow-artifacts/issues-backlog.md`, — Timeline Roadmap
Structure by the levels chosen during intake:
```
## Milestones / Epics
- M1-<slug>: <name> — <goal> — <target date or sprint range>
  - Sprint S1-<slug>: <goal>
    - Issue I-001: <user story>
      - Task T-001a: <specific work item>
```
Only include levels that apply (not every project needs all four).
For each milestone/epic include: goal, deliverable, success signal.

### 2. `state/` — Issue File-System State
Create one directory triplet **per sprint**:
```
state/<milestone-id>/<sprint-id>/open/
state/<milestone-id>/<sprint-id>/active/
state/<milestone-id>/<sprint-id>/closed/
```
- `<milestone-id>` matches the `M1-<slug>` ids used in `./tmp/workflow-artifacts/{mode}-plan.md`.
- `<sprint-id>` matches the `S1-<slug>` ids.
- For projects with no formal sprints, use a single sprint id of `S1`.

Create one **issue file** per issue/task inside the appropriate `open/` directory:
```
state/<milestone-id>/<sprint-id>/open/<issue-id>.md
```

**Issue file format** (frontmatter + body):
```markdown
---
id: I-001
milestone: <milestone-id>
sprint: <sprint-id>
title: <short title>
depends-on: []           # list of issue ids that must be closed first; empty if none
security-sensitive: false
parallel: false           # true when this issue can run alongside its sibling
acceptance-criteria: <one-line stub — expanded during Issue Intake>
---

# <id>: <title>

<Optional additional context, user story, or notes for the intake agent.>
```

- Use sequential ids: `I-001`, `I-002`, … for issues; `T-001a`, `T-001b`, … for sub-tasks.
- All files start in `open/`. Runtime transitions and queue handling are performed via `uwf-issue-management`.
- `depends-on` lists ids (not paths); dependency resolution is performed via `uwf-issue-management`.

## After producing both artifacts
1. Verify that every intake goal maps to at least one issue file.
2. Verify that no circular `depends-on` chains exist.
