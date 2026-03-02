/**
 * skip.mjs — Skip an open issue (close it without activation).
 *
 * Moves: tmp/state/<M>/<S>/open/<id>.md → tmp/state/<M>/<S>/closed/<id>.md
 * and prepends a "## Skip reason" section to the file body.
 *
 * Outputs:
 *   { "skipped": "<new-path>", "id": "<id>", "reason": "<reason>" }
 *
 * Flags:
 *   --reason "<text>"   Human-readable skip rationale (default: "No reason provided.")
 *
 * Usage:
 *   node scripts/tracking/skip.mjs <issue-path> [--reason "Out of scope for this sprint"]
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { parseFrontmatter } from "./lib/frontmatter.mjs";

// --- Parse args ---
const args = process.argv.slice(2);
let issuePath = null;
let reason = "No reason provided.";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--reason" && args[i + 1]) {
    reason = args[++i];
  } else if (!issuePath && !args[i].startsWith("--")) {
    issuePath = args[i];
  }
}

if (!issuePath) {
  console.error(JSON.stringify({ error: "Usage: skip.mjs <issue-path> [--reason '...']" }));
  process.exit(1);
}

if (!existsSync(issuePath)) {
  console.error(JSON.stringify({ error: `File not found: ${issuePath}` }));
  process.exit(1);
}

if (!issuePath.includes("/open/") && !issuePath.includes("\\open\\")) {
  console.error(JSON.stringify({ error: `Issue is not in an open/ directory: ${issuePath}` }));
  process.exit(1);
}

// --- Prepend skip section after frontmatter ---
const raw = readFileSync(issuePath, "utf8");

// Find the end of the frontmatter block
const fmEnd = raw.indexOf("\n---\n", 4); // skip opening ---
let updatedContent;

if (raw.startsWith("---\n") && fmEnd !== -1) {
  const frontmatter = raw.slice(0, fmEnd + 5); // includes closing ---\n
  const body = raw.slice(fmEnd + 5);
  updatedContent = `${frontmatter}\n## Skip reason\n\n${reason}\n\n---\n\n${body}`;
} else {
  // No frontmatter — prepend at top
  updatedContent = `## Skip reason\n\n${reason}\n\n---\n\n${raw}`;
}

// --- Write to closed/, remove from open/ ---
const openDir = dirname(issuePath);
const sprintDir = dirname(openDir);
const closedDir = join(sprintDir, "closed");

mkdirSync(closedDir, { recursive: true });

const newPath = join(closedDir, basename(issuePath));
writeFileSync(newPath, updatedContent, "utf8");
unlinkSync(issuePath);

const { data } = parseFrontmatter(newPath);

console.log(
  JSON.stringify({
    skipped: newPath,
    id: data.id ?? basename(newPath, ".md"),
    title: data.title ?? "",
    reason,
  })
);
