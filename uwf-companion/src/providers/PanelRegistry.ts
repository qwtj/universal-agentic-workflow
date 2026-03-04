/** Collects all open panel refresh callbacks so DbWatcher can notify them. */
export class PanelRegistry {
  private static callbacks: Map<string, (workspaceRoot: string) => void> =
    new Map();

  static register(id: string, fn: (workspaceRoot: string) => void) {
    PanelRegistry.callbacks.set(id, fn);
  }

  static unregister(id: string) {
    PanelRegistry.callbacks.delete(id);
  }

  static refreshAll(workspaceRoot: string) {
    for (const fn of PanelRegistry.callbacks.values()) {
      try { fn(workspaceRoot); } catch { /* panel may have closed */ }
    }
  }
}
