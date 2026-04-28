"use client";

import { GlobalStyles } from "@mui/material";
import { deepmerge } from "deepmerge-ts";
import {
  type ReactNode,
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { DialogScaffolding } from "../components/DialogScaffolding";
import { useDialogCallbacks } from "../hooks/useDialogCallbacks";
import {
  clearDialogHandlersRow,
  extractReactiveHandlersFromConfig,
  readOwnerTokenFromOpenConfig,
  resolveHandler,
  resyncDialogHandlersFromConfig,
  seedDialogHandlers,
  stripInternalDialogOpenFields,
} from "../state/DialogHandlers";
import { dialogistStyles } from "../theme/dialogTheme";
import type {
  BaseDialogConfig,
  DialogCloseEvent,
  DialogCloseOptions,
  DialogComponents,
  DialogConflictResolver,
  DialogKey,
  DialogKeyArray,
  DialogOpenConfig,
  DialogPartContent,
  DialogSlotProps,
  DialogState,
  DialogStoredConfig,
} from "../types";
import { deepEqual } from "../utils/deepCompare";
import { evaluateDialogCanClose } from "../utils/dialogCanClose";
import { dialogKeyStartsWith, ensureDialogKeyArray, resolveDialogKey } from "../utils/dialogKey";
import { DialogActionsContext } from "./DialogActionsContext";
import { DialogCallbacksContext } from "./DialogCallbacksContext";
import { getActiveDialogKey, shouldDialogUpdate, stripOnConflictForComparison } from "./DialogProvider.utils";
import { DialogSlotRegistryProvider, useDialogSlotRegistry } from "./DialogSlotRegistry";
import { DialogStateContext } from "./DialogStateContext";
import { dialogStateStore } from "./DialogStateStore";
import { mergeSlotsWithConfig } from "./mergeSlotsWithConfig";
import {
  attachResolvedOpenConflictDecision,
  createOpenDialogConflict,
  formatBlockedOpenConflictError,
  isOpenReplaceAllowed,
  resolveOpenConflictPolicy,
} from "./openDialogPolicy";

// No re-export; contexts exported explicitly

// Track last keyboard interaction to detect A11y keyboard focus
let lastKeyboardInteractionTime = 0;
let lastMouseInteractionTime = 0;

if (typeof document !== "undefined") {
  document.addEventListener(
    "keydown",
    () => {
      lastKeyboardInteractionTime = Date.now();
    },
    true,
  );
  document.addEventListener(
    "mousedown",
    () => {
      lastMouseInteractionTime = Date.now();
    },
    true,
  );
}

const schedulePostUpdate =
  typeof queueMicrotask === "function" ? queueMicrotask : (cb: () => void) => Promise.resolve().then(cb);

const DEFAULT_CLOSE_ANIMATION_DURATION = 300;

const getCloseDuration = (config: BaseDialogConfig | DialogStoredConfig): number =>
  (config as BaseDialogConfig).closeAnimationDuration ?? DEFAULT_CLOSE_ANIMATION_DURATION;

const readConflictThrow = (cfg?: DialogOpenConfig | DialogStoredConfig): boolean | undefined =>
  cfg ? (cfg as BaseDialogConfig).throwOnConflict : undefined;

/**
 * Resolves `throwOnConflict` when the active (top) dialog and an incoming `open()` may supply values:
 * - If the incoming value is **undefined**, the active value wins (then provider, then `defaultValue`).
 * - If the active value is **undefined**, the incoming value wins (then provider, then `defaultValue`).
 * - If **both** are defined, the **active** value wins (provider is not consulted for that pick).
 */
const pickActiveIncomingProvider = <T,>(
  incoming: T | undefined,
  active: T | undefined,
  provider: T | undefined,
  defaultValue: T,
): T => {
  if (incoming === undefined) {
    if (active !== undefined) return active;
    if (provider !== undefined) return provider;
    return defaultValue;
  }
  if (active === undefined) {
    return incoming;
  }
  return active;
};

const resolveConflictThrow = (options: {
  incomingConfig: DialogOpenConfig | DialogStoredConfig;
  activeDialogConfig?: DialogOpenConfig | DialogStoredConfig;
  providerThrowOnConflict?: boolean;
}): boolean => {
  const incomingThrow = readConflictThrow(options.incomingConfig);
  const activeThrow = options.activeDialogConfig ? readConflictThrow(options.activeDialogConfig) : undefined;
  return pickActiveIncomingProvider(incomingThrow, activeThrow, options.providerThrowOnConflict, false);
};

// Generate a short unique ID (4-6 chars) for React reconciliation
const generateInternalId = (): string => {
  return Math.random().toString(36).slice(2, 8);
};

const dialogProviderInstrumentationEnabled =
  typeof globalThis !== "undefined" &&
  (() => {
    const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
    return env?.NODE_ENV !== "production" && env?.NEXT_PUBLIC_DIALOGIST_DEBUG_LOGS === "true";
  })() &&
  typeof performance !== "undefined";

const useRenderInstrumentation = (label: string) => {
  const startRef = useRef<number | null>(null);
  if (dialogProviderInstrumentationEnabled) {
    startRef.current = performance.now();
    console.log(`[Dialogist][${label}] render:start`, { timestamp: startRef.current });
  }

  useEffect(() => {
    if (!dialogProviderInstrumentationEnabled || startRef.current == null) return;
    const duration = performance.now() - startRef.current;
    console.log(`[Dialogist][${label}] render:end`, { duration });
  });
};

// Children are outside DialogStateContext so they won't re-render from dialog state changes

/** Default options merged with each `dialog.open()` call (including `onConflict`). */
export type DefaultOptions = Partial<BaseDialogConfig>;

export interface DialogProviderProps {
  children: ReactNode;
  defaultOptions?: DefaultOptions;
  slots?: DialogComponents;
  slotProps?: DialogSlotProps;
  /**
   * Default when merged open config leaves `onConflict` unset (after `defaultOptions` + call).
   * Does not deep-merge into each dialog config; use `defaultOptions.onConflict` for that.
   * Fallback when the active dialog's merged config leaves `onConflict` unset (see {@link DialogConflictResolver}).
   */
  onConflict?: BaseDialogConfig["onConflict"];
  /**
   * Fallback when active and incoming configs leave `throwOnConflict` unset (see {@link DialogConflictResolver}).
   */
  throwOnConflict?: boolean;
}

const DialogProviderCore = ({
  children,
  defaultOptions,
  slots,
  slotProps,
  onConflict,
  throwOnConflict: throwOnConflictProp,
}: DialogProviderProps) => {
  useRenderInstrumentation("DialogProviderCore");

  const [dialogs, setDialogs] = useState<DialogState[]>([]);
  const callbacks = useDialogCallbacks();

  const slotRegistry = useDialogSlotRegistry();
  const lastMergedConfigRef = useRef<Map<string, DialogStoredConfig>>(new Map());
  /** When canClose blocks an action close, remember the DOM event; suppress a replay with the same nativeEvent ref. */
  const lastBlockedActionNativeByDialogKeyRef = useRef(new Map<string, unknown>());

  // useLayoutEffect (not useEffect): sync before passive effects so `useDialog`'s merge effect and
  // `useSyncExternalStore` subscribers do not observe an open row in the store after handlers were
  // cleared in the same React commit as dialog removal.
  useLayoutEffect(() => {
    dialogStateStore.setDialogs(dialogs);
  }, [dialogs]);

  // useEffect (not useDeepEffect): in Strict Mode, React runs effect cleanup then re-runs the effect.
  // useDeepEffect skips the second run when deps are still deep-equal (same slotRegistry object),
  // so the slot listener is removed and never re-attached — live slot updates stop (listenerCount 0).
  useEffect(() => {
    const unsubscribe = slotRegistry.onSlotChange((dialogKey) => {
      // Do not use flushSync here (see history in this file). Defer the tree update so it does not
      // interleave with the browser's pointer/composite pipeline after unrelated UI flips canClose.
      startTransition(() => {
        setDialogs((currentDialogs) => {
          const dialogIndex =
            typeof currentDialogs.findLastIndex === "function"
              ? currentDialogs.findLastIndex((d) => d.key === dialogKey)
              : (() => {
                  for (let i = currentDialogs.length - 1; i >= 0; i -= 1) {
                    if (currentDialogs[i].key === dialogKey) return i;
                  }
                  return -1;
                })();
          if (dialogIndex >= 0) {
            const existingDialog = currentDialogs[dialogIndex];

            const refreshedConfig = mergeSlotsWithConfig(
              slotRegistry,
              existingDialog.config,
              dialogKey,
              existingDialog.keySegments,
            );

            const prevMerged = lastMergedConfigRef.current.get(dialogKey);
            if (
              prevMerged &&
              deepEqual(prevMerged, refreshedConfig) &&
              deepEqual(existingDialog.config, refreshedConfig)
            ) {
              return currentDialogs;
            }

            if (!deepEqual(existingDialog.config, refreshedConfig)) {
              const updatedDialog = {
                ...existingDialog,
                config: refreshedConfig,
              };

              const newDialogs = [...currentDialogs];
              newDialogs[dialogIndex] = updatedDialog;
              lastMergedConfigRef.current.set(dialogKey, refreshedConfig);
              return newDialogs;
            }
          }

          return currentDialogs;
        });
      });
    });

    return unsubscribe;
  }, [slotRegistry]);

  const closeDialog = useCallback(
    (dialogKey: string, options?: DialogCloseOptions) => {
      const reason = options?.reason ?? "programmatic";
      const actionEvent = options?.actionEvent;
      const cancelled = options?.cancelled ?? false;
      const hasResolveValue = options ? Object.hasOwn(options, "resolveValue") : false;
      const resolveValue = hasResolveValue ? options?.resolveValue : false;
      const closeEvent = {
        dialogKey,
        reason,
        ok: !cancelled,
        cancelled,
        resolveValue,
        ...(actionEvent && {
          action: actionEvent.action,
          actionId: actionEvent.actionId,
          buttonText: actionEvent.buttonText,
          nativeEvent: actionEvent.nativeEvent,
        }),
      } as DialogCloseEvent;
      const actionInfo =
        actionEvent?.action !== undefined
          ? {
              action: actionEvent.action,
              actionId: actionEvent.actionId,
              buttonText: actionEvent.buttonText,
              nativeEvent: actionEvent.nativeEvent,
            }
          : undefined;

      setDialogs((prev) => {
        let idx = prev.findIndex((d) => d.key === dialogKey);
        // Prefix fallback: closeDialog("checkout-flow") closes "checkout-flow::step-1" when active.
        // Uses findLastIndex-style iteration so the topmost matching dialog is targeted.
        if (idx < 0) {
          for (let i = prev.length - 1; i >= 0; i--) {
            if (dialogKeyStartsWith(prev[i].key, dialogKey)) {
              idx = i;
              break;
            }
          }
        }
        if (idx < 0) return prev;

        const dialog = prev[idx];
        // Use the dialog's actual key for removal/callbacks — may differ from the requested
        // `dialogKey` when a prefix match resolved to a composite step key.
        const resolvedKey = dialog.key;

        if (!options?.force) {
          const canClose = evaluateDialogCanClose(
            dialog.keySegments,
            dialog.internalId,
            dialog.config,
            reason,
            actionInfo,
          );
          if (!canClose) {
            if (reason === "action" && actionInfo?.nativeEvent != null) {
              lastBlockedActionNativeByDialogKeyRef.current.set(resolvedKey, actionInfo.nativeEvent);
            }
            const payload = { reason, closeEvent };
            // Defer: emit runs from inside the setDialogs updater; synchronous listeners must not setState
            // on other components during this phase (React "Cannot update while rendering" guard).
            schedulePostUpdate(() => {
              callbacks.emit(resolvedKey, "closePrevented", payload);
            });
            return prev;
          }
          if (reason === "action" && actionInfo?.nativeEvent != null) {
            const blockedNative = lastBlockedActionNativeByDialogKeyRef.current.get(resolvedKey);
            if (blockedNative != null && blockedNative === actionInfo.nativeEvent) {
              lastBlockedActionNativeByDialogKeyRef.current.delete(resolvedKey);
              return prev;
            }
          }
        }

        lastBlockedActionNativeByDialogKeyRef.current.delete(resolvedKey);

        callbacks.trigger("willClose", closeEvent);
        callbacks.emit(resolvedKey, "willClose", closeEvent);

        if (dialog.resolve) {
          dialog.resolve(closeEvent);
        }

        const preserveBackdrop = options?.preserveBackdrop;

        const nextDialogs: DialogState[] = preserveBackdrop
          ? (() => {
              const holding: DialogState = {
                ...dialog,
                config: { ...dialog.config, _backdropHold: true },
              };
              const arr = [...prev];
              arr[idx] = holding;
              return arr;
            })()
          : prev.filter((d) => d.key !== resolvedKey);

        const closeDuration = getCloseDuration(dialog.config);

        setTimeout(() => {
          resolveHandler(resolvedKey, dialog.internalId, "onClose", dialog.config.onClose)?.(closeEvent);
          callbacks.emit(resolvedKey, "close", closeEvent);
          if (reason === "action" && actionInfo && actionInfo.actionId === "ok") {
            callbacks.emit(resolvedKey, "okClick", closeEvent);
          }
          if (cancelled) {
            callbacks.emit(resolvedKey, "cancel", closeEvent);
          }
        }, 0);

        setTimeout(() => {
          if (cancelled) {
            callbacks.trigger("didCancel", closeEvent);
          }
          callbacks.trigger("didClose", closeEvent);
          callbacks.emit(resolvedKey, "didClose", closeEvent);

          // Blur the trigger element if it was opened via mouse click (not keyboard)
          if (typeof document !== "undefined" && dialog.previousActiveElement && !dialog.openedViaKeyboard) {
            const activeElement = document.activeElement as HTMLElement | null;
            if (activeElement === dialog.previousActiveElement) {
              if (
                activeElement.tagName === "BUTTON" ||
                activeElement.tagName === "A" ||
                activeElement.getAttribute("role") === "button" ||
                activeElement.getAttribute("tabindex") !== null
              ) {
                activeElement.blur();
              }
            }
          }
        }, closeDuration);

        if (!preserveBackdrop) {
          lastMergedConfigRef.current.delete(resolvedKey);
          const onlyHoldsRemain = nextDialogs.length > 0 && nextDialogs.every((d) => d.config._backdropHold);
          if (onlyHoldsRemain) {
            dialogStateStore.replaceDialogsSnapshotWithoutNotify([]);
            nextDialogs.forEach((held) => {
              clearDialogHandlersRow(held.key, held.internalId);
            });
            return [];
          }
          dialogStateStore.replaceDialogsSnapshotWithoutNotify(nextDialogs);
          clearDialogHandlersRow(resolvedKey, dialog.internalId);
        }

        return nextDialogs;
      });
    },
    [callbacks],
  );

  const closeAllDialogs = useCallback(
    (options?: { force?: boolean }) => {
      setDialogs((prev) => {
        if (prev.length === 0) {
          return prev;
        }

        const force = options?.force === true;
        if (!force) {
          for (const dialog of prev) {
            if (!evaluateDialogCanClose(dialog.keySegments, dialog.internalId, dialog.config, "programmatic")) {
              return prev;
            }
          }
        }

        const closeEventForDialog = (key: string): DialogCloseEvent => ({
          dialogKey: key,
          reason: "programmatic",
          ok: false,
          cancelled: true,
          resolveValue: false,
        });

        prev.forEach((dialog) => {
          const closeEvent = closeEventForDialog(dialog.key);
          callbacks.trigger("willClose", closeEvent);
          callbacks.emit(dialog.key, "willClose", closeEvent);
        });

        dialogStateStore.replaceDialogsSnapshotWithoutNotify([]);
        prev.forEach((dialog) => {
          if (dialog.resolve) {
            dialog.resolve(closeEventForDialog(dialog.key));
          }
          clearDialogHandlersRow(dialog.key, dialog.internalId);
        });

        const maxDuration = Math.max(DEFAULT_CLOSE_ANIMATION_DURATION, ...prev.map((d) => getCloseDuration(d.config)));
        setTimeout(() => {
          prev.forEach((dialog) => {
            const closeEvent = closeEventForDialog(dialog.key);
            callbacks.emit(dialog.key, "close", closeEvent);
            callbacks.emit(dialog.key, "cancel", closeEvent);
            callbacks.trigger("didCancel", closeEvent);
            callbacks.trigger("didClose", closeEvent);
            callbacks.emit(dialog.key, "didClose", closeEvent);
          });
        }, maxDuration);

        lastMergedConfigRef.current.clear();
        return [];
      });
    },
    [callbacks],
  );

  const mergeWithDefaults = useCallback(
    (config: DialogOpenConfig | DialogStoredConfig): DialogOpenConfig | DialogStoredConfig => {
      let merged =
        defaultOptions && Object.keys(defaultOptions).length > 0 ? deepmerge(defaultOptions, config) : config;
      merged = { ...merged } as DialogOpenConfig | DialogStoredConfig;

      // Default type to "custom" when unspecified
      if (!(merged as BaseDialogConfig).type) {
        (merged as BaseDialogConfig).type = "custom";
      }

      const mergedBase = merged as BaseDialogConfig;
      // `content` is an alias for `message`; when both are set, `content` wins (then dropped)
      if (mergedBase.content !== undefined) {
        mergedBase.message = mergedBase.content;
      }
      delete (mergedBase as { content?: DialogPartContent }).content;

      return merged;
    },
    [defaultOptions],
  );

  // Handle dialog updates when the same dialog key is opened again
  const openDialog = useCallback(
    (config: DialogOpenConfig | DialogStoredConfig): Promise<DialogCloseEvent> => {
      return new Promise((resolve, reject) => {
        const configWithDefaults = mergeWithDefaults(config);
        const rKey = resolveDialogKey(configWithDefaults.dialogKey, { autogenerate: true });
        const keySegments = rKey.parts;
        const resolvedId = rKey.str;

        // Merge config with registered slots
        const enhancedConfig = mergeSlotsWithConfig(slotRegistry, configWithDefaults, resolvedId, keySegments);

        // Check if dialog with this dialog key already exists
        setDialogs((prev) => {
          const existingDialogIndex = prev.findIndex((d) => d.key === resolvedId);
          const activeDialogKey = getActiveDialogKey(prev);

          const activeDialog = activeDialogKey ? prev.find((dialog) => dialog.key === activeDialogKey) : null;
          const notifyConflict = (
            conflict: DialogConflictResolver,
            options?: {
              activeDialogConfig?: DialogOpenConfig | DialogStoredConfig;
              activeKey?: string | null;
            },
          ) => {
            const shouldThrow = resolveConflictThrow({
              incomingConfig: enhancedConfig,
              activeDialogConfig: options?.activeDialogConfig,
              providerThrowOnConflict: throwOnConflictProp,
            });

            if (shouldThrow) {
              reject(new Error(formatBlockedOpenConflictError(conflict)));
              return prev;
            }

            schedulePostUpdate(() => {
              resolve?.({
                dialogKey: resolvedId,
                reason: "programmatic",
                ok: false,
                cancelled: false,
                blocked: true,
                resolveValue: false,
              });
            });

            return prev;
          };

          const appendNewDialogRow = (tail: DialogState[]): DialogState[] => {
            const configKeySegments = ensureDialogKeyArray(enhancedConfig.dialogKey as DialogKey) ?? keySegments;

            let previousActiveElement: HTMLElement | null = null;
            let openedViaKeyboard = false;

            if (typeof document !== "undefined") {
              previousActiveElement = document.activeElement as HTMLElement | null;
              if (previousActiveElement) {
                try {
                  openedViaKeyboard = previousActiveElement.matches?.(":focus-visible") ?? false;
                } catch {
                  const timeSinceKeyboard = Date.now() - lastKeyboardInteractionTime;
                  const timeSinceMouse = Date.now() - lastMouseInteractionTime;
                  openedViaKeyboard = timeSinceKeyboard < timeSinceMouse && timeSinceKeyboard < 500;
                }
              }
            }

            const dialogState: DialogState = {
              key: resolvedId,
              keySegments: configKeySegments,
              type: enhancedConfig.type,
              config: dialogRowConfigForState(enhancedConfig, configKeySegments),
              resolve,
              reject,
              previousActiveElement,
              openedViaKeyboard,
              internalId: generateInternalId(),
            };

            callbacks.trigger("willOpen");

            const newDialogs = [...tail, dialogState];
            seedDialogHandlers(
              resolvedId,
              dialogState.internalId,
              readOwnerTokenFromOpenConfig(enhancedConfig as BaseDialogConfig),
              extractReactiveHandlersFromConfig(enhancedConfig as BaseDialogConfig),
            );
            setTimeout(() => callbacks.trigger("didOpen"), 0);
            return newDialogs;
          };

          if (activeDialog && activeDialog.key !== resolvedId) {
            const notSameKeyConflict = createOpenDialogConflict({
              attemptedDialogKey: resolvedId,
              activeDialogKey: activeDialog.key,
              targetRowKey: activeDialog.key,
              activeDialogConfig: activeDialog.config as DialogOpenConfig | DialogStoredConfig,
              providerOnConflict: onConflict,
            });
            const notSameKeyPolicy = resolveOpenConflictPolicy({
              activeDialogConfig: activeDialog.config as DialogOpenConfig | DialogStoredConfig,
              providerOnConflict: onConflict,
              conflict: notSameKeyConflict,
              reactiveHandlersContext: { key: activeDialog.key, internalId: activeDialog.internalId },
            });

            if (isOpenReplaceAllowed(notSameKeyPolicy, resolvedId, activeDialog.key)) {
              if (activeDialog.resolve) {
                activeDialog.resolve({
                  dialogKey: activeDialog.key,
                  reason: "replace",
                  ok: true,
                  cancelled: false,
                  resolveValue: "replaced",
                });
              }
              lastMergedConfigRef.current.delete(activeDialog.key);

              const activeIndex = prev.findIndex((d) => d.key === activeDialog.key);
              if (activeIndex < 0) {
                const withoutActive = prev.filter((d) => d.key !== activeDialog.key);
                const newDialogs = appendNewDialogRow(withoutActive);
                dialogStateStore.replaceDialogsSnapshotWithoutNotify(newDialogs);
                clearDialogHandlersRow(activeDialog.key, activeDialog.internalId);
                return newDialogs;
              }

              const updatedConfigKeySegments =
                ensureDialogKeyArray(enhancedConfig.dialogKey as DialogKey) ?? keySegments;

              const updatedConfig = { ...enhancedConfig };
              if (updatedConfig._backdropHold) {
                delete updatedConfig._backdropHold;
              }

              const updatedDialog: DialogState = {
                ...activeDialog,
                key: resolvedId,
                keySegments: updatedConfigKeySegments,
                type: enhancedConfig.type,
                config: dialogRowConfigForState(updatedConfig, updatedConfigKeySegments),
                resolve,
                reject,
                internalId: activeDialog.internalId,
              };

              const nextDialogs = [...prev];
              nextDialogs[activeIndex] = updatedDialog;
              clearDialogHandlersRow(activeDialog.key, activeDialog.internalId);
              seedDialogHandlers(
                resolvedId,
                updatedDialog.internalId,
                readOwnerTokenFromOpenConfig(enhancedConfig as BaseDialogConfig),
                extractReactiveHandlersFromConfig(enhancedConfig as BaseDialogConfig),
              );
              dialogStateStore.replaceDialogsSnapshotWithoutNotify(nextDialogs);
              return nextDialogs;
            }

            return notifyConflict(
              attachResolvedOpenConflictDecision(notSameKeyConflict, notSameKeyPolicy, resolvedId, activeDialog.key),
              {
                activeDialogConfig: activeDialog.config as DialogOpenConfig | DialogStoredConfig,
                activeKey: activeDialog.key,
              },
            );
          }

          if (existingDialogIndex >= 0) {
            const existingDialog = prev[existingDialogIndex];

            const shouldUpdate = shouldDialogUpdate(
              stripOnConflictForComparison(existingDialog.config),
              stripOnConflictForComparison(enhancedConfig),
            );

            const sameKeyConflict = createOpenDialogConflict({
              attemptedDialogKey: resolvedId,
              activeDialogKey,
              targetRowKey: existingDialog.key,
              activeDialogConfig: existingDialog.config as DialogOpenConfig | DialogStoredConfig,
              providerOnConflict: onConflict,
            });

            const sameKeyConflictPolicy = resolveOpenConflictPolicy({
              activeDialogConfig: existingDialog.config as DialogOpenConfig | DialogStoredConfig,
              providerOnConflict: onConflict,
              conflict: sameKeyConflict,
              reactiveHandlersContext: { key: existingDialog.key, internalId: existingDialog.internalId },
            });

            const sameKeySwapAllowed = isOpenReplaceAllowed(sameKeyConflictPolicy, resolvedId, existingDialog.key);

            if (shouldUpdate) {
              if (!sameKeySwapAllowed) {
                return notifyConflict(
                  attachResolvedOpenConflictDecision(
                    sameKeyConflict,
                    sameKeyConflictPolicy,
                    resolvedId,
                    existingDialog.key,
                  ),
                  {
                    activeDialogConfig: existingDialog.config as DialogOpenConfig | DialogStoredConfig,
                  },
                );
              }

              return applySameKeyDialogStateUpdate({
                prev,
                existingDialogIndex,
                existingDialog,
                enhancedConfig,
                resolve,
                reject,
              });
            }

            if (sameKeySwapAllowed) {
              return applySameKeyDialogStateUpdate({
                prev,
                existingDialogIndex,
                existingDialog,
                enhancedConfig,
                resolve,
                reject,
              });
            }

            return notifyConflict(
              attachResolvedOpenConflictDecision(
                sameKeyConflict,
                sameKeyConflictPolicy,
                resolvedId,
                existingDialog.key,
              ),
              {
                activeDialogConfig: existingDialog.config as DialogOpenConfig | DialogStoredConfig,
              },
            );
          } else {
            return appendNewDialogRow(prev);
          }
        });
      });
    },
    [callbacks, slotRegistry, onConflict, throwOnConflictProp, mergeWithDefaults],
  );

  // Replace an existing dialog in-place, preserving the component instance (and backdrop)
  const replaceDialog = useCallback(
    (dialogKey: string, config: DialogOpenConfig | DialogStoredConfig): Promise<DialogCloseEvent> => {
      return new Promise((resolve, reject) => {
        const configWithDefaults = mergeWithDefaults(config);
        const rKey = resolveDialogKey(configWithDefaults.dialogKey, { autogenerate: true });
        const keySegments = rKey.parts;
        const resolvedId = rKey.str;

        // Merge config with registered slots
        const enhancedConfig = mergeSlotsWithConfig(slotRegistry, configWithDefaults, resolvedId, keySegments);

        setDialogs((prev) => {
          const existingDialogIndex = prev.findIndex((d) => d.key === dialogKey);

          if (existingDialogIndex >= 0) {
            const existingDialog = prev[existingDialogIndex];

            // Resolve the current dialog's promise (signaling it has been replaced)
            if (existingDialog.resolve) {
              existingDialog.resolve({
                dialogKey: existingDialog.key,
                reason: "replace",
                ok: true,
                cancelled: false,
                resolveValue: "replaced",
              });
            }

            // Update the dialog state in-place, preserving internalId
            const updatedConfigKeySegments =
              ensureDialogKeyArray(enhancedConfig.dialogKey as DialogKey) ?? existingDialog.keySegments;

            // Remove _backdropHold flag if present (dialog is being replaced, not held)
            const updatedConfig = { ...enhancedConfig };
            if (updatedConfig._backdropHold) {
              delete updatedConfig._backdropHold;
            }

            const updatedDialog: DialogState = {
              ...existingDialog,
              key: resolvedId,
              keySegments: updatedConfigKeySegments,
              config: dialogRowConfigForState(updatedConfig, updatedConfigKeySegments),
              resolve,
              reject,
              // Preserve internalId to prevent remount
              internalId: existingDialog.internalId,
            };

            const newDialogs = [...prev];
            newDialogs[existingDialogIndex] = updatedDialog;
            resyncDialogHandlersFromConfig(
              updatedDialog.key,
              updatedDialog.internalId,
              extractReactiveHandlersFromConfig(enhancedConfig as BaseDialogConfig),
            );

            return newDialogs;
          } else {
            // Dialog not found, fallback to openDialog
            schedulePostUpdate(() => {
              openDialog(config).then(resolve).catch(reject);
            });
            return prev;
          }
        });
      });
    },
    [slotRegistry, openDialog, mergeWithDefaults],
  );

  // Stable proxies for actions to avoid re-rendering children when dialog state changes
  const openRef = useRef(openDialog);
  const closeRef = useRef(closeDialog);
  const closeAllRef = useRef(closeAllDialogs);
  const replaceRef = useRef(replaceDialog);
  openRef.current = openDialog;
  closeRef.current = closeDialog;
  closeAllRef.current = closeAllDialogs;
  replaceRef.current = replaceDialog;

  const openProxy = useCallback((config: DialogOpenConfig) => openRef.current(config), []);
  const closeProxy = useCallback(
    (dialogKey: string, options?: DialogCloseOptions) => closeRef.current(dialogKey, options),
    [],
  );
  const closeAllProxy = useCallback((options?: { force?: boolean }) => closeAllRef.current(options), []);
  const replaceProxy = useCallback(
    (dialogKey: string, config: DialogOpenConfig) => replaceRef.current(dialogKey, config),
    [],
  );

  // Memoize state context value for scaffolding only
  const stateContextValue = useMemo(() => ({ dialogs, callbacks, slots }), [dialogs, callbacks, slots]);

  // Memoize actions context value so consumers don't re-render unless proxies change
  const actionsContextValue = useMemo(
    () => ({
      openDialog: openProxy,
      closeDialog: closeProxy,
      closeAllDialogs: closeAllProxy,
      replaceDialog: replaceProxy,
    }),
    [openProxy, closeProxy, closeAllProxy, replaceProxy],
  );

  return (
    <DialogActionsContext.Provider value={actionsContextValue}>
      <DialogCallbacksContext.Provider value={callbacks}>
        <DialogStateContext.Provider value={stateContextValue}>
          <GlobalStyles styles={dialogistStyles} />
          {children}
          <DialogScaffolding dialogs={dialogs} onClose={closeDialog} slots={slots} slotProps={slotProps} />
        </DialogStateContext.Provider>
      </DialogCallbacksContext.Provider>
    </DialogActionsContext.Provider>
  );
};

const dialogRowConfigForState = (
  enhanced: DialogOpenConfig | DialogStoredConfig,
  dialogKeySegments: DialogKeyArray,
): DialogStoredConfig => {
  return stripInternalDialogOpenFields({
    ...enhanced,
    dialogKey: dialogKeySegments,
  } as DialogOpenConfig);
};

const applySameKeyDialogStateUpdate = (params: {
  prev: DialogState[];
  existingDialogIndex: number;
  existingDialog: DialogState;
  enhancedConfig: DialogOpenConfig | DialogStoredConfig;
  resolve: (value: DialogCloseEvent) => void;
  reject: (reason?: unknown) => void;
}): DialogState[] => {
  const { prev, existingDialogIndex, existingDialog, enhancedConfig, resolve, reject } = params;
  const updatedConfigKeySegments =
    ensureDialogKeyArray(enhancedConfig.dialogKey as DialogKey) ?? existingDialog.keySegments;
  const updatedDialog: DialogState = {
    ...existingDialog,
    keySegments: updatedConfigKeySegments,
    config: dialogRowConfigForState(enhancedConfig, updatedConfigKeySegments),
    resolve,
    reject,
    internalId: existingDialog.internalId,
  };
  const newDialogs = [...prev];
  newDialogs[existingDialogIndex] = updatedDialog;
  resyncDialogHandlersFromConfig(
    updatedDialog.key,
    updatedDialog.internalId,
    extractReactiveHandlersFromConfig(enhancedConfig as BaseDialogConfig),
  );
  return newDialogs;
};

// Main provider that wraps everything with slot registry
export const DialogProvider = ({
  children,
  defaultOptions,
  slots,
  slotProps,
  onConflict,
  throwOnConflict,
}: DialogProviderProps) => {
  return (
    <DialogSlotRegistryProvider>
      <DialogProviderCore
        defaultOptions={defaultOptions}
        slots={slots}
        slotProps={slotProps}
        onConflict={onConflict}
        throwOnConflict={throwOnConflict}
      >
        {children}
      </DialogProviderCore>
    </DialogSlotRegistryProvider>
  );
};
