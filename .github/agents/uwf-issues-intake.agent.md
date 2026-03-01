---
name: uwf-issues-intake
description: "Capture the user objective and work-breakdown strategy (Project Mode) or scope a single work item (Issue Mode). Produces tmp/workflow-artifacts/intake.md."
tools: ["todo", "search/codebase", "read/readFile", "edit/createFile", "edit/editFiles", "search/listDirectory", "search/searchResults"]
---
# Intake Stage

Any issue that has the following minimum information should be considered ready for implementation:
- **Issue goal** — what this specific item delivers
- **Acceptance criteria** — explicit, testable conditions (copy + expand from backlog stub)
- **Constraints** — what must NOT change, tech limits, time box
- **Out-of-scope items** — what this issue deliberately defers
- **Dependencies** — other issues that must be closed first (read `depends-on` from the issue)

Goal: Given a active and groomed issue, produce a scoped intake that captures the above information specific to this work item. This should be written to `tmp/workflow-artifacts/intake.md` for the active issue. If any of the above information is missing, use the tools at your disposal to inspect the workspace and gather the necessary details. Do not make assumptions or fill in gaps with generic placeholders. Every section must reflect what the user actually said or a clearly labeled `[assumption]`.

## Inputs
-  An active and groomed issued, if no issue is given or issue is not active return an error.

## Outputs
The intake comments/report should also summarise any automated recommendations made during the process (e.g. prompts to create or update backlog stubs, sprint placement advice, reordering suggestions).  Write the scoped intake to `tmp/workflow-artifacts/intake.md` for the active issue.
