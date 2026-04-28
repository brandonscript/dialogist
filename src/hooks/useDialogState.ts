"use client";

import { useCallback, useSyncExternalStore } from "react";

import { dialogStateStore } from "../context/DialogStateStore";
import type { DialogKey } from "../types";
import { resolveDialogKey } from "../utils/dialogKey";

/**
 * Subscribe to state changes for a specific dialog key.
 * Only re-renders when the specified dialog's state changes.
 */
export const useDialogState = (dialogKey: DialogKey) => {
  const rKey = resolveDialogKey(dialogKey);

  const subscribe = useCallback(
    (listener: () => void) => {
      if (!rKey.str) return () => undefined;
      return dialogStateStore.subscribe(rKey.str, listener);
    },
    [rKey.str],
  );

  const getSnapshot = useCallback(() => {
    if (!rKey.str) return undefined;
    return dialogStateStore.get(rKey.str);
  }, [rKey.str]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

/**
 * Check if a specific dialog is open.
 * Only re-renders when the specified dialog opens or closes.
 *
 * Prefer `isOpen` from `useDialog(sameKey)` when you already use that hook.
 */
export const useDialogIsOpen = (dialogKey: DialogKey): boolean => {
  const dialog = useDialogState(dialogKey);
  return dialog !== undefined;
};
