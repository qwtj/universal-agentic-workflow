import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { IssuesReader } from "../db/readers/IssuesReader";
import { RequirementsReader } from "../db/readers/RequirementsReader";
import { AdrReader } from "../db/readers/AdrReader";
import { DiscoveryReader } from "../db/readers/DiscoveryReader";
import { ReviewReader } from "../db/readers/ReviewReader";

interface Snapshot {
  issues: ReturnType<IssuesReader["listAll"]>;
  requirements: ReturnType<RequirementsReader["listAll"]>;
  adrs: ReturnType<AdrReader["listAll"]>;
  discoveries: ReturnType<DiscoveryReader["listAll"]>;
  reviews: ReturnType<ReviewReader["listReviews"]>;
  findings: ReturnType<ReviewReader["listFindings"]>;
}

function collectSnapshot(workspaceRoot: string): Snapshot {
  const readers = {
    issues: new IssuesReader(workspaceRoot),
    requirements: new RequirementsReader(workspaceRoot),
    adrs: new AdrReader(workspaceRoot),
    discoveries: new DiscoveryReader(workspaceRoot),
    review: new ReviewReader(workspaceRoot),
  };
  try {
    return {
      issues: readers.issues.exists() ? readers.issues.listAll() : [],
      requirements: readers.requirements.exists() ? readers.requirements.listAll() : [],
      adrs: readers.adrs.exists() ? readers.adrs.listAll() : [],
      discoveries: readers.discoveries.exists() ? readers.discoveries.listAll() : [],
      reviews: readers.review.exists() ? readers.review.listReviews() : [],
      findings: readers.review.exists() ? readers.review.listFindings() : [],
    };
  } finally {
    Object.values(readers).forEach((r) => r.close());
  }
}

function toJson(snap: Snapshot): string {
  return JSON.stringify(snap, null, 2);
}

function toCsv(snap: Snapshot): string {
  const sections: string[] = [];

  const csvRow = (row: Record<string, unknown>) =>
    Object.values(row)
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",");

  for (const [key, rows] of Object.entries(snap) as [string, Record<string, unknown>[]][]) {
    if (!rows.length) continue;
    const headers = Object.keys(rows[0]).join(",");
    sections.push(`## ${key}\n${headers}\n${rows.map(csvRow).join("\n")}`);
  }
  return sections.join("\n\n");
}

export class ReportBuilder {
  static async export(
    workspaceRoot: string,
    format: "json" | "csv"
  ): Promise<void> {
    const snap = collectSnapshot(workspaceRoot);
    const outDir = path.join(workspaceRoot, "tmp", "reports");
    fs.mkdirSync(outDir, { recursive: true });

    const filename = `uwf-report-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-")}.${format}`;
    const outPath = path.join(outDir, filename);
    const content = format === "json" ? toJson(snap) : toCsv(snap);
    fs.writeFileSync(outPath, content, "utf8");

    const uri = vscode.Uri.file(outPath);
    await vscode.window.showTextDocument(uri);
  }
}
