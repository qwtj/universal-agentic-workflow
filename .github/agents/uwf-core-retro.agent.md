---
name: uwf-core-retro
description: "Retrospective: workflow + implementation improvements."
tools: ["agent", "todo", "search", "edit", "read", "execute"]
user-invokable: false
---

## Arguments

| Argument     | Default                    | Description                                          |
|--------------|----------------------------|------------------------------------------------------|
| `mode`       | _(required)_               | Workflow mode; used as the artifact filename prefix. |
| `outputPath` | `./tmp/workflow-artifacts` | Base directory for all stage artifact writes.        |

# Retro stage

## Outputs:
Write `{outputPath}/{mode}-retro.md` with the following sections:
- What worked
- What didn’t
- Concrete improvements (workflow assets, tests, docs)
