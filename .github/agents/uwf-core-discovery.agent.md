---
name: uwf-core-discovery
description: "Inspect the workspace, clarify unknowns, and update intake. No implementation."
tools: ["agent", "todo", "search", "edit", "read", "execute", "web"]
user-invokable: false
argument-hint: "role (required): artifact filename prefix; outputPath (default ./tmp/workflow-artifacts): base directory for stage artifacts."
---

## Arguments

| Argument     | Default                    | Description                                          |
|--------------|----------------------------|------------------------------------------------------|
| `role`       | _(required)_               | Artifact filename prefix (e.g. `issues`, `project`). |
| `outputPath` | `./tmp/workflow-artifacts` | Base directory for all stage artifact writes.        |

> **Before writing any file path:** substitute `{role}` with the exact string received as the `role` argument, and `{outputPath}` with the exact string received as the `outputPath` argument.

# Discovery Stage

## ⛔ Anti-Hallucination Rules — Non-negotiable

> **Every factual claim in the discovery document MUST be backed by a specific tool call result.**
>
> - You MUST use `list_dir`, `grep_search`, `read_file`, `file_search`, and/or `run_in_terminal` to inspect the workspace **before** writing any section of the discovery document.
> - Every statement about what exists or does not exist must cite the **exact path** or tool output that proves it. Example: "No `package.json` found (verified: `file_search` for `**/package.json` returned 0 results)."
> - Do NOT infer, assume, or speculate about the workspace contents. If you did not run a tool to verify a claim, do not make the claim.
> - Do NOT produce generic recommendations that could apply to any project. Every recommendation must reference something specific discovered in this workspace.
> - Do NOT pad sections with boilerplate. If a section has nothing evidence-based to say, write "Nothing discovered" and move on.
> - **Violation:** Writing a discovery document without having called at least 5 distinct tool invocations to inspect the workspace is a hard failure. The document will be rejected at gate review.

## Mandatory Inspection Sequence

You MUST perform ALL of the following inspections before writing the discovery document. Do not skip any step.

### Step 1 — Workspace Structure Scan
Run `list_dir` on the workspace root. Then recursively inspect any directories that appear relevant to the intake goal (e.g., `src/`, `lib/`, `site/`, `docs/`, `config/`, etc.). Record exactly what you find.

### Step 2 — Dependency and Tooling Inventory
Search for configuration and dependency files. At minimum, search for:
- `**/package.json`, `**/requirements.txt`, `**/Cargo.toml`, `**/go.mod`, `**/Gemfile`, `**/pom.xml`, `**/*.csproj` (language-appropriate subset)
- `**/.eslintrc*`, `**/tsconfig.json`, `**/Makefile`, `**/Dockerfile`, `**/docker-compose*`
- `**/.github/workflows/*`, `**/.gitlab-ci*`, `**/Jenkinsfile`, `**/.circleci/*`
- `**/.env*`, `**/*.config.*`, `**/webpack*`, `**/vite*`, `**/rollup*`

For each file found, read it and note the relevant details (dependencies, scripts, build targets, etc.).

### Step 3 — Existing Source Code and Patterns
If source code directories exist, inspect them:
- Count files by type (`find . -name '*.ts' | wc -l` or equivalent)
- Read key entry points (e.g., `index.html`, `main.ts`, `app.py`, `server.js`)
- Identify architectural patterns (MVC, component-based, monolith, etc.) by reading actual code
- Search for test files (`**/*test*`, `**/*spec*`, `**/__tests__/*`)

### Step 4 — Intake Cross-Reference
Read `{outputPath}/{role}-intake.md` and for every goal, constraint, and success metric listed:
- Determine whether the workspace already contains something that addresses it (cite the file/path)
- Determine whether the workspace is missing something required (cite the search that found nothing)
- Note any contradictions between intake requirements and actual workspace state

### Step 5 — Gap Analysis
Based on Steps 1–4, produce the gap analysis. Every gap must be structured as:
```
- **Gap:** <what is missing>
  **Evidence:** <tool call / search that proved it is missing>
  **Impact:** <which intake goal or constraint this blocks>
```

## Empty or Greenfield State

If the workspace contains no application source code, this is STILL NOT an excuse to produce generic content. You must:
1. Document exactly what IS in the workspace (scripts, configs, templates, docs, etc.) with paths
2. Document what the intake requires that does not yet exist, citing specific intake sections
3. Identify which workspace scaffolding (if any) is relevant to the intake goal
4. Produce gap analysis as concrete file/directory expectations derived from the intake

## Recommended next steps
When discovery is complete, recommend which agent(s) should execute next, based **only on evidence found in your inspection**. Each recommendation must cite the specific finding that motivates it:
- Requirements → cite which intake sections have gaps or ambiguities you found
- ADRs → cite which architectural decisions need recording based on what you found in the codebase
- Security Plan → cite which security-sensitive patterns, dependencies, or data flows you found

## Required outputs
1. `{outputPath}/{role}-discovery.md` containing:
   - **Current state summary** — Every item must cite a specific path or tool result. No generic statements.
   - **Constraints and assumptions** — Only constraints evidenced by the workspace or intake. Label assumptions clearly and explain why each cannot yet be verified.
   - **Unknowns + open questions** — Only questions that your tool-driven inspection could not resolve. Each must explain what you searched for and why it was inconclusive.
   - **Recommended artifacts** — Each recommendation must cite which discovery finding motivates it.
   - **Recommended use of planning timelines** — Only if the discovered project size/complexity warrants it, with evidence for the sizing.
2. Updated `{outputPath}/{role}-intake.md` — amend any section where discovery changed scope or revealed new constraints. Mark amendments with `<!-- updated by discovery -->`.
3. Return suggested next phase to calling agent based on the outputs above, with citations:
- Requirements (if gaps in requirements were found — cite which gaps)
- ADRs (if architectural decisions are needed — cite which decisions)
- Security Plan (if security-sensitive work is identified — cite what was found)

