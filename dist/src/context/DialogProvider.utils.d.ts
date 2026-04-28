import type { DialogOpenConfig, DialogState, DialogStoredConfig } from "../types";
/** Same-key open comparison: `onConflict` (conflict policy) on the config must not force a content update by itself. */
export declare const stripOnConflictForComparison: (config: DialogOpenConfig | DialogStoredConfig) => DialogOpenConfig | DialogStoredConfig;
/**
 * Helper function to determine if a dialog should be updated when opened with the same ID.
 *
 * Comparison logic:
 * 1. If no deps specified - performs deep comparison on entire config
 * 2. If deps specified - compares props (always) and specified dependencies
 * 3. For actionsDeps - supports nested arrays for per-action dependencies
 *
 * @param oldConfig - The existing dialog configuration
 * @param newConfig - The new dialog configuration to compare against
 * @returns true if dialog should update, false if no update needed
 */
export declare const shouldDialogUpdate: (oldConfig: DialogOpenConfig | DialogStoredConfig, newConfig: DialogOpenConfig | DialogStoredConfig) => boolean;
/**
 * Get the currently active (topmost) dialog ID from the dialog stack.
 *
 * @param dialogs - Array of current dialog states
 * @returns The ID of the active dialog, or null if no dialogs are open
 */
export declare const getActiveDialogKey: (dialogs: DialogState[]) => string | null;
