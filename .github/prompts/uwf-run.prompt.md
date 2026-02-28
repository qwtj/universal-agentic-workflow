---
name: "uwf-run"
description: "Run the Universal Workflow Framework (UWF) — auto-detects Project Mode vs Issue Mode."
argument-hint: "New project: describe what you want to build + constraints. Returning: leave blank to continue from backlog."
agent: "uwf-orchestrator"
tools: ["todos", "codebase", "listDirectory", "readFile", "createFile", "editFiles", "createDirectory"]
---
## Task
Hand off to the UWF orchestrator, which auto-detects the operating mode and drives the correct stage sequence.

## Instructions
1. **Mode detection** (orchestrator does this first):
   - Check `tmp/state/backlog.md`.
   - **Absent** → Project Mode: run Intake → Discovery → Timeline Planning → produce backlog → hand off to orchestrator for Issue Mode.
   - **Present** → Issue Mode: pick the next `open` item from backlog, set up active state, reset workflow docs, run per-issue workflow.

2. **Project Mode** — only if backlog is absent:
   - Clarification gate: if the objective is missing or vague, ask focused questions before writing any artifact.
   - Run `uwf-intake` → `uwf-discovery` → `uwf-timeline-planner`.
   - Planner creates `tmp/state/backlog.md` and then triggers orchestrator to switch to Issue Mode.

3. **Issue Mode** — if backlog present:
   - Orchestrator picks next `open` item, creates `tmp/state/active/<id>.md`, resets workflow docs, triggers `uwf-intake` for that issue.
   - Full per-issue cycle: Intake → Discovery → (Requirements) → (ADRs) → (Security) → Implementation → Review → Acceptance.
   - On completion: move to `tmp/state/complete/`, update backlog, loop to next open item.

## Done when
- Project Mode: `tmp/state/backlog.md` exists and orchestrator has transitioned to Issue Mode.
- Issue Mode: all items in backlog reach `complete` or `skipped` and a retro is prompted.

