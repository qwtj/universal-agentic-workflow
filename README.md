# UWF (Universal Workflow Framework) for GitHub Copilot in VS Code

This folder is intentionally self-contained under `./tmp` so it can be opened as a workspace without mixing with any existing repo files.

## How to use (recommended)
1. add contents of this repo in your VS Code workspace root.
2. Open Copilot Chat and run: `/uwf-run`
3. Follow the handoff buttons between stage agents.

## What’s included
- Custom instructions: `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md`
- Prompt files (slash commands): `.github/prompts/*.prompt.md`
- Custom agents + handoffs: `.github/agents/*.agent.md`
  - `uwf-orchestrator` — mode detection + stage sequencing
  - `uwf-intake` — project or issue intake
  - `uwf-discovery` — workspace inspection
  - `uwf-timeline-planner` — **Project Mode**: roadmap + backlog
  - `uwf-work-planner` — **Issue Mode**: implementation plan per issue
  - `uwf-implementer`, `uwf-reviewer`, `uwf-acceptance`, and others
- Skills: `.github/skills/*/SKILL.md`
- Hooks (Preview): `.github/hooks/*.json` + `scripts/hooks/preToolUse.mjs`
- Workflow artifact templates (do not edit in-place): `docs/workflow/*.md`, `docs/adr/*.md`
- Active workflow artifacts (editable after intake): `tmp/workflow-artifacts/*.md`
- State tracking: `state/<milestone>/<sprint>/{open,active,closed}/<issue-id>.md`

## Two operating modes

UWF auto-detects its mode from the issue tree under `state/`:

### Project Mode (first run — no `state/*/*` paths)
Runs once per new project objective:
1. **Intake** (`uwf-intake`) — goal + work-breakdown strategy
2. **Discovery** (`uwf-discovery`) — inspect workspace, update intake
3. **Timeline Planning** (`uwf-timeline-planner`) — roadmap (`tmp/workflow-artifacts/plan.md`) + issue tree (`state/<milestone>/<sprint>/{open,active,closed}/`)
4. Orchestrator switches automatically to Issue Mode

### Issue Mode (subsequent runs — `state/*/*` exists)
Orchestrator picks each `open` item and drives the per-issue cycle:
1. **Issue Intake** (`uwf-intake`) — scope item, reset workflow docs
2. **Issue Discovery** (`uwf-discovery`) — focus on relevant areas
3. **Work Planning** (`uwf-work-planner`) — implementation steps, tests, rollout/rollback
4. **Implementation** → **Review** → **Acceptance**
5. Acceptance stage should move `state/<M>/<S>/active/<id>.md` → `state/<M>/<S>/closed/<id>.md`; the orchestrator simply loops afterwards.

## Notes
- Hooks are **Preview** in VS Code (see VS Code docs). Your org may disable them.
- The hook script blocks obvious destructive commands and requires confirmation for edits in sensitive paths.
- `docs/workflow/` contains example templates and should remain intact.
- After intake begins, edit and reference workflow artifacts from `tmp/workflow-artifacts/`.
