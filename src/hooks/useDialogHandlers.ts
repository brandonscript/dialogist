"use client";

import { useEffect, useMemo, useRef } from "react";

import type { ReactiveDialogHandlers } from "../state/DialogHandlers";
import { tryMergeReactiveHandlers } from "../state/DialogHandlers";
import type { DialogKey } from "../types";

import { useDeepMemo } from "./useDeepCompare";
import { useDialogState } from "./useDialogState";

/**
 * Keeps live dialog handlers in sync for a key when the dialog was opened without `useDialog`
 * (e.g. utility `open()`), or when you want to push handler overrides from a separate component.
 * Merge `ownerToken` into `open({ ..., ownerToken: ownerToken })` so this hook owns writes.
 */
export const useDialogHandlers = (dialogKey: DialogKey, handlers: Partial<ReactiveDialogHandlers>) => {
  const ownerTokenRef = useRef(Symbol("dialogist-useDialogHandlers"));
  const dialogRow = useDialogState(dialogKey);
  const stableHandlers = useDeepMemo(() => handlers, [handlers]);

  useEffect(() => {
    if (!dialogRow) return;
    tryMergeReactiveHandlers(
      dialogRow.key,
      dialogRow.internalId,
      ownerTokenRef.current,
      stableHandlers as ReactiveDialogHandlers,
      {
        silent: true,
      },
    );
  }, [dialogRow, dialogRow?.internalId, dialogRow?.key, stableHandlers]);

  return useMemo(() => ({ ownerToken: ownerTokenRef.current }), []);
};
