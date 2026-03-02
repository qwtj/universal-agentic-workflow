/**
 * close.mjs — Move a completed issue from active/ to closed/.
 *
 * Moves: tmp/state/<M>/<S>/active/<id>.md → tmp/state/<M>/<S>/closed/<id>.md
 *
 * Outputs:
 *   { "closed": "<new-path>", "id": "<id>" }
 *
 * Usage:
 *   node scripts/tracking/close.mjs <issue-path>
 */

import { existsSync, mkdirSync, renameSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { parseFrontmatter } from "./lib/frontmatter.mjs";

const [, , issuePath] = process.argv;

if (!issuePath) {
  console.error(JSON.stringify({ error: "Usage: close.mjs <issue-path>" }));
  process.exit(1);
}

if (!existsSync(issuePath)) {
  console.error(JSON.stringify({ error: `File not found: ${issuePath}` }));
  process.exit(1);
}

// Accept closing from either active/ or open/ (for direct-close scenarios)
const parentDir = dirname(issuePath);
const sprintDir = dirname(parentDir);
const closedDir = join(sprintDir, "closed");

mkdirSync(closedDir, { recursive: true });

const newPath = join(closedDir, basename(issuePath));
renameSync(issuePath, newPath);

const { data } = parseFrontmatter(newPath);

console.log(
  JSON.stringify({
    closed: newPath,
    id: data.id ?? basename(newPath, ".md"),
    title: data.title ?? "",
  })
);
