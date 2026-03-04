/**
 * UWF project_manager persona — gate enforcement shim.
 *
 * Stage definitions and gate conditions live in stages.yaml (this directory).
 * All logic is handled by the central stage-tracker in uwf-orchestration-engine.
 *
 * Usage (called by the orchestrator agent via terminal):
 *   node .github/skills/uwf-project_manager/run.mjs --list-stages
 *   node .github/skills/uwf-project_manager/run.mjs --check-gate <stageName> [--output-path <path>] [--state-path <path>]
 *
 * Exit codes:  0 = gate passed   1 = gate failed   2 = usage error
 */

import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tracker   = join(__dirname, "..", "uwf-orchestration-engine", "stage-tracker.mjs");
const rawArgs   = process.argv.slice(2);
const baseArgs  = ["--workflow", "project_manager", ...forwardGlobalFlags(rawArgs)];

let trackerArgs;
if (rawArgs.includes("--list-stages")) {
  trackerArgs = ["list-stages", ...baseArgs];
} else {
  const gateIdx = rawArgs.indexOf("--check-gate");
  if (gateIdx !== -1) {
    const stageName = rawArgs[gateIdx + 1];
    if (!stageName) { process.stderr.write("Usage: --check-gate <stageName>\n"); process.exit(2); }
    trackerArgs = ["check-gate", ...baseArgs, "--stage", stageName];
  } else {
    process.stderr.write("Usage: --list-stages | --check-gate <stageName> [--output-path <p>] [--state-path <p>]\n");
    process.exit(2);
  }
}

spawn(process.execPath, [tracker, ...trackerArgs], { stdio: "inherit" })
  .on("exit", (code) => process.exit(code ?? 0));

function forwardGlobalFlags(args) {
  const out = [];
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "--output-path" || args[i] === "--state-path") && i + 1 < args.length) {
      out.push(args[i], args[++i]);
    }
  }
  return out;
}
