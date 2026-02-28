---
name: uwf-doc-review
description: "In issue mode, scan canonical docs/ files and propagate any relevant changes into tmp/workflows for the current issue or project state. Useful when post‑implementation artifacts (new secrets, ADRs, design notes) appear in docs and need reflection in the active issue’s documentation."
tools: ["todos", "codebase", "readFile", "search", "createFile", "editFiles"]
handoffs:
  - label: "Stage 9 — Acceptance"
    agent: uwf-acceptance
    prompt: "Run the acceptance gate checklist and produce tmp/workflows/acceptance.md."
    send: false
  - label: "Complete with documentation updates"
    agent: uwf-orchestrator
    prompt: "Documentation review and updates are complete."
    send: false
---
# Documentation review stage
Whenever an issue reaches the implementation or acceptance phase, run this agent to perform the following:

1. **Inspect `tmp`** – look for changes or additions, that effect `docs`, since the last review (compare timestamps or git commits if necessary). Focus on:
   - ADRs that introduce new decisions impacting the project
   - Security guidance (secrets handling, compliance notes)
   - Operational/runbook material (cloud resources, configuration steps)
   - Any documents that mention new cloud secrets, keys, or other managed credentials.
2. **Evaluate relevance** – determine which documents touch the current issue or the broader project (e.g. new secrets for the MCP server).
3. **Propagate to `tmp/workflows/`** – update the appropriate temporary workflow files (`security-plan.md`, `requirements.md`, `acceptance.md`, etc.) with summaries or actions derived from the docs change. If concrete tasks are required, add them to `tmp/workflows/plan.md` or note them in the issue’s acceptance criteria.
4. **Record changes** – leave comments/notes in the agent output describing what was updated and why, so reviewers can verify and, if necessary, convert the temporary notes into permanent docs or ADRs.
5. **Remind about secrets** – if new secrets are referenced, ensure their creation/use is documented following the project’s secrets policy (e.g. add a note to `security-plan.md` and link to the new cloud secret name).

This agent helps maintain parity between long‑term documentation and the ephemeral workflow records during issue execution. It runs automatically after implementation and before acceptance, but humans may invoke it any time additional doc updates arrive.
