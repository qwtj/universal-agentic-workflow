import { BaseReader } from "./BaseReader";

export interface Question {
  id: number;
  stage: string | null;
  group_name: string | null;
  question: string;
  proposed: string | null;
  required: number;
  status: string;
  answer: string | null;
  created_at: string;
  answered_at: string | null;
}

export class QuestionsReader extends BaseReader {
  constructor(workspaceRoot: string) {
    super(workspaceRoot, "uwf-question-protocol", "uwf-questions.db");
  }

  listAll(): Question[] {
    return this.all<Question>("SELECT * FROM questions ORDER BY id");
  }

  listOpen(): Question[] {
    return this.all<Question>("SELECT * FROM questions WHERE status = 'open' ORDER BY id");
  }
}
