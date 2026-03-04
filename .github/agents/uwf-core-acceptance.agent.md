---
name: uwf-core-acceptance
description: "Final acceptance checks and last-mile fixes."
tools: ["agent", "todo", "search", "edit", "read", "execute"]
user-invokable: false
argument-hint: "role (required): artifact filename prefix; outputPath (default ./tmp/workflow-artifacts): base directory for stage artifacts."
---

# Acceptance stage

## Outputs:
Write `{outputPath}/{role}-acceptance.md` with the following sections:
- Acceptance checklist results
- Verification commands + outcomes
- Known issues / follow-ups
- Final summary