import { useEffect, useMemo, useState } from "react";

const RESET_EVENT = "dialogist:external-state-reset-all";
const CHANGE_EVENT = "dialogist:external-state-change";

type ResetDetail = Record<string, never>;

interface ChangeDetail {
  dialogId: string;
  hasChanges: boolean;
}

export const emitExternalStateResetAll = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ResetDetail>(RESET_EVENT));
}

export const useExternalStateResetAll = (handler: () => void) => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const listener = () => handler();
    window.addEventListener(RESET_EVENT, listener);
    return () => {
      window.removeEventListener(RESET_EVENT, listener);
    };
  }, [handler]);
}

export const emitExternalStateChange = (dialogId: string, hasChanges: boolean) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ChangeDetail>(CHANGE_EVENT, { detail: { dialogId, hasChanges } }));
}

export const useHasDirtyExternalState = (): boolean => {
  const [dirtyMap, setDirtyMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<ChangeDetail>).detail;
      if (!detail) return;
      setDirtyMap((prev) => {
        if (prev[detail.dialogId] === detail.hasChanges) return prev;
        return { ...prev, [detail.dialogId]: detail.hasChanges };
      });
    };
    window.addEventListener(CHANGE_EVENT, listener as EventListener);
    return () => {
      window.removeEventListener(CHANGE_EVENT, listener as EventListener);
    };
  }, []);

  return useMemo(() => Object.values(dirtyMap).some(Boolean), [dirtyMap]);
}
