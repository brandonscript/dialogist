"use client";

import { createRef, type ReactNode, type RefObject, useCallback, useContext, useEffect, useMemo, useRef } from "react";

import { useDialogActionsContext } from "./context/DialogActionsContext";
import { DialogCallbacksContext } from "./context/DialogCallbacksContext";
import {
  clearDialogImperativeHandle,
  getDialogImperativeHandle,
  registerDialogImperativeHandle,
} from "./context/DialogImperativeHandles";
import {
  type DialogSlot as DialogSlotRegistration,
  type SlotType,
  useDialogSlotRegistry,
} from "./context/DialogSlotRegistry";
import { dialogStateStore } from "./context/DialogStateStore";
import { useDialogState } from "./hooks/useDialogState";
import { useShallowEffect } from "./hooks/useShallowEffect";
import {
  extractReactiveHandlersFromConfig,
  getReactiveHandlersSnapshot,
  hasDialogHandlersRow,
  type ReactiveDialogHandlers,
  seedDialogHandlers,
  tryClearReactiveHandlers,
  tryMergeReactiveHandlers,
} from "./state/DialogHandlers";
import type {
  DialogCloseEvent,
  DialogConfig,
  DialogConfigWithTypedMessage,
  DialogKey,
  DialogKeyArray,
  DialogOpenConfig,
  DialogPartContent,
  UseDialogEmit,
  UseDialogOff,
  UseDialogOn,
} from "./types";
import { evaluateDialogCanClose } from "./utils/dialogCanClose";
import { type DialogKeyObject, dialogKeyArrayEquals, resolveDialogKey } from "./utils/dialogKey";

export type DependencyArray = ReadonlyArray<unknown>;

export interface DialogDeps {
  // Observable objects that can trigger updates to different parts of the dialog
  contentDeps?: DependencyArray;
  actionsDeps?: DependencyArray[]; // Nested array - each action can have its own deps
  titleDeps?: DependencyArray;
  statusBarDeps?: DependencyArray;
  footerDeps?: DependencyArray;
}

type RegistryRefType = Map<string, Map<string, Set<(payload?: unknown) => void>>>;
type ImperativeHandleRefType<Handle = unknown> = RefObject<Handle | null> | null;

/**
 * Hook for opening and controlling dialogs.
 *
 * @template TResolveValue - Default type for resolveValue when the dialog closes via an action.
 * Use dialog.open<T>() to override per-call, or useDialog<T>() to set a default for this dialog.
 * @template TActionId - Union of custom action ids. Default (never) = built-in "ok" | "cancel" only. Specify e.g. "draft" | "delete" to add custom ids.
 *
 * Includes `isOpen`: true when a dialog with this key is on the stack. Use `useDialogIsOpen(key)` only when you need that without the rest of the API.
 */
export const useDialog = <TResolveValue = unknown, TActionId extends string = never>(
  key?: DialogKey,
  initialConfig?: Partial<DialogConfig>,
  deps?: DialogDeps,
) => {
  // Intentionally do not autogenerate here: useDialog() without a key should require
  // key input at open-time (or via config), not silently create a default identity.
  const initialResolvedKey = key === undefined ? undefined : resolveDialogKey(key);
  const initialResolvedKeyRef = useRef<DialogKeyObject | undefined>(initialResolvedKey);
  const { openDialog, closeDialog, closeAllDialogs, replaceDialog } = useDialogActionsContext();
  // Use context if available; otherwise fall back to a local registry so hooks can work outside provider
  const ctx = useContext(DialogCallbacksContext);
  // Subscribe only to this specific dialog's state (prevents re-renders when other dialogs change)
  // If no key provided, use a placeholder that won't match any real dialog
  const dialogState = useDialogState(key ?? "");
  const slotRegistry = useDialogSlotRegistry();
  const localRegistryRef = useRef<RegistryRefType>(new Map());
  const fallbackImperativeHandleRef = useRef<ImperativeHandleRefType<unknown>>(createRef());
  const registeredImperativeHandleRef = useRef<ImperativeHandleRefType<unknown>>(null);

  // Persist initial config and deps to avoid recreating callbacks when callers pass inline objects
  const initialConfigRef = useRef<Partial<DialogConfig> | undefined>(initialConfig);
  const depsRef = useRef<DialogDeps | undefined>(deps);
  const defaultThrottleMsRef = useRef<number | undefined>(getLiveThrottleMs(initialConfigRef.current));

  // Flow Controller state: track which dialog this hook instance is currently managing
  const activeKeyRef = useRef<DialogKeyObject | undefined>(initialResolvedKey);

  const getCurrentKeyStr = useCallback(
    (): string | undefined => activeKeyRef.current?.str ?? initialResolvedKeyRef.current?.str,
    [],
  );

  // History tracking for next/back navigation - stores full configs
  const historyRef = useRef<DialogOpenConfig[]>([]);
  const lastOpenConfigRef = useRef<DialogOpenConfig | null>(null);
  const handlersOwnerRef = useRef(Symbol("dialogist-useDialog-handlers"));

  // Keep refs in sync when callers change initial config or deps (e.g., HMR / live edits)
  // Use shallow comparison since initialConfig and deps are objects/arrays that may be recreated
  useShallowEffect(() => {
    if (initialConfig !== undefined) {
      initialConfigRef.current = initialConfig;
      defaultThrottleMsRef.current = getLiveThrottleMs(initialConfig);
    }
  }, [initialConfig]);

  useShallowEffect(() => {
    if (deps !== undefined) {
      depsRef.current = deps;
    }
  }, [deps]);

  useEffect(() => {
    initialResolvedKeyRef.current = initialResolvedKey;
  }, [initialResolvedKey]);

  const mergeWithInitialConfig = useCallback((...configs: Array<Partial<DialogConfig> | undefined>) => {
    const base = { ...initialConfigRef.current };
    for (const cfg of configs) {
      if (cfg) {
        Object.assign(base, cfg);
      }
    }
    return base;
  }, []);

  const resolveDialogKeySegments = useCallback(
    (
      keyOrConfig?: DialogKey | Partial<DialogConfig>,
      config?: Partial<DialogConfig>,
      fallbackKey?: DialogKeyObject,
    ) => {
      let rKey: DialogKeyObject | undefined;
      let mergedConfig: Partial<DialogConfig>;

      if (keyOrConfig === undefined) {
        rKey = fallbackKey ?? initialResolvedKeyRef.current;
        mergedConfig = mergeWithInitialConfig(config);
      } else if (Array.isArray(keyOrConfig) || typeof keyOrConfig === "string" || typeof keyOrConfig === "number") {
        rKey = resolveDialogKey(keyOrConfig as DialogKey);
        mergedConfig = mergeWithInitialConfig(config);
      } else {
        const configObj = keyOrConfig as Partial<DialogConfig>;
        rKey =
          (configObj.dialogKey === undefined
            ? undefined
            : resolveDialogKey(configObj.dialogKey as DialogConfig["dialogKey"])) ??
          fallbackKey ??
          initialResolvedKeyRef.current;
        mergedConfig = mergeWithInitialConfig(configObj, config);
      }

      if (!rKey) {
        throw new Error(
          "[Dialogist] useDialog: Unable to resolve dialogKey. Provide a key to useDialog() or pass it to open().",
        );
      }

      return { rKey, mergedConfig };
    },
    [mergeWithInitialConfig],
  );

  const buildDialogConfig = useCallback(
    (keySegments: DialogKeyArray, mergedConfig: Partial<DialogConfig>): DialogOpenConfig => {
      return {
        ...mergedConfig,
        dialogKey: keySegments,
        _dialogDeps: depsRef.current,
        ownerToken: handlersOwnerRef.current,
        liveThrottleMs: getLiveThrottleMs(mergedConfig) ?? defaultThrottleMsRef.current,
      } as DialogOpenConfig;
    },
    [],
  );

  const resolveRowForHandlers = useCallback(() => {
    const k = getCurrentKeyStr();
    if (!k) return null;
    return dialogStateStore.get(k) ?? null;
  }, [getCurrentKeyStr]);

  // initialConfig must be a dependency so handler closures refresh when callers pass new functions (e.g. canClose: () => state).
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — merge reads latest refs; dialogState identity updates on stack changes.
  useEffect(() => {
    if (!dialogState) return;
    const last = lastOpenConfigRef.current ?? {};
    const init = initialConfigRef.current ?? {};
    const initDefined: Partial<DialogConfig> = {};
    for (const [k, v] of Object.entries(init)) {
      if (v !== undefined) {
        (initDefined as Record<string, unknown>)[k] = v;
      }
    }
    const merged = {
      ...last,
      ...initDefined,
    } as Partial<DialogConfig>;
    const extractedHandlers = extractReactiveHandlersFromConfig(merged as import("./types").BaseDialogConfig);
    const extractedHasPayload = Object.values(extractedHandlers).some((v) => v !== undefined);
    if (extractedHasPayload && !hasDialogHandlersRow(dialogState.key, dialogState.internalId)) {
      seedDialogHandlers(dialogState.key, dialogState.internalId, handlersOwnerRef.current, extractedHandlers);
    }
    tryMergeReactiveHandlers(dialogState.key, dialogState.internalId, handlersOwnerRef.current, extractedHandlers, {
      silent: true,
    });
  }, [dialogState, initialConfig]);

  const withDialogKeyAndDeps = useCallback(
    (keyOrConfig?: DialogKey | Partial<DialogConfig>, config?: Partial<DialogConfig>): DialogOpenConfig => {
      const { rKey, mergedConfig } = resolveDialogKeySegments(
        keyOrConfig,
        config,
        activeKeyRef.current ?? initialResolvedKeyRef.current,
      );
      return buildDialogConfig(rKey.parts, mergedConfig);
    },
    [resolveDialogKeySegments, buildDialogConfig],
  );

  const syncActiveKeyRef = useCallback((dialogKey: DialogKey) => {
    activeKeyRef.current = resolveDialogKey(dialogKey);
  }, []);

  // Dialog opening (returns Promise<DialogCloseEvent<T, TActionId>>, can be awaited or ignored)
  // Overloaded type so TypeScript infers `props` from the component passed to `message`.
  type OpenFn = {
    <
      T = TResolveValue,
      A extends string = TActionId extends string ? TActionId : never,
      P extends Record<string, unknown> = Record<string, unknown>,
    >(
      config: DialogConfigWithTypedMessage<P>,
    ): Promise<DialogCloseEvent<T, A>>;
    <T = TResolveValue, A extends string = TActionId extends string ? TActionId : never>(
      keyOrConfig?: DialogKey | Partial<DialogConfig>,
      config?: Partial<DialogConfig>,
    ): Promise<DialogCloseEvent<T, A>>;
  };

  const open = useCallback(
    <T = TResolveValue, A extends string = TActionId extends string ? TActionId : never>(
      keyOrConfig?: DialogKey | Partial<DialogConfig>,
      config?: Partial<DialogConfig>,
    ): Promise<DialogCloseEvent<T, A>> => {
      const merged = withDialogKeyAndDeps(keyOrConfig, config);
      syncActiveKeyRef(merged.dialogKey as DialogKey);
      lastOpenConfigRef.current = merged;
      return openDialog(merged) as Promise<DialogCloseEvent<T, A>>;
    },
    [openDialog, withDialogKeyAndDeps, syncActiveKeyRef],
  ) as unknown as OpenFn;

  const close = useCallback(
    (result?: unknown, options?: Omit<import("./types").DialogCloseOptions, "resolveValue">): void => {
      const keyToClose = getCurrentKeyStr();
      if (!keyToClose) {
        console.warn("[Dialogist] useDialog.close(): No active dialog to close.");
        return;
      }
      closeDialog(keyToClose, {
        ...options,
        reason: options?.reason || "programmatic",
        resolveValue: result,
      });
    },
    [closeDialog, getCurrentKeyStr],
  );

  const closeAll = useCallback(
    (options?: { force?: boolean }): void => {
      closeAllDialogs(options);
    },
    [closeAllDialogs],
  );

  const replace = useCallback(
    <T = TResolveValue, A extends string = TActionId extends string ? TActionId : never>(
      keyOrConfig: DialogKey | Partial<DialogConfig>,
      config?: Partial<DialogConfig>,
    ): Promise<DialogCloseEvent<T, A>> => {
      // Get the current active dialog ID
      const currentKeyStr = activeKeyRef.current?.str;
      if (!currentKeyStr) {
        throw new Error("[Dialogist] useDialog.replace(): No active dialog to replace.");
      }

      const { rKey, mergedConfig } = resolveDialogKeySegments(
        keyOrConfig,
        config,
        activeKeyRef.current ?? initialResolvedKeyRef.current,
      );

      const merged = buildDialogConfig(rKey.parts, mergedConfig);

      // Capture current key before updating refs
      const targetKeyStr = currentKeyStr;

      // Update refs immediately so UI is consistent
      syncActiveKeyRef(merged.dialogKey as DialogKey);
      lastOpenConfigRef.current = merged;

      // Use replaceDialog to atomically replace the dialog in-place
      return replaceDialog(targetKeyStr, merged) as Promise<DialogCloseEvent<T, A>>;
    },
    [resolveDialogKeySegments, buildDialogConfig, replaceDialog, syncActiveKeyRef],
  );

  const next = useCallback(
    (step: string | number, config?: Partial<DialogConfig>): Promise<DialogCloseEvent<TResolveValue, TActionId>> => {
      const currentKeyParts = activeKeyRef.current?.parts;

      // Require composite key (array) with root + step for next() navigation
      if (!currentKeyParts || !Array.isArray(currentKeyParts) || currentKeyParts.length < 2) {
        throw new Error(
          "[Dialogist] useDialog.next(): Requires a composite dialog key with at least two segments (root and step). Use useDialog(['root', 'step']) or dialog.open(['root', 'step']).",
        );
      }

      // Construct new key: [...rootSegments, step]
      const rootSegments = currentKeyParts.slice(0, -1); // All but last segment
      const newKey: DialogKeyArray = [...rootSegments, step];

      // Push current config to history before moving forward,
      // BUT ONLY if we are actually changing steps (new key != current key).
      // This prevents duplicate history when re-opening/updating the same step.
      if (lastOpenConfigRef.current && !dialogKeyArrayEquals(currentKeyParts, newKey)) {
        historyRef.current.push(lastOpenConfigRef.current);
      }

      // Merge config
      const mergedConfig = mergeWithInitialConfig(config);

      // Use replace to seamlessly transition and return promise
      return replace(newKey, mergedConfig);
    },
    [replace, mergeWithInitialConfig],
  );

  const back = useCallback(
    (targetStep?: string | number): Promise<unknown> | undefined => {
      const history = historyRef.current;
      const currentKeyParts = activeKeyRef.current?.parts;

      if (targetStep !== undefined) {
        if (!currentKeyParts || !Array.isArray(currentKeyParts) || currentKeyParts.length < 2) {
          throw new Error(
            "[Dialogist] useDialog.back(targetStep): Requires a composite dialog key with at least two segments (root and step). Use useDialog(['root', 'step']).",
          );
        }
      }

      if (history.length === 0) {
        // No history, close current dialog
        close();
        return Promise.resolve(undefined);
      }

      if (targetStep === undefined) {
        // Pop one step back
        const prevConfig = history.pop();
        if (prevConfig) {
          return replace(prevConfig);
        } else {
          close();
          return Promise.resolve(undefined);
        }
      }

      // Find target step in history (by matching root + targetStep)
      if (!currentKeyParts) {
        return Promise.resolve(undefined);
      }
      const rootSegments = currentKeyParts.slice(0, -1);
      const targetKeyParts: DialogKeyArray = [...rootSegments, targetStep];

      // Pop until we find the target (or run out of history)
      let found = false;
      const popped: DialogOpenConfig[] = [];

      while (history.length > 0) {
        // biome-ignore lint/style/noNonNullAssertion: loop condition guarantees history is non-empty
        const config = history.pop()!;
        const configKeyParts = config.dialogKey === undefined ? undefined : resolveDialogKey(config.dialogKey).parts;
        if (configKeyParts && dialogKeyArrayEquals(configKeyParts, targetKeyParts)) {
          found = true;
          return replace(config);
        }
        popped.push(config);
      }

      // If not found, restore popped items and close
      if (!found) {
        // Restore popped items (in reverse order since we popped from end)
        history.push(...popped.reverse());
        close();
        return Promise.resolve(undefined);
      }
    },
    [replace, close],
  );

  /** True when a dialog with this hook's key is on the stack. */
  const isOpen = dialogState !== undefined;

  useEffect(() => {
    if (!isOpen) {
      historyRef.current = [];
    }
  }, [isOpen]);

  // Toggle open/close based on current state (if provider present). If no provider, default to open.
  const toggle = useCallback(
    (keyOrConfig?: DialogKey | Partial<DialogConfig>, config?: Partial<DialogConfig>): void => {
      if (isOpen) {
        close();
      } else {
        open(keyOrConfig, config);
      }
    },
    [isOpen, close, open],
  );

  /**
   * @internal Library / advanced integration — merges reactive handlers for the open row.
   */
  const _setHandlers = useCallback(
    (partial: ReactiveDialogHandlers) => {
      const row = resolveRowForHandlers();
      if (!row) {
        throw new Error("[Dialogist] _setHandlers: No open dialog for this key.");
      }
      tryMergeReactiveHandlers(row.key, row.internalId, handlersOwnerRef.current, partial);
    },
    [resolveRowForHandlers],
  );

  /**
   * @internal Clears reactive handler fields registered via {@link _setHandlers}.
   */
  const _clearHandlers = useCallback(
    (fields?: Array<keyof ReactiveDialogHandlers>) => {
      const row = resolveRowForHandlers();
      if (!row) return;
      tryClearReactiveHandlers(row.key, row.internalId, handlersOwnerRef.current, fields);
    },
    [resolveRowForHandlers],
  );

  /**
   * @internal Returns the reactive handler snapshot for the open row (owner-scoped).
   */
  const _getHandlers = useCallback(() => {
    const row = resolveRowForHandlers();
    if (!row) return undefined;
    return getReactiveHandlersSnapshot(row.key, row.internalId, handlersOwnerRef.current);
  }, [resolveRowForHandlers]);

  const canClose = useCallback(() => {
    const row = resolveRowForHandlers();
    const activeConfig = lastOpenConfigRef.current ?? (initialConfigRef.current as DialogOpenConfig | undefined);
    if (!row || !activeConfig) return true;
    return evaluateDialogCanClose(row.keySegments, row.internalId, activeConfig, "programmatic");
  }, [resolveRowForHandlers]);

  type ImperativeSlotInput<T> = T | (() => T);

  const registerImperativeSlot = useCallback(
    (slotType: SlotType, input: ImperativeSlotInput<unknown>) => {
      const factory = typeof input === "function" ? (input as () => unknown) : () => input;
      const key = getCurrentKeyStr();
      if (!key) {
        console.warn("[Dialogist] useDialog slot registration: No dialog key available. Provide a key to useDialog().");
        return;
      }

      const payload: DialogSlotRegistration = {
        key,
        slotType,
        factory,
        deps: [],
      };
      slotRegistry.registerSlot(payload);
    },
    [slotRegistry, getCurrentKeyStr],
  );

  useEffect(() => {
    return () => {
      if (registeredImperativeHandleRef.current) {
        const key = getCurrentKeyStr();
        if (key) {
          clearDialogImperativeHandle(key, registeredImperativeHandleRef.current);
        }
      }
    };
  }, [getCurrentKeyStr]);

  const setImperativeHandle = useCallback(
    <RefType extends ImperativeHandleRefType<unknown>>(ref?: RefType) => {
      registeredImperativeHandleRef.current = ref ?? null;
      const key = getCurrentKeyStr();
      if (!key) {
        console.warn(
          "[Dialogist] useDialog.setImperativeRef(): No dialog key available. Provide a key to useDialog().",
        );
        return;
      }
      if (!ref) {
        clearDialogImperativeHandle(key);
        return;
      }
      registerDialogImperativeHandle(key, ref);
    },
    [getCurrentKeyStr],
  );

  const imperativeHandle = useCallback(<
    Handle = unknown,
    RefType extends React.RefObject<Handle | null> = React.RefObject<Handle | null>,
  >() => {
    const key = getCurrentKeyStr();
    if (!key) {
      return fallbackImperativeHandleRef.current as RefType | null;
    }
    const registered = getDialogImperativeHandle<Handle>(key);
    if (registered) {
      return registered as RefType;
    }
    return fallbackImperativeHandleRef.current as RefType | null;
  }, [getCurrentKeyStr]);

  const setTitle = useMemo(
    () => (next: ImperativeSlotInput<ReactNode>) => registerImperativeSlot("title", next),
    [registerImperativeSlot],
  );

  const setContent = useMemo(
    () => (next: ImperativeSlotInput<DialogPartContent>) => registerImperativeSlot("content", next),
    [registerImperativeSlot],
  );

  const setStatusBar = useMemo(
    () => (next: ImperativeSlotInput<DialogPartContent>) => registerImperativeSlot("statusBar", next),
    [registerImperativeSlot],
  );

  const setFooter = useMemo(
    () => (next: ImperativeSlotInput<DialogPartContent>) => registerImperativeSlot("footer", next),
    [registerImperativeSlot],
  );

  const setProps = useMemo(
    () => (next: ImperativeSlotInput<Record<string, unknown>>) => registerImperativeSlot("props", next),
    [registerImperativeSlot],
  );

  // Return a stable object so consumers can safely memoize against it
  return useMemo(
    () => ({
      open,
      isOpen,
      replace,
      next,
      back,
      toggle,
      close,
      closeAll,
      /**
       * Register an event handler scoped to this dialog.
       * Extend `DialogistEventMap` via declaration merging to register custom event names and payload types.
       * @param event - Event name
       * @param handler - Event handler function
       * @returns A function to unregister the event handler
       */
      on: ((event: string, handler: (payload?: unknown) => void) => {
        const key = getCurrentKeyStr();
        if (!key) {
          console.warn("[Dialogist] useDialog.on(): No dialog key available. Provide a key to useDialog().");
          return () => {};
        }
        if (ctx) return ctx.on(key, event, handler as (payload?: unknown) => void);
        let byEvent = localRegistryRef.current.get(key);
        if (!byEvent) {
          byEvent = new Map();
          localRegistryRef.current.set(key, byEvent);
        }
        let set = byEvent.get(event);
        if (!set) {
          set = new Set();
          byEvent.set(event, set);
        }
        const handlerToStore = handler as (payload?: unknown) => void;
        set.add(handlerToStore);
        return () => {
          set?.delete(handlerToStore);
          if (set?.size === 0) byEvent?.delete(event);
        };
      }) as UseDialogOn,
      /**
       * Unregister an event handler scoped to this dialog
       * @param event - Event name
       * @param handler - Event handler function
       */
      off: ((event: string, handler: (payload?: unknown) => void) => {
        const key = getCurrentKeyStr();
        if (!key) return;
        if (ctx) return ctx.off(key, event, handler as (payload?: unknown) => void);
        const byEvent = localRegistryRef.current.get(key);
        const set = byEvent?.get(event);
        if (set) {
          set.delete(handler as (payload?: unknown) => void);
          if (set.size === 0) byEvent?.delete(event);
        }
      }) as UseDialogOff,
      emit: ((event: string, payload?: unknown) => {
        const key = getCurrentKeyStr();
        if (!key) return;
        if (ctx) return ctx.emit(key, event, payload);
        const set = localRegistryRef.current.get(key)?.get(event);
        if (!set) return;
        for (const fn of Array.from(set)) {
          try {
            fn(payload);
          } catch (err) {
            console.error("Dialog local emit handler error:", err);
          }
        }
      }) as UseDialogEmit,
      imperativeHandle,
      _setHandlers,
      _clearHandlers,
      _getHandlers,
      canClose,
      setTitle,
      setContent,
      setStatusBar,
      setFooter,
      setProps,
      setImperativeHandle,
    }),
    [
      open,
      isOpen,
      replace,
      next,
      back,
      toggle,
      close,
      closeAll,
      imperativeHandle,
      _setHandlers,
      _clearHandlers,
      _getHandlers,
      canClose,
      setTitle,
      setContent,
      setStatusBar,
      setFooter,
      setProps,
      setImperativeHandle,
      ctx,
      getCurrentKeyStr,
    ],
  );
};

const getLiveThrottleMs = (cfg?: Partial<DialogConfig>): number | undefined => {
  if (!cfg) return undefined;
  return (cfg as Partial<DialogConfig> & { liveThrottleMs?: number }).liveThrottleMs;
};
