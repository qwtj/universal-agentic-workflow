import { BaseReader } from "./BaseReader";

export interface WorkflowState {
  id: number;
  phase: string;
  mode: string;
  status: string;
  current_agent: string | null;
  artifact_path: string | null;
  ready_for_implementation: number;
}

export interface WorkflowHistoryEntry {
  id: number;
  ts: string;
  from_phase: string | null;
  to_phase: string;
  agent: string | null;
  note: string | null;
}

export class WorkflowStateReader extends BaseReader {
  constructor(workspaceRoot: string) {
    super(workspaceRoot, "uwf-state-manager", "uwf-state.db");
  }

  getCurrent(): WorkflowState | null {
    return this.get<WorkflowState>(
      "SELECT * FROM workflow_state ORDER BY id DESC LIMIT 1"
    );
  }

  getHistory(): WorkflowHistoryEntry[] {
    return this.all<WorkflowHistoryEntry>(
      "SELECT * FROM workflow_history ORDER BY ts DESC LIMIT 50"
    );
  }
}
