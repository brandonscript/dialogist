type DialogStateSource = "dialog" | "external";
interface DialogStateEntry<T> {
    value: T;
    source: DialogStateSource;
    version: number;
    updatedAt: number;
}
/**
 * Subscribe to a realtime dialog value from the dialog state system.
 *
 * This hook uses React's `useSyncExternalStore` to subscribe to a dialog's state value.
 * State values are out-of-band updates that do NOT cause dialog re-renders, making them ideal
 * for real-time visual updates during user interactions (e.g., dragging a slider).
 *
 * The dialog state system is separate from dialog React state and is designed for high-frequency updates
 * that need to be reflected immediately without triggering dialog content re-renders.
 *
 * @param dialogKey - The dialog identifier
 * @param key - The key for the specific state value within the dialog
 * @param initialValue - Seed value applied only when this store entry is first created (same contract as
 *   `useState(initialValue)`). After that, updates must go through the returned setter; changing `initialValue` on a
 *   later render for the same `dialogKey` + `key` is ignored and emits a dev-only warning.
 * @param sourceFilter - Optional filter: "dialog" (only dialog updates), "external" (only external updates), or "any" (all updates, default)
 * @returns A tuple `[value, setValue]` where:
 *   - `value`: The current live value from the state system (filtered by source if specified)
 *   - `setValue`: Function to update the live value
 */
export declare const useDialogStateValue: <T>(dialogKey: string, key: string, initialValue: T, sourceFilter?: DialogStateSource | "any") => readonly [T, (next: T, source?: DialogStateSource) => DialogStateEntry<T>];
/**
 * Subscribe to the source metadata for a dialog state value.
 *
 * @param initial - Applied only when this store entry is first created. Later changes are ignored (use the setter)
 *   and trigger a dev-only warning for the same `dialogKey` + `key`.
 */
export declare const useDialogStateSource: (dialogKey: string, key: string, initial?: DialogStateSource) => readonly [DialogStateSource, (next: DialogStateSource) => void];
/**
 * Imperatively set a dialog state value and optionally mark its source.
 *
 * @param dialogKey - The dialog identifier
 * @param key - The key for the specific state value
 * @param value - The value to set
 * @param source - Optional source: "dialog" (from dialog interaction) or "external" (external state). If not provided, only the value is updated.
 */
export declare const setDialogStateValue: <T>(dialogKey: string, key: string, value: T, source?: DialogStateSource) => void;
/**
 * Convenience function to set a dialog state value from within a dialog.
 * Automatically marks the source as "dialog".
 */
export declare const setDialogStateValueFromDialog: <T>(dialogKey: string, key: string, value: T) => void;
/**
 * Convenience function to set a dialog state value from external state.
 * Automatically marks the source as "external".
 */
export declare const setDialogStateValueFromExternal: <T>(dialogKey: string, key: string, value: T) => void;
export declare const clearDialogStateValue: (dialogKey: string, key: string) => void;
/**
 * Read a dialog state value without subscribing.
 */
export declare const getDialogStateValue: <T>(dialogKey: string, key: string) => T | undefined;
export type { DialogStateEntry, DialogStateSource };
