---
name: uwf-doc-review
description: "In issue mode, scan canonical docs/ files and propagate any relevant changes into tmp/workflow-artifacts for the current issue or project state. Useful when post‑implementation artifacts (new secrets, ADRs, design notes) appear in docs and need reflection in the active issue’s documentation."
tools: ["todos", "codebase", "readFile", "search", "createFile", "editFiles"]
handoffs:
  - label: "Issue Mode — Stage 7: Acceptance"
    agent: uwf-acceptance
    prompt: "Run the acceptance gate checklist and produce tmp/workflow-artifacts/acceptance.md."
    send: false
  - label: "Issue Mode - Stage 4: Work Planning (skip security+test)"
    agent: uwf-work-planner
    prompt: "Produce tmp/workflow-artifacts/plan.md with test steps ordered before implementation steps. Note: security and test planning were skipped — document the reason in the plan."
    send: false
  - label: "Issue Mode - Stage 3: Create Test Plan"
    agent: uwf-test-planner
    prompt: "Produce tmp/workflow-artifacts/test-plan.md for this issue. ADRs and security plan are complete and available as input."
    send: false
  - label: "Issue Mode - Create Security Plan"
    agent: uwf-security-plan
    prompt: "Produce tmp/workflow-artifacts/security-plan.md for this issue. ADRs are complete and available as input."
    send: false
---
Documentation created from here should be stored or updated in `docs`.  The primary goal of this agent is to ensure that any new information is captured in the living documentation.

# Documentation review stage
Whenever an issue reaches the implementation or acceptance phase, run this agent to perform the following:

1. **Inspect `tmp`** – look for changes or additions, that effect `docs`, since the last review (compare timestamps or git commits if necessary). Focus on:
   - ADRs that introduce new decisions impacting the project
   - Security guidance (secrets handling, compliance notes)
   - Operational/runbook material (cloud resources, configuration steps)
   - Any documents that mention new cloud secrets, keys, or other managed credentials.
2. **Evaluate relevance** – determine which documents touch the current issue or the broader project (e.g. new secrets for the MCP server).
3. **Propagate to `docs/`** – update or create markdown files in `docs/` that reflect the new long term information. For example:
   - If a new ADR defines a secret management approach, update `docs/security/secrets.md` with a summary and link to the ADR.
   - If the security plan mentions new controls, ensure they are documented in `docs/security/controls.md`.
   - If operational steps are added, update `docs/runbooks/` with the relevant procedures.
4. **Record changes** – leave comments/notes in the agent output describing what was updated and why, so reviewers can verify and, if necessary, convert the temporary notes into permanent docs or ADRs.
5. **Remind about secrets** – if new secrets are referenced, ensure their creation/use is documented following the project’s secrets policy (e.g. add a note to `security-plan.md` and link to the new cloud secret name).

This agent helps maintain parity between long‑term documentation and the ephemeral workflow records during issue execution. It runs automatically after implementation and before acceptance, but humans may invoke it any time additional doc updates arrive.

## Areas of Improvement and new Found Requirements
As you perform the review or if review is complete, immediately turn any uncovered gaps, missing tests, or new requirements into backlog tickets.

Invoke the uwf-review-to-issues skill for every item you discover – don’t merely document them.

Examples:

An ADR mentions a new secret but there’s no runbook or documentation; open an issue to add the how‑to to the security plan/operational docs.
The security plan refers to a control that isn’t yet listed; file an issue to document that control with implementation notes.
Acceptance criteria call for performance targets that aren’t covered; create an issue to add a performance‑testing section to the test plan or security plan.
If the review surfaces suggestions outside the current issue’s scope (e.g. a new ADR that isn’t directly related), still create an issue in the backlog so it can be tracked later.