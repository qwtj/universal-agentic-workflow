# ADR-0006: Sandbox Mechanism for Tool Execution

## Status
Proposed

## Context
Issue I-004 requires executing external tools from within the system while limiting their potential impact. The environment is a Node.js/Express backend with existing audit and configuration infrastructure. Sandboxing must be lightweight, avoid adding heavy dependencies, and prevent tool processes from escaping or abusing host resources.

## Decision
- Use Node's built-in `child_process` API to spawn tools in separate processes.
- Launch tool processes with `spawn` rather than `exec` to avoid shell injection hazards.
- Apply sandbox controls by:
  - Running processes under a low-privilege user if available (via `uid`/`gid` options).
  - Restricting filesystem access by setting `cwd` to a dedicated temporary directory and never passing untrusted paths.
  - Limiting CPU and memory using `resourceLimits` (available in Node 16+: `maxBuffer`, `maxOldGenerationSizeMb`, etc.) or external wrappers like `ulimit` when necessary.
- Do **not** adopt heavier sandbox frameworks (e.g. Docker, Firecracker) due to complexity and performance cost.
- Encapsulate execution logic in a new module `lib/toolRunner.js`, exposing `executeTool(name, args, options)`.

## Consequences
- Execution stays within the Node.js process tree, simplifying integration with existing code and audit logging.
- Reliance on OS-level primitives means portability may vary (some `resourceLimits` flags not supported on Windows). The project currently targets UNIX-like environments, which is acceptable.[assumption]
- Additional effort required to validate sandbox boundaries and write escape tests; however, no new dependencies are introduced.
- Future enhancements (e.g. chroot, seccomp) can wrap around this abstraction if needed.

## Alternatives Considered
- **Use Node `vm` module**: runs code in a separate JavaScript sandbox but cannot isolate native binaries, so unsuitable for running arbitrary tools.
- **Embed a third-party sandbox library (e.g. `sandboxed-module`, `isolated-vm`)**: these focus on JavaScript sandboxing and introduce dependencies.
- **Containerization (Docker/k8s)**: rejected due to non-goal, complexity, and performance.
- **Use WebAssembly (WASM)**: not appropriate for existing CLI tools, only useful if tools are rewritten.

## References
- Issue I-004 requirements document
- Node.js child_process documentation
- `lib/auditLogger.js` (integration point)
