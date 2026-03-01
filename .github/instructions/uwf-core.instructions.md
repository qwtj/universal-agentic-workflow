---
name: "UWF Core Workflow Rules"
description: "Stage gates, artifact expectations, and workflow discipline."
applyTo: "**"
---
## Mode
The `mode` represents the current focus or context of the workflow. It helps agents understand what the parent workflow is.

Before invoking a subagent or starting a phase, `runSubagent` with `uwf-core-project-tracking` to update any workflow state and return the `mode` (or what is currently being worked on: project, issues, artifact, digital media, etc).

## Artifact Locations
| Artifact | Path |
|---|---|
| Workflow templates (read-only) | `docs/workflow/*.md` |
| Workflow generated artifacts (read/write) | `./tmp/workflow-artifacts/` |