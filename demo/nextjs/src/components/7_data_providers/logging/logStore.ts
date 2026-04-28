"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

export type ExternalStateLogEntry = {
  id: string;
  dialogId: string;
  sor: "dialog" | "external";
  timestamp: number;
  change?: string;
};

type Listener = () => void;

const logMap = new Map<string, ExternalStateLogEntry[]>();
const EMPTY_ENTRIES: ExternalStateLogEntry[] = [];
const listeners = new Set<Listener>();
const schedule = (cb: () => void) => {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (fn: IdleRequestCallback) => number }).requestIdleCallback(() => cb());
  } else {
    setTimeout(cb, 0);
  }
};

const notify = () => {
  listeners.forEach((listener) => {
    listener();
  });
};

export const appendExternalStateLog = (dialogId: string, entry: Omit<ExternalStateLogEntry, "id" | "dialogId">) => {
  schedule(() => {
    const nextEntry: ExternalStateLogEntry = {
      ...entry,
      dialogId,
      id: `${dialogId}-${entry.timestamp}-${Math.random()}`,
    };
    const current = logMap.get(dialogId) ?? [];
    const updated = [...current, nextEntry].slice(-50);
    logMap.set(dialogId, updated);
    notify();
  });
};

export const clearExternalStateLogs = (dialogId: string) => {
  schedule(() => {
    logMap.delete(dialogId);
    notify();
  });
};

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = (dialogId: string): ExternalStateLogEntry[] => {
  return logMap.get(dialogId) ?? EMPTY_ENTRIES;
};

export const useExternalStateLogs = (dialogId: string): ExternalStateLogEntry[] => {
  const serverSnapshotRef = useRef<ExternalStateLogEntry[] | null>(null);

  if (serverSnapshotRef.current === null) {
    serverSnapshotRef.current = getSnapshot(dialogId);
  }

  useEffect(() => {
    serverSnapshotRef.current = getSnapshot(dialogId);
  }, [dialogId]);

  const getClientSnapshot = useCallback(() => getSnapshot(dialogId), [dialogId]);
  const getServerSnapshot = useCallback(() => serverSnapshotRef.current ?? getSnapshot(dialogId), [dialogId]);

  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
};
