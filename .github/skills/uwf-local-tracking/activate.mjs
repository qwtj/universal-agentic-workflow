/**
 * activate.mjs — Move an issue from open/ to active/ and reset workflow artifacts.
 *
 * Moves: tmp/state/<M>/<S>/open/<id>.md → tmp/state/<M>/<S>/active/<id>.md
 * Resets (overwrites): tmp/workflow-artifacts/{mode}-intake.md
 *                      tmp/workflow-artifacts/{mode}-discovery.md
 *                      tmp/workflow-artifacts/{mode}-plan.md
 *                      tmp/workflow-artifacts/{mode}-acceptance.md
 *
 * Outputs:
 *   { "activated": "<new-path>", "mode": "<mode>", "artifacts_reset": [...] }
 *
 * Flags:
 *   --mode <mode>   Workflow mode prefix for artifact filenames (default: "issue")
 *
 * Usage:
 *   node scripts/tracking/activate.mjs <issue-path> [--mode sw_dev]
 */

import { existsSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { parseFrontmatter } from "./lib/frontmatter.mjs";

// --- Parse args ---
const args = process.argv.slice(2);
let issuePath = null;
let mode = "issue";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--mode" && args[i + 1]) {
    mode = args[++i];
  } else if (!issuePath && !args[i].startsWith("--")) {
    issuePath = args[i];
  }
}

if (!issuePath) {
  console.error(JSON.stringify({ error: "Usage: activate.mjs <issue-path> [--mode <mode>]" }));
  process.exit(1);
}

if (!existsSync(issuePath)) {
  console.error(JSON.stringify({ error: `File not found: ${issuePath}` }));
  process.exit(1);
}

// Validate the file is in an open/ directory
if (!issuePath.includes("/open/") && !issuePath.includes("\\open\\")) {
  console.error(JSON.stringify({ error: `Issue is not in an open/ directory: ${issuePath}` }));
  process.exit(1);
}

// --- Move open → active ---
const sprintDir = dirname(dirname(issuePath));
const activeDir = join(sprintDir, "active");

mkdirSync(activeDir, { recursive: true });

const newPath = join(activeDir, basename(issuePath));
renameSync(issuePath, newPath);

// --- Reset workflow artifacts ---
const ARTIFACTS_DIR = "./tmp/workflow-artifacts";
mkdirSync(ARTIFACTS_DIR, { recursive: true });

const artifactNames = ["intake", "discovery", "plan", "acceptance"];
const artifactsReset = [];

for (const name of artifactNames) {
  const filePath = join(ARTIFACTS_DIR, `${mode}-${name}.md`);
  writeFileSync(filePath, `# ${mode}-${name}\n\n<!-- reset by activate.mjs for ${basename(newPath, ".md")} -->\n`, "utf8");
  artifactsReset.push(filePath);
}

// Read the activated issue summary
const { data } = parseFrontmatter(newPath);

console.log(
  JSON.stringify({
    activated: newPath,
    mode,
    issue: {
      id: data.id ?? basename(newPath, ".md"),
      title: data.title ?? "",
      milestone: data.milestone ?? "",
      sprint: data.sprint ?? "",
    },
    artifacts_reset: artifactsReset,
  })
);
