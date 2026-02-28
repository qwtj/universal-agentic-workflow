---
name: "uwf-profile"
description: "Create or update a domain profile (backend/frontend/infra/slides/docs) for this workspace."
argument-hint: "Domain + standards you want enforced (style, security baseline, testing, tooling)."
agent: "uwf-orchestrator"
tools: ["readFile", "listDirectory", "createFile", "editFiles", "createDirectory"]
---
## Task
Create or update domain instruction files and skills for the requested domain.

## Output files (as needed)
- .github/instructions/<domain>.instructions.md
- .github/skills/<domain-skill>/SKILL.md (+ templates/resources)

## Done when
- Domain profile is in place and referenced by the workflow where relevant.
