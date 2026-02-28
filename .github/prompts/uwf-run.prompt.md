---
name: "uwf-run"
description: "Run the Universal Workflow Framework (UWF) — auto-detects Project Mode vs Issue Mode."
argument-hint: "New project: describe what you want to build + constraints. Returning: leave blank to continue working through open issues."
agent: "uwf-orchestrator"
tools: ["todos", "codebase", "listDirectory", "readFile", "createFile", "editFiles", "createDirectory"]
---
## Task
Hand off to the UWF orchestrator, which auto-detects the operating mode and drives the correct stage sequence.

## Instructions
1. **Mode detection** (orchestrator does this first):
   - Check whether any `state/*/*` directory path exists.
   - **No such path** → Project Mode: run Intake → Discovery → Timeline Planning → create `state/` issue structure → hand off to orchestrator for Issue Mode.
   - **Path exists** → Issue Mode: scan `state/*/*/open/` for the next eligible issue, move it to `active/`, reset workflow docs in `tmp/workflow-artifacts/`, run per-issue workflow.

2. **Project Mode** — only if no `state/*/*` path exists:
   - Clarification gate: if the objective is missing or vague, ask focused questions before writing any artifact.
   - handoff to `uwf-intake` → `uwf-discovery` → `uwf-timeline-planner` to produce `tmp/workflow-artifacts/plan.md` and populate the initial issue tree under `state/`.
3. **Issue Mode** — if `state/*/*` paths exist:
   - Orchestrator scans `state/*/*/open/` for next eligible issue (respecting `depends-on`).
   - Full per-issue cycle: Intake → Discovery → (Requirements) → (ADRs) → (Security) → Implementation → Review → Acceptance.

## Done when
- Project Mode: `state/` directory structure exists and orchestrator has transitioned to Issue Mode.
- Issue Mode: all `open/` directories are empty across all milestones and sprints, and a retro is prompted.

