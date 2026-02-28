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
- Skills: `.github/skills/*/SKILL.md`
- Hooks (Preview): `.github/hooks/*.json` + `scripts/hooks/preToolUse.mjs`
- Workflow artifact locations: `docs/workflow/*.md`, `docs/adr/*.md`

## Notes
- Hooks are **Preview** in VS Code (see VS Code docs). Your org may disable them.
- The hook script included here blocks obvious destructive commands and requires confirmation for edits in sensitive paths.
