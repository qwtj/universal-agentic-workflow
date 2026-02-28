---
title: ADR-0002 — Input validation library for Express
date: 2026-02-28
status: proposed
---

Context
-------
The codebase is a JavaScript Express app with minimal routes. Input validation is required to reduce injection and malformed-payload risks.

Decision
--------
Use `express-validator` as the primary validation library and middleware for the following reasons:

- Lightweight and purpose-built for Express middleware patterns.
- Declarative validation rules near route definitions; integrates with existing Express request lifecycle.
- No immediate need for schema-first or TypeScript-first tools (e.g., `zod`) given current JS codebase.

Rationale
---------
- `express-validator` provides express-focused middleware, minimal dependencies, and easy migration for small to medium APIs.
- `Joi` was considered; it's powerful but introduces a larger API surface and patterns that may duplicate middleware concerns.
- `zod` is excellent for TypeScript-first projects; migrating to TypeScript later can prompt reevaluation.

Consequences
------------
- Add `express-validator` to `package.json` and implement middleware for endpoints.
- Tests must include validation unit tests and integration checks to prevent regressions.

Implementation
--------------
1. Dependabot will update `express-validator` as needed per ADR-0001.
2. Add `npm install --save express-validator` and implement a simple validator for any POST/PUT endpoints.
3. Add unit tests to `tests/` verifying accepted and rejected payloads.

## Implementation Reference
- Validation middleware implemented in `validators/validatePayload.js`.
- Unit and integration tests: `validators/validatePayload.test.js`, `integration/validation.integration.test.js`.
- See ADR-0004 for implementation details.

Alternatives Considered
-----------------------
- `Joi`: mature schema library, more verbose integration in Express.
- `zod`: excellent for TypeScript but not ideal for plain JS route-driven middleware today.

Status & Rollout
----------------
Add the package and one canonical middleware pattern as a starter PR; iterate as endpoints are added.
