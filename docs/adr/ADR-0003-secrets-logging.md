# ADR-0003: Secrets Handling and Logging Approach

## Status
Accepted

## Context
To ensure security and compliance, secrets must never be committed to the repository. Logging must avoid exposing sensitive data. This ADR documents the approach for secrets management and logging in the project.

## Decision
- All secrets are stored in environment variables, never in source code or repo.
- `.env` is gitignored and not committed.
- CI/CD secrets are managed via GitHub Actions encrypted secrets.
- Logging must never include sensitive data (PII, credentials, tokens).
- Structured logging is recommended for production; console logging is allowed for development only.

## Consequences
- No secrets are present in any committed file.
- Accidental exposure risk is minimized.
- Developers must use local `.env` files and never share them.
- Audit logs for security events should be written to a secure location (future scope).
- **Note:** specific storage and tamper‑evidence decisions are now captured in [ADR-0005](ADR-0005-audit-log-and-secret-backend.md).

## Alternatives Considered
- Hardcoding secrets (rejected)
- Storing secrets in config files (rejected)

## References
- [tmp/workflow-artifacts/security-plan.md](../../tmp/workflow-artifacts/security-plan.md)
- [ADR-0001-dependency-scanner.md](ADR-0001-dependency-scanner.md)
