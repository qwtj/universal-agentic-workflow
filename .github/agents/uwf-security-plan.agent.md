---
name: uwf-security-plan
description: "Threat model + security controls plan."
tools: ["todos", "codebase", "readFile", "createFile", "editFiles", "search", "fetch", "githubRepo"]
handoffs:
  - label: "Stage 6 — Implementation"
    agent: uwf-implementer
    prompt: "Implement with security plan constraints; add tests and guardrails."
    send: false
---
# Security planning stage
Produce docs/workflow/security-plan.md with:
- Threat model (assets, trust boundaries, threats, mitigations)
- AuthN/AuthZ model
- Secrets handling
- Dependency risk plan
- Logging/auditing
- Verification checklist
