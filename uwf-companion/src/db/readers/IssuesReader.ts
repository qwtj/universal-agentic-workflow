import { BaseReader } from "./BaseReader";

export interface Issue {
  id: string;
  title: string;
  status: string;
  phase: string | null;
  milestone: string | null;
  sprint: string | null;
  description: string | null;
  assigned_agent: string | null;
  risk: string | null;
  unknowns: string | null;
  depends_on: string | null;
  parallel: number;
  comments: string | null;
  created_at: string;
  updated_at: string;
}

export class IssuesReader extends BaseReader {
  constructor(workspaceRoot: string) {
    super(workspaceRoot, "uwf-local-tracking", "uwf-issues.db");
  }

  listAll(): Issue[] {
    return this.all<Issue>("SELECT * FROM issues ORDER BY id");
  }

  listByStatus(status: string): Issue[] {
    return this.all<Issue>("SELECT * FROM issues WHERE status = ? ORDER BY id", status);
  }

  getById(id: string): Issue | null {
    return this.get<Issue>("SELECT * FROM issues WHERE id = ?", id);
  }
}
