---
name: "UWF Core Workflow Rules"
description: "Stage gates, artifact expectations, and workflow discipline."
applyTo: "**"
---
## Mode
The `mode` represents the parent worrkflow. It helps agents understand who is the persona running the workflow. 

Before invoking a subagent or starting a phase, use `runSubagent` with `uwf-core-project-tracking` to update any workflow state and return the `mode` (or what is currently being worked on: project, issues, artifact, digital media, etc).

## Artifact Locations
| Artifact | Path |
|---|---|
| Workflow templates (read-only) | `docs/workflow/*.md` |
| Workflow generated artifacts (read/write) | `./tmp/workflow-artifacts/` |

##  Questions & Querying the User
All questions and queries must be done by the Orchestrator agent. Subagents should never ask questions directly to the user. If a subagent needs clarification or input, it should return a structured request to the orchestrator, which will then handle the user interaction, using the `askQuestion` tool offered by vscode and pass the response back to the subagent. This ensures a consistent user experience and prevents multiple agents from asking questions simultaneously, which could lead to confusion

## Tracing and Debugging
- Orchestrator must output tell the user it's current action and what is about to do at each step, especially when invoking subagents. This provides visibility into the workflow's progress and helps with debugging.  DO NOT STOP FOR USER FEEDBACK OR REQUEST PERMISSION TO PROCEED.

## Gates

ALways update the current context using the `uwf-core-project-tracking` agent before starting any new phase or invoking any subagent. This ensures the workflow state is accurate and up-to-date for all agents to reference.