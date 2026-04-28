"use client";

import type { DialogState } from "../types";
import { dialogKeyStartsWith } from "../utils/dialogKey";

type Listener = () => void;

const KEY_DELIMITER = "::";

/** Fires every registered listener whose subscription key is a segment-aligned prefix of `changedKey`. */
const notifyPrefixListeners = (changedKey: string, listeners: Map<string, Set<Listener>>): void => {
  const parts = changedKey.split(KEY_DELIMITER);
  for (let i = 1; i < parts.length; i++) {
    const prefixKey = parts.slice(0, i).join(KEY_DELIMITER);
    const set = listeners.get(prefixKey);
    if (set) {
      set.forEach((l) => {
        l();
      });
    }
  }
};

class DialogStateStore {
  private dialogs = new Map<string, DialogState>();
  private listeners = new Map<string, Set<Listener>>();
  private globalListeners = new Set<Listener>();
  /** Keys removed by {@link replaceDialogsSnapshotWithoutNotify}; notified on next {@link setDialogs}. */
  private silentRemovePendingNotify = new Set<string>();

  /**
   * Returns the dialog for `key`. Falls back to a dialog whose full key has `key` as a
   * segment-aligned prefix — enabling `useDialogState("checkout-flow")` to resolve when the
   * active dialog is `"checkout-flow::step-1"`.
   *
   * When multiple rows match the same prefix, the **most recently inserted** row wins (aligned
   * with stack / `findLastIndex` semantics elsewhere).
   */
  get(key: string): DialogState | undefined {
    const exact = this.dialogs.get(key);
    if (exact) return exact;
    const entries = [...this.dialogs.entries()];
    for (let i = entries.length - 1; i >= 0; i -= 1) {
      // biome-ignore lint/style/noNonNullAssertion: i is always within bounds of entries
      const [k, v] = entries[i]!;
      if (dialogKeyStartsWith(k, key)) return v;
    }
    return undefined;
  }

  /**
   * Get all dialogs
   */
  getAll(): DialogState[] {
    return Array.from(this.dialogs.values());
  }

  /**
   * Returns `true` when a dialog with `key` (or a composite key prefixed by `key`) is open.
   */
  isOpen(key: string): boolean {
    if (this.dialogs.has(key)) return true;
    for (const k of this.dialogs.keys()) {
      if (dialogKeyStartsWith(k, key)) return true;
    }
    return false;
  }

  /**
   * Replace the in-memory snapshot **without** notifying subscribers. Used from React state
   * updaters that also mutate the handler store so `useSyncExternalStore` cannot observe an open
   * dialog after `clearDialogHandlersRow` in the same synchronous turn (listeners are deferred to
   * {@link setDialogs} in layout).
   */
  replaceDialogsSnapshotWithoutNotify(dialogs: DialogState[]): void {
    const newKeys = new Set(dialogs.map((d) => d.key));
    for (const key of [...this.dialogs.keys()]) {
      if (!newKeys.has(key)) {
        this.silentRemovePendingNotify.add(key);
        this.dialogs.delete(key);
      }
    }
    for (const d of dialogs) {
      this.dialogs.set(d.key, d);
    }
  }

  /**
   * Update all dialogs (called from DialogProvider).
   * When a composite key like `"checkout-flow::step-1"` changes, listeners for the root prefix
   * `"checkout-flow"` are also notified so `useDialogState` / `useDialogIsOpen` work with root keys.
   */
  setDialogs(dialogs: DialogState[]): void {
    if (this.silentRemovePendingNotify.size > 0) {
      for (const key of this.silentRemovePendingNotify) {
        const listeners = this.listeners.get(key);
        if (listeners) {
          listeners.forEach((l) => {
            l();
          });
        }
        notifyPrefixListeners(key, this.listeners);
      }
      this.silentRemovePendingNotify.clear();
    }

    const prevKeys = new Set(this.dialogs.keys());
    const newKeys = new Set(dialogs.map((d) => d.key));

    // Update or add dialogs
    dialogs.forEach((dialog) => {
      const prev = this.dialogs.get(dialog.key);
      this.dialogs.set(dialog.key, dialog);

      if (prev !== dialog) {
        const listeners = this.listeners.get(dialog.key);
        if (listeners) {
          listeners.forEach((l) => {
            l();
          });
        }
        notifyPrefixListeners(dialog.key, this.listeners);
      }
    });

    // Remove dialogs that are no longer in the list
    prevKeys.forEach((key) => {
      if (!newKeys.has(key)) {
        this.dialogs.delete(key);
        const listeners = this.listeners.get(key);
        if (listeners) {
          listeners.forEach((l) => {
            l();
          });
        }
        notifyPrefixListeners(key, this.listeners);
      }
    });

    // Notify global listeners (for scaffolding)
    this.globalListeners.forEach((l) => {
      l();
    });
  }

  /**
   * Subscribe to changes for a specific dialog key
   */
  subscribe(key: string, listener: Listener): () => void {
    let set = this.listeners.get(key);
    if (!set) {
      set = new Set<Listener>();
      this.listeners.set(key, set);
    }
    set.add(listener);
    return () => {
      const s = this.listeners.get(key);
      if (!s) return;
      s.delete(listener);
      if (s.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  /**
   * Subscribe to all dialog changes (for scaffolding only)
   */
  subscribeAll(listener: Listener): () => void {
    this.globalListeners.add(listener);
    return () => {
      this.globalListeners.delete(listener);
    };
  }
}

export const dialogStateStore = new DialogStateStore();
