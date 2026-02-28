# ADR-0005: Audit Log Storage & Pluggable Secret Backend

## Status
Accepted

## Context
The project requires secure handling of runtime secrets and a reliable audit
trail of tool execution events. Earlier ADR-0003 established high-level
principles: environment variables for secrets and no sensitive data in logs. As
we begin implementation, additional details must be decided:

* Where should audit logs be stored?  
* How to make logs tamper-evident?  
* How to design the secret manager to allow future vaults without rewriting
  consumers?  

## Decision
1. **Audit log storage**: store logs in a local file `logs/audit.log` inside the
   repository workspace (ignored by Git). Each entry is JSON with a timestamp,
   event metadata, and a SHA256 checksum of the entry body. The file is opened
   with append-only semantics and a `verifyIntegrity()` helper validates all
   checksums on startup or demand.
2. **Tamper evidence**: the checksum prevents undetected modification. If the
   integrity check fails, the application will log an error and optionally stop.
   Rotating or archiving old logs is considered acceptable; the logger supports
   simple size-based rotation in future updates.
3. **Pluggable secret backend**: implement a `secretManager` module exposing
   `getSecret(key)` and `setBackend(backend)` where `backend` is an object with
   a `get(key)` method. The default backend reads from `process.env`. This
   allows swapping in a Vault, Azure Key Vault, or other provider without
   changing consumer code.
4. **Configuration**: backend selection is controlled via `SECRET_BACKEND`
   environment variable, defaulting to `'env'`. Additional backends must be
   explicitly whitelisted in code review.

## Consequences
* Logs are accessible to processes with filesystem access, which is acceptable
  for the current threat model. A future ADR may revisit remote log storage.
* The checksum approach is lightweight and pure‑JavaScript, avoiding new
  dependencies. It requires reading the entire log during verification, which
  may be slow for very large files; log rotation mitigates this.
* The secret manager API adds a small abstraction layer. Callers must not read
  `process.env` directly; tests will catch violations.
* Developers can write custom backends for testing or deploy to external vaults.

## Alternatives Considered
* Storing audit logs in a database or external service (rejected for scope).
* Using a cryptographic hash chain (each entry includes previous hash) for
  stronger tamper resistance (rejected as overkill for now).
* Hardcoding secret backend; would reduce flexibility and require refactors
  later.

## References
- ADR-0003: Secrets Handling and Logging Approach
- tmp/workflow-artifacts/plan.md
- tmp/workflow-artifacts/security-plan.md
- tmp/lib/auditLogger.js
- tmp/lib/secretManager.js
