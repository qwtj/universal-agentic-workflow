````skill
---
name: uwf-state-manager
description: "Read, validate, and mutate docs/uwf-state.json and the file-system state tree. Provides canonical procedures for phase transitions, agent hand-offs, artifact path resolution, and history recording."
---
# UWF State Manager Skill

## When to use
Invoke this skill whenever an agent needs to:
- Read the current workflow phase or status from `docs/uwf-state.json`
- Advance or roll back a phase (`idea → intake → discovery → planning → execution → acceptance → closed`)
- Record a hand-off between agents (`current_agent` field)
- Mark `ready_for_implementation` after both `intake.md` and `plan.md` are confirmed present
- Append an entry to the `history` array
- Validate that `docs/uwf-state.json` is well-formed before acting on it
- Sync JSON state with the file-system `state/` directory tree after issue transitions

This skill is the single authoritative source for all reads and writes to `docs/uwf-state.json`.

---

## Schema reference — `docs/uwf-state.json`

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
- **intake** — `tmp/workflow-artifacts/intake.md` being produced.
- **discovery** — `tmp/workflow-artifacts/discovery.md` being produced.
- **planning** — `tmp/workflow-artifacts/plan.md` and `state/` issue tree being produced.
- **execution** — orchestrator is driving per-issue cycles; `state/` tree is active.
- **acceptance** — final checks; `tmp/workflow-artifacts/acceptance.md` being produced.
- **closed** — all issues closed; project complete.

---

## Procedures

### 1) Read state
1. Read `docs/uwf-state.json`.
2. Validate all required top-level keys are present: `phase`, `status`, `current_agent`, `artifact_path`, `ready_for_implementation`, `history`.
3. If the file is missing or malformed, initialize it with the default schema (phase `idea`, status `idle`, `current_agent` null, `artifact_path` `./tmp/workflow-artifacts`, `ready_for_implementation` false, `history` []).
4. Return the parsed object.

### 2) Advance phase
1. Read current state (Procedure 1).
2. Verify the requested `to_phase` is the legal next step in the lifecycle (or a forced override flagged explicitly by the caller).
3. Append a history entry:
   ```json
   {
     "ts": "<current ISO-8601 timestamp>",
     "from_phase": "<current phase>",
     "to_phase": "<requested phase>",
     "agent": "<calling agent id>",
     "note": "<reason or empty string>"
   }
   ```
4. Update `phase` to `to_phase`.
5. Update `status` to `active`.
6. Write the updated object back to `docs/uwf-state.json` (pretty-printed, 2-space indent).
7. Return a transition summary.

### 3) Roll back phase
1. Read current state.
2. Confirm the requested `to_phase` is earlier in the lifecycle than the current phase.
3. Append a history entry with `note` beginning `ROLLBACK:`.
4. Update `phase` and set `status` to `active`.
5. Write back to disk.
6. Return rollback summary and list any artifact files that may need to be re-generated.

### 4) Set current agent
1. Read current state.
2. Set `current_agent` to the given agent id (string) or `null` for release.
3. If claiming (non-null) and `current_agent` is already non-null and different, **refuse** and return a conflict error — do not overwrite a held token without an explicit `force: true` flag.
4. Write back to disk.
5. Return updated `current_agent` value.

### 5) Mark ready for implementation
1. Verify both files exist:
   - `tmp/workflow-artifacts/intake.md` (non-empty)
   - `tmp/workflow-artifacts/plan.md` (non-empty)
2. Verify `phase` is `planning` or later.
3. If conditions met: set `ready_for_implementation` to `true` and write back.
4. If conditions not met: return a list of missing prerequisites; do **not** write.

### 6) Record idle / blocked status
1. Read current state.
2. Set `status` to `idle` (queue empty, waiting) or `blocked` (dependency unmet, external blocker).
3. Append a history entry if the previous status was different.
4. Write back to disk.

### 7) Sync with file-system state tree
After any issue-level state transition (open → active, active → closed, open → closed/skipped):
1. Read `docs/uwf-state.json`.
2. Count files across all `state/*/*/open/*.md`, `state/*/*/active/*.md`, `state/*/*/closed/*.md`.
3. Derive and update the following derived fields if they differ from current values:
   - If any `active/` file exists → `status: active`.
   - If `open/` is empty and `active/` is empty → `status: idle`; if phase is `execution`, advance phase to `acceptance`.
   - `ready_for_implementation` rechecked against Procedure 5.
4. Write back only if changes were derived.
5. Return a sync summary (counts before/after).

### 8) Append arbitrary history note
1. Read current state.
2. Append a history entry with `ts`, `agent`, and caller-supplied `note`; leave `from_phase` and `to_phase` equal to current phase.
3. Write back to disk.

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
After any procedure, return a state-manager report containing:
- **Procedure executed** — name and parameters
- **State before** — phase, status, current_agent, ready_for_implementation
- **State after** — same fields
- **History entry appended** — full JSON of the new entry (if applicable)
- **Errors or warnings** — any validation failures encountered
- **Recommended next action** — which agent or stage should act next
````
