---
name: uwf-acceptance
description: "Final acceptance checks and last-mile fixes."
tools: ["todos", "runTests", "terminalLastCommand", "changes", "problems", "readFile", "createFile", "editFiles"]
handoffs:
  - label: "Issue Mode - Back to Implementation (Final Fixes)"
    agent: uwf-implementer
    prompt: "Fix acceptance issues listed above; re-run checks."
    send: false
  - label: "Issue Mode - Stage 8: Complete Acceptance"
    agent: uwf-orchestrator
    prompt: "All acceptance criteria met."
    send: true
---
# Acceptance stage
Write tmp/workflow-artifacts/acceptance.md:
- Acceptance checklist results
- Verification commands + outcomes
- Known issues / follow-ups
- Final summary
