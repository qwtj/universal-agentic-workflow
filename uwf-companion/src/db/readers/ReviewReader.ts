import { BaseReader } from "./BaseReader";

export interface Review {
  id: number;
  role: string;
  stage: string | null;
  verdict: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Finding {
  id: number;
  review_id: number;
  severity: string;
  status: string;
  file_path: string | null;
  description: string;
  created_at: string;
  updated_at: string;
}

export class ReviewReader extends BaseReader {
  constructor(workspaceRoot: string) {
    super(workspaceRoot, "uwf-review", "uwf-reviews.db");
  }

  listReviews(): Review[] {
    return this.all<Review>("SELECT * FROM reviews ORDER BY id DESC");
  }

  listFindings(reviewId?: number): Finding[] {
    if (reviewId !== undefined) {
      return this.all<Finding>(
        "SELECT * FROM findings WHERE review_id = ? ORDER BY severity",
        reviewId
      );
    }
    return this.all<Finding>("SELECT * FROM findings ORDER BY severity");
  }
}
