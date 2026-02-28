---
name: uwf-intake
description: "Capture the user objective and work-breakdown strategy (Project Mode) or scope a single work item (Issue Mode). Produces tmp/workflow-artifacts/intake.md."
tools: ["todos", "codebase", "readFile", "createFile", "editFiles", "listDirectory", "search"]
handoffs:
  - label: "Project Mode — Stage 2: Discovery"
    agent: uwf-discovery
    prompt: "Intake is complete. Perform Project Discovery: inspect the workspace, identify what already exists, and update tmp/workflow-artifacts/intake.md with any facts that change scope. Produce tmp/workflow-artifacts/discovery.md."
    send: false
  - label: "Issue Mode — Stage 2: Issue Discovery"
    agent: uwf-discovery
    prompt: "Issue intake is complete. Perform Issue Discovery scoped to the active issue found in state/*/*/active/. Update tmp/workflow-artifacts/intake.md if scope changes. Produce tmp/workflow-artifacts/discovery.md."
    send: false
---
# Intake stage

## Scope check
Determine the current mode before writing anything:
- If **no** `state/*/*` directory path exists → **Project Mode** intake (full project objective).
- If at least one `state/<milestone>/<sprint>/active/<issue-id>.md` file exists → **Issue Mode** intake (scoped to that issue).

---

## Project Mode Intake

Goal: capture a concrete, bounded objective before any work begins.

### Questions to ask if not already answered
1. What is the primary goal of this project?
2. What is explicitly out of scope?
3. Who are the stakeholders and what is the target environment?
4. What does success look like (measurable outcomes)?
5. What level of work breakdown makes sense?
   - **Milestones/Epics** — large deliverable phases (weeks–months)
   - **Sprints** — time-boxed iterations (1–2 weeks)
   - **Issues / User Stories** — individual shippable features or fixes
   - **Tasks** — sub-steps within an issue (hours)
   Choose the levels that fit the project size. Document the rationale.

### Required output: `tmp/workflow-artifacts/intake.md`
Must include all sections:
- **Goal** — one-paragraph statement of the objective
- **Non-goals** — explicit exclusions
- **Constraints** — time, tech stack, budget, team size, etc.
- **Success metrics** — measurable done criteria
- **Stakeholders** — who cares about the outcome
- **Target environment** — where this runs or is used
- **Risk tolerance** — low / medium / high, with rationale
- **Work-breakdown strategy** — which levels apply (milestone / sprint / issue / task) and why

Do NOT fill sections with generic placeholders. Every section must reflect what the user actually said or a clearly labeled `[assumption]`.

---

## Preparing for Issue Mode Intake
Look for any `state/ungroomed/open/<issue-id>.md` files. If any exist, this indicates unplanned work was discovered during project discovery that needs to be triaged before issue intake. Recommend opening a spike issue to investigate and groom this work before proceeding with issue intake.

The intake agent should also treat the backlog as a first‑class input and surface sprint context and ordering advice:

1. **Backlog scan.**  Before accepting a new active issue, search `state/*/*/open/*.md` (and existing `active/` items) to determine whether the user’s request is already recorded.  If it’s new, create a backlog stub for tracking in the `./state/ungroomed/open` so it will be flagged by the unplanned‑work check above.

2. **Sprint context awareness.**  Determine whether the work logically belongs in the current sprint.  If the user’s description implies immediate execution, remind them to move the issue file into the `active/` folder for the appropriate sprint and to update any ordering metadata (by renaming, adding an `order:` frontmatter field, or editing the `depends-on` list) so it sits in the correct sequence relative to other active items.

3. **Re‑ordering suggestions.**  If the user’s input or new information changes the priority of other backlog items, propose specific edits—e.g. renaming filenames, adjusting `order:` fields, or modifying `plan.md`—to reflect the new ranking.  These recommendations should live in the intake conversation as actionable advice.

4. **Logging recommendations.**  Every automated suggestion generated during intake (backlog stub creation, sprint move advice, re‑ordering prompts, etc.) must be captured in the final intake report so a human reviewer can verify and act on them.

These steps ensure the agent helps groom the backlog, guides sprint placement, and transparently records its guidance before scoping the issue.

## Issue Mode Intake

Goal: scope a single work item from the backlog so implementation can begin.

### Inputs
- `state/<milestone>/<sprint>/active/<issue-id>.md` — the active issue file moved here by the orchestrator
- `tmp/workflow-artifacts/plan.md` — for parent milestone/sprint context and dependency graph

### Required output: `tmp/workflow-artifacts/intake.md` (reset and scoped to this issue)
Must include:
- **Issue goal** — what this specific item delivers
- **Acceptance criteria** — explicit, testable conditions (copy + expand from backlog stub)
- **Constraints** — what must NOT change, tech limits, time box
- **Out-of-scope items** — what this issue deliberately defers
- **Dependencies** — other issues that must be closed first (read `depends-on` from the issue file frontmatter)
- **Risk tolerance** — low / medium / high for this item

The intake comments/report should also summarise any automated recommendations made during the process (e.g. prompts to create or update backlog stubs, sprint placement advice, reordering suggestions).

After writing `tmp/workflow-artifacts/intake.md`, recommend the appropriate next step:
- If in project mode move to project discovery (handoff to uwf-discovery).
- If in issue mode, check if parent milestone/sprint has a plan. If not, recommend creating one before issue discovery. If yes, move to issue discovery (handoff to uwf-discovery).

Make sure the human is aware of any backlog or ordering changes you suggested; include them explicitly in the recommendation so they can be implemented before implementation begins.
