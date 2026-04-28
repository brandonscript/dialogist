"use client";

import { useCallback, useSyncExternalStore } from "react";

import { getDialogImperativeHandle, subscribeDialogImperativeHandle } from "../context/DialogImperativeHandles";
import type { DialogKey } from "../types";
import { resolveDialogKey } from "../utils/dialogKey";

export const useDialogImperativeValue = <Handle>(dialogKey: DialogKey) => {
  const rKey = resolveDialogKey(dialogKey);

  const subscribe = useCallback(
    (listener: () => void) => subscribeDialogImperativeHandle(rKey.str, listener),
    [rKey.str],
  );

  const getSnapshot = useCallback(() => getDialogImperativeHandle<Handle>(rKey.str)?.current ?? null, [rKey.str]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
