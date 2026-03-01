---
description: Used to perform issue intake for an active issue after opening a new chat session.
agent: uwf-issues-intake
model: GPT-5.3-Codex (copilot)
---
- `runSubagent` with`uwf-project-tracking` skill to identify/manage the current active issue using the canonical state procedure — including scanning the backlog for duplicates or related items, advising on sprint placement and ordering, and logging any automated recommendationg.
- Proceed with `Issue Workflow`