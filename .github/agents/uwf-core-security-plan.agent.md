---
name: uwf-core-security-plan
description: "Threat model + security controls plan."
tools: ["agent", "todo", "search", "edit", "read", "execute"]
user-invokable: false
argument-hint: "role (required): artifact filename prefix; outputPath (default ./tmp/workflow-artifacts): base directory for stage artifacts."
---

# Security Plan Stage
Produce `{outputPath}/{role}-security-plan.md` with:
- Threat model (assets, trust boundaries, threats, mitigations)
- AuthN/AuthZ model
- Secrets handling
- Dependency risk plan
- Logging/auditing
- Verification checklist
