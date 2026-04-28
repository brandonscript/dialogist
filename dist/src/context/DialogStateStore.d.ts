import type { DialogState } from "../types";
type Listener = () => void;
declare class DialogStateStore {
    private dialogs;
    private listeners;
    private globalListeners;
    /** Keys removed by {@link replaceDialogsSnapshotWithoutNotify}; notified on next {@link setDialogs}. */
    private silentRemovePendingNotify;
    /**
     * Returns the dialog for `key`. Falls back to a dialog whose full key has `key` as a
     * segment-aligned prefix — enabling `useDialogState("checkout-flow")` to resolve when the
     * active dialog is `"checkout-flow::step-1"`.
     *
     * When multiple rows match the same prefix, the **most recently inserted** row wins (aligned
     * with stack / `findLastIndex` semantics elsewhere).
     */
    get(key: string): DialogState | undefined;
    /**
     * Get all dialogs
     */
    getAll(): DialogState[];
    /**
     * Returns `true` when a dialog with `key` (or a composite key prefixed by `key`) is open.
     */
    isOpen(key: string): boolean;
    /**
     * Replace the in-memory snapshot **without** notifying subscribers. Used from React state
     * updaters that also mutate the handler store so `useSyncExternalStore` cannot observe an open
     * dialog after `clearDialogHandlersRow` in the same synchronous turn (listeners are deferred to
     * {@link setDialogs} in layout).
     */
    replaceDialogsSnapshotWithoutNotify(dialogs: DialogState[]): void;
    /**
     * Update all dialogs (called from DialogProvider).
     * When a composite key like `"checkout-flow::step-1"` changes, listeners for the root prefix
     * `"checkout-flow"` are also notified so `useDialogState` / `useDialogIsOpen` work with root keys.
     */
    setDialogs(dialogs: DialogState[]): void;
    /**
     * Subscribe to changes for a specific dialog key
     */
    subscribe(key: string, listener: Listener): () => void;
    /**
     * Subscribe to all dialog changes (for scaffolding only)
     */
    subscribeAll(listener: Listener): () => void;
}
export declare const dialogStateStore: DialogStateStore;
export {};
