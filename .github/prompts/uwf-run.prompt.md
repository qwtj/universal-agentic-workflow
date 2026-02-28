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
   - Check whether any `tmp/state/*/*` directory path exists.
   - **No such path** → Project Mode: run Intake → Discovery → Timeline Planning → create `tmp/state/` issue structure → hand off to orchestrator for Issue Mode.
   - **Path exists** → Issue Mode: scan `tmp/state/*/*/open/` for the next eligible issue, move it to `active/`, reset workflow docs, run per-issue workflow.

2. **Project Mode** — only if no `tmp/state/*/*` path exists:
   - Clarification gate: if the objective is missing or vague, ask focused questions before writing any artifact.
   - Run `uwf-intake` → `uwf-discovery` → `uwf-timeline-planner`.
   - Planner creates the `tmp/state/<milestone>/<sprint>/{open,active,closed}/` tree and then triggers orchestrator to switch to Issue Mode.

3. **Issue Mode** — if `tmp/state/*/*` paths exist:
   - Orchestrator scans `tmp/state/*/*/open/` for next eligible issue (respecting `depends-on`).
   - Move issue file to `active/`, reset workflow docs, trigger `uwf-intake`.
   - Full per-issue cycle: Intake → Discovery → (Requirements) → (ADRs) → (Security) → Implementation → Review → Acceptance.
   - On completion: move issue file from `active/` → `closed/`, loop to next open issue.

## Done when
- Project Mode: `tmp/state/` directory structure exists and orchestrator has transitioned to Issue Mode.
- Issue Mode: all `open/` directories are empty across all milestones and sprints, and a retro is prompted.

