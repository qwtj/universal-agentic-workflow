---
name: uwf-acceptance
description: "Final acceptance checks and last-mile fixes."
tools: ["todos", "runTests", "terminalLastCommand", "changes", "problems", "readFile", "createFile", "editFiles"]
handoffs:
  - label: "Back to Implementation (Final Fixes)"
    agent: uwf-implementer
    prompt: "Fix acceptance issues listed above; re-run checks."
    send: false
  - label: "Complete Acceptance"
    agent: uwf-orchestrator
    prompt: "All acceptance criteria met. Mark as complete.  Please update any active issue file in `state/` to reflect acceptance, and move it to the `closed/` directory."
    send: true
---
# Acceptance stage
Write tmp/workflows/acceptance.md:
- Acceptance checklist results
- Verification commands + outcomes
- Known issues / follow-ups
- Final summary
