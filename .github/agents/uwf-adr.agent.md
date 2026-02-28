---
name: uwf-adr
description: "Create ADRs and decision records (use 300-point ADR when warranted)."
tools: ["todos", "codebase", "readFile", "createDirectory", "createFile", "editFiles"]
handoffs:
  - label: "Stage 4 — Planning"
    agent: uwf-planner
    prompt: "Use ADRs + requirements to create docs/workflow/plan.md."
    send: false
---
# ADR stage
- Create docs/adr/ADR-####-<slug>.md for each major decision.
- For high-impact decisions, invoke or follow the 'uwf-adr-300' skill checklist.
- Each ADR must include: context, decision, alternatives, consequences, security/ops notes, verification.
