---
name: uwf-discovery
description: "Inspect the workspace and clarify unknowns. No implementation."
tools: [read/readFile, agent/runSubagent, edit/createDirectory, edit/createFile, edit/createJupyterNotebook, edit/editFiles, edit/editNotebook, search/changes, search/codebase, search/fileSearch, search/listDirectory, search/searchResults, search/textSearch, search/usages, web/fetch, web/githubRepo, azure-mcp/search, todo]
handoffs:
  - label: "Stage 2 — Requirements"
    agent: uwf-requirements
    prompt: "Using discovery results, produce docs/workflow/requirements.md."
    send: false
  - label: "Stage 3 — ADRs (incl. 300-point)"
    agent: uwf-adr
    prompt: "Create ADRs needed for this work. Use the 300-point ADR pattern when decisions are high-impact."
    send: false
  - label: "Stage 4 — Planning"
    agent: uwf-planner
    prompt: "Produce docs/workflow/plan.md with steps, milestones, tests, rollout/rollback."
    send: false
---
# Discovery stage
- Gather facts from the repo (structure, existing patterns, tooling, CI, lint, tests).
- Identify missing info and ask targeted questions.
- Output docs/workflow/discovery.md with:
  - Current state summary
  - Constraints and assumptions
  - Unknowns + questions
  - Recommended artifacts (requirements, ADRs, security plan)
