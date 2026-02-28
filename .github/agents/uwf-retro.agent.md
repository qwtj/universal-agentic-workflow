---
name: uwf-retro
description: "Retrospective: workflow + implementation improvements."
tools: ["todos", "changes", "readFile", "createFile", "editFiles"]
handoffs:
  - label: "Stage 9 — Acceptance"
    agent: uwf-acceptance
    prompt: "Run the acceptance checklist; finalize tmp/workflow-artifacts/acceptance.md."
    send: false
---
# Retro stage
Write tmp/workflow-artifacts/retro.md:
- What worked
- What didn’t
- Concrete improvements (workflow assets, tests, docs)
