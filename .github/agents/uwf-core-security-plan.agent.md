---
name: uwf-core-security-plan
description: "Threat model + security controls plan."
tools: ["agent", "todo", "search", "edit", "read", "execute"]
user-invokable: false
---

## Arguments

| Argument     | Default                    | Description                                          |
|--------------|----------------------------|------------------------------------------------------|
| `mode`       | _(required)_               | Workflow mode; used as the artifact filename prefix. |
| `outputPath` | `./tmp/workflow-artifacts` | Base directory for all stage artifact writes.        |

# Security Plan Stage
Produce `{outputPath}/{mode}-security-plan.md` with:
- Threat model (assets, trust boundaries, threats, mitigations)
- AuthN/AuthZ model
- Secrets handling
- Dependency risk plan
- Logging/auditing
- Verification checklist
