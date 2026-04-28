"use client";
import { useRef, useEffect, useMemo } from 'react';
import { tryMergeReactiveHandlers } from '../state/DialogHandlers.js';
import { useDeepMemo } from './useDeepCompare.js';
import { useDialogState } from './useDialogState.js';

/**
 * Keeps live dialog handlers in sync for a key when the dialog was opened without `useDialog`
 * (e.g. utility `open()`), or when you want to push handler overrides from a separate component.
 * Merge `ownerToken` into `open({ ..., ownerToken: ownerToken })` so this hook owns writes.
 */
var useDialogHandlers = function useDialogHandlers(dialogKey, handlers) {
  var ownerTokenRef = useRef(Symbol("dialogist-useDialogHandlers"));
  var dialogRow = useDialogState(dialogKey);
  var stableHandlers = useDeepMemo(function () {
    return handlers;
  }, [handlers]);
  useEffect(function () {
    if (!dialogRow) return;
    tryMergeReactiveHandlers(dialogRow.key, dialogRow.internalId, ownerTokenRef.current, stableHandlers, {
      silent: true
    });
  }, [dialogRow, dialogRow === null || dialogRow === void 0 ? void 0 : dialogRow.internalId, dialogRow === null || dialogRow === void 0 ? void 0 : dialogRow.key, stableHandlers]);
  return useMemo(function () {
    return {
      ownerToken: ownerTokenRef.current
    };
  }, []);
};

export { useDialogHandlers };
//# sourceMappingURL=useDialogHandlers.js.map
