---
name: uwf-core-requirements
description: "Write the requirements pack: PRD + NFRs + acceptance criteria."
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

# Requirements stage
Produce `{outputPath}/{role}-requirements.md` with:
- Goal / Non-goals
- Functional requirements (numbered)
- Non-functional requirements (performance, security, reliability, cost, operability)
- Data requirements (if any)
- Acceptance criteria (testable)
- Risks + mitigations
