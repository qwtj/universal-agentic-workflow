/**
 * UWF State Manager — deterministic CLI for all uwf-state.json operations.
 *
 * This script replaces LLM-based state manipulation with reliable, atomic
 * reads and writes. Every agent that needs to touch workflow state must call
 * this script via terminal instead of reasoning about the JSON file itself.
 *
 * Usage:
 *   node .github/skills/uwf-state-manager/state.mjs <command> [options]
 *
 * Commands:
 *   read                                   Read + validate state; print JSON
 *   init [--mode <mode>]                   Initialize a fresh state file
 *   advance  --to <phase> --agent <id>     Advance to the next phase
 *            [--note <text>] [--force]
 *   rollback --to <phase> --agent <id>     Roll back to an earlier phase
 *            [--note <text>]
 *   set-agent --agent <id>  [--force]      Claim the agent token
 *   release-agent                          Release the agent token (set null)
 *   check-ready                            Mark ready_for_implementation when
 *                                          gate conditions are met
 *   set-status --status <s> --agent <id>   Set status (idle|active|blocked)
 *   sync                                   Derive fields from ./tmp/state/ tree
 *   note --agent <id> --note <text>        Append a history entry
 *
 * Global options:
 *   --state-path  <path>   Default: ./tmp/uwf-state.json
 *   --output-path <path>   Default: ./tmp/workflow-artifacts
 *
 * Exit codes:
 *   0  success
 *   1  operational error (validation failure, conflict, missing prereq …)
 *   2  usage error (unknown command, missing required flag)
 *
 * All output is JSON to stdout.
 */

import fs from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_PHASES = ["idea", "intake", "discovery", "planning", "execution", "acceptance", "closed"];
const VALID_STATUSES = ["idle", "active", "blocked"];
const PHASE_ORDER = Object.fromEntries(VALID_PHASES.map((p, i) => [p, i]));

const DEFAULT_STATE_PATH = "./tmp/uwf-state.json";
const DEFAULT_OUTPUT_PATH = "./tmp/workflow-artifacts";

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

const rawArgs = process.argv.slice(2);
const [command, ...restArgs] = rawArgs;

const flags = parseFlags(restArgs);
const statePath = flags["state-path"] ?? DEFAULT_STATE_PATH;
const outputPath = flags["output-path"] ?? DEFAULT_OUTPUT_PATH;

if (!command) {
  usageError("No command provided. Run with --help for usage.");
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

try {
  switch (command) {
    case "read":        cmdRead(); break;
    case "init":        cmdInit(); break;
    case "advance":     cmdAdvance(); break;
    case "rollback":    cmdRollback(); break;
    case "set-agent":   cmdSetAgent(); break;
    case "release-agent": cmdReleaseAgent(); break;
    case "check-ready": cmdCheckReady(); break;
    case "set-status":  cmdSetStatus(); break;
    case "sync":        cmdSync(); break;
    case "note":        cmdNote(); break;
    default:
      usageError(`Unknown command: "${command}"`);
  }
} catch (err) {
  fail(err.message);
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/** Procedure 1: Read + validate state. */
function cmdRead() {
  const { state, initialized } = loadState();
  succeed({
    procedure: "read",
    initialized,
    state,
  });
}

/** Initialize a fresh state file (overwrites if present). */
function cmdInit() {
  const mode = flags["mode"] ?? null;
  const fresh = defaultState(mode);
  writeState(fresh);
  succeed({
    procedure: "init",
    mode,
    state: fresh,
  });
}

/** Procedure 2: Advance phase. */
function cmdAdvance() {
  requireFlag("to", "advance");
  requireFlag("agent", "advance");

  const toPhase = flags["to"];
  const agent = flags["agent"];
  const note = flags["note"] ?? "";
  const force = "force" in flags;

  validatePhase(toPhase);

  const { state } = loadState();
  const fromPhase = state.phase ?? "idea";

  if (!force) {
    const fromIdx = PHASE_ORDER[fromPhase] ?? -1;
    const toIdx = PHASE_ORDER[toPhase];
    if (toIdx !== fromIdx + 1) {
      fail(
        `Illegal phase advance: "${fromPhase}" → "${toPhase}". ` +
        `Expected next phase: "${VALID_PHASES[fromIdx + 1] ?? "(none)"}". ` +
        `Use --force to override.`
      );
    }
  }

  const entry = historyEntry(fromPhase, toPhase, agent, note);
  state.phase = toPhase;
  state.status = "active";
  state.history = [...(state.history ?? []), entry];

  writeState(state);
  succeed({
    procedure: "advance",
    from_phase: fromPhase,
    to_phase: toPhase,
    agent,
    history_entry: entry,
    state,
  });
}

/** Procedure 3: Roll back phase. */
function cmdRollback() {
  requireFlag("to", "rollback");
  requireFlag("agent", "rollback");

  const toPhase = flags["to"];
  const agent = flags["agent"];
  const rawNote = flags["note"] ?? "";

  validatePhase(toPhase);

  const { state } = loadState();
  const fromPhase = state.phase ?? "idea";

  const fromIdx = PHASE_ORDER[fromPhase] ?? 0;
  const toIdx = PHASE_ORDER[toPhase];

  if (toIdx >= fromIdx) {
    fail(
      `Rollback target "${toPhase}" is not earlier than current phase "${fromPhase}".`
    );
  }

  const note = `ROLLBACK: ${rawNote}`.trimEnd();
  const entry = historyEntry(fromPhase, toPhase, agent, note);
  state.phase = toPhase;
  state.status = "active";
  state.history = [...(state.history ?? []), entry];

  writeState(state);
  succeed({
    procedure: "rollback",
    from_phase: fromPhase,
    to_phase: toPhase,
    agent,
    history_entry: entry,
    artifacts_to_regenerate: artifactsForPhase(toPhase, outputPath),
    state,
  });
}

/** Procedure 4: Set (claim) current agent. */
function cmdSetAgent() {
  requireFlag("agent", "set-agent");
  const agent = flags["agent"];
  const force = "force" in flags;

  const { state } = loadState();
  const prev = state.current_agent;

  if (prev && prev !== agent && !force) {
    fail(
      `Token conflict: "${prev}" currently holds the agent token. ` +
      `Use --force to override.`
    );
  }

  state.current_agent = agent;
  writeState(state);
  succeed({ procedure: "set-agent", previous: prev, current_agent: agent, state });
}

/** Procedure 4 (release): Set current_agent to null. */
function cmdReleaseAgent() {
  const { state } = loadState();
  const prev = state.current_agent;
  state.current_agent = null;
  writeState(state);
  succeed({ procedure: "release-agent", previous: prev, current_agent: null, state });
}

/** Procedure 5: Mark ready for implementation. */
function cmdCheckReady() {
  const { state } = loadState();

  const phaseIdx = PHASE_ORDER[state.phase ?? "idea"] ?? 0;
  const planningIdx = PHASE_ORDER["planning"];

  const missing = [];

  const intakePath = path.join(outputPath, "issues-intake.md");
  const planPath = path.join(outputPath, "issues-plan.md");

  if (!fileNonEmpty(intakePath)) missing.push(intakePath);
  if (!fileNonEmpty(planPath)) missing.push(planPath);

  if (phaseIdx < planningIdx) {
    missing.push(`phase must be "planning" or later (current: "${state.phase}")`);
  }

  if (missing.length > 0) {
    fail(`ready_for_implementation prerequisites not met`, { missing });
  }

  state.ready_for_implementation = true;
  writeState(state);
  succeed({ procedure: "check-ready", ready_for_implementation: true, state });
}

/** Procedure 6: Set status (idle | active | blocked). */
function cmdSetStatus() {
  requireFlag("status", "set-status");
  requireFlag("agent", "set-status");

  const newStatus = flags["status"];
  const agent = flags["agent"];

  if (!VALID_STATUSES.includes(newStatus)) {
    fail(`Invalid status "${newStatus}". Must be one of: ${VALID_STATUSES.join(", ")}.`);
  }

  const { state } = loadState();
  const prevStatus = state.status;

  if (prevStatus !== newStatus) {
    const entry = historyEntry(state.phase, state.phase, agent, `status → ${newStatus}`);
    state.history = [...(state.history ?? []), entry];
  }

  state.status = newStatus;
  writeState(state);
  succeed({ procedure: "set-status", previous_status: prevStatus, status: newStatus, state });
}

/** Procedure 7: Sync derived fields from file-system state tree. */
function cmdSync() {
  const { state } = loadState();
  const stateRoot = "./tmp/state";

  const counts = countIssues(stateRoot);
  const before = {
    status: state.status,
    phase: state.phase,
    ready_for_implementation: state.ready_for_implementation,
  };

  let changed = false;

  // Derive status
  if (counts.active > 0) {
    if (state.status !== "active") { state.status = "active"; changed = true; }
  } else if (counts.open === 0 && counts.active === 0) {
    if (state.status !== "idle") { state.status = "idle"; changed = true; }
    // Auto-advance execution → acceptance when all issues are done
    if (state.phase === "execution") {
      state.phase = "acceptance";
      const entry = historyEntry("execution", "acceptance", "sync", "All issues closed; auto-advancing to acceptance.");
      state.history = [...(state.history ?? []), entry];
      changed = true;
    }
  }

  // Re-check ready_for_implementation
  const intakePath = path.join(outputPath, "issues-intake.md");
  const planPath = path.join(outputPath, "issues-plan.md");
  const phaseIdx = PHASE_ORDER[state.phase ?? "idea"] ?? 0;
  const planningIdx = PHASE_ORDER["planning"];
  const newReady = fileNonEmpty(intakePath) && fileNonEmpty(planPath) && phaseIdx >= planningIdx;

  if (newReady !== state.ready_for_implementation) {
    state.ready_for_implementation = newReady;
    changed = true;
  }

  if (changed) writeState(state);

  succeed({
    procedure: "sync",
    changed,
    issue_counts: counts,
    before,
    after: {
      status: state.status,
      phase: state.phase,
      ready_for_implementation: state.ready_for_implementation,
    },
    state,
  });
}

/** Procedure 8: Append arbitrary history note. */
function cmdNote() {
  requireFlag("agent", "note");
  requireFlag("note", "note");

  const agent = flags["agent"];
  const noteText = flags["note"];

  const { state } = loadState();
  const entry = historyEntry(state.phase, state.phase, agent, noteText);
  state.history = [...(state.history ?? []), entry];

  writeState(state);
  succeed({ procedure: "note", history_entry: entry, state });
}

// ---------------------------------------------------------------------------
// State I/O
// ---------------------------------------------------------------------------

function loadState() {
  const abs = path.resolve(statePath);

  if (!fs.existsSync(abs)) {
    const fresh = defaultState(null);
    writeState(fresh);
    return { state: fresh, initialized: true };
  }

  let raw;
  try {
    raw = fs.readFileSync(abs, "utf8");
  } catch (err) {
    fail(`Cannot read state file: ${err.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    fail(`State file is not valid JSON: ${abs}`);
  }

  // Validate required keys
  const REQUIRED = ["phase", "status", "current_agent", "artifact_path", "ready_for_implementation", "history"];
  const missingKeys = REQUIRED.filter((k) => !(k in parsed));
  if (missingKeys.length > 0) {
    // Repair rather than reject
    const repaired = { ...defaultState(null), ...parsed };
    writeState(repaired);
    return { state: repaired, initialized: false, repaired: true, repaired_keys: missingKeys };
  }

  if (parsed.phase !== null && !VALID_PHASES.includes(parsed.phase)) {
    fail(`Invalid phase value in state file: "${parsed.phase}"`);
  }
  if (!VALID_STATUSES.includes(parsed.status)) {
    fail(`Invalid status value in state file: "${parsed.status}"`);
  }

  return { state: parsed, initialized: false };
}

function writeState(state) {
  const abs = path.resolve(statePath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(state, null, 2) + "\n", "utf8");
}

function defaultState(mode) {
  return {
    phase: "idea",
    mode: mode ?? null,
    status: "idle",
    current_agent: null,
    artifact_path: outputPath,
    ready_for_implementation: false,
    history: [],
  };
}

// ---------------------------------------------------------------------------
// File-system helpers
// ---------------------------------------------------------------------------

function fileNonEmpty(filePath) {
  const abs = path.resolve(filePath);
  return fs.existsSync(abs) && fs.statSync(abs).size > 0;
}

/**
 * Count issues by state across the entire ./tmp/state/ tree.
 * Expects: tmp/state/<milestone>/<sprint>/open|active|closed/<id>.md
 */
function countIssues(stateRoot) {
  const abs = path.resolve(stateRoot);
  const counts = { open: 0, active: 0, closed: 0 };
  if (!fs.existsSync(abs)) return counts;

  for (const entry of walkDir(abs)) {
    const rel = path.relative(abs, entry);
    const parts = rel.split(path.sep);
    const stateDir = parts[parts.length - 2]; // parent dir of the file
    if (stateDir === "open") counts.open++;
    else if (stateDir === "active") counts.active++;
    else if (stateDir === "closed") counts.closed++;
  }
  return counts;
}

function walkDir(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkDir(full));
    else results.push(full);
  }
  return results;
}

/**
 * Return a list of artifact file paths that should be regenerated after
 * rolling back to a given phase.
 */
function artifactsForPhase(toPhase, artPath) {
  const phaseArtifacts = {
    idea: [],
    intake: [`${artPath}/{mode}-intake.md`],
    discovery: [`${artPath}/{mode}-intake.md`, `${artPath}/{mode}-discovery.md`],
    planning: [`${artPath}/{mode}-intake.md`, `${artPath}/{mode}-discovery.md`, `${artPath}/{mode}-plan.md`],
    execution: [],
    acceptance: [`${artPath}/{mode}-acceptance.md`],
    closed: [],
  };
  return phaseArtifacts[toPhase] ?? [];
}

// ---------------------------------------------------------------------------
// History helpers
// ---------------------------------------------------------------------------

function historyEntry(fromPhase, toPhase, agent, note) {
  return {
    ts: new Date().toISOString(),
    from_phase: fromPhase,
    to_phase: toPhase,
    agent,
    note: note ?? "",
  };
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validatePhase(phase) {
  if (!VALID_PHASES.includes(phase)) {
    usageError(`Unknown phase: "${phase}". Valid phases: ${VALID_PHASES.join(", ")}.`);
  }
}

function requireFlag(name, cmd) {
  if (!(name in flags) || !flags[name]) {
    usageError(`Command "${cmd}" requires --${name}.`);
  }
}

// ---------------------------------------------------------------------------
// Output helpers
// ---------------------------------------------------------------------------

function succeed(payload) {
  process.stdout.write(JSON.stringify({ ok: true, ...payload }, null, 2) + "\n");
  process.exit(0);
}

function fail(message, extras = {}) {
  process.stdout.write(JSON.stringify({ ok: false, error: message, ...extras }, null, 2) + "\n");
  process.exit(1);
}

function usageError(message) {
  process.stderr.write(`Usage error: ${message}\n`);
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Flag parser  --key value  or  --flag (boolean)
// ---------------------------------------------------------------------------

function parseFlags(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
        result[key] = args[++i];
      } else {
        result[key] = true;
      }
    }
  }
  return result;
}
