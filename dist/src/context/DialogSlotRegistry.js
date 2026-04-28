"use client";
import { objectSpread2 as _objectSpread2 } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { useMemo, useCallback, createContext, useContext } from 'react';
import { deepEqual as _deepEqual } from '../utils/deepCompare.js';
import { resolveDialogKey } from '../utils/dialogKey.js';
import { jsx } from 'react/jsx-runtime';

var DialogSlotRegistryContext = /*#__PURE__*/createContext(null);
var DialogSlotRegistryProvider = function DialogSlotRegistryProvider(_ref) {
  var children = _ref.children;
  // Map structure: normalized dialogKey string -> slotType -> DialogSlot
  var slotRegistry = useMemo(function () {
    return new Map();
  }, []);
  var changeListeners = useMemo(function () {
    return new Set();
  }, []);
  var registerSlot = useCallback(function (slot) {
    var _existing$value;
    if (!slotRegistry.has(slot.key)) {
      slotRegistry.set(slot.key, new Map());
    }

    // biome-ignore lint/style/noNonNullAssertion: key guaranteed to exist — set in the block above
    var dialogSlots = slotRegistry.get(slot.key);
    var nextValue = slot.factory();
    var existing = dialogSlots.get(slot.slotType);
    var prevValue = existing ? (_existing$value = existing.value) !== null && _existing$value !== void 0 ? _existing$value : existing.factory() : undefined;

    // Last write wins per (key, slotType): always store the latest factory + resolved value.
    // Notify only when the resolved value actually changed (deps only affect React effect timing).
    dialogSlots.set(slot.slotType, _objectSpread2(_objectSpread2({}, slot), {}, {
      value: nextValue
    }));
    if (existing !== undefined && _deepEqual(prevValue, nextValue)) {
      return;
    }

    // Notify synchronously from within useLayoutEffect so React batches the resulting setState
    // calls with the current commit, rendering StableDialogRenderer before the browser paints.
    // React 18 automatic batching merges all setState calls from multiple slots into one render.
    changeListeners.forEach(function (callback) {
      callback(slot.key, slot.slotType);
    });
  }, [slotRegistry, changeListeners]);
  var removeSlot = useCallback(function (dialogKey, slotType) {
    var rKey = resolveDialogKey(dialogKey);
    var dialogSlots = slotRegistry.get(rKey.str);
    if (!(dialogSlots !== null && dialogSlots !== void 0 && dialogSlots.has(slotType))) return;
    dialogSlots["delete"](slotType);
    if (dialogSlots.size === 0) {
      slotRegistry["delete"](rKey.str);
    }
    changeListeners.forEach(function (callback) {
      callback(rKey.str, slotType);
    });
  }, [slotRegistry, changeListeners]);
  var getSlot = useCallback(function (dialogKey, slotType) {
    var _slotRegistry$get;
    var rKey = resolveDialogKey(dialogKey);
    return (_slotRegistry$get = slotRegistry.get(rKey.str)) === null || _slotRegistry$get === void 0 ? void 0 : _slotRegistry$get.get(slotType);
  }, [slotRegistry]);
  var getAllSlots = useCallback(function (dialogKey) {
    var rKey = resolveDialogKey(dialogKey);
    var dialogSlots = slotRegistry.get(rKey.str);
    return dialogSlots ? Array.from(dialogSlots.values()) : [];
  }, [slotRegistry]);
  var clearSlots = useCallback(function (dialogKey) {
    var rKey = resolveDialogKey(dialogKey);
    var dialogSlots = slotRegistry.get(rKey.str);
    var slotTypes = dialogSlots ? Array.from(dialogSlots.keys()) : [];
    slotRegistry["delete"](rKey.str);
    if (slotTypes.length === 0) {
      return;
    }
    slotTypes.forEach(function (slotType) {
      changeListeners.forEach(function (callback) {
        callback(rKey.str, slotType);
      });
    });
  }, [slotRegistry, changeListeners]);
  var onSlotChange = useCallback(function (callback) {
    changeListeners.add(callback);
    // Return unsubscribe function
    return function () {
      return changeListeners["delete"](callback);
    };
  }, [changeListeners]);
  var contextValue = useMemo(function () {
    return {
      registerSlot: registerSlot,
      removeSlot: removeSlot,
      getSlot: getSlot,
      getAllSlots: getAllSlots,
      clearSlots: clearSlots,
      onSlotChange: onSlotChange
    };
  }, [registerSlot, removeSlot, getSlot, getAllSlots, clearSlots, onSlotChange]);
  return /*#__PURE__*/jsx(DialogSlotRegistryContext.Provider, {
    value: contextValue,
    children: children
  });
};
var useDialogSlotRegistry = function useDialogSlotRegistry() {
  var context = useContext(DialogSlotRegistryContext);
  if (!context) {
    throw new Error("useDialogSlotRegistry must be used within DialogSlotRegistryProvider");
  }
  return context;
};

export { DialogSlotRegistryProvider, useDialogSlotRegistry };
//# sourceMappingURL=DialogSlotRegistry.js.map
