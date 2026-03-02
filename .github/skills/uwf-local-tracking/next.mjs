/**
 * next.mjs — Find the next eligible issue(s) from the open queue.
 *
 * Eligibility rule: all ids listed in `depends-on` frontmatter must exist
 * in any /closed/ directory. Issues with no dependencies are always eligible.
 *
 * Outputs:
 *   { "exhausted": false, "eligible": ["path/to/I-001.md", ...], "blocked": [...] }
 *   { "exhausted": true,  "eligible": [], "blocked": [...] }
 *
 * Usage:
 *   node scripts/tracking/next.mjs
 */

import { existsSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { parseFrontmatter } from "./lib/frontmatter.mjs";

const STATE_DIR = "./tmp/state";

/** Collect all closed issue ids across every sprint. */
function closedIds() {
  const ids = new Set();
  if (!existsSync(STATE_DIR)) return ids;

  for (const ms of readdirSync(STATE_DIR).sort()) {
    const msPath = join(STATE_DIR, ms);
    if (!statSync(msPath).isDirectory()) continue;

    for (const sp of readdirSync(msPath).sort()) {
      const closedDir = join(msPath, sp, "closed");
      if (!existsSync(closedDir)) continue;

      for (const f of readdirSync(closedDir)) {
        if (f.endsWith(".md")) ids.add(basename(f, ".md"));
      }
    }
  }

  return ids;
}

/** Collect all open issue file paths in deterministic order. */
function openPaths() {
  const paths = [];
  if (!existsSync(STATE_DIR)) return paths;

  for (const ms of readdirSync(STATE_DIR).sort()) {
    const msPath = join(STATE_DIR, ms);
    if (!statSync(msPath).isDirectory()) continue;

    for (const sp of readdirSync(msPath).sort()) {
      const openDir = join(msPath, sp, "open");
      if (!existsSync(openDir)) continue;

      for (const f of readdirSync(openDir).filter((f) => f.endsWith(".md")).sort()) {
        paths.push(join(openDir, f));
      }
    }
  }

  return paths;
}

const closed = closedIds();
const open = openPaths();

if (open.length === 0) {
  console.log(JSON.stringify({ exhausted: true, eligible: [], blocked: [] }));
  process.exit(0);
}

const eligible = [];
const blocked = [];

for (const p of open) {
  const { data } = parseFrontmatter(p);
  const raw = data["depends-on"] ?? [];
  const deps = Array.isArray(raw) ? raw : [raw].filter(Boolean);
  const unmet = deps.filter((d) => !closed.has(d));

  if (unmet.length === 0) {
    eligible.push(p);
  } else {
    blocked.push({ path: p, waiting_on: unmet });
  }
}

const exhausted = eligible.length === 0 && open.length > 0;
console.log(JSON.stringify({ exhausted, eligible, blocked }));
