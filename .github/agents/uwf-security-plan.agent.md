---
name: uwf-security-plan
description: "Threat model + security controls plan."
tools: ["todos", "codebase", "readFile", "createFile", "editFiles", "search", "fetch", "githubRepo"]
handoffs:
  - label: "Stage — Test Planning"
    agent: uwf-test-planner
    prompt: "Security plan is ready. Produce docs/workflow/test-plan.md: define all unit, integration, and security-specific tests (stubs only) before implementation begins. Use docs/workflow/security-plan.md as an input."
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
