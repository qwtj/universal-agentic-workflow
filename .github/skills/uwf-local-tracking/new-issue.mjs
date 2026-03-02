/**
 * new-issue.mjs — Create a new issue file in the correct open/ directory.
 *
 * Auto-increments the issue id (I-001, I-002, …) by scanning existing files
 * in the target open/ directory unless --id is supplied explicitly.
 *
 * Outputs:
 *   { "created": "<path>", "id": "<id>" }
 *
 * Required flags:
 *   --milestone <M>   e.g. M1-core
 *   --sprint    <S>   e.g. S1-bootstrap
 *   --title     <T>   Short title (quoted if it contains spaces)
 *
 * Optional flags:
 *   --id        <I>              Explicit id (e.g. I-005); auto-incremented if omitted
 *   --depends-on <"I-001,I-002"> Comma-separated dependency ids
 *   --parallel  true|false       Default: false
 *   --security-sensitive true|false  Default: false
 *   --acceptance-criteria <text> One-line stub
 *   --notes     <text>           Optional body text appended after the template
 *   --ungroomed                  Write to tmp/state/ungroomed/open/ instead of milestone/sprint path
 *
 * Usage:
 *   node scripts/tracking/new-issue.mjs --milestone M1-core --sprint S1-bootstrap --title "Set up CI"
 *   node scripts/tracking/new-issue.mjs --ungroomed --title "Investigate flaky test"
 */

import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";

// --- Parse args ---
const args = process.argv.slice(2);
const flags = {};
let positional = [];

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--")) {
    const key = args[i].slice(2);
    // Boolean flags
    if (key === "ungroomed") {
      flags[key] = true;
    } else if (args[i + 1] && !args[i + 1].startsWith("--")) {
      flags[key] = args[++i];
    } else {
      flags[key] = true;
    }
  } else {
    positional.push(args[i]);
  }
}

const isUngroomed = Boolean(flags["ungroomed"]);
const milestone = flags["milestone"];
const sprint = flags["sprint"];
const title = flags["title"];

if (!title) {
  console.error(JSON.stringify({ error: "--title is required" }));
  process.exit(1);
}

if (!isUngroomed && (!milestone || !sprint)) {
  console.error(JSON.stringify({ error: "--milestone and --sprint are required (or use --ungroomed)" }));
  process.exit(1);
}

// --- Resolve target directory ---
const STATE_DIR = "./tmp/state";
const targetDir = isUngroomed
  ? join(STATE_DIR, "ungroomed", "open")
  : join(STATE_DIR, milestone, sprint, "open");

mkdirSync(targetDir, { recursive: true });

// --- Resolve issue id ---
let id = flags["id"];
if (!id) {
  const existing = existsSync(targetDir)
    ? readdirSync(targetDir)
        .filter((f) => f.match(/^I-\d+\.md$/))
        .map((f) => parseInt(f.replace("I-", "").replace(".md", ""), 10))
        .filter((n) => !isNaN(n))
    : [];

  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  id = `I-${String(next).padStart(3, "0")}`;
}

// --- Build dependency array ---
const rawDeps = flags["depends-on"] ?? "";
const deps = rawDeps
  ? rawDeps.split(",").map((s) => s.trim()).filter(Boolean)
  : [];
const depsYaml = deps.length > 0 ? `[${deps.join(", ")}]` : "[]";

const parallel = flags["parallel"] ?? "false";
const securitySensitive = flags["security-sensitive"] ?? "false";
const acceptanceCriteria = flags["acceptance-criteria"] ?? "<expand during intake>";
const notes = flags["notes"] ?? "";

// --- Write issue file ---
const filePath = join(targetDir, `${id}.md`);

if (existsSync(filePath)) {
  console.error(JSON.stringify({ error: `Issue file already exists: ${filePath}` }));
  process.exit(1);
}

const milestoneField = isUngroomed ? "ungroomed" : milestone;
const sprintField = isUngroomed ? "ungroomed" : sprint;

const content = `---
id: ${id}
milestone: ${milestoneField}
sprint: ${sprintField}
title: ${title}
depends-on: ${depsYaml}
security-sensitive: ${securitySensitive}
parallel: ${parallel}
acceptance-criteria: ${acceptanceCriteria}
submitter: new-issue.mjs
reason: created
---

# ${id}: ${title}
${notes ? "\n" + notes + "\n" : ""}`;

writeFileSync(filePath, content, "utf8");

console.log(JSON.stringify({ created: filePath, id, title }));
