import { BaseReader } from "./BaseReader";

export interface Adr {
  id: number;
  number: number;
  slug: string;
  title: string;
  status: string;
  impact: string | null;
  stage: string | null;
  decision: string | null;
  file_path: string | null;
  superseded_by: string | null;
  created_at: string;
  updated_at: string;
}

export class AdrReader extends BaseReader {
  constructor(workspaceRoot: string) {
    super(workspaceRoot, "uwf-adr", "uwf-adrs.db");
  }

  listAll(): Adr[] {
    return this.all<Adr>("SELECT * FROM adrs ORDER BY number");
  }

  getById(id: number): Adr | null {
    return this.get<Adr>("SELECT * FROM adrs WHERE id = ?", id);
  }
}
