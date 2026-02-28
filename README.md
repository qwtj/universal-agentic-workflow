# UWF (Universal Workflow Framework) for GitHub Copilot in VS Code

This folder is intentionally self-contained under `./tmp` so it can be opened as a workspace without mixing with any existing repo files.

## How to use (recommended)
1. Open **this `tmp/` folder** as your VS Code workspace root.
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
- Workflow artifact templates: `docs/workflow/*.md`, `docs/adr/*.md`
- State tracking: `tmp/state/backlog.md`, `tmp/state/active/`, `tmp/state/complete/`, `tmp/state/skipped/`

## Two operating modes

UWF auto-detects its mode from `tmp/state/backlog.md`:

### Project Mode (first run — backlog absent)
Runs once per new project objective:
1. **Intake** (`uwf-intake`) — goal + work-breakdown strategy
2. **Discovery** (`uwf-discovery`) — inspect workspace, update intake
3. **Timeline Planning** (`uwf-timeline-planner`) — roadmap (`docs/workflow/plan.md`) + backlog (`tmp/state/backlog.md`)
4. Orchestrator switches automatically to Issue Mode

### Issue Mode (subsequent runs — backlog present)
Orchestrator picks each `open` item and drives the per-issue cycle:
1. **Issue Intake** (`uwf-intake`) — scope item, reset workflow docs
2. **Issue Discovery** (`uwf-discovery`) — focus on relevant areas
3. **Work Planning** (`uwf-work-planner`) — implementation steps, tests, rollout/rollback
4. **Implementation** → **Review** → **Acceptance**
5. Move `tmp/state/active/<id>.md` → `tmp/state/complete/<id>.md`, loop

## Notes
- Hooks are **Preview** in VS Code (see VS Code docs). Your org may disable them.
- The hook script blocks obvious destructive commands and requires confirmation for edits in sensitive paths.
- `tmp/state/backlog.md` is the mode toggle: absent = Project Mode, present = Issue Mode.
