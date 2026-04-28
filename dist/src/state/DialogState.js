"use client";
import { createClass as _createClass, objectSpread2 as _objectSpread2, classCallCheck as _classCallCheck, defineProperty as _defineProperty } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { useRef, useEffect, useCallback, useSyncExternalStore } from 'react';
import { shallowEqualLevel2 } from '../utils/shallowCompare.js';

var isProduction = function isProduction() {
  var _process;
  return ((_process = globalThis.process) === null || _process === void 0 || (_process = _process.env) === null || _process === void 0 ? void 0 : _process.NODE_ENV) === "production";
};
var DialogState = /*#__PURE__*/function () {
  function DialogState() {
    _classCallCheck(this, DialogState);
    _defineProperty(this, "entries", new Map());
    _defineProperty(this, "listeners", new Map());
  }
  return _createClass(DialogState, [{
    key: "emit",
    value: function emit(key) {
      var listeners = this.listeners.get(key);
      if (listeners) listeners.forEach(function (l) {
        l();
      });
    }
  }, {
    key: "getEntry",
    value: function getEntry(key) {
      return this.entries.get(key);
    }
  }, {
    key: "getValue",
    value: function getValue(key) {
      var _this$entries$get;
      return (_this$entries$get = this.entries.get(key)) === null || _this$entries$get === void 0 ? void 0 : _this$entries$get.value;
    }
  }, {
    key: "ensure",
    value: function ensure(key, initialValue) {
      var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "external";
      var existing = this.entries.get(key);
      if (!existing) {
        existing = {
          value: initialValue,
          source: source,
          version: 0,
          updatedAt: Date.now()
        };
        this.entries.set(key, existing);
      }
      return existing;
    }
  }, {
    key: "set",
    value: function set(key, value, source) {
      var _ref;
      var prev = this.entries.get(key);
      var nextSource = (_ref = source !== null && source !== void 0 ? source : prev === null || prev === void 0 ? void 0 : prev.source) !== null && _ref !== void 0 ? _ref : "external";
      var valueChanged = !prev || !shallowEqualLevel2(prev.value, value);
      var sourceChanged = !prev || prev.source !== nextSource;
      // biome-ignore lint/style/noNonNullAssertion: if !valueChanged then !prev is false, so prev is defined
      if (!valueChanged && !sourceChanged) return prev;
      var nextEntry = {
        value: value,
        source: nextSource,
        version: prev ? prev.version + 1 : 1,
        updatedAt: Date.now()
      };
      this.entries.set(key, nextEntry);
      this.emit(key);
      return nextEntry;
    }
  }, {
    key: "setSource",
    value: function setSource(key, source) {
      var prev = this.entries.get(key);
      if (!prev || prev.source === source) return;
      var next = _objectSpread2(_objectSpread2({}, prev), {}, {
        source: source,
        version: prev.version + 1,
        updatedAt: Date.now()
      });
      this.entries.set(key, next);
      this.emit(key);
    }
  }, {
    key: "clear",
    value: function clear(key) {
      this.entries["delete"](key);
      this.listeners["delete"](key);
    }
  }, {
    key: "subscribe",
    value: function subscribe(key, listener) {
      var _this = this;
      var set = this.listeners.get(key);
      if (!set) {
        set = new Set();
        this.listeners.set(key, set);
      }
      set.add(listener);
      return function () {
        var s = _this.listeners.get(key);
        if (!s) return;
        s["delete"](listener);
        if (s.size === 0) _this.listeners["delete"](key);
      };
    }
  }]);
}();
var dialogState = new DialogState();
var makeKey = function makeKey(dialogKey, key) {
  return "".concat(dialogKey, "::").concat(key);
};

/**
 * Subscribe to a realtime dialog value from the dialog state system.
 *
 * This hook uses React's `useSyncExternalStore` to subscribe to a dialog's state value.
 * State values are out-of-band updates that do NOT cause dialog re-renders, making them ideal
 * for real-time visual updates during user interactions (e.g., dragging a slider).
 *
 * The dialog state system is separate from dialog React state and is designed for high-frequency updates
 * that need to be reflected immediately without triggering dialog content re-renders.
 *
 * @param dialogKey - The dialog identifier
 * @param key - The key for the specific state value within the dialog
 * @param initialValue - Seed value applied only when this store entry is first created (same contract as
 *   `useState(initialValue)`). After that, updates must go through the returned setter; changing `initialValue` on a
 *   later render for the same `dialogKey` + `key` is ignored and emits a dev-only warning.
 * @param sourceFilter - Optional filter: "dialog" (only dialog updates), "external" (only external updates), or "any" (all updates, default)
 * @returns A tuple `[value, setValue]` where:
 *   - `value`: The current live value from the state system (filtered by source if specified)
 *   - `setValue`: Function to update the live value
 */
var useDialogStateValue = function useDialogStateValue(dialogKey, key, initialValue) {
  var sourceFilter = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "any";
  var storeKey = makeKey(dialogKey, key);
  var lastMatchingValueRef = useRef(initialValue);
  var seededInitialRef = useRef(initialValue);
  var seededStoreKeyRef = useRef(storeKey);
  useEffect(function () {
    var storeKeyChanged = seededStoreKeyRef.current !== storeKey;
    if (storeKeyChanged) {
      seededStoreKeyRef.current = storeKey;
      seededInitialRef.current = initialValue;
      dialogState.ensure(storeKey, initialValue);
      return;
    }
    if (!Object.is(seededInitialRef.current, initialValue)) {
      if (!isProduction()) {
        console.warn("[dialogist] useDialogStateValue: `initialValue` changed for the same store key (".concat(storeKey, "). ") + "The initial value is only applied when the entry is first created; use the returned setter to update the value.");
      }
      seededInitialRef.current = initialValue;
    }
    dialogState.ensure(storeKey, initialValue);
  }, [storeKey, initialValue]);
  var getSnapshot = useCallback(function () {
    var entry = dialogState.getEntry(storeKey);
    if (!entry) return lastMatchingValueRef.current;
    if (sourceFilter === "any" || entry.source === sourceFilter) {
      lastMatchingValueRef.current = entry.value;
      return entry.value;
    }
    return lastMatchingValueRef.current;
  }, [storeKey, sourceFilter]);
  var subscribe = useCallback(function (listener) {
    return dialogState.subscribe(storeKey, listener);
  }, [storeKey]);
  var value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  var setValue = useCallback(function (next, source) {
    return dialogState.set(storeKey, next, source);
  }, [storeKey]);
  return [value, setValue];
};

/**
 * Subscribe to the source metadata for a dialog state value.
 *
 * @param initial - Applied only when this store entry is first created. Later changes are ignored (use the setter)
 *   and trigger a dev-only warning for the same `dialogKey` + `key`.
 */
var useDialogStateSource = function useDialogStateSource(dialogKey, key) {
  var initial = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "external";
  var storeKey = makeKey(dialogKey, key);
  var seededInitialRef = useRef(initial);
  var seededStoreKeyRef = useRef(storeKey);
  useEffect(function () {
    var storeKeyChanged = seededStoreKeyRef.current !== storeKey;
    if (storeKeyChanged) {
      seededStoreKeyRef.current = storeKey;
      seededInitialRef.current = initial;
      dialogState.ensure(storeKey, undefined, initial);
      return;
    }
    if (seededInitialRef.current !== initial) {
      if (!isProduction()) {
        console.warn("[dialogist] useDialogStateSource: `initial` source changed for the same store key (".concat(storeKey, "). ") + "The initial source is only applied when the entry is first created; use the returned setter to update the source.");
      }
      seededInitialRef.current = initial;
    }
    dialogState.ensure(storeKey, undefined, initial);
  }, [storeKey, initial]);
  var getSnapshot = useCallback(function () {
    var _dialogState$getEntry, _dialogState$getEntry2;
    return (_dialogState$getEntry = (_dialogState$getEntry2 = dialogState.getEntry(storeKey)) === null || _dialogState$getEntry2 === void 0 ? void 0 : _dialogState$getEntry2.source) !== null && _dialogState$getEntry !== void 0 ? _dialogState$getEntry : initial;
  }, [storeKey, initial]);
  var subscribe = useCallback(function (listener) {
    return dialogState.subscribe(storeKey, listener);
  }, [storeKey]);
  var value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  var setValue = useCallback(function (next) {
    return dialogState.setSource(storeKey, next);
  }, [storeKey]);
  return [value, setValue];
};

/**
 * Imperatively set a dialog state value and optionally mark its source.
 *
 * @param dialogKey - The dialog identifier
 * @param key - The key for the specific state value
 * @param value - The value to set
 * @param source - Optional source: "dialog" (from dialog interaction) or "external" (external state). If not provided, only the value is updated.
 */
var setDialogStateValue = function setDialogStateValue(dialogKey, key, value, source) {
  dialogState.set(makeKey(dialogKey, key), value, source);
};

/**
 * Convenience function to set a dialog state value from within a dialog.
 * Automatically marks the source as "dialog".
 */
var setDialogStateValueFromDialog = function setDialogStateValueFromDialog(dialogKey, key, value) {
  setDialogStateValue(dialogKey, key, value, "dialog");
};

/**
 * Convenience function to set a dialog state value from external state.
 * Automatically marks the source as "external".
 */
var setDialogStateValueFromExternal = function setDialogStateValueFromExternal(dialogKey, key, value) {
  setDialogStateValue(dialogKey, key, value, "external");
};
var clearDialogStateValue = function clearDialogStateValue(dialogKey, key) {
  dialogState.clear(makeKey(dialogKey, key));
};

/**
 * Read a dialog state value without subscribing.
 */
var getDialogStateValue = function getDialogStateValue(dialogKey, key) {
  return dialogState.getValue(makeKey(dialogKey, key));
};

export { clearDialogStateValue, getDialogStateValue, setDialogStateValue, setDialogStateValueFromDialog, setDialogStateValueFromExternal, useDialogStateSource, useDialogStateValue };
//# sourceMappingURL=DialogState.js.map
