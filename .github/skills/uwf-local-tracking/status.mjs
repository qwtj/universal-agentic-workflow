/**
 * status.mjs — Report queue state across all sprints.
 *
 * Walks every tmp/state/<milestone>/<sprint>/ directory and counts
 * issues in open/, active/, and closed/. Flags queue exhaustion when
 * no open issues remain and reports any currently active issues.
 *
 * Outputs:
 *   {
 *     "mode": "project" | "issue",
 *     "queue_exhausted": false,
 *     "active_issues": [{ "path": "...", "id": "...", "title": "..." }],
 *     "sprints": [
 *       {
 *         "milestone": "M1-core",
 *         "sprint": "S1-bootstrap",
 *         "open": 3,
 *         "active": 1,
 *         "closed": 2,
 *         "issues": { "open": [...], "active": [...], "closed": [...] }
 *       }
 *     ],
 *     "totals": { "open": 4, "active": 1, "closed": 5 }
 *   }
 *
 * Usage:
 *   node scripts/tracking/status.mjs
 */

import { existsSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";
import { parseFrontmatter } from "./lib/frontmatter.mjs";

const STATE_DIR = "./tmp/state";

function readIssues(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => {
      const p = join(dir, f);
      const { data } = parseFrontmatter(p);
      return {
        path: p,
        id: data.id ?? basename(f, ".md"),
        title: data.title ?? "",
        depends_on: data["depends-on"] ?? [],
        parallel: data.parallel ?? false,
        security_sensitive: data["security-sensitive"] ?? false,
      };
    });
}

const sprints = [];
let totalOpen = 0;
let totalActive = 0;
let totalClosed = 0;
const activeIssues = [];

if (existsSync(STATE_DIR)) {
  for (const ms of readdirSync(STATE_DIR).sort()) {
    const msPath = join(STATE_DIR, ms);
    if (!statSync(msPath).isDirectory()) continue;

    for (const sp of readdirSync(msPath).sort()) {
      const spPath = join(msPath, sp);
      if (!statSync(spPath).isDirectory()) continue;

      const openIssues = readIssues(join(spPath, "open"));
      const activeIssueList = readIssues(join(spPath, "active"));
      const closedIssues = readIssues(join(spPath, "closed"));

      totalOpen += openIssues.length;
      totalActive += activeIssueList.length;
      totalClosed += closedIssues.length;
      activeIssues.push(...activeIssueList);

      sprints.push({
        milestone: ms,
        sprint: sp,
        open: openIssues.length,
        active: activeIssueList.length,
        closed: closedIssues.length,
        issues: {
          open: openIssues,
          active: activeIssueList,
          closed: closedIssues,
        },
      });
    }
  }
}

const mode = sprints.length > 0 ? "issue" : "project";
const queueExhausted = mode === "issue" && totalOpen === 0 && totalActive === 0;

console.log(
  JSON.stringify({
    mode,
    queue_exhausted: queueExhausted,
    active_issues: activeIssues,
    sprints,
    totals: {
      open: totalOpen,
      active: totalActive,
      closed: totalClosed,
    },
  })
);
