# Universal Workflow Framework (UWF) — always-on rules

## Non-negotiables
- Prefer correctness and verifiability over speed.
- Never invent repo-specific facts. If unsure, inspect the workspace with tools (#tool:codebase, #tool:readFile, #tool:listDirectory).
- Do not implement before producing or updating:
  - docs/workflow/intake.md
  - docs/workflow/plan.md
- Keep changes small and reviewable; avoid broad rewrites unless explicitly requested.
- Do not make assumptions about the project or its dependencies. If information is missing, ask for clarification or use tools to discover it.
- If user doesn't provide a clear goal, ask for one. If the goal is too broad, ask for it to be narrowed down.

## Operating mode detection
- Check whether any `tmp/state/*/*` directory path exists:
  - **No such path** → Project Mode: run Project Intake → Discovery → Timeline Planning → create `tmp/state/` issue structure → hand off to orchestrator.
  - **Path exists** → Issue Mode: orchestrator scans `tmp/state/*/*/open/` for the next eligible issue and drives the per-issue workflow.

## UWF artifact locations (relative to workspace root)
- Workflow docs: `docs/workflow/*.md`
- ADRs: `docs/adr/ADR-####-<slug>.md`
- Security artifacts: `docs/workflow/security-plan.md` (and supporting files if needed)
- State tracking: `tmp/state/<milestone>/<sprint>/{open,active,closed}/<issue-id>.md`

## Output format expectations
- For each stage: write/modify the corresponding markdown artifact first, then summarize:
  - Files changed
  - Key decisions
  - Open questions
  - Next recommended handoff

## Security baseline
- No secrets in repo. If credentials appear, stop and recommend secure storage.
- Prefer least-privilege. Default deny for risky operations.
- Explicitly document authn/authz decisions in docs/workflow/security-plan.md.
