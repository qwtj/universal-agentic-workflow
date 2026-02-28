---
name: uwf-adr-300
description: "Create a high-rigor ADR using a 300-point checklist (security/ops/compliance/testability included). Use for high-impact decisions."
---
# UWF ADR 300 Skill

## When to use
Use when a decision materially impacts security, cost, reliability, maintainability, or long-term architecture.

## Output
- Write docs/adr/ADR-####-<slug>.md
- Append an Appendix: a checklist with up to ~300 considerations grouped by domains.
  - Use checkboxes ([ ]).
  - Mark non-applicable items explicitly as N/A.
  - Keep the top ADR narrative readable; move the bulk checklist to the Appendix.

## Procedure
1) Create the ADR skeleton (Context, Decision, Alternatives, Consequences, Verification).
2) Add the checklist appendix grouped into domains:
   - Product/UX, Data, APIs, AuthN/AuthZ, Secrets, Dependencies/Supply chain,
     Observability, Performance, Reliability, Cost, Compliance/Privacy, Operations,
     Testing, Migration/Rollback, Incident response, Maintenance.
3) Deep-dive where risk is high; otherwise keep checklist items brief.

## Template
See: templates/adr-300.template.md
