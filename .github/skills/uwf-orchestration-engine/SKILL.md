# Skill: uwf-orchestration-engine

## When to use
Load this skill at orchestrator startup. It governs **how** any persona-driven orchestrator operates — stage sequencing discipline, gate enforcement, retry logic, and the fix-loop. The **what** (stage list, gate definitions, subagent roster) comes from the persona skill loaded alongside it.

---

## Invocation Contract

Every `runSubagent` call **must** include the following context object so subagents know their operating environment.

```jsonc
{
  "workflow":   "<persona_name>",      // e.g. "project_manager", "sw_dev", "book_writer"
  "mode":       "<mode>",              // from the persona skill, e.g. "project" or "issues"
  "phase":      "<current_phase>",     // from uwf-state.json
  "outputPath": "./tmp/workflow-artifacts",
  "statePath":  "./tmp/uwf-state.json"
}
```

The `workflow` and `mode` values are provided by the persona skill. The `phase` value is read from `uwf-state.json` via `uwf-core-project-tracking` before every stage transition.

---

## Non-negotiable Principles

1. The orchestrator does **not** produce, edit, or delete any artifact file. Every artifact is produced by a subagent.
2. Before **every** stage transition, invoke `uwf-core-project-tracking` to advance the phase and record the hand-off in `uwf-state.json`.
3. After **every** subagent completes, run the **Gate Check** for that stage (defined in the persona skill). If the gate fails, re-invoke the same subagent with the failure details — up to **2 retries**. If still failing after retries, halt and report the blocked gate to the user.
4. Do **not** skip stages. Conditional stages (ADR, Security, etc.) may be marked `PASS — not required` in the gate log but must be explicitly evaluated.
5. All user questions flow through the orchestrator via `vscode/askQuestions`. Subagents must return structured requests upward; the orchestrator relays them and passes responses back down.

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

For every stage, after the designated subagent returns:

1. Identify the gate for that stage from the persona skill's gate definitions.
2. Verify each required artifact exists and is non-empty.
3. If the gate **passes** → log `GATE PASS: <gate_name>` and advance.
4. If the gate **fails** → execute the Gate Failure Protocol below.

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

- Never start a dependent stage without its prerequisite artifacts confirmed present (per gate definitions).
- Do not invent facts; use `uwf-core-discovery` to inspect the workspace when uncertain.
- On queue empty or workflow completion, summarize completion status and offer a retrospective via `uwf-core-retro` if appropriate.
- Subagents must end every response with `Current Stage/Phase:` / `Recommended Next Stage/Phase:` blocks per UWF conventions.

---

## Adding a New Workflow (for workflow authors)

To create a new persona:
1. Create `.github/skills/uwf-{name}/SKILL.md` with the structure defined below.
2. Add all new stage agents to the `agents:` list in `uwf-core-orchestrator.agent.md`.
3. Bootstrap the orchestrator with `workflow={name}`.

### Required sections in a persona SKILL.md

| Section | Content |
|---|---|
| `mode` | The string passed as `mode` in the invocation contract (e.g. `project`, `issues`, `design`, `writing`) |
| `Stage Sequence` | Ordered table: `# \| Phase \| Subagent \| Purpose` |
| `Gate Definitions` | One gate per stage: required artifact paths and field-level checks |
| `Subagent Roster` | List of all subagent names this persona uses |
| `Artifact Prefix` | The filename prefix for all generated artifacts (e.g. `project-`, `issues-`) |
