import type { DialogKey } from "../types";
/**
 * Subscribe to state changes for a specific dialog key.
 * Only re-renders when the specified dialog's state changes.
 */
export declare const useDialogState: (dialogKey: DialogKey) => import("../types").DialogState | undefined;
/**
 * Check if a specific dialog is open.
 * Only re-renders when the specified dialog opens or closes.
 *
 * Prefer `isOpen` from `useDialog(sameKey)` when you already use that hook.
 */
export declare const useDialogIsOpen: (dialogKey: DialogKey) => boolean;
