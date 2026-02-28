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
    prompt: "All acceptance criteria met.  The acceptance agent will now move the active issue file from `state/.../active/` to the corresponding `closed/` directory and perform any final updates.  Notify the orchestrator when done."
    send: true
---
# Acceptance stage
Write tmp/workflows/acceptance.md:
- Acceptance checklist results
- Verification commands + outcomes
- Known issues / follow-ups
- Final summary

Once all criteria are satisfied the agent should also:
1. Update the active issue file with any final notes (e.g. a link to the acceptance document).
2. Move the file from `state/<milestone>/<sprint>/active/` to the matching `closed/` directory.
3. Optionally, adjust frontmatter or add a `## Completed` section if not already present.
4. Confirm completion to the orchestrator so it can select the next issue.
