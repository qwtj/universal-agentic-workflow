# Universal Workflow Framework (UWF) — always-on rules

## Non-negotiables
- Prefer correctness and verifiability over speed.
- Do not implement before producing or updating:
  - tmp/workflow-artifacts/intake.md
  - tmp/workflow-artifacts/plan.md
- Keep changes small and reviewable; avoid broad rewrites unless explicitly requested.
- Do not make assumptions about the project or its dependencies. If information is missing, ask for clarification or use tools to discover it.
- If user doesn't provide a clear goal, ask for one. If the goal is too broad, ask for it to be narrowed down.
- Keep `docs/workflow/*.md` as example templates. Active edits go in `tmp/workflow-artifacts/*.md`.

## Operating mode detection
- Check whether any `state/*/*` directory path exists:
  - **No such path** → Project Mode: run Project Intake → Discovery → Timeline Planning → create `state/` issue structure → hand off to orchestrator.
  - **Path exists** → Issue Mode: orchestrator scans `state/*/*/open/` for the next eligible issue and drives the per-issue workflow.

## UWF artifact locations (relative to workspace root)
- Workflow templates: `docs/workflow/*.md`
- Active workflow docs: `tmp/workflow-artifacts/*.md`
- ADRs: `docs/adr/ADR-####-<slug>.md`
- Security artifacts: `tmp/workflow-artifacts/security-plan.md` (and supporting files if needed)
- State tracking: `state/<milestone>/<sprint>/{open,active,closed}/<issue-id>.md`

## Output format expectations
- For each stage: write/modify the corresponding markdown artifact first, then summarize:
  - Files changed
  - Key decisions
  - Open questions
  - Next recommended handoff

## Security baseline
- No secrets in repo. If credentials appear, stop and recommend secure storage.
- Prefer least-privilege. Default deny for risky operations.
- Explicitly document authn/authz decisions in tmp/workflow-artifacts/security-plan.md.

## Unplanned Work Discovered 
If unplanned work is discovered during any stage, open a spike issue for it - add ungroomed to title. Do not implement unplanned work.