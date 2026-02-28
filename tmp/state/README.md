# UWF State Directory

Managed exclusively by the UWF orchestrator. Do not edit files here manually.

## Structure

```
tmp/state/
  backlog.md              ← master ordered work list (created by uwf-timeline-planner)
  active/
    <issue-id>.md         ← current work item context (one file at a time, or parallel set)
  complete/
    <issue-id>.md         ← moved here after acceptance
  skipped/
    <issue-id>.md         ← moved here if deliberately deferred
```

## Mode detection

The orchestrator determines operating mode by checking `tmp/state/backlog.md`:

| File state | Mode | Action |
|------------|------|--------|
| **Absent** | Project Mode | Run Intake → Discovery → Timeline Planning → create backlog |
| **Present** | Issue Mode | Pick next `open` item, create active file, run per-issue workflow |

## Issue file format (`active/<issue-id>.md`)

```markdown
# Issue <id>: <title>

## Parent
<milestone/epic/sprint id and title>

## Goal
<what this issue delivers>

## Acceptance criteria
- [ ] <criterion 1>
- [ ] <criterion 2>

## Depends on
- <id>: <title> (status: complete)

## Notes
<anything the orchestrator needs to pass to intake>
```

## Lifecycle transitions

```
open → active   (orchestrator picks item, creates active/<id>.md)
active → complete  (after acceptance, move to complete/<id>.md)
active → skipped   (if deferred, move to skipped/<id>.md)
```

All transitions must be reflected in `tmp/state/backlog.md` change log.
