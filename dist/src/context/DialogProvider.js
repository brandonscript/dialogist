"use client";
import { slicedToArray as _slicedToArray, objectSpread2 as _objectSpread2, toConsumableArray as _toConsumableArray, createForOfIteratorHelper as _createForOfIteratorHelper } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { GlobalStyles } from '@mui/material';
import { deepmerge } from '../../node_modules/deepmerge-ts/dist/node/index.js';
import { useState, useRef, useLayoutEffect, useEffect, startTransition, useCallback, useMemo } from 'react';
import { DialogScaffolding } from '../components/DialogScaffolding.js';
import { useDialogCallbacks } from '../hooks/useDialogCallbacks.js';
import { resolveHandler, clearDialogHandlersRow, seedDialogHandlers, extractReactiveHandlersFromConfig, readOwnerTokenFromOpenConfig, resyncDialogHandlersFromConfig, stripInternalDialogOpenFields } from '../state/DialogHandlers.js';
import { dialogistStyles } from '../theme/dialogTheme.js';
import { deepEqual as _deepEqual } from '../utils/deepCompare.js';
import { evaluateDialogCanClose } from '../utils/dialogCanClose.js';
import { dialogKeyStartsWith, resolveDialogKey, ensureDialogKeyArray } from '../utils/dialogKey.js';
import { DialogActionsContext } from './DialogActionsContext.js';
import { DialogCallbacksContext } from './DialogCallbacksContext.js';
import { getActiveDialogKey, shouldDialogUpdate, stripOnConflictForComparison } from './DialogProvider.utils.js';
import { DialogSlotRegistryProvider, useDialogSlotRegistry } from './DialogSlotRegistry.js';
import { DialogStateContext } from './DialogStateContext.js';
import { dialogStateStore } from './DialogStateStore.js';
import { mergeSlotsWithConfig } from './mergeSlotsWithConfig.js';
import { createOpenDialogConflict, resolveOpenConflictPolicy, isOpenReplaceAllowed, attachResolvedOpenConflictDecision, formatBlockedOpenConflictError } from './openDialogPolicy.js';
import { jsx, jsxs } from 'react/jsx-runtime';

var lastKeyboardInteractionTime = 0;
var lastMouseInteractionTime = 0;
if (typeof document !== "undefined") {
  document.addEventListener("keydown", function () {
    lastKeyboardInteractionTime = Date.now();
  }, true);
  document.addEventListener("mousedown", function () {
    lastMouseInteractionTime = Date.now();
  }, true);
}
var schedulePostUpdate = typeof queueMicrotask === "function" ? queueMicrotask : function (cb) {
  return Promise.resolve().then(cb);
};
var DEFAULT_CLOSE_ANIMATION_DURATION = 300;
var getCloseDuration = function getCloseDuration(config) {
  var _closeAnimationDurati;
  return (_closeAnimationDurati = config.closeAnimationDuration) !== null && _closeAnimationDurati !== void 0 ? _closeAnimationDurati : DEFAULT_CLOSE_ANIMATION_DURATION;
};
var readConflictThrow = function readConflictThrow(cfg) {
  return cfg ? cfg.throwOnConflict : undefined;
};

/**
 * Resolves `throwOnConflict` when the active (top) dialog and an incoming `open()` may supply values:
 * - If the incoming value is **undefined**, the active value wins (then provider, then `defaultValue`).
 * - If the active value is **undefined**, the incoming value wins (then provider, then `defaultValue`).
 * - If **both** are defined, the **active** value wins (provider is not consulted for that pick).
 */
var pickActiveIncomingProvider = function pickActiveIncomingProvider(incoming, active, provider, defaultValue) {
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
var resolveConflictThrow = function resolveConflictThrow(options) {
  var incomingThrow = readConflictThrow(options.incomingConfig);
  var activeThrow = options.activeDialogConfig ? readConflictThrow(options.activeDialogConfig) : undefined;
  return pickActiveIncomingProvider(incomingThrow, activeThrow, options.providerThrowOnConflict, false);
};

// Generate a short unique ID (4-6 chars) for React reconciliation
var generateInternalId = function generateInternalId() {
  return Math.random().toString(36).slice(2, 8);
};
var dialogProviderInstrumentationEnabled = typeof globalThis !== "undefined" && function (_process) {
  var env = (_process = globalThis.process) === null || _process === void 0 ? void 0 : _process.env;
  return (env === null || env === void 0 ? void 0 : env.NODE_ENV) !== "production" && (env === null || env === void 0 ? void 0 : env.NEXT_PUBLIC_DIALOGIST_DEBUG_LOGS) === "true";
}() && typeof performance !== "undefined";
var useRenderInstrumentation = function useRenderInstrumentation(label) {
  var startRef = useRef(null);
  if (dialogProviderInstrumentationEnabled) {
    startRef.current = performance.now();
    console.log("[Dialogist][".concat(label, "] render:start"), {
      timestamp: startRef.current
    });
  }
  useEffect(function () {
    if (!dialogProviderInstrumentationEnabled || startRef.current == null) return;
    var duration = performance.now() - startRef.current;
    console.log("[Dialogist][".concat(label, "] render:end"), {
      duration: duration
    });
  });
};

// Children are outside DialogStateContext so they won't re-render from dialog state changes

/** Default options merged with each `dialog.open()` call (including `onConflict`). */

var DialogProviderCore = function DialogProviderCore(_ref) {
  var children = _ref.children,
    defaultOptions = _ref.defaultOptions,
    slots = _ref.slots,
    slotProps = _ref.slotProps,
    onConflict = _ref.onConflict,
    throwOnConflictProp = _ref.throwOnConflict;
  useRenderInstrumentation("DialogProviderCore");
  var _useState = useState([]),
    _useState2 = _slicedToArray(_useState, 2),
    dialogs = _useState2[0],
    setDialogs = _useState2[1];
  var callbacks = useDialogCallbacks();
  var slotRegistry = useDialogSlotRegistry();
  var lastMergedConfigRef = useRef(new Map());
  /** When canClose blocks an action close, remember the DOM event; suppress a replay with the same nativeEvent ref. */
  var lastBlockedActionNativeByDialogKeyRef = useRef(new Map());

  // useLayoutEffect (not useEffect): sync before passive effects so `useDialog`'s merge effect and
  // `useSyncExternalStore` subscribers do not observe an open row in the store after handlers were
  // cleared in the same React commit as dialog removal.
  useLayoutEffect(function () {
    dialogStateStore.setDialogs(dialogs);
  }, [dialogs]);

  // useEffect (not useDeepEffect): in Strict Mode, React runs effect cleanup then re-runs the effect.
  // useDeepEffect skips the second run when deps are still deep-equal (same slotRegistry object),
  // so the slot listener is removed and never re-attached — live slot updates stop (listenerCount 0).
  useEffect(function () {
    var unsubscribe = slotRegistry.onSlotChange(function (dialogKey) {
      // Do not use flushSync here (see history in this file). Defer the tree update so it does not
      // interleave with the browser's pointer/composite pipeline after unrelated UI flips canClose.
      startTransition(function () {
        setDialogs(function (currentDialogs) {
          var dialogIndex = typeof currentDialogs.findLastIndex === "function" ? currentDialogs.findLastIndex(function (d) {
            return d.key === dialogKey;
          }) : function () {
            for (var i = currentDialogs.length - 1; i >= 0; i -= 1) {
              if (currentDialogs[i].key === dialogKey) return i;
            }
            return -1;
          }();
          if (dialogIndex >= 0) {
            var existingDialog = currentDialogs[dialogIndex];
            var refreshedConfig = mergeSlotsWithConfig(slotRegistry, existingDialog.config, dialogKey, existingDialog.keySegments);
            var prevMerged = lastMergedConfigRef.current.get(dialogKey);
            if (prevMerged && _deepEqual(prevMerged, refreshedConfig) && _deepEqual(existingDialog.config, refreshedConfig)) {
              return currentDialogs;
            }
            if (!_deepEqual(existingDialog.config, refreshedConfig)) {
              var updatedDialog = _objectSpread2(_objectSpread2({}, existingDialog), {}, {
                config: refreshedConfig
              });
              var newDialogs = _toConsumableArray(currentDialogs);
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
  var closeDialog = useCallback(function (dialogKey, options) {
    var _options$reason, _options$cancelled;
    var reason = (_options$reason = options === null || options === void 0 ? void 0 : options.reason) !== null && _options$reason !== void 0 ? _options$reason : "programmatic";
    var actionEvent = options === null || options === void 0 ? void 0 : options.actionEvent;
    var cancelled = (_options$cancelled = options === null || options === void 0 ? void 0 : options.cancelled) !== null && _options$cancelled !== void 0 ? _options$cancelled : false;
    var hasResolveValue = options ? Object.hasOwn(options, "resolveValue") : false;
    var resolveValue = hasResolveValue ? options === null || options === void 0 ? void 0 : options.resolveValue : false;
    var closeEvent = _objectSpread2({
      dialogKey: dialogKey,
      reason: reason,
      ok: !cancelled,
      cancelled: cancelled,
      resolveValue: resolveValue
    }, actionEvent && {
      action: actionEvent.action,
      actionId: actionEvent.actionId,
      buttonText: actionEvent.buttonText,
      nativeEvent: actionEvent.nativeEvent
    });
    var actionInfo = (actionEvent === null || actionEvent === void 0 ? void 0 : actionEvent.action) !== undefined ? {
      action: actionEvent.action,
      actionId: actionEvent.actionId,
      buttonText: actionEvent.buttonText,
      nativeEvent: actionEvent.nativeEvent
    } : undefined;
    setDialogs(function (prev) {
      var idx = prev.findIndex(function (d) {
        return d.key === dialogKey;
      });
      // Prefix fallback: closeDialog("checkout-flow") closes "checkout-flow::step-1" when active.
      // Uses findLastIndex-style iteration so the topmost matching dialog is targeted.
      if (idx < 0) {
        for (var i = prev.length - 1; i >= 0; i--) {
          if (dialogKeyStartsWith(prev[i].key, dialogKey)) {
            idx = i;
            break;
          }
        }
      }
      if (idx < 0) return prev;
      var dialog = prev[idx];
      // Use the dialog's actual key for removal/callbacks — may differ from the requested
      // `dialogKey` when a prefix match resolved to a composite step key.
      var resolvedKey = dialog.key;
      if (!(options !== null && options !== void 0 && options.force)) {
        var canClose = evaluateDialogCanClose(dialog.keySegments, dialog.internalId, dialog.config, reason, actionInfo);
        if (!canClose) {
          if (reason === "action" && (actionInfo === null || actionInfo === void 0 ? void 0 : actionInfo.nativeEvent) != null) {
            lastBlockedActionNativeByDialogKeyRef.current.set(resolvedKey, actionInfo.nativeEvent);
          }
          var payload = {
            reason: reason,
            closeEvent: closeEvent
          };
          // Defer: emit runs from inside the setDialogs updater; synchronous listeners must not setState
          // on other components during this phase (React "Cannot update while rendering" guard).
          schedulePostUpdate(function () {
            callbacks.emit(resolvedKey, "closePrevented", payload);
          });
          return prev;
        }
        if (reason === "action" && (actionInfo === null || actionInfo === void 0 ? void 0 : actionInfo.nativeEvent) != null) {
          var blockedNative = lastBlockedActionNativeByDialogKeyRef.current.get(resolvedKey);
          if (blockedNative != null && blockedNative === actionInfo.nativeEvent) {
            lastBlockedActionNativeByDialogKeyRef.current["delete"](resolvedKey);
            return prev;
          }
        }
      }
      lastBlockedActionNativeByDialogKeyRef.current["delete"](resolvedKey);
      callbacks.trigger("willClose", closeEvent);
      callbacks.emit(resolvedKey, "willClose", closeEvent);
      if (dialog.resolve) {
        dialog.resolve(closeEvent);
      }
      var preserveBackdrop = options === null || options === void 0 ? void 0 : options.preserveBackdrop;
      var nextDialogs = preserveBackdrop ? function () {
        var holding = _objectSpread2(_objectSpread2({}, dialog), {}, {
          config: _objectSpread2(_objectSpread2({}, dialog.config), {}, {
            _backdropHold: true
          })
        });
        var arr = _toConsumableArray(prev);
        arr[idx] = holding;
        return arr;
      }() : prev.filter(function (d) {
        return d.key !== resolvedKey;
      });
      var closeDuration = getCloseDuration(dialog.config);
      setTimeout(function () {
        var _resolveHandler;
        (_resolveHandler = resolveHandler(resolvedKey, dialog.internalId, "onClose", dialog.config.onClose)) === null || _resolveHandler === void 0 || _resolveHandler(closeEvent);
        callbacks.emit(resolvedKey, "close", closeEvent);
        if (reason === "action" && actionInfo && actionInfo.actionId === "ok") {
          callbacks.emit(resolvedKey, "okClick", closeEvent);
        }
        if (cancelled) {
          callbacks.emit(resolvedKey, "cancel", closeEvent);
        }
      }, 0);
      setTimeout(function () {
        if (cancelled) {
          callbacks.trigger("didCancel", closeEvent);
        }
        callbacks.trigger("didClose", closeEvent);
        callbacks.emit(resolvedKey, "didClose", closeEvent);

        // Blur the trigger element if it was opened via mouse click (not keyboard)
        if (typeof document !== "undefined" && dialog.previousActiveElement && !dialog.openedViaKeyboard) {
          var activeElement = document.activeElement;
          if (activeElement === dialog.previousActiveElement) {
            if (activeElement.tagName === "BUTTON" || activeElement.tagName === "A" || activeElement.getAttribute("role") === "button" || activeElement.getAttribute("tabindex") !== null) {
              activeElement.blur();
            }
          }
        }
      }, closeDuration);
      if (!preserveBackdrop) {
        lastMergedConfigRef.current["delete"](resolvedKey);
        var onlyHoldsRemain = nextDialogs.length > 0 && nextDialogs.every(function (d) {
          return d.config._backdropHold;
        });
        if (onlyHoldsRemain) {
          dialogStateStore.replaceDialogsSnapshotWithoutNotify([]);
          nextDialogs.forEach(function (held) {
            clearDialogHandlersRow(held.key, held.internalId);
          });
          return [];
        }
        dialogStateStore.replaceDialogsSnapshotWithoutNotify(nextDialogs);
        clearDialogHandlersRow(resolvedKey, dialog.internalId);
      }
      return nextDialogs;
    });
  }, [callbacks]);
  var closeAllDialogs = useCallback(function (options) {
    setDialogs(function (prev) {
      if (prev.length === 0) {
        return prev;
      }
      var force = (options === null || options === void 0 ? void 0 : options.force) === true;
      if (!force) {
        var _iterator = _createForOfIteratorHelper(prev),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var dialog = _step.value;
            if (!evaluateDialogCanClose(dialog.keySegments, dialog.internalId, dialog.config, "programmatic")) {
              return prev;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
      var closeEventForDialog = function closeEventForDialog(key) {
        return {
          dialogKey: key,
          reason: "programmatic",
          ok: false,
          cancelled: true,
          resolveValue: false
        };
      };
      prev.forEach(function (dialog) {
        var closeEvent = closeEventForDialog(dialog.key);
        callbacks.trigger("willClose", closeEvent);
        callbacks.emit(dialog.key, "willClose", closeEvent);
      });
      dialogStateStore.replaceDialogsSnapshotWithoutNotify([]);
      prev.forEach(function (dialog) {
        if (dialog.resolve) {
          dialog.resolve(closeEventForDialog(dialog.key));
        }
        clearDialogHandlersRow(dialog.key, dialog.internalId);
      });
      var maxDuration = Math.max.apply(Math, [DEFAULT_CLOSE_ANIMATION_DURATION].concat(_toConsumableArray(prev.map(function (d) {
        return getCloseDuration(d.config);
      }))));
      setTimeout(function () {
        prev.forEach(function (dialog) {
          var closeEvent = closeEventForDialog(dialog.key);
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
  }, [callbacks]);
  var mergeWithDefaults = useCallback(function (config) {
    var merged = defaultOptions && Object.keys(defaultOptions).length > 0 ? deepmerge(defaultOptions, config) : config;
    merged = _objectSpread2({}, merged);

    // Default type to "custom" when unspecified
    if (!merged.type) {
      merged.type = "custom";
    }
    var mergedBase = merged;
    // `content` is an alias for `message`; when both are set, `content` wins (then dropped)
    if (mergedBase.content !== undefined) {
      mergedBase.message = mergedBase.content;
    }
    delete mergedBase.content;
    return merged;
  }, [defaultOptions]);

  // Handle dialog updates when the same dialog key is opened again
  var openDialog = useCallback(function (config) {
    return new Promise(function (resolve, reject) {
      var configWithDefaults = mergeWithDefaults(config);
      var rKey = resolveDialogKey(configWithDefaults.dialogKey, {
        autogenerate: true
      });
      var keySegments = rKey.parts;
      var resolvedId = rKey.str;

      // Merge config with registered slots
      var enhancedConfig = mergeSlotsWithConfig(slotRegistry, configWithDefaults, resolvedId, keySegments);

      // Check if dialog with this dialog key already exists
      setDialogs(function (prev) {
        var existingDialogIndex = prev.findIndex(function (d) {
          return d.key === resolvedId;
        });
        var activeDialogKey = getActiveDialogKey(prev);
        var activeDialog = activeDialogKey ? prev.find(function (dialog) {
          return dialog.key === activeDialogKey;
        }) : null;
        var notifyConflict = function notifyConflict(conflict, options) {
          var shouldThrow = resolveConflictThrow({
            incomingConfig: enhancedConfig,
            activeDialogConfig: options === null || options === void 0 ? void 0 : options.activeDialogConfig,
            providerThrowOnConflict: throwOnConflictProp
          });
          if (shouldThrow) {
            reject(new Error(formatBlockedOpenConflictError(conflict)));
            return prev;
          }
          schedulePostUpdate(function () {
            resolve === null || resolve === void 0 || resolve({
              dialogKey: resolvedId,
              reason: "programmatic",
              ok: false,
              cancelled: false,
              blocked: true,
              resolveValue: false
            });
          });
          return prev;
        };
        var appendNewDialogRow = function appendNewDialogRow(tail) {
          var _ensureDialogKeyArray;
          var configKeySegments = (_ensureDialogKeyArray = ensureDialogKeyArray(enhancedConfig.dialogKey)) !== null && _ensureDialogKeyArray !== void 0 ? _ensureDialogKeyArray : keySegments;
          var previousActiveElement = null;
          var openedViaKeyboard = false;
          if (typeof document !== "undefined") {
            previousActiveElement = document.activeElement;
            if (previousActiveElement) {
              try {
                var _previousActiveElemen, _previousActiveElemen2, _previousActiveElemen3;
                openedViaKeyboard = (_previousActiveElemen = (_previousActiveElemen2 = (_previousActiveElemen3 = previousActiveElement).matches) === null || _previousActiveElemen2 === void 0 ? void 0 : _previousActiveElemen2.call(_previousActiveElemen3, ":focus-visible")) !== null && _previousActiveElemen !== void 0 ? _previousActiveElemen : false;
              } catch (_unused) {
                var timeSinceKeyboard = Date.now() - lastKeyboardInteractionTime;
                var timeSinceMouse = Date.now() - lastMouseInteractionTime;
                openedViaKeyboard = timeSinceKeyboard < timeSinceMouse && timeSinceKeyboard < 500;
              }
            }
          }
          var dialogState = {
            key: resolvedId,
            keySegments: configKeySegments,
            type: enhancedConfig.type,
            config: dialogRowConfigForState(enhancedConfig, configKeySegments),
            resolve: resolve,
            reject: reject,
            previousActiveElement: previousActiveElement,
            openedViaKeyboard: openedViaKeyboard,
            internalId: generateInternalId()
          };
          callbacks.trigger("willOpen");
          var newDialogs = [].concat(_toConsumableArray(tail), [dialogState]);
          seedDialogHandlers(resolvedId, dialogState.internalId, readOwnerTokenFromOpenConfig(enhancedConfig), extractReactiveHandlersFromConfig(enhancedConfig));
          setTimeout(function () {
            return callbacks.trigger("didOpen");
          }, 0);
          return newDialogs;
        };
        if (activeDialog && activeDialog.key !== resolvedId) {
          var notSameKeyConflict = createOpenDialogConflict({
            attemptedDialogKey: resolvedId,
            activeDialogKey: activeDialog.key,
            targetRowKey: activeDialog.key,
            activeDialogConfig: activeDialog.config,
            providerOnConflict: onConflict
          });
          var notSameKeyPolicy = resolveOpenConflictPolicy({
            activeDialogConfig: activeDialog.config,
            providerOnConflict: onConflict,
            conflict: notSameKeyConflict,
            reactiveHandlersContext: {
              key: activeDialog.key,
              internalId: activeDialog.internalId
            }
          });
          if (isOpenReplaceAllowed(notSameKeyPolicy, resolvedId, activeDialog.key)) {
            var _ensureDialogKeyArray2;
            if (activeDialog.resolve) {
              activeDialog.resolve({
                dialogKey: activeDialog.key,
                reason: "replace",
                ok: true,
                cancelled: false,
                resolveValue: "replaced"
              });
            }
            lastMergedConfigRef.current["delete"](activeDialog.key);
            var activeIndex = prev.findIndex(function (d) {
              return d.key === activeDialog.key;
            });
            if (activeIndex < 0) {
              var withoutActive = prev.filter(function (d) {
                return d.key !== activeDialog.key;
              });
              var newDialogs = appendNewDialogRow(withoutActive);
              dialogStateStore.replaceDialogsSnapshotWithoutNotify(newDialogs);
              clearDialogHandlersRow(activeDialog.key, activeDialog.internalId);
              return newDialogs;
            }
            var updatedConfigKeySegments = (_ensureDialogKeyArray2 = ensureDialogKeyArray(enhancedConfig.dialogKey)) !== null && _ensureDialogKeyArray2 !== void 0 ? _ensureDialogKeyArray2 : keySegments;
            var updatedConfig = _objectSpread2({}, enhancedConfig);
            if (updatedConfig._backdropHold) {
              delete updatedConfig._backdropHold;
            }
            var updatedDialog = _objectSpread2(_objectSpread2({}, activeDialog), {}, {
              key: resolvedId,
              keySegments: updatedConfigKeySegments,
              type: enhancedConfig.type,
              config: dialogRowConfigForState(updatedConfig, updatedConfigKeySegments),
              resolve: resolve,
              reject: reject,
              internalId: activeDialog.internalId
            });
            var nextDialogs = _toConsumableArray(prev);
            nextDialogs[activeIndex] = updatedDialog;
            clearDialogHandlersRow(activeDialog.key, activeDialog.internalId);
            seedDialogHandlers(resolvedId, updatedDialog.internalId, readOwnerTokenFromOpenConfig(enhancedConfig), extractReactiveHandlersFromConfig(enhancedConfig));
            dialogStateStore.replaceDialogsSnapshotWithoutNotify(nextDialogs);
            return nextDialogs;
          }
          return notifyConflict(attachResolvedOpenConflictDecision(notSameKeyConflict, notSameKeyPolicy, resolvedId, activeDialog.key), {
            activeDialogConfig: activeDialog.config,
            activeKey: activeDialog.key
          });
        }
        if (existingDialogIndex >= 0) {
          var existingDialog = prev[existingDialogIndex];
          var shouldUpdate = shouldDialogUpdate(stripOnConflictForComparison(existingDialog.config), stripOnConflictForComparison(enhancedConfig));
          var sameKeyConflict = createOpenDialogConflict({
            attemptedDialogKey: resolvedId,
            activeDialogKey: activeDialogKey,
            targetRowKey: existingDialog.key,
            activeDialogConfig: existingDialog.config,
            providerOnConflict: onConflict
          });
          var sameKeyConflictPolicy = resolveOpenConflictPolicy({
            activeDialogConfig: existingDialog.config,
            providerOnConflict: onConflict,
            conflict: sameKeyConflict,
            reactiveHandlersContext: {
              key: existingDialog.key,
              internalId: existingDialog.internalId
            }
          });
          var sameKeySwapAllowed = isOpenReplaceAllowed(sameKeyConflictPolicy, resolvedId, existingDialog.key);
          if (shouldUpdate) {
            if (!sameKeySwapAllowed) {
              return notifyConflict(attachResolvedOpenConflictDecision(sameKeyConflict, sameKeyConflictPolicy, resolvedId, existingDialog.key), {
                activeDialogConfig: existingDialog.config
              });
            }
            return applySameKeyDialogStateUpdate({
              prev: prev,
              existingDialogIndex: existingDialogIndex,
              existingDialog: existingDialog,
              enhancedConfig: enhancedConfig,
              resolve: resolve,
              reject: reject
            });
          }
          if (sameKeySwapAllowed) {
            return applySameKeyDialogStateUpdate({
              prev: prev,
              existingDialogIndex: existingDialogIndex,
              existingDialog: existingDialog,
              enhancedConfig: enhancedConfig,
              resolve: resolve,
              reject: reject
            });
          }
          return notifyConflict(attachResolvedOpenConflictDecision(sameKeyConflict, sameKeyConflictPolicy, resolvedId, existingDialog.key), {
            activeDialogConfig: existingDialog.config
          });
        } else {
          return appendNewDialogRow(prev);
        }
      });
    });
  }, [callbacks, slotRegistry, onConflict, throwOnConflictProp, mergeWithDefaults]);

  // Replace an existing dialog in-place, preserving the component instance (and backdrop)
  var replaceDialog = useCallback(function (dialogKey, config) {
    return new Promise(function (resolve, reject) {
      var configWithDefaults = mergeWithDefaults(config);
      var rKey = resolveDialogKey(configWithDefaults.dialogKey, {
        autogenerate: true
      });
      var keySegments = rKey.parts;
      var resolvedId = rKey.str;

      // Merge config with registered slots
      var enhancedConfig = mergeSlotsWithConfig(slotRegistry, configWithDefaults, resolvedId, keySegments);
      setDialogs(function (prev) {
        var existingDialogIndex = prev.findIndex(function (d) {
          return d.key === dialogKey;
        });
        if (existingDialogIndex >= 0) {
          var _ensureDialogKeyArray3;
          var existingDialog = prev[existingDialogIndex];

          // Resolve the current dialog's promise (signaling it has been replaced)
          if (existingDialog.resolve) {
            existingDialog.resolve({
              dialogKey: existingDialog.key,
              reason: "replace",
              ok: true,
              cancelled: false,
              resolveValue: "replaced"
            });
          }

          // Update the dialog state in-place, preserving internalId
          var updatedConfigKeySegments = (_ensureDialogKeyArray3 = ensureDialogKeyArray(enhancedConfig.dialogKey)) !== null && _ensureDialogKeyArray3 !== void 0 ? _ensureDialogKeyArray3 : existingDialog.keySegments;

          // Remove _backdropHold flag if present (dialog is being replaced, not held)
          var updatedConfig = _objectSpread2({}, enhancedConfig);
          if (updatedConfig._backdropHold) {
            delete updatedConfig._backdropHold;
          }
          var updatedDialog = _objectSpread2(_objectSpread2({}, existingDialog), {}, {
            key: resolvedId,
            keySegments: updatedConfigKeySegments,
            config: dialogRowConfigForState(updatedConfig, updatedConfigKeySegments),
            resolve: resolve,
            reject: reject,
            // Preserve internalId to prevent remount
            internalId: existingDialog.internalId
          });
          var newDialogs = _toConsumableArray(prev);
          newDialogs[existingDialogIndex] = updatedDialog;
          resyncDialogHandlersFromConfig(updatedDialog.key, updatedDialog.internalId, extractReactiveHandlersFromConfig(enhancedConfig));
          return newDialogs;
        } else {
          // Dialog not found, fallback to openDialog
          schedulePostUpdate(function () {
            openDialog(config).then(resolve)["catch"](reject);
          });
          return prev;
        }
      });
    });
  }, [slotRegistry, openDialog, mergeWithDefaults]);

  // Stable proxies for actions to avoid re-rendering children when dialog state changes
  var openRef = useRef(openDialog);
  var closeRef = useRef(closeDialog);
  var closeAllRef = useRef(closeAllDialogs);
  var replaceRef = useRef(replaceDialog);
  openRef.current = openDialog;
  closeRef.current = closeDialog;
  closeAllRef.current = closeAllDialogs;
  replaceRef.current = replaceDialog;
  var openProxy = useCallback(function (config) {
    return openRef.current(config);
  }, []);
  var closeProxy = useCallback(function (dialogKey, options) {
    return closeRef.current(dialogKey, options);
  }, []);
  var closeAllProxy = useCallback(function (options) {
    return closeAllRef.current(options);
  }, []);
  var replaceProxy = useCallback(function (dialogKey, config) {
    return replaceRef.current(dialogKey, config);
  }, []);

  // Memoize state context value for scaffolding only
  var stateContextValue = useMemo(function () {
    return {
      dialogs: dialogs,
      callbacks: callbacks,
      slots: slots
    };
  }, [dialogs, callbacks, slots]);

  // Memoize actions context value so consumers don't re-render unless proxies change
  var actionsContextValue = useMemo(function () {
    return {
      openDialog: openProxy,
      closeDialog: closeProxy,
      closeAllDialogs: closeAllProxy,
      replaceDialog: replaceProxy
    };
  }, [openProxy, closeProxy, closeAllProxy, replaceProxy]);
  return /*#__PURE__*/jsx(DialogActionsContext.Provider, {
    value: actionsContextValue,
    children: /*#__PURE__*/jsx(DialogCallbacksContext.Provider, {
      value: callbacks,
      children: /*#__PURE__*/jsxs(DialogStateContext.Provider, {
        value: stateContextValue,
        children: [/*#__PURE__*/jsx(GlobalStyles, {
          styles: dialogistStyles
        }), children, /*#__PURE__*/jsx(DialogScaffolding, {
          dialogs: dialogs,
          onClose: closeDialog,
          slots: slots,
          slotProps: slotProps
        })]
      })
    })
  });
};
var dialogRowConfigForState = function dialogRowConfigForState(enhanced, dialogKeySegments) {
  return stripInternalDialogOpenFields(_objectSpread2(_objectSpread2({}, enhanced), {}, {
    dialogKey: dialogKeySegments
  }));
};
var applySameKeyDialogStateUpdate = function applySameKeyDialogStateUpdate(params) {
  var _ensureDialogKeyArray4;
  var prev = params.prev,
    existingDialogIndex = params.existingDialogIndex,
    existingDialog = params.existingDialog,
    enhancedConfig = params.enhancedConfig,
    resolve = params.resolve,
    reject = params.reject;
  var updatedConfigKeySegments = (_ensureDialogKeyArray4 = ensureDialogKeyArray(enhancedConfig.dialogKey)) !== null && _ensureDialogKeyArray4 !== void 0 ? _ensureDialogKeyArray4 : existingDialog.keySegments;
  var updatedDialog = _objectSpread2(_objectSpread2({}, existingDialog), {}, {
    keySegments: updatedConfigKeySegments,
    config: dialogRowConfigForState(enhancedConfig, updatedConfigKeySegments),
    resolve: resolve,
    reject: reject,
    internalId: existingDialog.internalId
  });
  var newDialogs = _toConsumableArray(prev);
  newDialogs[existingDialogIndex] = updatedDialog;
  resyncDialogHandlersFromConfig(updatedDialog.key, updatedDialog.internalId, extractReactiveHandlersFromConfig(enhancedConfig));
  return newDialogs;
};

// Main provider that wraps everything with slot registry
var DialogProvider = function DialogProvider(_ref2) {
  var children = _ref2.children,
    defaultOptions = _ref2.defaultOptions,
    slots = _ref2.slots,
    slotProps = _ref2.slotProps,
    onConflict = _ref2.onConflict,
    throwOnConflict = _ref2.throwOnConflict;
  return /*#__PURE__*/jsx(DialogSlotRegistryProvider, {
    children: /*#__PURE__*/jsx(DialogProviderCore, {
      defaultOptions: defaultOptions,
      slots: slots,
      slotProps: slotProps,
      onConflict: onConflict,
      throwOnConflict: throwOnConflict,
      children: children
    })
  });
};

export { DialogProvider };
//# sourceMappingURL=DialogProvider.js.map
