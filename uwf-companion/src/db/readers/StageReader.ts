import { BaseReader } from "./BaseReader";

export interface Stage {
  id: number;
  workflow: string;
  stage: string;
  status: string;
  retry_count: number;
  run_as_subagent: number;
  started_at: string | null;
  completed_at: string | null;
  gate_result: string | null;
  notes: string | null;
}

export class StageReader extends BaseReader {
  constructor(workspaceRoot: string) {
    super(workspaceRoot, "uwf-orchestration-engine", "uwf-stages.db");
  }

  listAll(): Stage[] {
    return this.all<Stage>("SELECT * FROM stage_runs ORDER BY id");
  }

  listByWorkflow(workflow: string): Stage[] {
    return this.all<Stage>("SELECT * FROM stage_runs WHERE workflow = ? ORDER BY id", workflow);
  }
}
