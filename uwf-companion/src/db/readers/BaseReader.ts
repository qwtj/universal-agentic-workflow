import { DatabaseSync } from "node:sqlite";
import * as path from "path";
import * as fs from "fs";

type SQLParam = string | number | bigint | null | Uint8Array;

export abstract class BaseReader {
  protected db: DatabaseSync | null = null;
  protected readonly dbPath: string;

  constructor(workspaceRoot: string, skillDir: string, dbFile: string) {
    this.dbPath = path.join(
      workspaceRoot,
      ".github",
      "skills",
      skillDir,
      dbFile
    );
  }

  private open(): DatabaseSync {
    if (!this.db) {
      if (!fs.existsSync(this.dbPath)) {
        throw new Error(`Database not found: ${this.dbPath}`);
      }
      this.db = new DatabaseSync(this.dbPath);
      this.db.exec("PRAGMA query_only = true");
    }
    return this.db;
  }

  /** Returns column names for a table by reading PRAGMA table_info at runtime. */
  columns(table: string): string[] {
    const rows = this.all<{ name: string }>(
      `PRAGMA table_info(${table.replace(/[^a-z0-9_]/gi, "")})`
    );
    return rows.map((r) => r.name);
  }

  protected all<T>(sql: string, ...params: SQLParam[]): T[] {
    return this.open().prepare(sql).all(...params) as unknown as T[];
  }

  protected get<T>(sql: string, ...params: SQLParam[]): T | null {
    return (this.open().prepare(sql).get(...params) as unknown as T | undefined) ?? null;
  }

  exists(): boolean {
    return fs.existsSync(this.dbPath);
  }

  close() {
    try { this.db?.close(); } catch { /* already closed */ }
    this.db = null;
  }
}
