/**
 * scaffold.mjs — Idempotently create the open/active/closed directory triplet
 * for a given milestone + sprint under tmp/state/.
 *
 * Outputs:
 *   { "dirs": ["<path>", ...] }   — all directories that now exist (created or pre-existing)
 *
 * Flags:
 *   --milestone <M>   e.g. M1-core
 *   --sprint    <S>   e.g. S1-bootstrap
 *   --ungroomed       Create tmp/state/ungroomed/open/ instead (no triplet)
 *
 * Usage:
 *   node scripts/tracking/scaffold.mjs --milestone M1-core --sprint S1-bootstrap
 *   node scripts/tracking/scaffold.mjs --ungroomed
 */

import { mkdirSync } from "node:fs";
import { join } from "node:path";

// --- Parse args ---
const args = process.argv.slice(2);
const flags = {};

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) {
    const key = args[i].slice(2);
    if (key === "ungroomed") {
      flags[key] = true;
    } else if (args[i + 1] && !args[i + 1].startsWith("--")) {
      flags[key] = args[++i];
    } else {
      flags[key] = true;
    }
  }
}

const isUngroomed = Boolean(flags["ungroomed"]);
const milestone = flags["milestone"];
const sprint = flags["sprint"];

if (!isUngroomed && (!milestone || !sprint)) {
  console.error(
    JSON.stringify({ error: "--milestone and --sprint are required (or use --ungroomed)" })
  );
  process.exit(1);
}

const STATE_DIR = "./tmp/state";
const dirs = [];

if (isUngroomed) {
  const d = join(STATE_DIR, "ungroomed", "open");
  mkdirSync(d, { recursive: true });
  dirs.push(d);
} else {
  for (const bucket of ["open", "active", "closed"]) {
    const d = join(STATE_DIR, milestone, sprint, bucket);
    mkdirSync(d, { recursive: true });
    dirs.push(d);
  }
}

console.log(JSON.stringify({ dirs }));
