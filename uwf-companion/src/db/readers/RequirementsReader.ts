import { BaseReader } from "./BaseReader";

export interface Requirement {
  id: number;
  role: string;
  number: number;
  type: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  source: string | null;
  stage: string | null;
  created_at: string;
  updated_at: string;
}

export class RequirementsReader extends BaseReader {
  constructor(workspaceRoot: string) {
    super(workspaceRoot, "uwf-requirements", "uwf-requirements.db");
  }

  listAll(): Requirement[] {
    return this.all<Requirement>("SELECT * FROM requirements ORDER BY number");
  }

  listByType(type: string): Requirement[] {
    return this.all<Requirement>("SELECT * FROM requirements WHERE type = ? ORDER BY number", type);
  }
}
