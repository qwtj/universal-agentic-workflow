/**
 * UWF sw_dev persona — gate enforcement script.
 *
 * Usage (called by the orchestrator agent via terminal):
 *   node .github/skills/uwf-sw_dev/run.mjs --list-stages
 *   node .github/skills/uwf-sw_dev/run.mjs --check-gate <stageName> [--output-path <path>] [--state-path <path>]
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
// Stage definitions
// ---------------------------------------------------------------------------
// Each stage maps 1-to-1 with a row in SKILL.md's Stage Sequence table.
// `gate` receives the resolved outputPath and statePath at check time.
// ---------------------------------------------------------------------------

const stages = [
  {
    name: "queue-prep",
    agent: "uwf-core-project-tracking",
    maxRetries: 2,
    onGateFailure: "retry",
    gate(outputPath, statePath) {
      const failures = [];
      const f = requireNonEmptyFile(statePath, "uwf-state.json");
      if (f) failures.push(f);
      return failures.length ? gateFail("queue-prep", failures) : gatePass("queue-prep");
    },
  },

  {
    name: "intake",
    agent: "uwf-sw_dev-intake",
    maxRetries: 2,
    onGateFailure: "retry",
    gate(outputPath) {
      const failures = [];
      const artifact = path.join(outputPath, "issues-intake.md");
      const f1 = requireNonEmptyFile(artifact, "issues-intake.md");
      if (f1) failures.push(f1);
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
      const f1 = requireNonEmptyFile(path.join(outputPath, "issues-discovery.md"), "issues-discovery.md");
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
      const f1 = requireNonEmptyFile(path.join(outputPath, "issues-requirements.md"), "issues-requirements.md");
      if (f1) failures.push(f1);
      return failures.length ? gateFail("requirements", failures) : gatePass("requirements");
    },
  },

  {
    // Conditional — gate auto-passes if ADRs were not recommended.
    // The agent records intent in issues-requirements.md with "ADR:" marker.
    name: "adr",
    agent: "uwf-core-adr",
    maxRetries: 2,
    onGateFailure: "retry",
    gate(outputPath) {
      const requirementsPath = path.join(outputPath, "issues-requirements.md");
      // If requirements don't flag ADR need, treat as not required.
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
    // Conditional — gate auto-passes if issue is not security-sensitive.
    name: "security-plan",
    agent: "uwf-core-security-plan",
    maxRetries: 2,
    onGateFailure: "retry",
    gate(outputPath) {
      const requirementsPath = path.join(outputPath, "issues-requirements.md");
      if (!securityRequired(requirementsPath)) {
        return gatePass("security-plan"); // PASS — not required
      }
      const failures = [];
      const f1 = requireNonEmptyFile(
        path.join(outputPath, "issues-security-plan.md"),
        "issues-security-plan.md"
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
      const f1 = requireNonEmptyFile(path.join(outputPath, "issues-test-plan.md"), "issues-test-plan.md");
      if (f1) failures.push(f1);
      return failures.length ? gateFail("test-plan", failures) : gatePass("test-plan");
    },
  },

  {
    name: "work-plan",
    agent: "uwf-sw_dev-work-planner",
    maxRetries: 2,
    onGateFailure: "retry",
    gate(outputPath) {
      const failures = [];
      const f1 = requireNonEmptyFile(path.join(outputPath, "issues-plan.md"), "issues-plan.md");
      if (f1) failures.push(f1);
      return failures.length ? gateFail("work-plan", failures) : gatePass("work-plan");
    },
  },

  {
    name: "implementation",
    agent: "uwf-issue-implementer",
    maxRetries: 1,
    onGateFailure: "retry",
    gate(outputPath) {
      // Implementation gate: work plan must still exist (not deleted mid-run)
      // and at least one source file must have been modified (checked via
      // the reviewer artifact in the next stage, not here).
      const failures = [];
      const f1 = requireNonEmptyFile(path.join(outputPath, "issues-plan.md"), "issues-plan.md");
      if (f1) failures.push(f1);
      return failures.length ? gateFail("implementation", failures) : gatePass("implementation");
    },
  },

  {
    // Review fix-loop: maxRetries encodes the maximum review cycles (3).
    name: "review",
    agent: "uwf-sw_dev-reviewer",
    maxRetries: 3,
    onGateFailure: "retry",
    gate(outputPath) {
      const failures = [];
      const reviewPath = path.join(outputPath, "issues-review.md");
      const f1 = requireNonEmptyFile(reviewPath, "issues-review.md");
      if (f1) {
        failures.push(f1);
      } else {
        // Gate passes only when reviewer explicitly records a clean bill.
        const f2 = requireFileContains(reviewPath, "APPROVED", "issues-review.md");
        if (f2) failures.push("Reviewer has not yet issued APPROVED status in issues-review.md");
      }
      return failures.length ? gateFail("review", failures) : gatePass("review");
    },
  },

  {
    name: "technical-writing",
    agent: "uwf-core-technical-writer",
    maxRetries: 1,
    onGateFailure: "abort",
    gate() {
      // Technical writer is best-effort; always passes after agent returns.
      return gatePass("technical-writing");
    },
  },

  {
    name: "acceptance",
    agent: "uwf-core-acceptance",
    maxRetries: 2,
    onGateFailure: "retry",
    gate(outputPath) {
      const failures = [];
      const f1 = requireNonEmptyFile(path.join(outputPath, "issues-acceptance.md"), "issues-acceptance.md");
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
      // State file must still exist after closing.
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
      // Retro is optional; always passes.
      return gatePass("retro");
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
