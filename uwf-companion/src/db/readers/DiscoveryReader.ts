import { BaseReader } from "./BaseReader";

export interface Discovery {
  id: number;
  role: string;
  stage: string | null;
  category: string;
  title: string;
  description: string | null;
  evidence: string | null;
  impact: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export class DiscoveryReader extends BaseReader {
  constructor(workspaceRoot: string) {
    super(workspaceRoot, "uwf-discovery", "uwf-discoveries.db");
  }

  listAll(): Discovery[] {
    return this.all<Discovery>("SELECT * FROM discoveries ORDER BY id");
  }

  listGaps(): Discovery[] {
    return this.all<Discovery>(
      "SELECT * FROM discoveries WHERE category = 'gap' AND status = 'open' ORDER BY impact DESC"
    );
  }
}
