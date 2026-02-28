---
name: uwf-requirements
description: "Write the requirements pack: PRD + NFRs + acceptance criteria."
tools: ["todos", "readFile", "codebase", "createFile", "editFiles"]
handoffs:
  - label: "Issue Mode — ADRs"
    agent: uwf-adr
    prompt: "Derive architecture decisions from requirements; write ADRs."
    send: false
  - label: "Issue Mode — Create Security Plan"
    agent: uwf-security-plan
    prompt: "Produce tmp/workflow-artifacts/security-plan.md for this issue. It will feed into test planning and the work plan."
    send: false
  - label: "Issue Mode — Stage 3: Test Planning"
    agent: uwf-test-planner
    prompt: "Produce tmp/workflow-artifacts/test-plan.md for this issue. It will feed into the work plan."
    send: false
  - label: "Issue Mode — Stage 4: Work Planning (skip security+test)"
    agent: uwf-work-planner
    prompt: "Produce tmp/workflow-artifacts/plan.md with test steps ordered before implementation steps. Note: security and test planning were skipped — document the reason in the plan."
    send: false
---
# Requirements stage
Produce tmp/workflow-artifacts/requirements.md with:
- Goal / Non-goals
- Functional requirements (numbered)
- Non-functional requirements (performance, security, reliability, cost, operability)
- Data requirements (if any)
- Acceptance criteria (testable)
- Risks + mitigations
