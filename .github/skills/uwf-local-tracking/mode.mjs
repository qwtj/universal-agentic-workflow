/**
 * mode.mjs — Determine UWF operating mode.
 *
 * Outputs: { "mode": "project" | "issue" }
 *
 * "issue" mode: at least one <milestone>/<sprint> directory exists under tmp/state/
 * "project" mode: the state tree is empty or absent
 *
 * Usage:
 *   node scripts/tracking/mode.mjs
 */

import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const STATE_DIR = "./tmp/state";

function hasSprintDirs() {
  if (!existsSync(STATE_DIR)) return false;

  for (const entry of readdirSync(STATE_DIR)) {
    const msPath = join(STATE_DIR, entry);
    if (!statSync(msPath).isDirectory()) continue;

    for (const sub of readdirSync(msPath)) {
      if (statSync(join(msPath, sub)).isDirectory()) return true;
    }
  }

  return false;
}

const mode = hasSprintDirs() ? "issue" : "project";
console.log(JSON.stringify({ mode }));
