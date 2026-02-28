# Intake

## Goal
- Define and run a UWF workflow to design, build, test, and accept a hardened Node.js MCP server suitable for production use.

## Non-goals
- Building unrelated product features beyond the MCP server core and required security controls.
- Selecting a cloud provider or deploying infrastructure in this stage.
- Committing to a specific transport/runtime before Discovery confirms constraints.

## Constraints
- Use UWF stage gates and required artifacts under `docs/workflow/`.
- Prefer TypeScript and explicit input validation for all tool and resource handlers.
- Enforce least privilege, secure defaults, and no secrets in source control.
- Keep scope reviewable with incremental milestones and verifiable outputs.
- Date context: 2026-02-26.

## Success metrics
- `docs/workflow/plan.md` contains implementation, test, rollout, rollback, and verification checklists for a hardened MCP server.
- `docs/workflow/security-plan.md` documents authn/authz model, threat assumptions, control mapping, and residual risks.
- A reference server implementation passes automated checks (for example `npm test` exits `0`, lint exits `0`, and dependency audit threshold is met).
- Acceptance criteria in `docs/workflow/acceptance.md` confirm hardening controls and known limitations.

## Stakeholders
- Requesting developer/operator (primary).
- Security reviewer or platform security owner.
- Backend maintainer responsible for Node.js service lifecycle.

## Target environment
- Local development on macOS.
- Production-like Linux container/runtime target (to be finalized in Discovery/Plan).
- CI pipeline with security and quality gates (to be defined in Plan).

## Risk tolerance
- Low tolerance for security regressions, credential leakage, and unauthorized tool execution.
- Moderate tolerance for delivery timeline changes if needed to meet hardening and verification standards.
