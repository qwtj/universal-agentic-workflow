# CI Security Gates

This document describes the continuous integration security checks introduced by
Issue I-005. The goal is to ensure dependency and static analysis scans run on
every push and pull request, with clear failure thresholds and documentation for
maintainers.

## Workflow Overview

The `.github/workflows/ci.yml` workflow triggers on `push` and
`pull_request` events targeting `main`. It runs on GitHub-hosted runners and
executes the following high-level steps:

1. Checkout repository.
2. Setup Node.js (version 18).
3. Install project dependencies (`npm ci`).
4. Run unit tests (`npm test -- --coverage`).
5. Dependency scan using `npm audit` with level set via the
   `SECURITY_FAIL_LEVEL` environment variable (defaults to `high`).
6. Static analysis using [Semgrep](https://semgrep.dev/) with the rules defined
   in `.semgrep.yml`.
7. Upload Semgrep results as a build artifact for later review.

Failure in any step (tests, audit, or semgrep) will mark the job as failed and
prevent merges under branch protection.

## Configuration and Thresholds

- **`security-config.json`** contains default thresholds used by local helper
  scripts, e.g. `{ "auditLevel": "high" }`. Developers may override
  thresholds on the command line or via environment variables when running
  scans locally.
- The workflow respects the `SECURITY_FAIL_LEVEL` secret or variable to adjust
  the `npm audit` severity.
- Semgrep rules are maintained in `.semgrep.yml`; additional custom rules may
  be appended and should be reviewed by security maintainers.

## Local Scanning Instructions

Developers can run scans locally using npm scripts or the helper script:

```bash
# run individual scans
npm run scan:sast   # semgrep
npm run scan:deps   # npm audit

# run both together
npm run scan
```

The helper script `scripts/run-scans.js` loads any thresholds from
`security-config.json` and returns a non-zero exit code if any scan fails.

## Rule Management and Triage

- Parties responsible for rule maintenance should monitor Semgrep community and
  in-house rules for false positives/negatives.
- To add a rule, edit `.semgrep.yml` and include a clear rationale in the git
  commit message. New rules should be tested by adding a corresponding snippet
  to `tests/integration/ciPipeline.test.js`.

## Audit and Documentation

- Workflow changes are auditable via GitHub history; CODEOWNERS may require
  security team review for `.github/workflows/` and `.semgrep.yml`.
- Semgrep results are archived as artifacts and publicly viewable on PRs.
- The team should review this document quarterly and update thresholds or
  processes as needed.

## Troubleshooting

- **Pipeline failures due to new vulnerabilities**: review the `npm audit` log,
  upgrade or patch the offending package, or temporarily raise the
  `SECURITY_FAIL_LEVEL` to `moderate` until a fix is available.
- **False positives from Semgrep**: mark findings as false positive and add an
  exception comment or adjust the rule; consider reducing severity.

---

*Document created for I-005 to codify CI security gating.*