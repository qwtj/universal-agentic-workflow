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
---
# Project Tracking Agent Responsibilities
This agent is responsible for tracking the overall project progress and ensuring that the correct stage sequence is followed based on the operating mode (Project vs Issue). It should coordinate with other agents to manage the workflow effectively.  Manage workflow state transitions, track active issues, and ensure that all necessary artifacts are produced at each stage of the project lifecycle using the `uwf-state-manager` skill and `uwf-local-tracking` skill as needed.

## Prerequisites
Invoke `uwf-local-tracking` for backlog triage and grooming support before finalizing issue intake. Use the skill output to:
- identify duplicate or existing backlog entries
- create ungroomed backlog stubs when a request is not represented
- generate sprint placement and ordering recommendations
- record all automated recommendations in the intake report

## Issue Management
Invoke the `uwf-local-tracking` skill for all issue-management procedures. This agent should not implement  issue-management logic.




