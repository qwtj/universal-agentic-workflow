---
name: uwf-local-tracking
description: "Canonical issue-management procedures for UWF state transitions, eligibility, backlog triage, and issue-mode orchestration."
---
# UWF Local Tracking Skill

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

