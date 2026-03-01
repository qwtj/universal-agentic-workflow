---
name: uwf-review-to-issues
description: "Parse a prioritized review table and create ungroomed backlog issues or send them to the user's tracking software."
---
# UWF Review-to-Issues Skill

## When to use
Invoke this skill when you have a tabular list of findings or recommendations (e.g., audit results, security review notes, code review comments) and you want to turn each row into a tracked work item.

Typical input looks like:

```
Priority\tIssue\tRecommendation
🔧 High\tauditLogger.logEvent performs synchronous writes and propagates any fs error. A disk full or permission error in production would crash the process.\tWrap appendFileSync in try/catch and fallback to console.error (or return a boolean). Add a unit test simulating write failure.
🔧 Medium\tNo unit test covers the case where an allowed tool exits with a non‑zero code (other than via timeout).\tAdd a test that mocks spawn to emit exit with a non‑zero code and verify the promise rejects with an error containing the code.
⚠️ Medium\tconfig.loadAllowlist() silently eats errors on startup and leaves _allowlist empty. Operators may not realise the file failed to parse.\tLog a warning via auditLogger or console.warn when the initial load fails. Consider allowing a default‑deny policy.
🤔 Low\ttoolRunner.checkAllowlist does a simple includes(); a malicious entry like ../bin/ls could circumvent if allowlist is manipulated.\tCanonicalise/normalize toolName before comparison or document that allowlist entries must be exact binaries.
✏️ Low\tSynchronous file I/O (fs.*Sync) used throughout; may block high‑traffic processes.\tConsider async variants or off‑loading logging to a worker thread. (Non‑blocking tests may need adjustment.)
✏️ Low\t/run-tool returns 400 for all errors. Distinguish client (400) vs server (500) failures to aid callers.
```

The skill should:

1. Parse each row into a priority, issue description, and recommendation.
2. For each row create an ungroomed issue file under `state/ungroomed/open/` with metadata (e.g. priority) and a descriptive title summarising the issue; include the recommendation in the body.
3. If the user has configured an external tracking system (via prompt or environment), send the items there instead; otherwise operate on the local state directory.
4. Tag or prefix filenames appropriately so the backlog can be triaged later.

## Output
- A set of `state/ungroomed/open/*.md` files (or external tickets) corresponding to the table rows.
- Optionally prompt the user for confirmation or additional context before writing.

## Implementation Notes
- Use a simple CSV/TSV parser that tolerates emojis and multi‑line cells.
- Normalize priority labels to high/medium/low for frontmatter and sort order.
- If invoked with no workspace (e.g. during chat), describe the intended file contents instead of writing them.

```