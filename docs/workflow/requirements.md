# Requirements

## Goal / Non-goals
- Goal
	- Deliver an MVP-ready, hardened Node.js MCP server specification that can be implemented with security-first controls and verified through automated and manual checks.
- Non-goals
	- Building non-MCP product features.
	- Finalizing cloud-specific infrastructure in this stage.
	- Supporting every possible transport/protocol in MVP; scope to a defined initial transport profile.

## Functional requirements
1. The system must implement an MCP-compliant server in Node.js (TypeScript preferred) with a defined session lifecycle and capability declaration.
2. The server must expose a tool registration model with deny-by-default execution policy.
3. Each tool must declare a strict input schema; unknown fields must be rejected.
4. The server must enforce authentication for all non-local/non-dev execution modes.
5. The server must enforce authorization checks before each tool invocation (minimum per-tool policy).
6. The server must provide bounded execution controls per invocation: timeout, cancellation support, and concurrency limits.
7. The server must produce structured logs for request start/end, auth decisions, policy denials, and tool execution outcomes.
8. The server must redact secrets and sensitive values from logs and client-visible error payloads.
9. The project must include automated tests for valid/invalid tool inputs, authz allow/deny behavior, and timeout/concurrency guardrails.
10. The project must include dependency vulnerability checks and lockfile-based reproducible installs in CI.
11. The workflow must define and document rollback and kill-switch procedures for compromised tools or policy regressions.
12. The project must produce stage artifacts required by UWF (`plan`, `security-plan`, `acceptance`) before implementation completion.

## Non-functional requirements (NFRs)
- Security
	- Enforce least privilege and secure-by-default behavior.
	- No plaintext secrets in repository, logs, or example configs.
	- Centralized error handling must avoid stack trace leakage to clients.
	- Supply-chain checks must run in CI with fail-on-threshold policy.
- Reliability
	- Service must fail closed on auth/authz or policy engine errors.
	- Tool execution failures must not crash the server process.
	- Startup checks must fail fast when critical configuration is missing.
- Performance
	- Authorization and validation overhead must remain bounded and measurable.
	- Under configured load, the server must respect latency/error thresholds defined in Plan.
	- Timeout enforcement must guarantee runaway tool calls are terminated or isolated.
- Cost
	- Operational controls (logging volume, retention, scan cadence) must include cost-conscious defaults.
	- MVP architecture should avoid mandatory premium infrastructure dependencies.
- Operability
	- Provide health/readiness signals and correlation IDs for traceability.
	- Provide runbooks for startup, rollback, incident response, and key rotation.
	- CI must provide deterministic pass/fail signals for lint, test, and security gates.

## Data requirements
- Data classification
	- Treat tool inputs/outputs and logs as potentially sensitive by default.
- Data handling
	- Minimize persisted data; persist only what is required for operations and audit.
	- Apply redaction to secrets, tokens, and sensitive payload fields before log write.
- Data retention
	- Define retention windows for operational logs and audit logs in `security-plan.md`.
	- Document deletion/rotation mechanism for retained records.
- Data integrity and access
	- Audit records must be tamper-evident or append-only where feasible.
	- Access to logs/audit data must be role-restricted and documented.

## Acceptance criteria
- AC1: Requirements, plan, and security plan exist and are project-specific; each includes verifiable checklists and is approved by project owner.
- AC2: A test suite exists and passes locally/CI; includes positive and negative tests for schema validation, authn/authz enforcement, and policy denial paths.
- AC3: Tool invocations exceeding configured timeout are terminated/aborted and recorded in logs with correlation ID.
- AC4: Unauthorized invocation attempts return controlled errors (no stack traces) and generate auditable denial events.
- AC5: Dependency audit step runs in CI and fails build when vulnerabilities exceed defined policy threshold.
- AC6: Structured logs demonstrate redaction of secrets in at least one automated test or verification script.
- AC7: Rollback and kill-switch procedure is documented and validated via tabletop or test scenario with a clear success signal.

## Risks + mitigations
- Risk: Unclear transport and deployment decisions cause rework.
	- Mitigation: Create ADR for transport/session model before implementation.
- Risk: Over-permissive tool policy leads to unauthorized actions.
	- Mitigation: Enforce deny-by-default policy, per-tool authz, and negative test coverage.
- Risk: Sensitive data leakage via logs or errors.
	- Mitigation: Mandatory redaction middleware, safe error envelopes, and log-content tests.
- Risk: Supply-chain vulnerabilities in Node.js dependencies.
	- Mitigation: Pin dependencies, maintain lockfile, run continuous vulnerability scanning with fail threshold.
- Risk: Operational instability under abuse or high load.
	- Mitigation: Enforce rate limits, concurrency bounds, timeouts, and health/readiness monitoring.
- Risk: Incomplete security evidence for acceptance.
	- Mitigation: Trace each security control to test/verification item in plan and acceptance docs.
