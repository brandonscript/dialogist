"use client";
import { createClass as _createClass, toConsumableArray as _toConsumableArray, slicedToArray as _slicedToArray, createForOfIteratorHelper as _createForOfIteratorHelper, classCallCheck as _classCallCheck, defineProperty as _defineProperty } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { dialogKeyStartsWith } from '../utils/dialogKey.js';

var KEY_DELIMITER = "::";

/** Fires every registered listener whose subscription key is a segment-aligned prefix of `changedKey`. */
var notifyPrefixListeners = function notifyPrefixListeners(changedKey, listeners) {
  var parts = changedKey.split(KEY_DELIMITER);
  for (var i = 1; i < parts.length; i++) {
    var prefixKey = parts.slice(0, i).join(KEY_DELIMITER);
    var set = listeners.get(prefixKey);
    if (set) {
      set.forEach(function (l) {
        l();
      });
    }
  }
};
var DialogStateStore = /*#__PURE__*/function () {
  function DialogStateStore() {
    _classCallCheck(this, DialogStateStore);
    _defineProperty(this, "dialogs", new Map());
    _defineProperty(this, "listeners", new Map());
    _defineProperty(this, "globalListeners", new Set());
    /** Keys removed by {@link replaceDialogsSnapshotWithoutNotify}; notified on next {@link setDialogs}. */
    _defineProperty(this, "silentRemovePendingNotify", new Set());
  }
  return _createClass(DialogStateStore, [{
    key: "get",
    value:
    /**
     * Returns the dialog for `key`. Falls back to a dialog whose full key has `key` as a
     * segment-aligned prefix — enabling `useDialogState("checkout-flow")` to resolve when the
     * active dialog is `"checkout-flow::step-1"`.
     *
     * When multiple rows match the same prefix, the **most recently inserted** row wins (aligned
     * with stack / `findLastIndex` semantics elsewhere).
     */
    function get(key) {
      var exact = this.dialogs.get(key);
      if (exact) return exact;
      var entries = _toConsumableArray(this.dialogs.entries());
      for (var i = entries.length - 1; i >= 0; i -= 1) {
        // biome-ignore lint/style/noNonNullAssertion: i is always within bounds of entries
        var _ref = entries[i],
          _ref2 = _slicedToArray(_ref, 2),
          k = _ref2[0],
          v = _ref2[1];
        if (dialogKeyStartsWith(k, key)) return v;
      }
      return undefined;
    }

    /**
     * Get all dialogs
     */
  }, {
    key: "getAll",
    value: function getAll() {
      return Array.from(this.dialogs.values());
    }

    /**
     * Returns `true` when a dialog with `key` (or a composite key prefixed by `key`) is open.
     */
  }, {
    key: "isOpen",
    value: function isOpen(key) {
      if (this.dialogs.has(key)) return true;
      var _iterator = _createForOfIteratorHelper(this.dialogs.keys()),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var k = _step.value;
          if (dialogKeyStartsWith(k, key)) return true;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return false;
    }

    /**
     * Replace the in-memory snapshot **without** notifying subscribers. Used from React state
     * updaters that also mutate the handler store so `useSyncExternalStore` cannot observe an open
     * dialog after `clearDialogHandlersRow` in the same synchronous turn (listeners are deferred to
     * {@link setDialogs} in layout).
     */
  }, {
    key: "replaceDialogsSnapshotWithoutNotify",
    value: function replaceDialogsSnapshotWithoutNotify(dialogs) {
      var newKeys = new Set(dialogs.map(function (d) {
        return d.key;
      }));
      for (var _i = 0, _arr = _toConsumableArray(this.dialogs.keys()); _i < _arr.length; _i++) {
        var key = _arr[_i];
        if (!newKeys.has(key)) {
          this.silentRemovePendingNotify.add(key);
          this.dialogs["delete"](key);
        }
      }
      var _iterator2 = _createForOfIteratorHelper(dialogs),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var d = _step2.value;
          this.dialogs.set(d.key, d);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }

    /**
     * Update all dialogs (called from DialogProvider).
     * When a composite key like `"checkout-flow::step-1"` changes, listeners for the root prefix
     * `"checkout-flow"` are also notified so `useDialogState` / `useDialogIsOpen` work with root keys.
     */
  }, {
    key: "setDialogs",
    value: function setDialogs(dialogs) {
      var _this = this;
      if (this.silentRemovePendingNotify.size > 0) {
        var _iterator3 = _createForOfIteratorHelper(this.silentRemovePendingNotify),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var key = _step3.value;
            var listeners = this.listeners.get(key);
            if (listeners) {
              listeners.forEach(function (l) {
                l();
              });
            }
            notifyPrefixListeners(key, this.listeners);
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        this.silentRemovePendingNotify.clear();
      }
      var prevKeys = new Set(this.dialogs.keys());
      var newKeys = new Set(dialogs.map(function (d) {
        return d.key;
      }));

      // Update or add dialogs
      dialogs.forEach(function (dialog) {
        var prev = _this.dialogs.get(dialog.key);
        _this.dialogs.set(dialog.key, dialog);
        if (prev !== dialog) {
          var _listeners = _this.listeners.get(dialog.key);
          if (_listeners) {
            _listeners.forEach(function (l) {
              l();
            });
          }
          notifyPrefixListeners(dialog.key, _this.listeners);
        }
      });

      // Remove dialogs that are no longer in the list
      prevKeys.forEach(function (key) {
        if (!newKeys.has(key)) {
          _this.dialogs["delete"](key);
          var _listeners2 = _this.listeners.get(key);
          if (_listeners2) {
            _listeners2.forEach(function (l) {
              l();
            });
          }
          notifyPrefixListeners(key, _this.listeners);
        }
      });

      // Notify global listeners (for scaffolding)
      this.globalListeners.forEach(function (l) {
        l();
      });
    }

    /**
     * Subscribe to changes for a specific dialog key
     */
  }, {
    key: "subscribe",
    value: function subscribe(key, listener) {
      var _this2 = this;
      var set = this.listeners.get(key);
      if (!set) {
        set = new Set();
        this.listeners.set(key, set);
      }
      set.add(listener);
      return function () {
        var s = _this2.listeners.get(key);
        if (!s) return;
        s["delete"](listener);
        if (s.size === 0) {
          _this2.listeners["delete"](key);
        }
      };
    }

    /**
     * Subscribe to all dialog changes (for scaffolding only)
     */
  }, {
    key: "subscribeAll",
    value: function subscribeAll(listener) {
      var _this3 = this;
      this.globalListeners.add(listener);
      return function () {
        _this3.globalListeners["delete"](listener);
      };
    }
  }]);
}();
var dialogStateStore = new DialogStateStore();

export { dialogStateStore };
//# sourceMappingURL=DialogStateStore.js.map
