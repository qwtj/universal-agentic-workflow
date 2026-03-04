# ADR-0003: Example ADR: logging strategy

Date: 2026-03-04
Status: Proposed

## Context
The UWF CLI and companion tools emit logs for debugging, telemetry, and audit trails. Current implementations use plain text with ad‑hoc formatting, making it difficult to parse or aggregate in log consumers.

Constraints:
- Developers need readable output on terminal during local development.
- Logs may eventually be shipped to external systems (Azure Monitor, ELK, etc.).
- Low overhead is required to avoid slowing down CLI commands.

Current state: a mix of `console.log` statements sprinkled throughout the codebase; some scripts add JSON manually, others rely on string concatenation.

## Decision
- Adopt structured JSON logs for observability

## Alternatives considered
1) **Continue with ad‑hoc text logs.** Minimal work but inconsistent structure hinders tooling and automated ingestion.
2) **Use a third‑party logging library (winston/pino) with structured output.** Adds dependency but gives flexibility and formatting options.
3) **Send events directly to telemetry services (Application Insights) instead of local logs.** Requires network and configuration; poor offline behaviour.

## Consequences
- **Positive**
  - Structured JSON logs can be filtered and aggregated easily.
  - Consistent schema simplifies later integration with cloud observability tools.
  - Local files remain human‑readable since each JSON object is one line.
- **Negative**
  - Developers must learn the chosen schema and may find raw JSON noisy.
  - Additional dependency increases maintenance surface.
- **Follow-ups**
  - Define a log schema/contract and publish it (e.g., `docs/log-schema.md`).
  - Provide helper functions or wrappers to standardize event creation.

## Security / Privacy / Compliance notes
Logs must avoid accidentally capturing secrets or personally identifiable information. When writing errors that include stack traces or object dumps, sensitive fields should be redacted.

Depending on compliance needs, log rotation and retention policies may apply to prevent unbounded disk growth. Structured logs make it easier to apply filtering rules for sensitive data before shipping.

## Verification
- Add unit tests that assert the logger outputs valid JSON and includes required fields (timestamp, level, message).
- Run CLI commands under typical loads and ensure performance overhead <5%.
- Review log outputs for accidental secret exposure using automated scanning tools.

## Appendix A — ADR-300 Checklist
> Add checkbox sections by domain; mark N/A explicitly.
