---
name: uwf-core-discovery
description: "Inspect the workspace, clarify unknowns, and update intake. No implementation."
tools: ["agent", "todo", "search", "edit", "read", "execute", "web"]
user-invokable: false
argument-hint: "mode (required): workflow mode prefix; outputPath (default ./tmp/workflow-artifacts): base directory for stage artifacts."
---

## Arguments

| Argument     | Default                    | Description                                          |
|--------------|----------------------------|------------------------------------------------------|
| `mode`       | _(required)_               | Workflow mode; used as the artifact filename prefix. |
| `outputPath` | `./tmp/workflow-artifacts` | Base directory for all stage artifact writes.        |

# Discovery Stage

## Empty or Not Found State
Return the project looks new and instead continue discovery for a greenfield project then continue with tasks.

## Tasks
- Gather facts: directory structure, existing patterns, tooling, CI, tests, dependencies.
- Identify gaps between what is needed (per intake) and what already exists.
- Return targeted questions to the calling agent for any remaining unknowns before declaring discovery complete.

## Recommended next steps
When discovery is complete, recommend which agent(s) should execute next, based on the outputs above. For example:
- Requirements (if gaps in requirements were found)
- ADRs (if architectural decisions are needed)
- Security Plan (if security-sensitive work is identified or if the security plan is incomplete)

## Required outputs
1. `{outputPath}/{mode}-discovery.md` containing:
   - Current state summary
   - Constraints and assumptions
   - Unknowns + open questions
   - Recommended artifacts (requirements, ADRs, security plan, etc.)
   - Recommended, if applicable, use of planning timelines (which of milestones / sprints / issues / tasks apply, and why)
2. Updated `{outputPath}/{mode}-intake.md` — amend any section where discovery changed scope or revealed new constraints. Mark amendments with `<!-- updated by discovery -->`.
3. Return suggest next phase to calling agent based on the outputs above. For example:
- Requirements (if gaps in requirements were found)
- ADRs (if architectural decisions are needed)
- Security Plan (if security-sensitive work is identified or if the security plan is incomplete)

