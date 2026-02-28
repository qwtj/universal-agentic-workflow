---
name: "UWF Core Workflow Rules"
description: "Stage gates, artifact expectations, and workflow discipline."
applyTo: "**"
---
# UWF Stage Gates (enforced socially + via hooks where possible)

## Gate: Intake
Must produce: docs/workflow/intake.md
Must include: goal, non-goals, constraints, success metrics, stakeholders, target environment, risk tolerance.

## Gate: Plan
Must produce: docs/workflow/plan.md
Must include: steps, milestones, test strategy, rollout strategy, rollback strategy, verification checklist.

## Gate: Implementation
Only begin after plan exists.
All code/infra changes must trace back to a requirement or ADR.

## Gate: Acceptance
Must produce: docs/workflow/acceptance.md
Must include: final checks, known issues, and follow-up backlog.
