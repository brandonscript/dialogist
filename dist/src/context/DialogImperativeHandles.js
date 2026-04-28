"use client";
import { typeof as _typeof } from '../../_virtual/_rollupPluginBabelHelpers.js';

var registry = new Map();
var listenersByKey = new Map();
var patchedRefs = new WeakSet();
var pendingNotifyKeys = new Set();
var flushDialogImperativeListeners = function flushDialogImperativeListeners(key) {
  var set = listenersByKey.get(key);
  if (!set) return;
  set.forEach(function (listener) {
    try {
      listener();
    } catch (_unused) {
      /* ignore subscriber errors */
    }
  });
};

/** Deferred so `register` / `.current` writes do not synchronously re-render during React commit. */
var scheduleNotifyDialogImperativeListeners = function scheduleNotifyDialogImperativeListeners(key) {
  if (pendingNotifyKeys.has(key)) return;
  pendingNotifyKeys.add(key);
  queueMicrotask(function () {
    pendingNotifyKeys["delete"](key);
    flushDialogImperativeListeners(key);
  });
};

/**
 * Subscribe to imperative handle registration/clear and to `.current` updates when the ref can be
 * safely patched (see {@link registerDialogImperativeHandle}). Identity of `.current` is compared
 * with `Object.is`; in-place mutation of the same object instance is not detected.
 */
var subscribeDialogImperativeHandle = function subscribeDialogImperativeHandle(key, listener) {
  var set = listenersByKey.get(key);
  if (!set) {
    set = new Set();
    listenersByKey.set(key, set);
  }
  set.add(listener);
  return function () {
    var s = listenersByKey.get(key);
    if (!s) return;
    s["delete"](listener);
    if (s.size === 0) {
      listenersByKey["delete"](key);
    }
  };
};
var tryPatchRefCurrentNotifier = function tryPatchRefCurrentNotifier(key, ref) {
  if (!ref || _typeof(ref) !== "object" || patchedRefs.has(ref)) {
    return;
  }
  try {
    var desc = Object.getOwnPropertyDescriptor(ref, "current");
    if ((desc === null || desc === void 0 ? void 0 : desc.configurable) === false) {
      return;
    }
    var value = ref.current;
    Object.defineProperty(ref, "current", {
      configurable: true,
      enumerable: true,
      get: function get() {
        return value;
      },
      set: function set(next) {
        if (!Object.is(value, next)) {
          value = next;
          scheduleNotifyDialogImperativeListeners(key);
        } else {
          value = next;
        }
      }
    });
    patchedRefs.add(ref);
  } catch (_unused2) {
    /* ref may be sealed or non-extensible */
  }
};
var registerDialogImperativeHandle = function registerDialogImperativeHandle(key, handle) {
  if (!handle) {
    clearDialogImperativeHandle(key);
    return;
  }
  tryPatchRefCurrentNotifier(key, handle);
  registry.set(key, handle);
  scheduleNotifyDialogImperativeListeners(key);
};
var getDialogImperativeHandle = function getDialogImperativeHandle(key) {
  var _ref;
  return (_ref = registry.get(key)) !== null && _ref !== void 0 ? _ref : null;
};
var clearDialogImperativeHandle = function clearDialogImperativeHandle(key, handle) {
  var existing = registry.get(key);
  if (!existing) return;
  if (handle && existing !== handle) return;
  registry["delete"](key);
  scheduleNotifyDialogImperativeListeners(key);
};

export { clearDialogImperativeHandle, getDialogImperativeHandle, registerDialogImperativeHandle, subscribeDialogImperativeHandle };
//# sourceMappingURL=DialogImperativeHandles.js.map
