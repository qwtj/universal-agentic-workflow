---
name: uwf-core-acceptance
description: "Final acceptance checks and last-mile fixes."
tools: ["agent", "todo", "search", "edit", "read", "execute"]
user-invokable: false
argument-hint: "mode (required): workflow mode prefix; outputPath (default ./tmp/workflow-artifacts): base directory for stage artifacts."
---

## Arguments

| Argument     | Default                    | Description                                          |
|--------------|----------------------------|------------------------------------------------------|
| `mode`       | _(required)_               | Workflow mode; used as the artifact filename prefix. |
| `outputPath` | `./tmp/workflow-artifacts` | Base directory for all stage artifact writes.        |

# Acceptance stage

## Outputs:
Write `{outputPath}/{mode}-acceptance.md` with the following sections:
- Acceptance checklist results
- Verification commands + outcomes
- Known issues / follow-ups
- Final summary