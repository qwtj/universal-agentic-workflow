# ADR-0007: Allowlist Configuration and Runtime Reload

## Status
Proposed

## Context
The sandboxing feature requires an allowlist of permitted tools. Operators need the ability to update the allowlist without redeploying or restarting the service. The configuration format must be simple, human-editable, and stored in the repository or reachable at runtime. The system already has a `lib/config.js` module for loading configuration.

## Decision
- Store the allowlist in a JSON file located at `config/allowlist.json` by default.
- Extend `lib/config.js` to load this file and expose an `getAllowlist()` function.
- Watch the file for changes using `fs.watchFile()`; on change, reload the allowlist in memory after validating JSON syntax. If parsing fails, log an audit error and keep the previous valid list.
- Provide a programmatic API `reloadAllowlist()` that can be called from tests or administrative endpoints.
- The allowlist format will be a simple array of strings: `["toolA","toolB"]`.

## Consequences
- Operators can add or remove tools by editing the JSON file and the server will pick up changes automatically.
- The use of `fs.watchFile` introduces a small memory footprint but is sufficient for low-frequency edits.
- If the configuration file is corrupted, the system logs an error and continues with the last good state; administrators must fix the file manually.
- The configuration file being in the repository means changes are versioned alongside code, aiding audits.

## Alternatives Considered
- **Environment variable**: easier to implement but not editable at runtime without restart; also cumbersome for long lists.
- **Database-backed config**: overkill for simple lists and would require introducing a new dependency.
- **Use a YAML or INI file**: JSON is native to Node and simpler to parse securely.
- **No runtime reload**: would simplify implementation but violate a requirement.

## References
- `lib/config.js` existing implementation
- I-004 Requirements
