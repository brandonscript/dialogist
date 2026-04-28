"use client";
import { objectSpread2 as _objectSpread2, slicedToArray as _slicedToArray, toConsumableArray as _toConsumableArray } from '../_virtual/_rollupPluginBabelHelpers.js';
import { useRef, useContext, createRef, useCallback, useEffect, useMemo } from 'react';
import { useDialogActionsContext } from './context/DialogActionsContext.js';
import { DialogCallbacksContext } from './context/DialogCallbacksContext.js';
import { clearDialogImperativeHandle, registerDialogImperativeHandle, getDialogImperativeHandle } from './context/DialogImperativeHandles.js';
import { useDialogSlotRegistry } from './context/DialogSlotRegistry.js';
import { dialogStateStore } from './context/DialogStateStore.js';
import { useDialogState } from './hooks/useDialogState.js';
import { useShallowEffect } from './hooks/useShallowEffect.js';
import { extractReactiveHandlersFromConfig, hasDialogHandlersRow, seedDialogHandlers, tryMergeReactiveHandlers, tryClearReactiveHandlers, getReactiveHandlersSnapshot } from './state/DialogHandlers.js';
import { evaluateDialogCanClose } from './utils/dialogCanClose.js';
import { resolveDialogKey, dialogKeyArrayEquals } from './utils/dialogKey.js';

/**
 * Hook for opening and controlling dialogs.
 *
 * @template TResolveValue - Default type for resolveValue when the dialog closes via an action.
 * Use dialog.open<T>() to override per-call, or useDialog<T>() to set a default for this dialog.
 * @template TActionId - Union of custom action ids. Default (never) = built-in "ok" | "cancel" only. Specify e.g. "draft" | "delete" to add custom ids.
 *
 * Includes `isOpen`: true when a dialog with this key is on the stack. Use `useDialogIsOpen(key)` only when you need that without the rest of the API.
 */
var useDialog = function useDialog(key, initialConfig, deps) {
  // Intentionally do not autogenerate here: useDialog() without a key should require
  // key input at open-time (or via config), not silently create a default identity.
  var initialResolvedKey = key === undefined ? undefined : resolveDialogKey(key);
  var initialResolvedKeyRef = useRef(initialResolvedKey);
  var _useDialogActionsCont = useDialogActionsContext(),
    openDialog = _useDialogActionsCont.openDialog,
    closeDialog = _useDialogActionsCont.closeDialog,
    closeAllDialogs = _useDialogActionsCont.closeAllDialogs,
    replaceDialog = _useDialogActionsCont.replaceDialog;
  // Use context if available; otherwise fall back to a local registry so hooks can work outside provider
  var ctx = useContext(DialogCallbacksContext);
  // Subscribe only to this specific dialog's state (prevents re-renders when other dialogs change)
  // If no key provided, use a placeholder that won't match any real dialog
  var dialogState = useDialogState(key !== null && key !== void 0 ? key : "");
  var slotRegistry = useDialogSlotRegistry();
  var localRegistryRef = useRef(new Map());
  var fallbackImperativeHandleRef = useRef(/*#__PURE__*/createRef());
  var registeredImperativeHandleRef = useRef(null);

  // Persist initial config and deps to avoid recreating callbacks when callers pass inline objects
  var initialConfigRef = useRef(initialConfig);
  var depsRef = useRef(deps);
  var defaultThrottleMsRef = useRef(getLiveThrottleMs(initialConfigRef.current));

  // Flow Controller state: track which dialog this hook instance is currently managing
  var activeKeyRef = useRef(initialResolvedKey);
  var getCurrentKeyStr = useCallback(function () {
    var _activeKeyRef$current, _activeKeyRef$current2, _initialResolvedKeyRe;
    return (_activeKeyRef$current = (_activeKeyRef$current2 = activeKeyRef.current) === null || _activeKeyRef$current2 === void 0 ? void 0 : _activeKeyRef$current2.str) !== null && _activeKeyRef$current !== void 0 ? _activeKeyRef$current : (_initialResolvedKeyRe = initialResolvedKeyRef.current) === null || _initialResolvedKeyRe === void 0 ? void 0 : _initialResolvedKeyRe.str;
  }, []);

  // History tracking for next/back navigation - stores full configs
  var historyRef = useRef([]);
  var lastOpenConfigRef = useRef(null);
  var handlersOwnerRef = useRef(Symbol("dialogist-useDialog-handlers"));

  // Keep refs in sync when callers change initial config or deps (e.g., HMR / live edits)
  // Use shallow comparison since initialConfig and deps are objects/arrays that may be recreated
  useShallowEffect(function () {
    if (initialConfig !== undefined) {
      initialConfigRef.current = initialConfig;
      defaultThrottleMsRef.current = getLiveThrottleMs(initialConfig);
    }
  }, [initialConfig]);
  useShallowEffect(function () {
    if (deps !== undefined) {
      depsRef.current = deps;
    }
  }, [deps]);
  useEffect(function () {
    initialResolvedKeyRef.current = initialResolvedKey;
  }, [initialResolvedKey]);
  var mergeWithInitialConfig = useCallback(function () {
    var base = _objectSpread2({}, initialConfigRef.current);
    for (var _len = arguments.length, configs = new Array(_len), _key = 0; _key < _len; _key++) {
      configs[_key] = arguments[_key];
    }
    for (var _i = 0, _configs = configs; _i < _configs.length; _i++) {
      var cfg = _configs[_i];
      if (cfg) {
        Object.assign(base, cfg);
      }
    }
    return base;
  }, []);
  var resolveDialogKeySegments = useCallback(function (keyOrConfig, config, fallbackKey) {
    var rKey;
    var mergedConfig;
    if (keyOrConfig === undefined) {
      rKey = fallbackKey !== null && fallbackKey !== void 0 ? fallbackKey : initialResolvedKeyRef.current;
      mergedConfig = mergeWithInitialConfig(config);
    } else if (Array.isArray(keyOrConfig) || typeof keyOrConfig === "string" || typeof keyOrConfig === "number") {
      rKey = resolveDialogKey(keyOrConfig);
      mergedConfig = mergeWithInitialConfig(config);
    } else {
      var _ref, _ref2;
      var configObj = keyOrConfig;
      rKey = (_ref = (_ref2 = configObj.dialogKey === undefined ? undefined : resolveDialogKey(configObj.dialogKey)) !== null && _ref2 !== void 0 ? _ref2 : fallbackKey) !== null && _ref !== void 0 ? _ref : initialResolvedKeyRef.current;
      mergedConfig = mergeWithInitialConfig(configObj, config);
    }
    if (!rKey) {
      throw new Error("[Dialogist] useDialog: Unable to resolve dialogKey. Provide a key to useDialog() or pass it to open().");
    }
    return {
      rKey: rKey,
      mergedConfig: mergedConfig
    };
  }, [mergeWithInitialConfig]);
  var buildDialogConfig = useCallback(function (keySegments, mergedConfig) {
    var _getLiveThrottleMs;
    return _objectSpread2(_objectSpread2({}, mergedConfig), {}, {
      dialogKey: keySegments,
      _dialogDeps: depsRef.current,
      ownerToken: handlersOwnerRef.current,
      liveThrottleMs: (_getLiveThrottleMs = getLiveThrottleMs(mergedConfig)) !== null && _getLiveThrottleMs !== void 0 ? _getLiveThrottleMs : defaultThrottleMsRef.current
    });
  }, []);
  var resolveRowForHandlers = useCallback(function () {
    var _dialogStateStore$get;
    var k = getCurrentKeyStr();
    if (!k) return null;
    return (_dialogStateStore$get = dialogStateStore.get(k)) !== null && _dialogStateStore$get !== void 0 ? _dialogStateStore$get : null;
  }, [getCurrentKeyStr]);

  // initialConfig must be a dependency so handler closures refresh when callers pass new functions (e.g. canClose: () => state).
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — merge reads latest refs; dialogState identity updates on stack changes.
  useEffect(function () {
    var _lastOpenConfigRef$cu, _initialConfigRef$cur;
    if (!dialogState) return;
    var last = (_lastOpenConfigRef$cu = lastOpenConfigRef.current) !== null && _lastOpenConfigRef$cu !== void 0 ? _lastOpenConfigRef$cu : {};
    var init = (_initialConfigRef$cur = initialConfigRef.current) !== null && _initialConfigRef$cur !== void 0 ? _initialConfigRef$cur : {};
    var initDefined = {};
    for (var _i2 = 0, _Object$entries = Object.entries(init); _i2 < _Object$entries.length; _i2++) {
      var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
        k = _Object$entries$_i[0],
        v = _Object$entries$_i[1];
      if (v !== undefined) {
        initDefined[k] = v;
      }
    }
    var merged = _objectSpread2(_objectSpread2({}, last), initDefined);
    var extractedHandlers = extractReactiveHandlersFromConfig(merged);
    var extractedHasPayload = Object.values(extractedHandlers).some(function (v) {
      return v !== undefined;
    });
    if (extractedHasPayload && !hasDialogHandlersRow(dialogState.key, dialogState.internalId)) {
      seedDialogHandlers(dialogState.key, dialogState.internalId, handlersOwnerRef.current, extractedHandlers);
    }
    tryMergeReactiveHandlers(dialogState.key, dialogState.internalId, handlersOwnerRef.current, extractedHandlers, {
      silent: true
    });
  }, [dialogState, initialConfig]);
  var withDialogKeyAndDeps = useCallback(function (keyOrConfig, config) {
    var _activeKeyRef$current3;
    var _resolveDialogKeySegm = resolveDialogKeySegments(keyOrConfig, config, (_activeKeyRef$current3 = activeKeyRef.current) !== null && _activeKeyRef$current3 !== void 0 ? _activeKeyRef$current3 : initialResolvedKeyRef.current),
      rKey = _resolveDialogKeySegm.rKey,
      mergedConfig = _resolveDialogKeySegm.mergedConfig;
    return buildDialogConfig(rKey.parts, mergedConfig);
  }, [resolveDialogKeySegments, buildDialogConfig]);
  var syncActiveKeyRef = useCallback(function (dialogKey) {
    activeKeyRef.current = resolveDialogKey(dialogKey);
  }, []);

  // Dialog opening (returns Promise<DialogCloseEvent<T, TActionId>>, can be awaited or ignored)
  // Overloaded type so TypeScript infers `props` from the component passed to `message`.

  var open = useCallback(function (keyOrConfig, config) {
    var merged = withDialogKeyAndDeps(keyOrConfig, config);
    syncActiveKeyRef(merged.dialogKey);
    lastOpenConfigRef.current = merged;
    return openDialog(merged);
  }, [openDialog, withDialogKeyAndDeps, syncActiveKeyRef]);
  var close = useCallback(function (result, options) {
    var keyToClose = getCurrentKeyStr();
    if (!keyToClose) {
      console.warn("[Dialogist] useDialog.close(): No active dialog to close.");
      return;
    }
    closeDialog(keyToClose, _objectSpread2(_objectSpread2({}, options), {}, {
      reason: (options === null || options === void 0 ? void 0 : options.reason) || "programmatic",
      resolveValue: result
    }));
  }, [closeDialog, getCurrentKeyStr]);
  var closeAll = useCallback(function (options) {
    closeAllDialogs(options);
  }, [closeAllDialogs]);
  var replace = useCallback(function (keyOrConfig, config) {
    var _activeKeyRef$current4, _activeKeyRef$current5;
    // Get the current active dialog ID
    var currentKeyStr = (_activeKeyRef$current4 = activeKeyRef.current) === null || _activeKeyRef$current4 === void 0 ? void 0 : _activeKeyRef$current4.str;
    if (!currentKeyStr) {
      throw new Error("[Dialogist] useDialog.replace(): No active dialog to replace.");
    }
    var _resolveDialogKeySegm2 = resolveDialogKeySegments(keyOrConfig, config, (_activeKeyRef$current5 = activeKeyRef.current) !== null && _activeKeyRef$current5 !== void 0 ? _activeKeyRef$current5 : initialResolvedKeyRef.current),
      rKey = _resolveDialogKeySegm2.rKey,
      mergedConfig = _resolveDialogKeySegm2.mergedConfig;
    var merged = buildDialogConfig(rKey.parts, mergedConfig);

    // Capture current key before updating refs
    var targetKeyStr = currentKeyStr;

    // Update refs immediately so UI is consistent
    syncActiveKeyRef(merged.dialogKey);
    lastOpenConfigRef.current = merged;

    // Use replaceDialog to atomically replace the dialog in-place
    return replaceDialog(targetKeyStr, merged);
  }, [resolveDialogKeySegments, buildDialogConfig, replaceDialog, syncActiveKeyRef]);
  var next = useCallback(function (step, config) {
    var _activeKeyRef$current6;
    var currentKeyParts = (_activeKeyRef$current6 = activeKeyRef.current) === null || _activeKeyRef$current6 === void 0 ? void 0 : _activeKeyRef$current6.parts;

    // Require composite key (array) with root + step for next() navigation
    if (!currentKeyParts || !Array.isArray(currentKeyParts) || currentKeyParts.length < 2) {
      throw new Error("[Dialogist] useDialog.next(): Requires a composite dialog key with at least two segments (root and step). Use useDialog(['root', 'step']) or dialog.open(['root', 'step']).");
    }

    // Construct new key: [...rootSegments, step]
    var rootSegments = currentKeyParts.slice(0, -1); // All but last segment
    var newKey = [].concat(_toConsumableArray(rootSegments), [step]);

    // Push current config to history before moving forward,
    // BUT ONLY if we are actually changing steps (new key != current key).
    // This prevents duplicate history when re-opening/updating the same step.
    if (lastOpenConfigRef.current && !dialogKeyArrayEquals(currentKeyParts, newKey)) {
      historyRef.current.push(lastOpenConfigRef.current);
    }

    // Merge config
    var mergedConfig = mergeWithInitialConfig(config);

    // Use replace to seamlessly transition and return promise
    return replace(newKey, mergedConfig);
  }, [replace, mergeWithInitialConfig]);
  var back = useCallback(function (targetStep) {
    var _activeKeyRef$current7;
    var history = historyRef.current;
    var currentKeyParts = (_activeKeyRef$current7 = activeKeyRef.current) === null || _activeKeyRef$current7 === void 0 ? void 0 : _activeKeyRef$current7.parts;
    if (targetStep !== undefined) {
      if (!currentKeyParts || !Array.isArray(currentKeyParts) || currentKeyParts.length < 2) {
        throw new Error("[Dialogist] useDialog.back(targetStep): Requires a composite dialog key with at least two segments (root and step). Use useDialog(['root', 'step']).");
      }
    }
    if (history.length === 0) {
      // No history, close current dialog
      close();
      return Promise.resolve(undefined);
    }
    if (targetStep === undefined) {
      // Pop one step back
      var prevConfig = history.pop();
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
    var rootSegments = currentKeyParts.slice(0, -1);
    var targetKeyParts = [].concat(_toConsumableArray(rootSegments), [targetStep]);

    // Pop until we find the target (or run out of history)
    var found = false;
    var popped = [];
    while (history.length > 0) {
      // biome-ignore lint/style/noNonNullAssertion: loop condition guarantees history is non-empty
      var _config = history.pop();
      var configKeyParts = _config.dialogKey === undefined ? undefined : resolveDialogKey(_config.dialogKey).parts;
      if (configKeyParts && dialogKeyArrayEquals(configKeyParts, targetKeyParts)) {
        found = true;
        return replace(_config);
      }
      popped.push(_config);
    }

    // If not found, restore popped items and close
    if (!found) {
      // Restore popped items (in reverse order since we popped from end)
      history.push.apply(history, _toConsumableArray(popped.reverse()));
      close();
      return Promise.resolve(undefined);
    }
  }, [replace, close]);

  /** True when a dialog with this hook's key is on the stack. */
  var isOpen = dialogState !== undefined;
  useEffect(function () {
    if (!isOpen) {
      historyRef.current = [];
    }
  }, [isOpen]);

  // Toggle open/close based on current state (if provider present). If no provider, default to open.
  var toggle = useCallback(function (keyOrConfig, config) {
    if (isOpen) {
      close();
    } else {
      open(keyOrConfig, config);
    }
  }, [isOpen, close, open]);

  /**
   * @internal Library / advanced integration — merges reactive handlers for the open row.
   */
  var _setHandlers = useCallback(function (partial) {
    var row = resolveRowForHandlers();
    if (!row) {
      throw new Error("[Dialogist] _setHandlers: No open dialog for this key.");
    }
    tryMergeReactiveHandlers(row.key, row.internalId, handlersOwnerRef.current, partial);
  }, [resolveRowForHandlers]);

  /**
   * @internal Clears reactive handler fields registered via {@link _setHandlers}.
   */
  var _clearHandlers = useCallback(function (fields) {
    var row = resolveRowForHandlers();
    if (!row) return;
    tryClearReactiveHandlers(row.key, row.internalId, handlersOwnerRef.current, fields);
  }, [resolveRowForHandlers]);

  /**
   * @internal Returns the reactive handler snapshot for the open row (owner-scoped).
   */
  var _getHandlers = useCallback(function () {
    var row = resolveRowForHandlers();
    if (!row) return undefined;
    return getReactiveHandlersSnapshot(row.key, row.internalId, handlersOwnerRef.current);
  }, [resolveRowForHandlers]);
  var canClose = useCallback(function () {
    var _lastOpenConfigRef$cu2;
    var row = resolveRowForHandlers();
    var activeConfig = (_lastOpenConfigRef$cu2 = lastOpenConfigRef.current) !== null && _lastOpenConfigRef$cu2 !== void 0 ? _lastOpenConfigRef$cu2 : initialConfigRef.current;
    if (!row || !activeConfig) return true;
    return evaluateDialogCanClose(row.keySegments, row.internalId, activeConfig, "programmatic");
  }, [resolveRowForHandlers]);
  var registerImperativeSlot = useCallback(function (slotType, input) {
    var factory = typeof input === "function" ? input : function () {
      return input;
    };
    var key = getCurrentKeyStr();
    if (!key) {
      console.warn("[Dialogist] useDialog slot registration: No dialog key available. Provide a key to useDialog().");
      return;
    }
    var payload = {
      key: key,
      slotType: slotType,
      factory: factory,
      deps: []
    };
    slotRegistry.registerSlot(payload);
  }, [slotRegistry, getCurrentKeyStr]);
  useEffect(function () {
    return function () {
      if (registeredImperativeHandleRef.current) {
        var _key2 = getCurrentKeyStr();
        if (_key2) {
          clearDialogImperativeHandle(_key2, registeredImperativeHandleRef.current);
        }
      }
    };
  }, [getCurrentKeyStr]);
  var setImperativeHandle = useCallback(function (ref) {
    registeredImperativeHandleRef.current = ref !== null && ref !== void 0 ? ref : null;
    var key = getCurrentKeyStr();
    if (!key) {
      console.warn("[Dialogist] useDialog.setImperativeRef(): No dialog key available. Provide a key to useDialog().");
      return;
    }
    if (!ref) {
      clearDialogImperativeHandle(key);
      return;
    }
    registerDialogImperativeHandle(key, ref);
  }, [getCurrentKeyStr]);
  var imperativeHandle = useCallback(function () {
    var key = getCurrentKeyStr();
    if (!key) {
      return fallbackImperativeHandleRef.current;
    }
    var registered = getDialogImperativeHandle(key);
    if (registered) {
      return registered;
    }
    return fallbackImperativeHandleRef.current;
  }, [getCurrentKeyStr]);
  var setTitle = useMemo(function () {
    return function (next) {
      return registerImperativeSlot("title", next);
    };
  }, [registerImperativeSlot]);
  var setContent = useMemo(function () {
    return function (next) {
      return registerImperativeSlot("content", next);
    };
  }, [registerImperativeSlot]);
  var setStatusBar = useMemo(function () {
    return function (next) {
      return registerImperativeSlot("statusBar", next);
    };
  }, [registerImperativeSlot]);
  var setFooter = useMemo(function () {
    return function (next) {
      return registerImperativeSlot("footer", next);
    };
  }, [registerImperativeSlot]);
  var setProps = useMemo(function () {
    return function (next) {
      return registerImperativeSlot("props", next);
    };
  }, [registerImperativeSlot]);

  // Return a stable object so consumers can safely memoize against it
  return useMemo(function () {
    return {
      open: open,
      isOpen: isOpen,
      replace: replace,
      next: next,
      back: back,
      toggle: toggle,
      close: close,
      closeAll: closeAll,
      /**
       * Register an event handler scoped to this dialog.
       * Extend `DialogistEventMap` via declaration merging to register custom event names and payload types.
       * @param event - Event name
       * @param handler - Event handler function
       * @returns A function to unregister the event handler
       */
      on: function (event, handler) {
        var key = getCurrentKeyStr();
        if (!key) {
          console.warn("[Dialogist] useDialog.on(): No dialog key available. Provide a key to useDialog().");
          return function () {};
        }
        if (ctx) return ctx.on(key, event, handler);
        var byEvent = localRegistryRef.current.get(key);
        if (!byEvent) {
          byEvent = new Map();
          localRegistryRef.current.set(key, byEvent);
        }
        var set = byEvent.get(event);
        if (!set) {
          set = new Set();
          byEvent.set(event, set);
        }
        var handlerToStore = handler;
        set.add(handlerToStore);
        return function () {
          var _set, _set2, _byEvent;
          (_set = set) === null || _set === void 0 || _set["delete"](handlerToStore);
          if (((_set2 = set) === null || _set2 === void 0 ? void 0 : _set2.size) === 0) (_byEvent = byEvent) === null || _byEvent === void 0 || _byEvent["delete"](event);
        };
      },
      /**
       * Unregister an event handler scoped to this dialog
       * @param event - Event name
       * @param handler - Event handler function
       */
      off: function (event, handler) {
        var key = getCurrentKeyStr();
        if (!key) return;
        if (ctx) return ctx.off(key, event, handler);
        var byEvent = localRegistryRef.current.get(key);
        var set = byEvent === null || byEvent === void 0 ? void 0 : byEvent.get(event);
        if (set) {
          set["delete"](handler);
          if (set.size === 0) byEvent === null || byEvent === void 0 || byEvent["delete"](event);
        }
      },
      emit: function (event, payload) {
        var _localRegistryRef$cur;
        var key = getCurrentKeyStr();
        if (!key) return;
        if (ctx) return ctx.emit(key, event, payload);
        var set = (_localRegistryRef$cur = localRegistryRef.current.get(key)) === null || _localRegistryRef$cur === void 0 ? void 0 : _localRegistryRef$cur.get(event);
        if (!set) return;
        for (var _i3 = 0, _Array$from = Array.from(set); _i3 < _Array$from.length; _i3++) {
          var fn = _Array$from[_i3];
          try {
            fn(payload);
          } catch (err) {
            console.error("Dialog local emit handler error:", err);
          }
        }
      },
      imperativeHandle: imperativeHandle,
      _setHandlers: _setHandlers,
      _clearHandlers: _clearHandlers,
      _getHandlers: _getHandlers,
      canClose: canClose,
      setTitle: setTitle,
      setContent: setContent,
      setStatusBar: setStatusBar,
      setFooter: setFooter,
      setProps: setProps,
      setImperativeHandle: setImperativeHandle
    };
  }, [open, isOpen, replace, next, back, toggle, close, closeAll, imperativeHandle, _setHandlers, _clearHandlers, _getHandlers, canClose, setTitle, setContent, setStatusBar, setFooter, setProps, setImperativeHandle, ctx, getCurrentKeyStr]);
};
var getLiveThrottleMs = function getLiveThrottleMs(cfg) {
  if (!cfg) return undefined;
  return cfg.liveThrottleMs;
};

export { useDialog };
//# sourceMappingURL=useDialog.js.map
