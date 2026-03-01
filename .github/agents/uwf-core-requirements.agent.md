---
name: uwf-core-requirements
description: "Write the requirements pack: PRD + NFRs + acceptance criteria."
tools: ["agent", "todo", "search", "edit", "read", "execute"]
user-invokable: false
---

## Arguments

| Argument     | Default                    | Description                                          |
|--------------|----------------------------|------------------------------------------------------|
| `mode`       | _(required)_               | Workflow mode; used as the artifact filename prefix. |
| `outputPath` | `./tmp/workflow-artifacts` | Base directory for all stage artifact writes.        |

# Requirements stage
Produce `{outputPath}/{mode}-requirements.md` with:
- Goal / Non-goals
- Functional requirements (numbered)
- Non-functional requirements (performance, security, reliability, cost, operability)
- Data requirements (if any)
- Acceptance criteria (testable)
- Risks + mitigations
