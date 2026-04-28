"use client";
import { useCallback, useSyncExternalStore } from 'react';
import { dialogStateStore } from '../context/DialogStateStore.js';
import { resolveDialogKey } from '../utils/dialogKey.js';

/**
 * Subscribe to state changes for a specific dialog key.
 * Only re-renders when the specified dialog's state changes.
 */
var useDialogState = function useDialogState(dialogKey) {
  var rKey = resolveDialogKey(dialogKey);
  var subscribe = useCallback(function (listener) {
    if (!rKey.str) return function () {
      return undefined;
    };
    return dialogStateStore.subscribe(rKey.str, listener);
  }, [rKey.str]);
  var getSnapshot = useCallback(function () {
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
var useDialogIsOpen = function useDialogIsOpen(dialogKey) {
  var dialog = useDialogState(dialogKey);
  return dialog !== undefined;
};

export { useDialogIsOpen, useDialogState };
//# sourceMappingURL=useDialogState.js.map
