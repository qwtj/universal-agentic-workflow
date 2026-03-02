# Skill: uwf-sw_dev

Persona skill for driving individual work items (issues) from intake through implementation, review, and acceptance.

---

## Persona Configuration

| Property | Value |
|---|---|
| `workflow` | `sw_dev` |
| `mode` | `issues` |
| Artifact prefix | `issues-` |
| Output path default | `./tmp/workflow-artifacts` |

---

## Subagent Roster

| Subagent | Role |
|---|---|
| `uwf-core-project-tracking` | Phase transitions, issue queue management, state management |
| `uwf-sw_dev-intake` | Scope a single work item; produce intake doc |
| `uwf-core-discovery` | Inspect codebase; update intake with findings |
| `uwf-core-requirements` | Produce requirements doc from intake and discovery |
| `uwf-core-adr` | Create architectural decision records |
| `uwf-core-security-plan` | Threat model and security controls |
| `uwf-core-test-planner` | Test plan and stubs for all testable behaviour |
| `uwf-sw_dev-work-planner` | Implementation plan with steps and associated tests |
| `uwf-issue-implementer` | Execute the work plan |
| `uwf-sw_dev-reviewer` | Review implementation; produce fix list or clean bill |
| `uwf-core-technical-writer` | Review and update documentation from changed artifacts |
| `uwf-core-acceptance` | Run acceptance gate checklist |
| `uwf-core-retro` | Retrospective |

---

## Stage Sequence

Execute stages **in this exact order** for each active issue. Do not advance past a stage until its gate passes.

| # | Phase (uwf-state) | Subagent | Purpose |
|---|---|---|---|
| 0 | *(queue prep)* | `uwf-core-project-tracking` | Identify the active issue; update workflow context and phase. |
| 1 | `intake` | `uwf-sw_dev-intake` | Scope the active issue; produce `issues-intake.md`. |
| 2 | `intake` → `discovery` | `uwf-core-project-tracking` | Advance phase to `discovery`. |
| 3 | `discovery` | `uwf-core-discovery` | Inspect codebase; update intake with findings; surface unknowns. |
| 4 | `discovery` → `planning` | `uwf-core-project-tracking` | Advance phase to `planning`. |
| 5 | `planning` | `uwf-core-requirements` | Produce requirements doc based on updated intake and discovery. |
| 6 | `planning` | `uwf-core-adr` | *(Conditional)* Create ADRs if discovery or requirements recommended architectural decisions. |
| 7 | `planning` | `uwf-core-security-plan` | *(Conditional)* Produce security plan if the issue is security-sensitive. |
| 8 | `planning` | `uwf-core-test-planner` | Produce test plan and stubs for all testable behaviour. |
| 9 | `planning` → `execution` | `uwf-sw_dev-work-planner` | Produce work plan with implementation steps and associated tests. |
| 10 | `execution` | `uwf-issue-implementer` | Execute the work plan. |
| 11 | `execution` | `uwf-sw_dev-reviewer` | Review implementation; produce fix list or recommend acceptance. *(fix-loop — see engine skill)* |
| 12 | `execution` → `acceptance` | `uwf-core-technical-writer` | Review and update `./tmp/workflow-artifacts/` documentation from new or changed artifacts. |
| 13 | `acceptance` | `uwf-core-acceptance` | Run acceptance gate checklist; produce `issues-acceptance.md`. |
| 14 | `acceptance` → `closed` | `uwf-core-project-tracking` | Execute close/skip transition for the issue. |
| 15 | *(next issue or done)* | `uwf-core-project-tracking` | If queue has more open issues, return to step 0 for the next issue. If queue is empty, offer a retrospective. |

---

## Gate Definitions

### Gate 0 — Issue Context Ready
| Check | Path / Condition |
|---|---|
| Active issue identified | `uwf-core-project-tracking` returned an issue ID |
| State file is readable | `./tmp/uwf-state.json` |

### Gate 1 — Intake Complete
| Check | Path / Condition |
|---|---|
| Intake artifact exists and is non-empty | `./tmp/workflow-artifacts/issues-intake.md` |
| Issue ID referenced in intake | Intake doc contains the active issue ID |

### Gate 3 — Discovery Complete
| Check | Path / Condition |
|---|---|
| Discovery artifact exists and is non-empty | `./tmp/workflow-artifacts/issues-discovery.md` |
| Intake updated or confirmed unchanged | Agent confirmed no intake amendments needed, or `issues-intake.md` updated |

### Gate 5 — Requirements Complete
| Check | Path / Condition |
|---|---|
| Requirements artifact exists and is non-empty | `./tmp/workflow-artifacts/issues-requirements.md` |

### Gate 6 — ADR Gate *(Conditional)*
| Check | Path / Condition |
|---|---|
| If ADRs recommended | At least one `./docs/adr/ADR-*.md` file exists |
| If no ADRs needed | Log `PASS — not required` and continue |

### Gate 7 — Security Plan Gate *(Conditional)*
| Check | Path / Condition |
|---|---|
| If issue is security-sensitive | `./tmp/workflow-artifacts/issues-security-plan.md` exists and is non-empty |
| If not security-sensitive | Log `PASS — not required` and continue |

### Gate 8 — Test Plan Complete
| Check | Path / Condition |
|---|---|
| Test plan artifact exists and is non-empty | `./tmp/workflow-artifacts/issues-test-plan.md` |

### Gate 9 — Work Plan Complete
| Check | Path / Condition |
|---|---|
| Work plan artifact exists and is non-empty | `./tmp/workflow-artifacts/issues-plan.md` |

### Gate 11 — Review Clean
| Check | Condition |
|---|---|
| Reviewer returned a clean bill | No outstanding fix items; or fix-loop completed ≤ 3 cycles |

### Gate 13 — Acceptance Complete
| Check | Path / Condition |
|---|---|
| Acceptance artifact exists and is non-empty | `./tmp/workflow-artifacts/issues-acceptance.md` |

---

## Persona-Specific Operating Rules

- This persona drives **one issue at a time**. Repeat the sequence for each issue in the queue.
- Do not start implementation (step 10) without a confirmed work plan and test plan.
- If `uwf-core-project-tracking` reports no eligible open issues after a close/skip transition, summarize project completion and prompt for a retrospective.
- Ensure all workflow artifacts are scoped to the active issue and maintained in `./tmp/workflow-artifacts/` throughout the issue lifecycle.
