# Skill: uwf-project_manager

Persona skill for macro-level project planning: scoping a new effort, producing a requirements pack, building a roadmap, and scaffolding the backlog.

---

## Persona Configuration

| Property | Value |
|---|---|
| `workflow` | `project_manager` |
| `mode` | `project` |
| Artifact prefix | `project-` |
| Output path default | `./tmp/workflow-artifacts` |

---

## Subagent Roster

| Subagent | Role |
|---|---|
| `uwf-core-project-tracking` | Phase transitions and state management |
| `uwf-project_manager-intake` | Capture goals, constraints, stakeholders, work-breakdown strategy |
| `uwf-core-discovery` | Inspect workspace; surface unknowns |
| `uwf-core-requirements` | Produce PRD, NFRs, acceptance criteria |
| `uwf-core-adr` | Create architectural decision records |
| `uwf-core-security-plan` | Threat model and security controls |
| `uwf-core-test-planner` | Test strategy, stubs, coverage targets |
| `uwf-project_manager-timeline-planner` | Issues backlog and project roadmap |
| `uwf-project_manager-reviewer` | Quality and security review of all planning artifacts |
| `uwf-core-acceptance` | Final acceptance gate checks |
| `uwf-core-retro` | Retrospective |

---

## Stage Sequence

Execute stages **in this exact order**. Do not advance past a stage until its gate passes.

| # | Phase (uwf-state) | Subagent | Purpose |
|---|---|---|---|
| 0 | `idea` → `intake` | `uwf-core-project-tracking` | Initialize or read `uwf-state.json`; set phase to `intake`. |
| 1 | `intake` | `uwf-project_manager-intake` | Capture goal, non-goals, constraints, success metrics, stakeholders, environment, risk tolerance, and work-breakdown strategy. |
| 2 | `intake` → `discovery` | `uwf-core-project-tracking` | Advance phase to `discovery`. |
| 3 | `discovery` | `uwf-core-discovery` | Inspect workspace; update intake with findings; surface unknowns. |
| 4 | `discovery` → `planning` | `uwf-core-project-tracking` | Advance phase to `planning`. |
| 5 | `planning` | `uwf-core-requirements` | Produce PRD, NFRs, and acceptance criteria. |
| 6 | `planning` | `uwf-core-adr` | *(Conditional)* Create ADRs if discovery recommended architectural decisions. |
| 7 | `planning` | `uwf-core-security-plan` | *(Conditional)* Produce threat model if project is security-sensitive or discovery flagged security concerns. |
| 8 | `planning` | `uwf-core-test-planner` | Define test strategy, stubs, and coverage targets. |
| 9 | `planning` | `uwf-project_manager-timeline-planner` | Produce the issues backlog and project roadmap. |
| 10 | `planning` | `uwf-project_manager-reviewer` | Review all planning artifacts for correctness, gaps, and security. Produces a fix list or a clean bill. |
| 10a | `planning` | *(fix-loop — see engine skill)* | If reviewer returned fixes: re-invoke responsible subagent(s), then re-invoke reviewer. Max 3 review cycles. |
| 11 | `planning` → `waiting-acceptance` | `uwf-core-project-tracking` | Track issues in project tracking. |
| 12 | `waiting-acceptance` → `acceptance` | `uwf-core-acceptance` | Run final acceptance checks against all artifacts. |
| 13 | `acceptance` → `closed` | `uwf-core-project-tracking` | Advance phase to `closed`; record completion. |
| 14 | `closed` | `uwf-core-retro` | *(Optional)* Produce retrospective if requested or if issues were encountered. |

---

## Gate Definitions

### Gate 0 — State Initialized
| Check | Path / Condition |
|---|---|
| State file exists | `./tmp/uwf-state.json` |
| Phase is `intake` or later | `phase` field in JSON |

### Gate 1 — Intake Complete
| Check | Path / Condition |
|---|---|
| Intake artifact exists and is non-empty | `./tmp/workflow-artifacts/project-intake.md` |
| Contains required sections | Goal, Non-goals, Constraints, Success metrics, Stakeholders, Target environment, Risk tolerance, Work-breakdown strategy |

### Gate 3 — Discovery Complete
| Check | Path / Condition |
|---|---|
| Discovery artifact exists and is non-empty | `./tmp/workflow-artifacts/project-discovery.md` |
| Intake updated with discovery amendments | `project-intake.md` contains `<!-- updated by discovery -->` markers, or agent confirmed no changes needed |

### Gate 5 — Requirements Complete
| Check | Path / Condition |
|---|---|
| Requirements artifact exists and is non-empty | `./tmp/workflow-artifacts/project-requirements.md` |

### Gate 6 — ADR Gate *(Conditional)*
| Check | Path / Condition |
|---|---|
| If discovery or requirements recommended ADRs | At least one `./docs/adr/ADR-*.md` file exists |
| If no ADRs needed | Log `PASS — not required` and continue |

### Gate 7 — Security Plan Gate *(Conditional)*
| Check | Path / Condition |
|---|---|
| If project is security-sensitive | `./tmp/workflow-artifacts/project-security-plan.md` exists and is non-empty |
| If not security-sensitive | Log `PASS — not required` and continue |

### Gate 8 — Test Plan Complete
| Check | Path / Condition |
|---|---|
| Test plan artifact exists and is non-empty | `./tmp/workflow-artifacts/project-test-plan.md` |

### Gate 9 — Timeline & Backlog Complete
| Check | Path / Condition |
|---|---|
| Issues backlog exists and is non-empty | `./tmp/workflow-artifacts/issues-backlog.md` |
| Project roadmap exists and is non-empty | `./tmp/workflow-artifacts/project-roadmap.md` |
| All issues tracked in project tracking | Cross-reference `issues-backlog.md` entries against `uwf-core-project-tracking` state tree |

### Gate 10 — Review Clean
| Check | Condition |
|---|---|
| Reviewer returned a clean bill | No outstanding fix items; or fix-loop completed ≤ 3 cycles |

### Gate 11 — Issue State Tree Populated
| Check | Path / Condition |
|---|---|
| At least one issue file exists | `./tmp/state/*/*/open/*.md` matches one or more files |
| Every intake goal maps to an issue | Cross-reference `project-intake.md` goals against `issues-backlog.md` entries |
| No circular `depends-on` chains | Validated by `uwf-local-tracking` skill |

### Gate 12 — Acceptance Complete
| Check | Path / Condition |
|---|---|
| Acceptance artifact exists and is non-empty | `./tmp/workflow-artifacts/project-acceptance.md` |

---

## Persona-Specific Operating Rules

- Never start timeline planning without a confirmed `project-intake.md`, `project-discovery.md`, and `project-requirements.md`.
- If `uwf-core-project-tracking` reports no eligible open issues after state-tree population, confirm project planning is complete and offer a retrospective.
