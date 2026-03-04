---
name: uwf-core-requirements
description: "Write the requirements pack: PRD + NFRs + acceptance criteria."
tools: ["agent", "todo", "search", "edit", "read", "execute"]
user-invokable: false
argument-hint: "role (required): artifact filename prefix; outputPath (default ./tmp/workflow-artifacts): base directory for stage artifacts."
---

# Requirements stage
Produce `{outputPath}/{role}-requirements.md` with:
- Goal / Non-goals
- Functional requirements (numbered)
- Non-functional requirements (performance, security, reliability, cost, operability)
- Data requirements (if any)
- Acceptance criteria (testable)
- Risks + mitigations
