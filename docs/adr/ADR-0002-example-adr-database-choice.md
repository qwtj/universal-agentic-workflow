# ADR-0002: Example ADR: database choice

Date: 2026-03-04
Status: Proposed

## Context
UWF needs a lightweight embedded data store for workflow state, ADR records, and temporary artifacts. The solution must be easy to bundle with the CLI tools, require no external service, and function offline.

Constraints:
- Single-file storage simplifies backups and workspace portability.
- Must work on macOS, Linux, and Windows without additional dependencies.
- Read/Write performance should handle a few thousand records without perceptible lag.

Current state: some earlier prototypes used JSON files, but they lacked indexing and suffered from concurrency issues when multiple scripts ran simultaneously.

## Decision
- Use SQLite for lightweight embedded storage

## Alternatives considered
1) **Plain JSON files.** Simple and human-readable, but querying requires loading whole documents and concurrent writes lead to corruption.
2) **Embedded key/value store (LevelDB/RocksDB).** Fast and supports transactions, but introduces a native dependency and complexity for cross-platform packaging.
3) **Remote database (PostgreSQL/MySQL).** Robust and scalable but requires network configuration and undermines the offline/workspace-local requirement.

## Consequences
- **Positive**
  - Single file simplifies backups, sharing, and version control.
  - ACID transactions prevent corruption during concurrent operations.
  - Mature ecosystem (`better-sqlite3`, `sqlite3` CLI) with extensive tooling.
- **Negative**
  - Native binary dependencies require build steps, especially for CI/workflows.
  - Limited to a single machine; not a drop-in for multi‑user or distributed setups.
- **Follow-ups**
  - Implement migration scripts for any future schema changes.
  - Bundle WASM version for browser-based tooling (e.g., vscode.dev).

## Security / Privacy / Compliance notes
The database will reside inside the developer's workspace and inherits the filesystem ACLs of that directory. No network exposure is required.

Sensitive data stored is limited to workflow metadata; no secrets or personal information should be persisted. If credentials are ever stored (e.g. for external integrations), they must be encrypted client-side.

## Verification
- Write unit tests for reader/writer wrappers using an in-memory SQLite instance.
- Load tests inserting and querying 10k rows to ensure sub‑100 ms response times.
- Simulate concurrent CLI invocations to validate transaction isolation.

## Appendix A — ADR-300 Checklist
> Add checkbox sections by domain; mark N/A explicitly.
