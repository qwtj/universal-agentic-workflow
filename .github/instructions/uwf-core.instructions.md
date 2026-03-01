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

# Questions & Querying the User
All questions and queries must be done by the Orchestrator agent. Subagents should never ask questions directly to the user. If a subagent needs clarification or input, it should return a structured request to the orchestrator, which will then handle the user interaction, using the `askQuestion` tool offered by vscode and pass the response back to the subagent. This ensures a consistent user experience and prevents multiple agents from asking questions simultaneously, which could lead to confusion