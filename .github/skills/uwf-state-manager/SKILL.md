---
name: uwf-state-manager
description: "Read, validate, and mutate sate docs/uwf-state.json and the file-system state tree. Provides canonical procedures for phase transitions, agent hand-offs, artifact path resolution, and history recording."
---
# UWF State Manager Skill

## When to use
Invoke this skill whenever an agent needs to:
- Read the current workflow phase or status from `./tmp/uwf-state.json`
- Advance or roll back a phase (`idea → intake → discovery → planning → execution → acceptance → closed`)
- Record a hand-off between agents (`current_agent` field)
- Mark `ready_for_implementation` after both `{mode}-intake.md` and `{mode}-plan.md` are confirmed present
- Append an entry to the `history` array
- Validate that `./tmp/uwf-state.json` is well-formed before acting on it
- Sync JSON state with the file-system `./tmp/state/` directory tree after issue transitions

This skill is the single authoritative source for all reads and writes to `./tmp/uwf-state.json`.

**All state operations MUST be performed by running the deterministic script:**
```
node .github/skills/uwf-state-manager/state.mjs <command> [options]
```
Agents must never write or mutate `./tmp/uwf-state.json` directly or by reasoning. Call the script via terminal and parse the JSON output it prints to stdout.

---

## Script reference

| Command | Purpose |
|---|---|
| `read` | Read + validate current state |
| `init [--mode <mode>]` | Initialize a fresh state file |
| `advance --to <phase> --agent <id> [--note <text>] [--force]` | Advance to next phase |
| `rollback --to <phase> --agent <id> [--note <text>]` | Roll back to earlier phase |
| `set-agent --agent <id> [--force]` | Claim the agent token |
| `release-agent` | Release the agent token |
| `check-ready` | Verify prereqs and mark `ready_for_implementation` |
| `set-status --status <s> --agent <id>` | Set status (`idle`\|`active`\|`blocked`) |
| `sync` | Derive fields from `./tmp/state/` tree |
| `note --agent <id> --note <text>` | Append a history entry |

Global options: `--state-path <path>` (default `./tmp/uwf-state.json`), `--output-path <path>` (default `./tmp/workflow-artifacts`).

All output is JSON. Exit code `0` = success, `1` = operational error, `2` = usage error.

### Example invocations
```sh
# Read current state
node .github/skills/uwf-state-manager/state.mjs read

# Initialize a new workflow
node .github/skills/uwf-state-manager/state.mjs init --mode sw_dev

# Advance from intake → discovery
node .github/skills/uwf-state-manager/state.mjs advance --to discovery --agent uwf-core-discovery --note "Intake complete"

# Claim the token
node .github/skills/uwf-state-manager/state.mjs set-agent --agent uwf-sw_dev-work-planner

# Release the token
node .github/skills/uwf-state-manager/state.mjs release-agent

# Mark ready for implementation
node .github/skills/uwf-state-manager/state.mjs check-ready

# Sync derived fields after issue transitions
node .github/skills/uwf-state-manager/state.mjs sync

# Append a note
node .github/skills/uwf-state-manager/state.mjs note --agent uwf-core-orchestrator --note "Pausing for user review"
```

---

## Schema reference — `./.github/skills/uwf-state-manager/uwf-state.json`

```jsonc
{
  "phase": "<phase-name>",            // see Phase lifecycle below
  "status": "<idle|active|blocked>",  // current execution status
  "current_agent": "<agent-id|null>", // agent presently holding the token
  "artifact_path": "./tmp/workflow-artifacts", // base path for per-stage docs
  "ready_for_implementation": false,  // true only when gate conditions are met
  "history": [                        // append-only audit log
    {
      "ts": "ISO-8601",
      "from_phase": "<phase>",
      "to_phase": "<phase>",
      "agent": "<agent-id>",
      "note": "<free text>"
    }
  ]
}
```

### Phase lifecycle

```
idea → intake → discovery → planning → execution → acceptance → closed
```

- **idea** — initial state; project goal not yet captured.
- **intake** — `./tmp/workflow-artifacts/{mode}-intake.md` being produced.
- **discovery** — `./tmp/workflow-artifacts/{mode}-discovery.md` being produced.
- **planning** — `./tmp/workflow-artifacts/{mode}-plan.md` and `./tmp/state/` issue tree being produced.
- **execution** — orchestrator is driving per-issue cycles; `./tmp/state/` tree is active.
- **acceptance** — final checks; `./tmp/workflow-artifacts/{mode}-acceptance.md` being produced.
- **closed** — all issues closed; project complete.

---

## Procedures → script commands

All procedures below map directly to script commands. Do not implement them manually — run the script.

### 1) Read state
```sh
node .github/skills/uwf-state-manager/state.mjs read
```
Returns validated state JSON. If the file is missing or malformed, the script auto-initializes/repairs it.

### 2) Advance phase
```sh
node .github/skills/uwf-state-manager/state.mjs advance --to <phase> --agent <id> [--note <text>] [--force]
```
Validates lifecycle order, appends a history entry, updates `phase` to the new value and `status` to `active`.

### 3) Roll back phase
```sh
node .github/skills/uwf-state-manager/state.mjs rollback --to <phase> --agent <id> [--note <text>]
```
Validates target is earlier than current phase, prefixes history note with `ROLLBACK:`, and returns a list of artifacts that may need regenerating.

### 4) Set / release current agent
```sh
# Claim
node .github/skills/uwf-state-manager/state.mjs set-agent --agent <id> [--force]
# Release
node .github/skills/uwf-state-manager/state.mjs release-agent
```
`set-agent` refuses to overwrite an existing non-null token without `--force`.

### 5) Mark ready for implementation
```sh
node .github/skills/uwf-state-manager/state.mjs check-ready [--output-path <path>]
```
Verifies `issues-intake.md` and `issues-plan.md` are non-empty and `phase` ≥ `planning`. Sets `ready_for_implementation: true` only if all conditions pass.

### 6) Set status
```sh
node .github/skills/uwf-state-manager/state.mjs set-status --status <idle|active|blocked> --agent <id>
```
Appends a history entry only if the status actually changes.

### 7) Sync with file-system state tree
```sh
node .github/skills/uwf-state-manager/state.mjs sync
```
Walks `./tmp/state/` open/active/closed directories to derive `status`, auto-advances `execution → acceptance` when all issues are done, and re-checks `ready_for_implementation`.

### 8) Append history note
```sh
node .github/skills/uwf-state-manager/state.mjs note --agent <id> --note "<text>"
```

---

## Validation rules
- `phase` must be one of: `idea`, `intake`, `discovery`, `planning`, `execution`, `acceptance`, `closed`.
- `status` must be one of: `idle`, `active`, `blocked`.
- `history` is append-only — never remove or mutate existing entries.
- `artifact_path` must be a relative path string starting with `./`.
- Phase advances must follow the defined lifecycle order unless a `force: true` override is explicitly supplied by the caller.
- Never write partial / intermediate state. Always construct the full updated object before writing.

---

## Error conditions and responses

| Condition | Response |
|---|---|
| File missing | Initialize with defaults; log as first history entry |
| Unknown phase value | Reject with validation error; do not write |
| Token conflict (agent claim) | Return conflict error; do not overwrite |
| Illegal phase skip | Return lifecycle-order error; do not write |
| Artifact prereqs unmet for `ready_for_implementation` | Return missing-file list; do not set flag |
| History mutation attempted | Return immutability error |

---

## Required output from skill invocations
The script prints structured JSON to stdout for every command. Agents must capture and relay the key fields to the orchestrator:
- `ok` — `true` for success, `false` for error
- `procedure` — command that ran
- `state.phase`, `state.status`, `state.current_agent`, `state.ready_for_implementation` — state snapshot after the operation
- `history_entry` — the new history entry appended (where applicable)
- `error` — error message (only present when `ok: false`)
