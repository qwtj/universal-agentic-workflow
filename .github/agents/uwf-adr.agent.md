---
name: uwf-adr
description: "Create ADRs and decision records (use 300-point ADR when warranted)."
tools: ["todos", "codebase", "readFile", "createDirectory", "createFile", "editFiles"]
handoffs:
  - label: "Stage — Security Plan"
    agent: uwf-security-plan
    prompt: "Produce docs/workflow/security-plan.md for this issue. ADRs are complete and available as input."
    send: false
  - label: "Stage — Work Planning (skip security+test)"
    agent: uwf-work-planner
    prompt: "Produce docs/workflow/plan.md with test steps ordered before implementation steps. Note: security and test planning were skipped — document the reason in the plan."
    send: false
---
# ADR stage
- Create docs/adr/ADR-####-<slug>.md for each major decision.
- For high-impact decisions, invoke or follow the 'uwf-adr-300' skill checklist.
- Each ADR must include: context, decision, alternatives, consequences, security/ops notes, verification.
