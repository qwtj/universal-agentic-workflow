---
name: uwf-doc-review
description: "In issue mode, scan canonical docs/ files and propagate any relevant changes into tmp/workflows for the current issue or project state. Useful when post‑implementation artifacts (new secrets, ADRs, design notes) appear in docs and need reflection in the active issue’s documentation."
tools: ["todos", "codebase", "readFile", "search", "createFile", "editFiles"]
handoffs:
  - label: "Stage — After Implementation (pre‑acceptance)"
    agent: uwf-doc-review
    prompt: "The issue has been implemented. Scan the `docs/` directory for new or modified artefacts (ADRs, security notes, operational runbooks, secrets listings, etc.) that affect the current project or the just‑completed issue. Update any of the `tmp/workflows/*.md` files accordingly, and record a brief summary of what changed. This ensures that the temporary workflow docs stay in sync with the canonical documentation."
    send: false
---
# Documentation review stage
Whenever an issue reaches the implementation or acceptance phase, run this agent to perform the following:

1. **Inspect `docs/`** – look for changes or additions since the last review (compare timestamps or git commits if necessary). Focus on:
   - ADRs that introduce new decisions impacting the project
   - Security guidance (secrets handling, compliance notes)
   - Operational/runbook material (cloud resources, configuration steps)
   - Any documents that mention new cloud secrets, keys, or other managed credentials.
2. **Evaluate relevance** – determine which documents touch the current issue or the broader project (e.g. new secrets for the MCP server).
3. **Propagate to `tmp/workflows/`** – update the appropriate temporary workflow files (`security-plan.md`, `requirements.md`, `acceptance.md`, etc.) with summaries or actions derived from the docs change. If concrete tasks are required, add them to `tmp/workflows/plan.md` or note them in the issue’s acceptance criteria.
4. **Record changes** – leave comments/notes in the agent output describing what was updated and why, so reviewers can verify and, if necessary, convert the temporary notes into permanent docs or ADRs.
5. **Remind about secrets** – if new secrets are referenced, ensure their creation/use is documented following the project’s secrets policy (e.g. add a note to `security-plan.md` and link to the new cloud secret name).

This agent helps maintain parity between long‑term documentation and the ephemeral workflow records during issue execution. It runs automatically after implementation and before acceptance, but humans may invoke it any time additional doc updates arrive.
