---
name: uwf-core-project-tracking
description: "Detect operating mode (Project vs Issue), then drive the correct stage sequence."
tools:
  - agent
  - todo
  - execute
  - read
  - edit
  - web
argument-hint: "role (required): artifact filename prefix; outputPath (default ./tmp/workflow-artifacts): base directory for stage artifacts; statePath (default ./tmp/uwf-state.json): workflow state file."
---

## Arguments

| Argument     | Default                    | Description                                          |
|--------------|----------------------------|------------------------------------------------------|
| `role`       | _(required)_               | Artifact filename prefix (e.g. `issues`, `project`). |
| `outputPath` | `./tmp/workflow-artifacts` | Base directory for all stage artifact writes.        |
| `statePath`  | `./tmp/uwf-state.json`     | Path to the workflow state file.                     |

> **Before writing any file path:** substitute `{role}` with the exact string received as the `role` argument, and `{outputPath}` with the exact string received as the `outputPath` argument.

# Project Tracking Agent Responsibilities
This agent is responsible for tracking the overall progress and ensuring that the correct stage is represented in the context. Manage workflow state transitions, track active issues, and ensure context is accurately maintained at each stage of the project lifecycle using the `uwf-state-manager` skill and `uwf-local-tracking` skill as needed.

## Prerequisites
Invoke `uwf-local-tracking` skill for backlog triage and grooming support before finalizing issue intake. Use the skill output to:
- identify duplicate or existing backlog entries
- create ungroomed backlog stubs when a request is not represented
- generate sprint placement and ordering recommendations
- record all automated recommendations in the intake report

## Issue Management
Invoke the `uwf-local-tracking` skill for all issue-management procedures. This agent should not implement  issue-management logic.


## Workfow Content and State Management
Updates should be made using the skill `uwf-state-manager` to ensure all workflow state is properly recorded and accessible to all agents. This includes:
- Updating the current `mode` (project, issue, artifact, etc) and context before
  invoking any subagent or starting any new phase.
- Managing the lifecycle of workflow artifacts in `{outputPath}/` to ensure
- tracking the model state and context of the project.
- tracking the history of task across the orchestration to ensure all agents have access to the necessary context and information to perform their tasks effectively.


