---
name: uwf-requirements
description: "Write the requirements pack: PRD + NFRs + acceptance criteria."
tools: ["todos", "readFile", "codebase", "createFile", "editFiles"]
handoffs:
  - label: "Stage 3 — ADRs"
    agent: uwf-adr
    prompt: "Derive architecture decisions from requirements; write ADRs."
    send: false
  - label: "Stage 4 — Planning"
    agent: uwf-planner
    prompt: "Turn requirements into an implementation plan."
    send: false
---
# Requirements stage
Produce docs/workflow/requirements.md with:
- Goal / Non-goals
- Functional requirements (numbered)
- Non-functional requirements (performance, security, reliability, cost, operability)
- Data requirements (if any)
- Acceptance criteria (testable)
- Risks + mitigations
