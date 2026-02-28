---
name: uwf-retro
description: "Retrospective: workflow + implementation improvements."
tools: ["todos", "changes", "readFile", "createFile", "editFiles"]
handoffs:
  - label: "Issue Mode — Stage 9: Acceptance"
    agent: uwf-acceptance
    prompt: "Run the acceptance checklist; finalize tmp/workflow-artifacts/acceptance.md."
    send: false
  - label: "Hand off to Orchestrator (Issue Mode)"
    agent: uwf-orchestrator
    prompt: "Timeline is ready and the state/ directory structure has been created. Switch to Issue Mode: scan state/*/*/open/ for the first eligible issue, move it to active/, reset workflow docs, and begin Issue Intake."
    send: false
---
# Retro stage
Write tmp/workflow-artifacts/retro.md:
- What worked
- What didn’t
- Concrete improvements (workflow assets, tests, docs)
