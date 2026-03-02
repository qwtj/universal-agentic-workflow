---
name: "uwf-start-development-with-issue"
description: "Start development with an active issue."
argument-hint: "New project: describe what you want to build + constraints. Returning: leave blank to continue working through open issues."
agent: "uwf-core-orchestrator"
workflow: "sw_dev"
---
# Tasks
Run the complete `sw_dev` workflow end-to-end:
1. Read `.github/skills/uwf-orchestration-engine/SKILL.md` and `.github/skills/uwf-sw_dev/SKILL.md`.
2. Call `runSubagent` for **every stage** in the persona's Stage Sequence table, in order, without stopping between stages.
3. Emit a single-line trace before each `runSubagent` call.
4. Run the gate check script after each subagent returns; apply Gate Failure Protocol if needed.
5. Only stop on permanent gate failure, a required user question (`vscode/askQuestions`), or final workflow completion.

**Do NOT narrate, simulate, or summarize stages. Every stage requires an actual `runSubagent` tool call. Describing or pretending to run a stage without calling the tool is a critical violation.**

> **`runSubagent` is a VS Code Copilot tool call — NOT a terminal command.** Never attempt `node run.mjs --run-stage` or any shell equivalent. The only terminal commands are `--list-stages` and `--check-gate`. There is no `--run-stage` flag anywhere in this workflow.
