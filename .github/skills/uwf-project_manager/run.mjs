/**
 * UWF project_manager persona — gate enforcement script.
 *
 * Usage (called by the orchestrator agent via terminal):
 *   node .github/skills/uwf-project_manager/run.mjs --list-stages
 *   node .github/skills/uwf-project_manager/run.mjs --check-gate <stageName> [--output-path <path>] [--state-path <path>]
 *
 * Exit codes:  0 = gate passed   1 = gate failed   2 = usage error
 */

import path from "node:path";
import fs from "node:fs";
import {
  runCLI,
  gatePass,
  gateFail,
  requireNonEmptyFile,
  requireFileContains,
  requireFilesWithPrefix,
  requireFileMatchingPattern,
} from "../uwf-orchestration-engine/skill-runner.mjs";

// ---------------------------------------------------------------------------
// Helpers for substantive content validation
// ---------------------------------------------------------------------------

/**
 * Check if a section in a file has substantive content (not placeholders).
 * @param {string} filePath - Path to the file to check
 * @param {string} section - Section name to look for
 * @returns {string|null} Error message if content is missing/placeholder, null if valid
 */
function hasSubstantiveContent(filePath, section) {
  if (!fs.existsSync(filePath)) {
    return `File ${filePath} does not exist`;
  }
  
  const content = fs.readFileSync(filePath, "utf8");
  const regex = new RegExp(`${section}[:\\s]*([^\\n]+)`, "i");
  const match = content.match(regex);
  
  if (!match || !match[1]) {
    return `Section "${section}" not found or has no content`;
  }
  
  const value = match[1].trim();
  const placeholders = ["...", "[TBD]", "[TODO]", "TBD", "TODO", "[assumption]"];
  
  if (value.length === 0) {
    return `Section "${section}" is empty`;
  }
  
  for (const placeholder of placeholders) {
    if (value === placeholder || value.startsWith(placeholder)) {
      return `Section "${section}" contains placeholder value: ${placeholder}`;
    }
  }
  
  return null; // Valid content
}

// ---------------------------------------------------------------------------
// Stage definitions
// ---------------------------------------------------------------------------

const stages = [
  {
    name: "state-init",
    agent: "uwf-core-project-tracking",
    maxRetries: 2,
    onGateFailure: "retry",
    gate(_outputPath, statePath) {
      const failures = [];
      const f1 = requireNonEmptyFile(statePath, "uwf-state.json");
      if (f1) failures.push(f1);
      if (!f1) {
        // Phase must be "intake" or later
        try {
          const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
          if (!state.phase) failures.push("uwf-state.json is missing 'phase' field");
        } catch {
          failures.push("uwf-state.json is not valid JSON");
        }
      }
      return failures.length ? gateFail("state-init", failures) : gatePass("state-init");
    },
  },

  {
    name: "intake",
    agent: "uwf-project_manager-intake",
    maxRetries: 2,
    onGateFailure: "retry",
    gate(outputPath) {
      const failures = [];
      const artifact = path.join(outputPath, "project-intake.md");
      const f1 = requireNonEmptyFile(artifact, "project-intake.md");
      if (f1) {
        failures.push(f1);
      } else {
        // Verify required sections are present AND have substantive content
        for (const section of [
          "Goal",
          "Non-goals",
          "Constraints",
          "Success metrics",
          "Stakeholders",
          "Risk tolerance",
          "Work-breakdown strategy",
        ]) {
          const f = requireFileContains(artifact, section, "project-intake.md");
          if (f) {
            failures.push(f);
          } else {
            // Check that section has substantive content, not just placeholders
            const contentError = hasSubstantiveContent(artifact, section);
            if (contentError) {
              failures.push(contentError);
            }
          }
        }
      }
      return failures.length ? gateFail("intake", failures) : gatePass("intake");
    },
  },

  {
    name: "discovery",
    agent: "uwf-core-discovery",
    maxRetries: 2,
    onGateFailure: "retry",
    gate(outputPath) {
      const failures = [];
      const f1 = requireNonEmptyFile(
        path.join(outputPath, "project-discovery.md"),
        "project-discovery.md"
      );
      if (f1) failures.push(f1);
      return failures.length ? gateFail("discovery", failures) : gatePass("discovery");
    },
  },

  {
    name: "requirements",
    agent: "uwf-core-requirements",
    maxRetries: 2,
    onGateFailure: "retry",
    gate(outputPath) {
      const failures = [];
      const f1 = requireNonEmptyFile(
        path.join(outputPath, "project-requirements.md"),
        "project-requirements.md"
      );
      if (f1) failures.push(f1);
      return failures.length ? gateFail("requirements", failures) : gatePass("requirements");
    },
  },

  {
    // Conditional — auto-passes if no ADRs were recommended.
    name: "adr",
    agent: "uwf-core-adr",
    maxRetries: 2,
    onGateFailure: "retry",
    gate(outputPath) {
      const requirementsPath = path.join(outputPath, "project-requirements.md");
      if (!adrRequired(requirementsPath)) {
        return gatePass("adr"); // PASS — not required
      }
      const failures = [];
      const f1 = requireFilesWithPrefix(
        path.join(process.cwd(), "docs", "adr"),
        "ADR-",
        "ADR-*.md"
      );
      if (f1) failures.push(f1);
      return failures.length ? gateFail("adr", failures) : gatePass("adr");
    },
  },

  {
    // Conditional — auto-passes if project is not security-sensitive.
    name: "security-plan",
    agent: "uwf-core-security-plan",
    maxRetries: 2,
    onGateFailure: "retry",
    gate(outputPath) {
      const requirementsPath = path.join(outputPath, "project-requirements.md");
      if (!securityRequired(requirementsPath)) {
        return gatePass("security-plan"); // PASS — not required
      }
      const failures = [];
      const f1 = requireNonEmptyFile(
        path.join(outputPath, "project-security-plan.md"),
        "project-security-plan.md"
      );
      if (f1) failures.push(f1);
      return failures.length ? gateFail("security-plan", failures) : gatePass("security-plan");
    },
  },

  {
    name: "test-plan",
    agent: "uwf-core-test-planner",
    maxRetries: 2,
    onGateFailure: "retry",
    gate(outputPath) {
      const failures = [];
      const f1 = requireNonEmptyFile(
        path.join(outputPath, "project-test-plan.md"),
        "project-test-plan.md"
      );
      if (f1) failures.push(f1);
      return failures.length ? gateFail("test-plan", failures) : gatePass("test-plan");
    },
  },

  {
    name: "timeline-planning",
    agent: "uwf-project_manager-timeline-planner",
    maxRetries: 2,
    onGateFailure: "retry",
    gate(outputPath) {
      const failures = [];
      const f1 = requireNonEmptyFile(
        path.join(outputPath, "issues-backlog.md"),
        "issues-backlog.md"
      );
      if (f1) failures.push(f1);
      const f2 = requireNonEmptyFile(
        path.join(outputPath, "project-roadmap.md"),
        "project-roadmap.md"
      );
      if (f2) failures.push(f2);
      return failures.length ? gateFail("timeline-planning", failures) : gatePass("timeline-planning");
    },
  },

  {
    // Review fix-loop: maxRetries = max review cycles (3).
    name: "review",
    agent: "uwf-project_manager-reviewer",
    maxRetries: 3,
    onGateFailure: "retry",
    gate(outputPath) {
      const failures = [];
      const reviewPath = path.join(outputPath, "project-review.md");
      const f1 = requireNonEmptyFile(reviewPath, "project-review.md");
      if (f1) {
        failures.push(f1);
      } else {
        const f2 = requireFileContains(reviewPath, "APPROVED", "project-review.md");
        if (f2) failures.push("Reviewer has not yet issued APPROVED status in project-review.md");
      }
      return failures.length ? gateFail("review", failures) : gatePass("review");
    },
  },

  {
    name: "issue-state-population",
    agent: "uwf-core-project-tracking",
    maxRetries: 2,
    onGateFailure: "retry",
    gate() {
      const failures = [];
      const f1 = requireFileMatchingPattern(
        path.join(process.cwd(), "tmp", "state"),
        /\/open\/.*\.md$/,
        "open issue files"
      );
      if (f1) failures.push(f1);
      return failures.length
        ? gateFail("issue-state-population", failures)
        : gatePass("issue-state-population");
    },
  },

  {
    name: "acceptance",
    agent: "uwf-core-acceptance",
    maxRetries: 2,
    onGateFailure: "retry",
    gate(outputPath) {
      const failures = [];
      const f1 = requireNonEmptyFile(
        path.join(outputPath, "project-acceptance.md"),
        "project-acceptance.md"
      );
      if (f1) failures.push(f1);
      return failures.length ? gateFail("acceptance", failures) : gatePass("acceptance");
    },
  },

  {
    name: "close",
    agent: "uwf-core-project-tracking",
    maxRetries: 1,
    onGateFailure: "abort",
    gate(_outputPath, statePath) {
      const failures = [];
      const f1 = requireNonEmptyFile(statePath, "uwf-state.json");
      if (f1) failures.push(f1);
      return failures.length ? gateFail("close", failures) : gatePass("close");
    },
  },

  {
    name: "retro",
    agent: "uwf-core-retro",
    maxRetries: 1,
    onGateFailure: "skip",
    gate() {
      return gatePass("retro"); // optional
    },
  },
];

// ---------------------------------------------------------------------------
// Helpers for conditional gates
// ---------------------------------------------------------------------------

function adrRequired(requirementsPath) {
  if (!fs.existsSync(requirementsPath)) return false;
  return fs.readFileSync(requirementsPath, "utf8").includes("ADR:");
}

function securityRequired(requirementsPath) {
  if (!fs.existsSync(requirementsPath)) return false;
  const content = fs.readFileSync(requirementsPath, "utf8");
  return (
    content.includes("security-sensitive: true") ||
    content.includes("SECURITY:") ||
    content.includes("security: true")
  );
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
runCLI(stages);
