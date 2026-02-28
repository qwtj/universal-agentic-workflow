# Plan

## Overview
- Build and deliver a hardened Node.js MCP server through controlled phases: architecture decisions, secure implementation, verification, staged rollout, and acceptance.
- This workflow is the execution contract for implementation and must be followed before production use.

## Implementation steps
1. Finalize architecture decisions (ADRs)
	 - Produce ADRs for transport/session model, authn/authz policy, tool execution isolation/limits, and observability/audit strategy.
	 - Exit criteria: ADRs approved by project owner + security reviewer.
2. Scaffold project baseline
	 - Initialize TypeScript Node.js service, strict compiler settings, lint, formatter, and test harness.
	 - Add CI skeleton with lint/test/security jobs.
	 - Exit criteria: baseline CI passes on empty/minimal server.
3. Implement MCP server core
	 - Implement protocol handshake/capabilities, session lifecycle, and tool registry.
	 - Enforce deny-by-default tool invocation policy.
	 - Exit criteria: integration tests prove session + tool discovery/invocation path.
4. Implement security controls
	 - Add authn for non-dev modes and per-tool authz evaluation.
	 - Add strict schema validation for all tool arguments (`additionalProperties: false`).
	 - Add timeout/cancellation/concurrency guards for tool execution.
	 - Exit criteria: negative tests for unauthorized/malformed/abusive requests pass.
5. Implement observability and secure error handling
	 - Add structured logging with correlation IDs and redaction.
	 - Centralize error responses to prevent stack/secret leakage.
	 - Exit criteria: log redaction verification and safe-error tests pass.
6. Supply-chain and runtime hardening
	 - Add lockfile enforcement, dependency audit policy, and patch/update cadence.
	 - Add startup config validation and fail-fast behavior.
	 - Exit criteria: CI security gates pass with defined thresholds.
7. Prepare operations and release readiness
	 - Produce runbooks for deploy, rollback, incident response, and kill switch.
	 - Finalize acceptance checklist and known limitations.
	 - Exit criteria: acceptance review sign-off.

## Milestones
- M1: ADR set approved.
- M2: Baseline repository + CI green.
- M3: MCP core functional with deny-by-default policy.
- M4: Security controls complete with negative test coverage.
- M5: Observability + supply-chain gates passing.
- M6: Acceptance completed and release candidate approved.

## Test strategy
- Unit tests
	- Schema validation allow/deny paths.
	- Authn/authz decision logic per tool.
	- Timeout/cancellation/concurrency guard behavior.
- Integration tests
	- MCP session initialization and capability negotiation.
	- Tool invocation success and policy-denied flows.
- Security tests
	- Malformed input fuzz/smoke set.
	- Unauthorized access attempts.
	- Secret redaction assertions in logs/errors.
- CI gates (required pass)
	- `npm run lint` exits `0`.
	- `npm test` exits `0`.
	- Dependency audit exits `0` under defined threshold policy.
- Success signal
	- All required checks green in CI for main branch candidate.

## Rollout strategy
- Phase 0: Local/dev rollout with synthetic clients and controlled tool set.
- Phase 1: Staging rollout with audit logging enabled and restrictive policy defaults.
- Phase 2: Production canary (small traffic or limited principals) with heightened monitoring.
- Phase 3: Gradual expansion after stable error/latency/security signals.
- Release gate for each phase
	- No unresolved high-severity security findings.
	- Error and timeout rates within defined thresholds.
	- Audit logs present and queryable for key security events.

## Rollback strategy
- Trigger conditions
	- Active exploit, authz bypass risk, severe data leakage, or sustained SLO violation.
- Actions
	- Activate kill switch to disable high-risk tools.
	- Roll back to last known-good artifact/config.
	- Restrict access to minimum trusted principals.
- Recovery verification
	- Confirm denied risky invocations.
	- Confirm service health baseline restored.
	- Document incident summary and corrective actions.

## Verification checklist
- [ ] ADRs approved for transport, authz, execution isolation, and observability.
- [ ] Requirements traced to implementation tasks and tests.
- [ ] All tool interfaces enforce strict schema validation.
- [ ] Authn/authz enforced and validated by negative tests.
- [ ] Timeout, cancellation, and concurrency controls active.
- [ ] Structured logs include correlation IDs and redaction checks pass.
- [ ] Dependency audit and lockfile policy enforced in CI.
- [ ] Rollback/kill-switch runbook validated.
- [ ] `docs/workflow/security-plan.md` completed and reviewed.
- [ ] `docs/workflow/acceptance.md` completed with final checks and known issues.
