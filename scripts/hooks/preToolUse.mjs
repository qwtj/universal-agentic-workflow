import fs from "node:fs";

function out(obj) {
  process.stdout.write(JSON.stringify(obj));
}

function deny(reason, additionalContext) {
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
      additionalContext: additionalContext ?? reason
    }
  };
}

function ask(reason, additionalContext) {
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: reason,
      additionalContext: additionalContext ?? reason
    }
  };
}

function allow(additionalContext) {
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      permissionDecisionReason: "Allowed by UWF policy",
      additionalContext: additionalContext ?? "Proceed."
    }
  };
}

const inputRaw = fs.readFileSync(0, "utf8");
let input;
try {
  input = JSON.parse(inputRaw);
} catch {
  out({
    continue: true,
    systemMessage:
      "UWF hook warning: could not parse hook JSON input; not enforcing guardrails."
  });
  process.exit(0);
}

const toolName = String(input.tool_name ?? "");
const toolInput = input.tool_input ?? {};
const toolInputStr = JSON.stringify(toolInput).toLowerCase();

// 1) Block obviously destructive terminal commands
if (toolName === "runInTerminal" || toolName.toLowerCase().includes("terminal")) {
  const blocked = [
    "rm -rf",
    "mkfs",
    "dd if=",
    "shutdown",
    "reboot",
    "format ",
    "diskpart",
    "drop table",
    "truncate table",
    "delete from",
    "curl | sh",
    "wget | sh"
  ];
  if (blocked.some((s) => toolInputStr.includes(s))) {
    out(
      deny(
        "Blocked potentially destructive command by UWF policy.",
        "If you truly intend this, run it manually outside agent mode."
      )
    );
    process.exit(0);
  }
}

// 2) Require confirmation for edits in sensitive directories
if (toolName === "editFiles" || toolName === "createFile" || toolName === "createDirectory") {
  const sensitive = [
    "/.github/",
    "/.vscode/",
    "/infra/prod",
    "/terraform/prod",
    "/k8s/prod"
  ];
  if (sensitive.some((p) => toolInputStr.includes(p))) {
    out(
      ask(
        "Sensitive path change requires explicit confirmation.",
        "Review the diff carefully before allowing changes."
      )
    );
    process.exit(0);
  }
}

// Default: allow
out(allow());
