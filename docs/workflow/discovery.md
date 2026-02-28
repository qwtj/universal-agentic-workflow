# Discovery

## Current state summary
- Workspace is a UWF scaffold with stage docs, prompts, custom agents, hooks, and skills; no Node.js MCP server implementation exists yet.
- Existing workflow artifacts are present but mostly template-level: `docs/workflow/plan.md`, `docs/workflow/requirements.md`, and `docs/workflow/security-plan.md` are not yet populated with project-specific content.
- Intake is defined for this initiative and sets a security-first objective for a hardened Node.js MCP server.
- Repository currently has no application source directories (for example `src/`, `server/`, `apps/api/`) and no runtime/tooling manifests detected (`package.json`, `tsconfig`, lint/test configs, CI workflows).
- Governance and process assets are available:
	- UWF stage-gate rules in `.github/instructions/uwf-core.instructions.md`.
	- Backend hardening guidance in `.github/instructions/backend.instructions.md` and `.github/instructions/node-backend.instructions.md`.
	- Hook policy in `scripts/hooks/preToolUse.mjs` plus `.github/hooks/00-uwf-security.json` (blocks obvious destructive terminal actions and asks confirmation on sensitive path edits).
	- Reusable hardening skill in `.github/skills/backend-node-mcp-hardening/SKILL.md`.

## Constraints and assumptions
- Constraints from intake and UWF rules:
	- Must follow stage gates and document-first workflow under `docs/workflow/`.
	- No implementation should start until `docs/workflow/plan.md` is produced.
	- Security posture is least privilege, secure defaults, and no secrets in repo.
	- Preference for TypeScript, strict input validation, centralized error handling, and explicit authn/authz.
	- Risk tolerance is low for security regressions and unauthorized tool execution.
- Assumptions (to validate in Requirements/ADR):
	- MCP server will target at least local macOS development and Linux production runtime.
	- A CI pipeline will be introduced for lint/test/security gates.
	- Hardening controls include deny-by-default tool policy, schema validation, rate limits/timeouts, audit logging, and dependency scanning.

## Unknowns + questions
- Protocol and transport decisions:
	- Should first release support `stdio`, HTTP/SSE, or both?
	- Is multi-tenant use required or single-tenant/operator use only?
- Security architecture:
	- Required authentication mechanism (API tokens, mTLS, OIDC, or internal identity)?
	- Required authorization granularity (per-tool, per-resource, per-tenant)?
	- Compliance baseline and evidence expectations (internal only, SOC 2, ISO 27001, etc.)?
- Runtime and operations:
	- Target Node.js LTS version and package manager standard (`npm`, `pnpm`, or `yarn`)?
	- Deployment target (container platform, VM, Kubernetes, managed service)?
	- Required SLOs/SLIs for availability and latency?
- Scope and product behavior:
	- Initial tool catalog and privilege boundaries?
	- Required data retention period and log/audit retention policy?
	- Incident response expectations (kill switch, break-glass, rollback time objective)?

## Recommended artifacts
- Requirements (`docs/workflow/requirements.md`)
	- Define MVP scope for hardened MCP server, explicit non-goals, and prioritized functional requirements.
	- Specify NFR targets: security controls, reliability/SLOs, performance budgets, operability, and cost guardrails.
	- Include acceptance criteria mapped to testable signals and stage-gate exit criteria.
- ADRs (`docs/adr/`)
	- `ADR-0001-mcp-transport-and-session-model.md` (transport/channel and session lifecycle).
	- `ADR-0002-authn-authz-policy-model.md` (identity, roles, policy engine, deny-by-default model).
	- `ADR-0003-tool-execution-sandbox-and-resource-guards.md` (timeouts, concurrency limits, isolation boundaries).
	- `ADR-0004-observability-and-audit-logging-strategy.md` (structured logs, redaction, audit events, retention).
	- Use the `uwf-adr-300` skill when decisions materially impact security, operations, or compliance.
- Security plan (`docs/workflow/security-plan.md`)
	- Produce threat model summary, trust boundaries, attack paths, and mitigations.
	- Document authn/authz architecture, secret handling, dependency/supply-chain controls, and verification checklist.
	- Use the `uwf-threat-model` skill to structure threat coverage and mitigation traceability.

