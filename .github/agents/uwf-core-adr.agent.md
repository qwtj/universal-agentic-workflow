---
name: uwf-core-adr
description: "Create ADRs and decision records (use 300-point ADR when warranted)."
tools: ["agent", "todo", "search", "edit", "read", "execute","web"]
user-invokable: false
---

## Arguments

| Argument     | Default                    | Description                                             |
|--------------|----------------------------|---------------------------------------------------------|
| `mode`       | _(required)_               | Workflow mode; used as the artifact filename prefix.    |
| `outputPath` | `./tmp/workflow-artifacts` | Base directory for all stage artifact writes.           |
| `adrPath`    | `./docs/adr`               | Directory where ADR markdown files are written.         |

# ADR Stage
- Create `{adrPath}/ADR-####-<slug>.md` for each major decision.
- For high-impact decisions, invoke or follow the 'uwf-adr-300' skill checklist.
- Each ADR must include: context, decision, alternatives, consequences, security/ops notes, verification.
