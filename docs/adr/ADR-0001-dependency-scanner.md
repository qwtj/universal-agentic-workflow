---
title: ADR-0001 — Dependency scanning and enforcement
date: 2026-02-28
status: proposed
---

Context
-------
The project must detect and prevent introduction of known-vulnerable dependencies. CI exists (`.github/workflows/ci.yml`) but currently only runs `npm audit --audit-level=high` as a basic enforcement step.

Decision
--------
Adopt a combined approach:

- Use Dependabot (GitHub-native) to keep dependencies updated via automated PRs.
- Keep `npm audit --audit-level=high` in CI to fail builds when high/critical vulnerabilities are present.
- Add an optional integration with a commercial scanner (e.g., Snyk) later if deeper SCA or policy features are required.

Rationale
---------
- Dependabot is built into GitHub, low-friction, and provides automated dependency updates.
- `npm audit` is available in the existing Node toolchain, fast, and sufficient to enforce high/critical findings in CI without extra service dependencies.
- Commercial scanners add value (SCA, license checks, PR remediation suggestions) but introduce cost and onboarding.

Consequences
------------
- CI will fail on high/critical findings; teams must triage and either remediate or accept risk via documented exceptions.
- Dependabot PRs may increase workload; recommend a weekly cadence and an owner for dependency PR triage.

Implementation
--------------
1. Ensure Dependabot is enabled via `.github/dependabot.yml` (configure package-ecosystem: "npm", schedule: "weekly").
2. Keep `npm audit --audit-level=high` in `.github/workflows/ci.yml` (already present). Optionally run `npm audit --json` and parse results for richer reporting.
3. Create a playbook for triage: severity thresholds (block on high+), exemption process, and issue creation policy for transitive findings.

## Implementation Reference
- Dependency scan enforced in CI/CD pipeline: see `.github/workflows/ci.yml`.
- No vulnerabilities present as of last audit.
- See ADR-0003 for secrets and logging approach.

Alternatives Considered
-----------------------
- Snyk: strong SCA and remediation, but commercial and requires onboarding.
- GitHub Advanced Security (GHAS): integrated code & secret scanning but may need paid licensing for full features.

Status & Rollout
----------------
Start with Dependabot + `npm audit` enforcement. Revisit in 1 sprint after observing noise and triage effort; evaluate Snyk/GHAS if needs exceed capabilities.
