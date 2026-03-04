---
name: uwf-core-retro
description: "Retrospective: workflow + implementation improvements."
tools: ["agent", "todo", "search", "edit", "read", "execute"]
user-invokable: false
argument-hint: "role (required): artifact filename prefix; outputPath (default ./tmp/workflow-artifacts): base directory for stage artifacts."
---

# Retro stage

## Outputs:
Write `{outputPath}/{role}-retro.md` with the following sections:
- What worked
- What didn’t
- Concrete improvements (workflow assets, tests, docs)
