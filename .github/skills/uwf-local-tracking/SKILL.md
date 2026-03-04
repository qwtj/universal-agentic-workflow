---
name: uwf-local-tracking
description: "Canonical issue-management procedures for UWF state transitions, eligibility, backlog triage and issues."
---
# UWF Local Tracking Skill

All issue-management operations are implemented as zero-dependency Node.js scripts co-located in this skill folder. Run them from the repo root with `node .github/skills/uwf-local-tracking/<script>.mjs`. Each script outputs JSON to stdout.

## Optional inputs
- `./tmp/workflow-artifacts/issues-backlog.md` — existing backlog with milestone/sprint placement
- `./tmp/workflow-artifacts/project-roadmap.md` — project roadmap for deliverables and milestones

## When to use
Invoke this skill whenever an agent needs to perform issue-management behavior:
- Determining operating mode (Project vs Issue)
- Finding the next eligible issue
- Activating, closing, or skipping issues
- Creating new issues or scaffolding the state directory tree
- Checking overall queue status

## Scripts reference

| Operation | Script | Usage |
|---|---|---|
| Determine operating mode | `mode.mjs` | `node .github/skills/uwf-local-tracking/mode.mjs` |
| Find next eligible issue(s) | `next.mjs` | `node .github/skills/uwf-local-tracking/next.mjs` |
| Activate issue (open → active, reset artifacts) | `activate.mjs` | `node .github/skills/uwf-local-tracking/activate.mjs <issue-path> [--mode <prefix>]` |
| Close issue after acceptance (active → closed) | `close.mjs` | `node .github/skills/uwf-local-tracking/close.mjs <issue-path>` |
| Skip issue without activating (open → closed) | `skip.mjs` | `node .github/skills/uwf-local-tracking/skip.mjs <issue-path> [--reason "..."]` |
| Create a new issue file | `new-issue.mjs` | `node .github/skills/uwf-local-tracking/new-issue.mjs --milestone <M> --sprint <S> --title "..."` |
| Scaffold open/active/closed directory triplet | `scaffold.mjs` | `node .github/skills/uwf-local-tracking/scaffold.mjs --milestone <M> --sprint <S>` |
| Report full queue status | `status.mjs` | `node .github/skills/uwf-local-tracking/status.mjs` |
| **SQLite issue CRUD** | `issues.mjs` | `node .github/skills/uwf-local-tracking/issues.mjs <cmd> [flags]` |

### Key flags

**`activate.mjs`**
- `--mode <prefix>` — artifact filename prefix (default: `issue`); produces `{prefix}-intake.md`, `{prefix}-discovery.md`, `{prefix}-plan.md`, `{prefix}-acceptance.md`

**`new-issue.mjs`**
- `--milestone <M>`, `--sprint <S>`, `--title <T>` — required (or use `--ungroomed`)
- `--id <I>` — explicit id; auto-incremented if omitted
- `--depends-on "I-001,I-002"` — comma-separated dependency ids
- `--parallel true|false` — default `false`
- `--security-sensitive true|false` — default `false`
- `--acceptance-criteria "<text>"` — one-line stub
- `--notes "<text>"` — appended to issue body
- `--ungroomed` — write to `tmp/state/ungroomed/open/` instead

**`scaffold.mjs`**
- `--milestone <M>`, `--sprint <S>` — required unless `--ungroomed`
- `--ungroomed` — create `tmp/state/ungroomed/open/` only

**`skip.mjs`**
- `--reason "<text>"` — rationale prepended as `## Skip reason` in the closed file

### `issues.mjs` — SQLite issue CRUD

Schema is defined by `issues-schema.yaml` in this directory. Database: `.github/skills/uwf-local-tracking/uwf-issues.db` (gitignored). Table shape is configurable — edit `issues-schema.yaml` and run `init` (or delete the DB) to apply changes.

| Command | Purpose |
|---|---|
| `create --id <id> --title <text> [fields…]` | Create a new issue |
| `update --id <id> [fields…]` | Update fields on an existing issue |
| `list [--status <s>] [--milestone <m>] [--sprint <s>]` | List issues with optional filters |
| `close  --id <id>` | Set issue status to `closed` |

**Field flags:** `--status`, `--phase`, `--milestone`, `--sprint`, `--description`, `--assigned-agent`, `--risk`, `--unknowns`, `--comments`

```sh
node .github/skills/uwf-local-tracking/issues.mjs create --id ISS-001 --title "Auth module" --milestone "v1.0" --risk "High" --unknowns "OAuth provider TBD"
node .github/skills/uwf-local-tracking/issues.mjs update --id ISS-001 --sprint "S1" --assigned-agent uwf-sw_dev-implementer
node .github/skills/uwf-local-tracking/issues.mjs list --status open --milestone v1.0
node .github/skills/uwf-local-tracking/issues.mjs close --id ISS-001
```

### Output shapes (all JSON)
- `mode.mjs` → `{ "mode": "project" | "issue" }`
- `next.mjs` → `{ "exhausted": bool, "eligible": [paths], "blocked": [{ path, waiting_on }] }`
- `activate.mjs` → `{ "activated": path, "mode": str, "issue": {...}, "artifacts_reset": [paths] }`
- `close.mjs` → `{ "closed": path, "id": str, "title": str }`
- `skip.mjs` → `{ "skipped": path, "id": str, "title": str, "reason": str }`
- `new-issue.mjs` → `{ "created": path, "id": str, "title": str }`
- `scaffold.mjs` → `{ "dirs": [paths] }`
- `status.mjs` → `{ "mode", "queue_exhausted", "active_issues", "sprints", "totals" }`

## Required output from skill invocations
Return a concise issue-management report with:
- Detected mode
- Files scanned / transitions performed
- Recommendations generated (if any)
- Next action for the caller agent

## End-of-queue behavior
When `next.mjs` returns `{ "exhausted": true }`: report queue exhaustion, recommend project completion summary and retrospective.

## Canonical state model

```
tmp/state/
  <milestone-id>/
    <sprint-id>/
      open/
      active/
      closed/
  ungroomed/
    open/
```

- `<milestone-id>` — matches `M1-<slug>` ids from `./tmp/workflow-artifacts/{mode}-plan.md`
- `<sprint-id>` — matches `S1-<slug>` ids; use `S1` for projects with no formal sprints

## Issue file format

```
---
id: I-001
milestone: <milestone-id>
sprint: <sprint-id>
title: <short title>
depends-on: []
security-sensitive: false
parallel: false
acceptance-criteria: <one-line stub>
submitter: <agent or script name>
reason: created
---

# <id>: <title>

<Optional context, user story, or notes for the intake agent.>
```

- Sequential ids: `I-001`, `I-002`, … for issues; `T-001a`, `T-001b`, … for sub-tasks
- `depends-on` lists ids (not paths); resolution handled by `next.mjs`
- `submitter` — agent or script that created/last modified the file
- `reason` — rationale for current state (created, activated, closed, skipped)

## Backlog timeline roadmap (`issues-backlog.md`)

```
## Milestones / Epics
- M1-<slug>: <name> — <goal> — <target date or sprint range>
  - Sprint S1-<slug>: <goal>
    - Issue I-001: <user story>
```

Include only applicable hierarchy levels. Each milestone must have: goal, deliverable, success signal.

## Intake readiness gate
An issue is ready for implementation when it contains:
- **Issue goal** — what this specific item delivers
- **Acceptance criteria** — explicit, testable conditions
- **Constraints** — what must NOT change, tech limits, time box
- **Out-of-scope items** — what this issue deliberately defers
- **Dependencies** — other issues that must be closed first (`depends-on` in frontmatter)

## Unplanned work
Create a spike at `./tmp/state/ungroomed/open/<id>.md` via `new-issue.mjs --ungroomed`. Do not implement unplanned work inline.
