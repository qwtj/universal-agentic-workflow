import * as vscode from "vscode";

type RefreshCallback = () => void;
const DEBOUNCE_MS = 300;

export class DbWatcher {
  private watchers: vscode.FileSystemWatcher[] = [];
  private callbacks: RefreshCallback[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Watch all DB files and their WAL companions under the workspace-root .github/skills
    for (const pattern of [
      ".github/skills/**/*.db",
      ".github/skills/**/*.db-wal",
    ]) {
      const w = vscode.workspace.createFileSystemWatcher(pattern);
      const handler = () => this.scheduleRefresh();
      w.onDidChange(handler);
      w.onDidCreate(handler);
      w.onDidDelete(handler);
      this.watchers.push(w);
    }
  }

  onRefresh(cb: RefreshCallback) {
    this.callbacks.push(cb);
  }

  private scheduleRefresh() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.callbacks.forEach((cb) => cb());
    }, DEBOUNCE_MS);
  }

  dispose() {
    this.watchers.forEach((w) => w.dispose());
    if (this.timer) clearTimeout(this.timer);
  }
}
