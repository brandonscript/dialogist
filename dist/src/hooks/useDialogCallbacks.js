"use client";
import { useRef, useCallback, useMemo } from 'react';

var useDialogCallbacks = function useDialogCallbacks() {
  var callbacksRef = useRef({
    willOpen: [],
    didOpen: [],
    willClose: [],
    didClose: [],
    didCancel: [],
    busy: [],
    custom: {}
  });

  // Register callback functions
  var willOpen = useCallback(function (callback) {
    callbacksRef.current.willOpen.push(callback);
    return function () {
      var index = callbacksRef.current.willOpen.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.willOpen.splice(index, 1);
      }
    };
  }, []);
  var didOpen = useCallback(function (callback) {
    callbacksRef.current.didOpen.push(callback);
    return function () {
      var index = callbacksRef.current.didOpen.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.didOpen.splice(index, 1);
      }
    };
  }, []);
  var willClose = useCallback(function (callback) {
    callbacksRef.current.willClose.push(callback);
    return function () {
      var index = callbacksRef.current.willClose.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.willClose.splice(index, 1);
      }
    };
  }, []);
  var didClose = useCallback(function (callback) {
    callbacksRef.current.didClose.push(callback);
    return function () {
      var index = callbacksRef.current.didClose.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.didClose.splice(index, 1);
      }
    };
  }, []);
  var didCancel = useCallback(function (callback) {
    callbacksRef.current.didCancel.push(callback);
    return function () {
      var index = callbacksRef.current.didCancel.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.didCancel.splice(index, 1);
      }
    };
  }, []);
  var busy = useCallback(function (callback) {
    callbacksRef.current.busy.push(callback);
    return function () {
      var index = callbacksRef.current.busy.indexOf(callback);
      if (index > -1) {
        callbacksRef.current.busy.splice(index, 1);
      }
    };
  }, []);
  var trigger = useCallback(function (event, closeEvent) {
    callbacksRef.current[event].forEach(function (callback) {
      try {
        if (event === "willClose" || event === "didClose" || event === "didCancel") {
          if (closeEvent === undefined) {
            throw new Error("[Dialogist] callbacks.trigger(\"".concat(event, "\") requires a closeEvent argument"));
          }
          callback(closeEvent);
        } else {
          callback();
        }
      } catch (error) {
        console.error("Error in dialog ".concat(event, " callback:"), error);
      }
    });
  }, []);

  // Memoize the returned object to prevent recreating it every render
  return useMemo(function () {
    return {
      willOpen: willOpen,
      didOpen: didOpen,
      willClose: willClose,
      didClose: didClose,
      didCancel: didCancel,
      busy: busy,
      trigger: trigger,
      on: function on(dialogKey, event, handler) {
        var _callbacksRef$current;
        (_callbacksRef$current = callbacksRef.current.custom)[dialogKey] || (_callbacksRef$current[dialogKey] = {});
        var byDialog = callbacksRef.current.custom[dialogKey];
        byDialog[event] || (byDialog[event] = new Set());
        var set = byDialog[event];
        set.add(handler);
        return function () {
          set["delete"](handler);
          if (set.size === 0) delete byDialog[event];
        };
      },
      off: function off(dialogKey, event, handler) {
        var byDialog = callbacksRef.current.custom[dialogKey];
        if (!byDialog) return;
        var set = byDialog[event];
        if (!set) return;
        set["delete"](handler);
        if (set.size === 0) delete byDialog[event];
      },
      emit: function emit(dialogKey, event, payload) {
        var _callbacksRef$current2;
        var set = (_callbacksRef$current2 = callbacksRef.current.custom[dialogKey]) === null || _callbacksRef$current2 === void 0 ? void 0 : _callbacksRef$current2[event];
        if (!set) return;
        for (var _i = 0, _Array$from = Array.from(set); _i < _Array$from.length; _i++) {
          var fn = _Array$from[_i];
          try {
            fn(payload);
          } catch (err) {
            console.error("Dialog custom event handler error:", err);
          }
        }
      }
    };
  }, [willOpen, didOpen, willClose, didClose, didCancel, busy, trigger]);
};

export { useDialogCallbacks };
//# sourceMappingURL=useDialogCallbacks.js.map
