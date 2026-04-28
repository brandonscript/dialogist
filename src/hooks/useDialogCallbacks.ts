"use client";

import { useCallback, useMemo, useRef } from "react";

import type {
  DialogCallbackRegistration,
  DialogCallbacks,
  DialogCallbacksTriggerFn,
  DialogCloseEvent,
} from "../types/callbacks";

export const useDialogCallbacks = (): DialogCallbackRegistration & { trigger: DialogCallbacksTriggerFn } => {
  const callbacksRef = useRef<DialogCallbacks>({
    willOpen: [],
    didOpen: [],
    willClose: [],
    didClose: [],
    didCancel: [],
    busy: [],
    custom: {},
  });

  // Register callback functions
  const willOpen = useCallback((callback: () => void) => {
    callbacksRef.current.willOpen.push(callback);
    return () => {
      const index = callbacksRef.current.willOpen.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.willOpen.splice(index, 1);
      }
    };
  }, []);

  const didOpen = useCallback((callback: () => void) => {
    callbacksRef.current.didOpen.push(callback);
    return () => {
      const index = callbacksRef.current.didOpen.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.didOpen.splice(index, 1);
      }
    };
  }, []);

  const willClose = useCallback((callback: (event: DialogCloseEvent) => void) => {
    callbacksRef.current.willClose.push(callback);
    return () => {
      const index = callbacksRef.current.willClose.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.willClose.splice(index, 1);
      }
    };
  }, []);

  const didClose = useCallback((callback: (event: DialogCloseEvent) => void) => {
    callbacksRef.current.didClose.push(callback);
    return () => {
      const index = callbacksRef.current.didClose.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.didClose.splice(index, 1);
      }
    };
  }, []);

  const didCancel = useCallback((callback: (event: DialogCloseEvent) => void) => {
    callbacksRef.current.didCancel.push(callback);
    return () => {
      const index = callbacksRef.current.didCancel.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.didCancel.splice(index, 1);
      }
    };
  }, []);

  const busy = useCallback((callback: () => void) => {
    callbacksRef.current.busy.push(callback);
    return () => {
      const index = callbacksRef.current.busy.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.busy.splice(index, 1);
      }
    };
  }, []);

  const trigger = useCallback<DialogCallbacksTriggerFn>(
    (event: Exclude<keyof DialogCallbacks, "custom">, closeEvent?: DialogCloseEvent) => {
      (callbacksRef.current[event] as ((...args: unknown[]) => void)[]).forEach((callback) => {
        try {
          if (event === "willClose" || event === "didClose" || event === "didCancel") {
            if (closeEvent === undefined) {
              throw new Error(`[Dialogist] callbacks.trigger("${event}") requires a closeEvent argument`);
            }
            (callback as (e: DialogCloseEvent) => void)(closeEvent);
          } else {
            (callback as () => void)();
          }
        } catch (error) {
          console.error(`Error in dialog ${event} callback:`, error);
        }
      });
    },
    [],
  );

  // Memoize the returned object to prevent recreating it every render
  return useMemo(
    () => ({
      willOpen,
      didOpen,
      willClose,
      didClose,
      didCancel,
      busy,
      trigger,
      on: (dialogKey: string, event: string, handler: (payload?: unknown) => void) => {
        callbacksRef.current.custom[dialogKey] ||= {};
        const byDialog = callbacksRef.current.custom[dialogKey];
        byDialog[event] ||= new Set();
        const set = byDialog[event];
        set.add(handler);
        return () => {
          set.delete(handler);
          if (set.size === 0) delete byDialog[event];
        };
      },
      off: (dialogKey: string, event: string, handler: (payload?: unknown) => void) => {
        const byDialog = callbacksRef.current.custom[dialogKey];
        if (!byDialog) return;
        const set = byDialog[event];
        if (!set) return;
        set.delete(handler);
        if (set.size === 0) delete byDialog[event];
      },
      emit: (dialogKey: string, event: string, payload?: unknown) => {
        const set = callbacksRef.current.custom[dialogKey]?.[event];
        if (!set) return;
        for (const fn of Array.from(set)) {
          try {
            fn(payload);
          } catch (err) {
            console.error("Dialog custom event handler error:", err);
          }
        }
      },
    }),
    [willOpen, didOpen, willClose, didClose, didCancel, busy, trigger],
  );
};
