# Universal Workflow Framework (UWF) — always-on rules

## Non-negotiables
- Prefer correctness and verifiability over speed.
- Keep changes small and reviewable; avoid broad rewrites unless explicitly requested.
- Do not make assumptions about the project or its dependencies. If information is missing, ask for clarification or use tools to discover it.
- If user doesn't provide a clear goal, use the orchestratorask for one, then pass answer back to subagent. If the goal is too broad, ask for it to be narrowed down.
- Keep `docs/workflow/*.md` as read-only example templates. Active edits go in `tmp/workflow-artifacts/*.md`.
- Always state what you are doing before doing it to provide a log, then proceed without waiting for feedback.

## Agent bundles
Agents are defined as `{role}-{job}.agent.md` files grouped into three bundles. Import only the bundles relevant to your use case.

- **core** (`uwf-core-*`) — Generic agents usable by any orchestrator regardless of workflow type. Covers acceptance, ADRs, discovery, requirements, retro, security planning, technical writing, test planning, and state tracking.
- **issues** (`uwf-issues-*`, `uwf-issue-*`) — Agents scoped to driving individual work items from intake through implementation, review, and acceptance.
- **project** (`uwf-project-*`) — Agents for macro-level work: scoping a new effort, building a roadmap, and scaffolding the backlog.

The **issues** and **project** bundles both rely on **core** agents for shared stages (discovery, security, test planning, acceptance, etc.).

## Skills are swappable behaviors
Skills (`uwf-{name}/SKILL.md`) encapsulate discrete behaviors. Agents reference skills by name; swapping a skill changes the behavior without modifying the agent.
- Default tracking behavior: `uwf-local-tracking` (filesystem-based state in `state/...`).
- To use GitHub Issues for tracking: substitute `uwf-github-track`. No agent files change.
- To use a different ADR format: substitute an alternative to `uwf-adr-300`.

## Security baseline
- No secrets in repo. If credentials appear, stop and recommend secure storage.
- Prefer least-privilege. Default deny for risky operations.
- Explicitly document authn/authz decisions in `tmp/workflow-artifacts/security-plan.md`.

## Must always
After completing a phase or stage, end with:
```
Current Stage/Phase: <stage/phase name>
Recommended Next Stage/Phase: <next stage/phase name>
```
If the response is workflow-related but not a formal stage:
```
Last Stage/Phase: <stage/phase name>
Recommended Next Stage/Phase: <next stage/phase name>
```