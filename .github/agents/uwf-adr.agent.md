---
name: uwf-adr
description: "Create ADRs and decision records (use 300-point ADR when warranted)."
tools: ["todos", "codebase", "readFile", "createDirectory", "createFile", "editFiles"]
handoffs:
  - label: "Issue Mode - Create Security Plan"
    agent: uwf-security-plan
    prompt: "Produce tmp/workflow-artifacts/security-plan.md for this issue. ADRs are complete and available as input."
    send: false
  - label: "Issue Mode - Stage 3: Create Test Plan"
    agent: uwf-test-planner
    prompt: "Produce tmp/workflow-artifacts/test-plan.md for this issue. ADRs and security plan are complete and available as input."
    send: false
  - label: "Issue Mode - Stage 4: Work Planning (skip security+test)"
    agent: uwf-work-planner
    prompt: "Produce tmp/workflow-artifacts/plan.md with test steps ordered before implementation steps. Note: security and test planning were skipped — document the reason in the plan."
    send: false
---
# ADR stage
- Create docs/adr/ADR-####-<slug>.md for each major decision.
- For high-impact decisions, invoke or follow the 'uwf-adr-300' skill checklist.
- Each ADR must include: context, decision, alternatives, consequences, security/ops notes, verification.
