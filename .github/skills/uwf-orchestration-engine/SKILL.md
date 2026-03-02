# Skill: uwf-orchestration-engine

## When to use
Load this skill at orchestrator startup. It governs **how** any persona-driven orchestrator operates — stage sequencing discipline, gate enforcement, retry logic, and the fix-loop. The **what** (stage list, gate definitions, subagent roster) comes from the persona skill loaded alongside it.

---

## Invocation Contract

Every `runSubagent` call **must** include the following context object so subagents know their operating environment.

```jsonc
{
  "workflow":   "<persona_name>",      // e.g. "project_manager", "sw_dev", "book_writer"
  "role":       "<role>",              // from the persona skill, e.g. "project" or "issues"
  "phase":      "<current_phase>",     // from uwf-state.json
  "outputPath": "./tmp/workflow-artifacts",
  "statePath":  "./tmp/uwf-state.json"
}
```

The `workflow` and `role` values are provided by the persona skill. The `phase` value is read from `uwf-state.json` via `uwf-core-project-tracking` before every stage transition.

---

## Non-negotiable Principles

1. The orchestrator does **not** produce, edit, or delete any artifact file. Every artifact is produced by a subagent.
2. Before **every** stage transition, invoke `uwf-core-project-tracking` to advance the phase and record the hand-off in `uwf-state.json`.
3. After **every** subagent completes, run the **Gate Check** for that stage (defined in the persona skill). If the gate fails, re-invoke the same subagent with the failure details — up to **2 retries**. If still failing after retries, halt and report the blocked gate to the user.
4. Do **not** skip stages. Conditional stages (ADR, Security, etc.) may be marked `PASS — not required` in the gate log but must be explicitly evaluated.
5. All user questions flow through the orchestrator via `vscode/askQuestions`. Subagents must return structured requests upward; the orchestrator relays them and passes responses back down.
6. **DO NOT yield back to the user between stages.** After a subagent returns and its gate passes, immediately invoke the next stage subagent. The orchestrator must run the full stage sequence to completion in a single turn. The only permitted user-visible output between stages is a one-line trace (e.g. `[Stage N] <stageName> → starting`). Never pause, ask for permission, summarize completed work, or wait for acknowledgement between stage transitions. Only stop when: a gate fails permanently after retries, a `vscode/askQuestions` call is needed, or the workflow is fully complete.

---

## Startup Procedure

When the orchestrator is invoked:

1. Read and internalize **this skill** (`uwf-orchestration-engine`) to load engine behavior.
2. Read and internalize the **persona skill** at `.github/skills/uwf-{workflow}/SKILL.md` to load:
   - The `mode` value for the invocation contract
   - The ordered stage sequence table
   - All gate definitions
   - The subagent roster
3. Invoke `uwf-core-project-tracking` to initialize or read `uwf-state.json` and obtain the current phase.
4. Begin executing stages from the persona's stage sequence in order, starting from the current phase.

---

## Gate Enforcement

For every stage, after the designated subagent returns, run the persona's gate script (see **Script-Driven Gate Enforcement** below):

```sh
node .github/skills/uwf-<workflow>/run.mjs --check-gate <stageName>
```

- Exit `0` → log `GATE PASS: <stageName>` and advance to the next stage.
- Exit `1` → parse the JSON failure list from stdout and execute the Gate Failure Protocol below.

Do **not** evaluate gate conditions through reasoning or artifact inspection in the conversation loop — the script is the authoritative gate.

---

## Gate Failure Protocol

When a gate check fails:
1. Log which check(s) failed and the missing artifact path(s).
2. Re-invoke the responsible subagent with an explicit note: `"Gate failure: <artifact> missing or empty. Please produce it."`.
3. Re-check the gate after the subagent returns.
4. Allow up to **2 retries** per gate. After 2 failures, **halt** the sequence and report the blockage to the user with: gate name, missing artifacts, and the subagent's last response.

---

## Review Fix-Loop Protocol

When a reviewer subagent returns findings:
1. Parse the fix list. Group fixes by responsible subagent.
2. Re-invoke each responsible subagent with context: `"Review fix request: <fix description>"`.
3. After all fixes are applied, re-invoke the reviewer for re-review.
4. If clean → advance. If still dirty → repeat.
5. Allow a maximum of **3 total review cycles**. After 3 dirty cycles, halt and surface the remaining issues to the user.

---

## Operating Principles

- **Run the full stage sequence without stopping.** After each gate passes, immediately invoke the next subagent. Do not pause, summarize, or yield between stages.
- Emit a single-line progress trace before each `runSubagent` call (e.g. `[Stage 3/14] discovery → invoking uwf-core-discovery`). This is the only output allowed mid-sequence.
- Never start a dependent stage without its prerequisite artifacts confirmed present (per gate definitions).
- Do not invent facts; use `uwf-core-discovery` to inspect the workspace when uncertain.
- On queue empty or workflow completion, summarize completion status and offer a retrospective via `uwf-core-retro` if appropriate.
- Subagents must end every response with `Current Stage/Phase:` / `Recommended Next Stage/Phase:` blocks per UWF conventions.

---

## Script-Driven Gate Enforcement

Gate enforcement for each persona is implemented in a deterministic script, not in the orchestrator's reasoning loop. Every persona skill directory contains a `run.mjs` file alongside its `SKILL.md`.

### Orchestrator gate-check protocol

Before advancing past any stage, the orchestrator **must** run the gate check via terminal:

```sh
node .github/skills/uwf-<workflow>/run.mjs --check-gate <stageName> \
  --output-path ./tmp/workflow-artifacts \
  --state-path ./tmp/uwf-state.json
```

**Exit codes:**
| Code | Meaning |
|---|---|
| `0` | Gate passed — advance to next stage |
| `1` | Gate failed — stdout contains JSON `{ stage, passed, failures[] }` |
| `2` | Usage error (bad stage name / missing args) |

On exit code `1`, apply the Gate Failure Protocol (re-invoke responsible subagent with failure details, up to `maxRetries` times). Retrieve `maxRetries` and `onGateFailure` for any stage via:

```sh
node .github/skills/uwf-<workflow>/run.mjs --list-stages
```

### Shared utilities

All `run.mjs` files import from `.github/skills/uwf-orchestration-engine/skill-runner.mjs`, which provides:
- `requireNonEmptyFile(path, label)` — checks file exists and is non-empty
- `requireFileContains(path, needle, label)` — checks file contains expected text
- `requireFilesWithPrefix(dir, prefix, label)` — checks at least one matching file exists
- `requireFileMatchingPattern(baseDir, regex, label)` — recursive pattern match
- `gatePass(stageName)` / `gateFail(stageName, failures[])` — result constructors
- `runCLI(stages)` — CLI dispatcher; call as the entry point of every `run.mjs`

---

## Adding a New Workflow (for workflow authors)

To create a new persona, use the scaffolder:

```sh
node scripts/scaffold-skill.mjs --name <skill-name> --stages "stage1,stage2,stage3"
```

This generates skeleton `run.mjs` and `SKILL.md` files with TODO stubs. Then:

1. Fill in the `gate()` function stubs in `.github/skills/uwf-{name}/run.mjs`.
2. Create stage agent files: `.github/agents/uwf-{name}-{stage}.agent.md`.
3. Add all new stage agents to the `agents:` list in `uwf-core-orchestrator.agent.md`.
4. Bootstrap the orchestrator with `workflow={name}`.

### Required artifacts per persona

| Artifact | Content |
|---|---|
| `SKILL.md` | `role`, Stage Sequence table, Subagent Roster, Artifact Prefix, Persona-Specific Rules |
| `run.mjs` | `stages[]` array with `name`, `agent`, `maxRetries`, `onGateFailure`, `gate()` for every stage |

### Required sections in a persona SKILL.md

| Section | Content |
|---|---|
| `mode` | The string passed as `mode` in the invocation contract (e.g. `project`, `issues`, `design`, `writing`) |
| `Stage Sequence` | Ordered table: `# \| Stage \| Subagent \| Purpose` — gate logic lives in `run.mjs`, not here |
| `Subagent Roster` | List of all subagent names this persona uses |
| `Artifact Prefix` | The filename prefix for all generated artifacts (e.g. `project-`, `issues-`) |
