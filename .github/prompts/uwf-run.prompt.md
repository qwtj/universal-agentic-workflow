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
1) Create or update docs/workflow/intake.md based on the user request.
2) Decide which domain packs are needed (backend/frontend/infra/docs/slides) and create missing:
   - .github/instructions/<domain>.instructions.md
   - .github/skills/<domain-skill>/SKILL.md (if a reusable capability is needed)
3) Recommend the next stage via handoff (Discovery first unless clearly unnecessary).

## Done when
- Intake doc exists and next stage is ready to run.
