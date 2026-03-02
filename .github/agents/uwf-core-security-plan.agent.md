---
name: uwf-core-security-plan
description: "Threat model + security controls plan."
tools: ["agent", "todo", "search", "edit", "read", "execute"]
user-invokable: false
argument-hint: "role (required): artifact filename prefix; outputPath (default ./tmp/workflow-artifacts): base directory for stage artifacts."
---

## Arguments

| Argument     | Default                    | Description                                          |
|--------------|----------------------------|------------------------------------------------------|
| `role`       | _(required)_               | Artifact filename prefix (e.g. `issues`, `project`). |
| `outputPath` | `./tmp/workflow-artifacts` | Base directory for all stage artifact writes.        |

> **Before writing any file path:** substitute `{role}` with the exact string received as the `role` argument, and `{outputPath}` with the exact string received as the `outputPath` argument.

# Security Plan Stage
Produce `{outputPath}/{role}-security-plan.md` with:
- Threat model (assets, trust boundaries, threats, mitigations)
- AuthN/AuthZ model
- Secrets handling
- Dependency risk plan
- Logging/auditing
- Verification checklist
