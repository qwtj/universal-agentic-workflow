---
name: "uwf-bootstrap"
description: "Scaffold the UWF framework assets into this workspace."
argument-hint: "Optional: target domains (node-backend, web-frontend, infra, slides)."
agent: "agent"
tools: ["createDirectory", "createFile", "editFiles", "listDirectory", "readFile"]
---
## Task
Create the UWF directory structure under .github/ plus `docs/workflow/` (templates) and `tmp/workflows/` (active artifacts).

## Instructions
- Create missing directories and baseline files.
- Do not overwrite existing user content; if a file exists, append safely or create a sibling *.local.md draft.
- After scaffolding, instruct the user to run /uwf-run.

## Done when
- UWF agents, prompts, instructions, skills skeletons, `docs/workflow/`, and `tmp/workflows/` exist.
