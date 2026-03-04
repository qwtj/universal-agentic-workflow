---
name: uwf-state-manager
description: "Read, validate, and mutate state in a SQLite database and the file-system state tree. Provides canonical procedures for phase transitions, agent hand-offs, artifact path resolution, history recording, and issue management."
---
# UWF State Manager Skill

## Overview

All workflow state and issue data are stored in a SQLite database:

```
.github/skills/uwf-state-manager/uwf-issues.db
```

The database schema is defined by two YAML files in the same directory:

| File | Purpose |
|---|---|
| `workflow-schema.yaml` | Defines `workflow_state` and `workflow_history` tables |
| `issues-schema.yaml` | Defines the `issues` table (shape is configurable) |

On first run (or after `init`), the script reads both YAML files and creates all tables via `CREATE TABLE IF NOT EXISTS`. To change the issues table shape, edit `issues-schema.yaml` and run `init`.

> **Note:** `uwf-issues.db` is in `.gitignore` and should not be committed.

## When to use
Invoke this skill whenever an agent needs to:
- Read the current workflow phase or status
- Advance or roll back a phase (`idea → intake → discovery → planning → execution → acceptance → closed`)
- Record a hand-off between agents (`current_agent` field)
- Mark `ready_for_implementation` after both `{role}-intake.md` and `{role}-plan.md` are confirmed present
- Append an entry to the history log
- Create, update, list, or close issues

**All state operations MUST be performed by running the deterministic script:**
```
node .github/skills/uwf-state-manager/state.mjs <command> [options]
```
Agents must never write to the database directly. Call the script via terminal and parse the JSON output it prints to stdout.

---

## Script reference

### Workflow commands

| Command | Purpose |
|---|---|
| `read` | Read current state |
| `init [--mode <mode>]` | Initialize fresh DB — clears all data and resets to `idea` |
| `advance --to <phase> --agent <id> [--note <text>] [--force]` | Advance to next phase |
| `rollback --to <phase> --agent <id> [--note <text>]` | Roll back to earlier phase |
| `set-agent --agent <id> [--force]` | Claim the agent token |
| `release-agent` | Release the agent token |
| `check-ready` | Verify prereqs and mark `ready_for_implementation` |
| `set-status --status <s> --agent <id>` | Set status (`idle`\|`active`\|`blocked`) |
| `sync` | Derive fields from `./tmp/state/` tree |
| `note --agent <id> --note <text>` | Append a history entry |

### Issue commands

| Command | Purpose |
|---|---|
| `issue-create --id <id> --title <text> [fields…]` | Create a new issue |
| `issue-update --id <id> [fields…]` | Update fields on an existing issue |
| `issue-list [--status <s>] [--milestone <m>] [--sprint <s>]` | List issues with optional filters |
| `issue-close --id <id>` | Set issue status to `closed` |

**Issue field flags:** `--status`, `--phase`, `--milestone`, `--sprint`, `--description`, `--assigned-agent`, `--risk`, `--unknowns`, `--comments`

Global option: `--output-path <path>` (default `./tmp/workflow-artifacts`).

All output is JSON. Exit code `0` = success, `1` = operational error, `2` = usage error.

### Example invocations
```sh
# Read current state
node .github/skills/uwf-state-manager/state.mjs read

# Initialize a new workflow
node .github/skills/uwf-state-manager/state.mjs init --mode sw_dev

# Advance from intake → discovery
node .github/skills/uwf-state-manager/state.mjs advance --to discovery --agent uwf-core-discovery --note "Intake complete"

# Claim / release the agent token
node .github/skills/uwf-state-manager/state.mjs set-agent --agent uwf-sw_dev-work-planner
node .github/skills/uwf-state-manager/state.mjs release-agent

# Mark ready for implementation
node .github/skills/uwf-state-manager/state.mjs check-ready

# Sync derived fields after issue transitions
node .github/skills/uwf-state-manager/state.mjs sync

# Append a note
node .github/skills/uwf-state-manager/state.mjs note --agent uwf-core-orchestrator --note "Pausing for user review"

# Issue management
node .github/skills/uwf-state-manager/state.mjs issue-create --id ISS-001 --title "Auth module" --milestone "v1.0" --risk "High" --unknowns "OAuth provider TBD"
node .github/skills/uwf-state-manager/state.mjs issue-update --id ISS-001 --sprint "S1" --assigned-agent uwf-sw_dev-implementer
node .github/skills/uwf-state-manager/state.mjs issue-list --status open --milestone v1.0
node .github/skills/uwf-state-manager/state.mjs issue-close --id ISS-001
```

---

## Schema reference

### workflow_state (single row, id=1)

Defined by `workflow-schema.yaml`.

| Column | Type | Description |
|---|---|---|
| `phase` | TEXT | Current workflow phase |
| `mode` | TEXT | Workflow mode (e.g. `sw_dev`) |
| `status` | TEXT | `idle` \| `active` \| `blocked` |
| `current_agent` | TEXT | Agent presently holding the token |
| `artifact_path` | TEXT | Base path for per-stage docs |
| `ready_for_implementation` | INTEGER | `1` when gate conditions are met |

### workflow_history (append-only)

Defined by `workflow-schema.yaml`.

| Column | Type | Description |
|---|---|---|
| `ts` | TEXT | ISO-8601 timestamp |
| `from_phase` | TEXT | Phase before the transition |
| `to_phase` | TEXT | Phase after the transition |
| `agent` | TEXT | Agent that triggered the entry |
| `note` | TEXT | Free-text annotation |

### issues

Defined by `issues-schema.yaml`. Default columns:

| Column | Type |
|---|---|
| `id` | TEXT (PK) |
| `title` | TEXT |
| `status` | TEXT (`open` \| `active` \| `closed`) |
| `phase` | TEXT |
| `milestone` | TEXT |
| `sprint` | TEXT |
| `description` | TEXT |
| `assigned_agent` | TEXT |
| `risk` | TEXT |
| `unknowns` | TEXT |
| `comments` | TEXT |
| `created_at` | TEXT |
| `updated_at` | TEXT |

### Phase lifecycle

```
idea → intake → discovery → planning → execution → acceptance → closed
```

---

## Validation rules
- `phase` must be one of: `idea`, `intake`, `discovery`, `planning`, `execution`, `acceptance`, `closed`.
- `status` must be one of: `idle`, `active`, `blocked`.
- `workflow_history` is append-only — never remove or mutate existing rows.
- Phase advances must follow lifecycle order unless `--force` is supplied.
- All writes are wrapped in SQLite transactions — no partial state.

---

## Error conditions and responses

| Condition | Response |
|---|---|
| DB missing | Auto-created on first run via schema YAML files |
| Unknown phase value | Reject with validation error; do not write |
| Token conflict (agent claim) | Return conflict error; do not overwrite |
| Illegal phase skip | Return lifecycle-order error; do not write |
| Artifact prereqs unmet for `ready_for_implementation` | Return missing-file list; do not set flag |
| Issue ID already exists | Return conflict error on `issue-create` |
| Issue ID not found | Return not-found error on `issue-update` / `issue-close` |

---

## Required output from skill invocations
The script prints structured JSON to stdout for every command. Agents must capture and relay the key fields to the orchestrator:
- `ok` — `true` for success, `false` for error
- `procedure` — command that ran
- `state.phase`, `state.status`, `state.current_agent`, `state.ready_for_implementation` — state snapshot after the operation
- `history_entry` — the new history entry appended (where applicable)
- `issue` / `issues` — issue data (issue commands only)
- `error` — error message (only present when `ok: false`)
