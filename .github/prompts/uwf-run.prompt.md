---
name: "uwf-run"
description: "Run the Universal Workflow Framework (UWF) to build anything in staged form."
argument-hint: "Describe what you want to build + constraints (stack, deadlines, security, target env)."
agent: "uwf-orchestrator"
tools: ["todos", "codebase", "listDirectory", "readFile", "createFile", "editFiles", "createDirectory"]
---
## Task
Run UWF end-to-end (or as far as the user wants) using stage agents + handoffs.

## Instructions
1) Clarification gate (mandatory): capture the concrete build objective before creating or updating any `docs/workflow/*` artifact.
   - If objective/scope is missing or vague, ask focused questions first (target outcome, in-scope/out-of-scope, constraints, acceptance criteria).
   - Do not generate generic workflow prose while waiting for clarification.
2) After objective is explicit, create or update `docs/workflow/intake.md` using only user-provided inputs + clearly labeled assumptions.
3) Decide which domain packs are needed (backend/frontend/infra/docs/slides) for this run.
   - If profile/scaffolding work is explicitly requested, create missing:
     - `.github/instructions/<domain>.instructions.md`
     - `.github/skills/<domain-skill>/SKILL.md` (if a reusable capability is needed)
   - Otherwise, report the recommended domain packs without creating files.
4) Recommend the next stage via handoff (Discovery first unless clearly unnecessary).

## Done when
- The objective and constraints are explicit, intake reflects them, required domain packs are identified, and the next stage is ready to run.
