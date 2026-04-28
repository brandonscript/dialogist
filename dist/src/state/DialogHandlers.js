"use client";
import { objectSpread2 as _objectSpread2, createForOfIteratorHelper as _createForOfIteratorHelper, objectWithoutProperties as _objectWithoutProperties } from '../../_virtual/_rollupPluginBabelHelpers.js';

var _excluded = ["ownerToken", "_dialogDeps"];
var rowKey = function rowKey(dialogKey, internalId) {
  return "".concat(dialogKey, "\0").concat(internalId);
};

/** Reactive overrides merged into the per-open handler store (see {@link seedDialogHandlers}). */

var store = new Map();
var flattenActionsInput = function flattenActionsInput(input) {
  if (!Array.isArray(input) || input.length === 0) return [];
  var hasNested = input.some(function (el) {
    return Array.isArray(el);
  });
  if (!hasNested) {
    return input;
  }
  return input.flatMap(function (slot) {
    return Array.isArray(slot) ? slot : [slot];
  });
};
var extractActionHandlersFromConfig = function extractActionHandlersFromConfig(config) {
  var out = {};
  var _iterator = _createForOfIteratorHelper(flattenActionsInput(config.actions)),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _action$id, _action$props;
      var action = _step.value;
      var id = (_action$id = action.id) !== null && _action$id !== void 0 ? _action$id : "custom";
      var onClick = (_action$props = action.props) === null || _action$props === void 0 ? void 0 : _action$props.onClick;
      if (typeof onClick === "function") {
        out[id] = onClick;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return out;
};

/** Pulls handler-shaped fields from an open config for the reactive handler store. */
var extractReactiveHandlersFromConfig = function extractReactiveHandlersFromConfig(config) {
  var actionHandlers = extractActionHandlersFromConfig(config);
  var reactive = {
    canClose: config.canClose,
    onClose: config.onClose,
    onConflict: config.onConflict
  };
  if (config.onOkClick !== undefined) {
    reactive.onOkClick = config.onOkClick;
  }
  if (config.onCancelClick !== undefined) {
    reactive.onCancelClick = config.onCancelClick;
  }
  if (config.onOkClick !== undefined) {
    reactive.onOkClick = config.onOkClick;
  }
  if (Object.keys(actionHandlers).length > 0) {
    reactive.actionHandlers = actionHandlers;
  }
  return reactive;
};
var readOwnerTokenFromOpenConfig = function readOwnerTokenFromOpenConfig(config) {
  return config.ownerToken;
};

/** Removes internal-only open fields before persisting config on a dialog row. */
var stripInternalDialogOpenFields = function stripInternalDialogOpenFields(config) {
  config.ownerToken;
    config._dialogDeps;
    var rest = _objectWithoutProperties(config, _excluded);
  return rest;
};
var seedDialogHandlers = function seedDialogHandlers(dialogKey, internalId, owner, initial) {
  store.set(rowKey(dialogKey, internalId), {
    key: dialogKey,
    internalId: internalId,
    owner: owner,
    reactive: _objectSpread2({}, initial)
  });
};
var clearDialogHandlersRow = function clearDialogHandlersRow(dialogKey, internalId) {
  store["delete"](rowKey(dialogKey, internalId));
};
var hasDialogHandlersRow = function hasDialogHandlersRow(dialogKey, internalId) {
  return store.has(rowKey(dialogKey, internalId));
};
var RESYNC_REACTIVE_KEYS = ["canClose", "onClose", "onConflict", "onOkClick", "onCancelClick", "actionHandlers"];
var resyncDialogHandlersFromConfig = function resyncDialogHandlersFromConfig(dialogKey, internalId, extracted) {
  var row = store.get(rowKey(dialogKey, internalId));
  if (!row) return;
  // Merge defined fields only so in-place resyncs cannot wipe live-only handlers (e.g. `canClose`
  // merged from `useDialog` when the persisted row config omits them).
  var merged = _objectSpread2({}, row.reactive);
  var writable = merged;
  for (var _i = 0, _RESYNC_REACTIVE_KEYS = RESYNC_REACTIVE_KEYS; _i < _RESYNC_REACTIVE_KEYS.length; _i++) {
    var k = _RESYNC_REACTIVE_KEYS[_i];
    var v = extracted[k];
    if (v !== undefined) {
      writable[k] = v;
    }
  }
  row.reactive = merged;
};
var tryMergeReactiveHandlers = function tryMergeReactiveHandlers(dialogKey, internalId, owner, partial, options) {
  var k = rowKey(dialogKey, internalId);
  var row = store.get(k);
  if (!row) {
    if (!(options !== null && options !== void 0 && options.silent)) {
      console.warn("[Dialogist] tryMergeReactiveHandlers: no store row for \"".concat(dialogKey, "\""));
    }
    return;
  }
  if (row.internalId !== internalId) {
    if (!(options !== null && options !== void 0 && options.silent)) {
      console.warn("[Dialogist] tryMergeReactiveHandlers: internalId mismatch");
    }
    return;
  }
  if (row.owner === undefined) {
    row.owner = owner;
  } else if (row.owner !== owner) {
    if (!(options !== null && options !== void 0 && options.silent)) {
      console.warn("[Dialogist] tryMergeReactiveHandlers: owner mismatch; merge ignored");
    }
    return;
  }
  row.reactive = _objectSpread2(_objectSpread2({}, row.reactive), partial);
};
var tryClearReactiveHandlers = function tryClearReactiveHandlers(dialogKey, internalId, owner, fields) {
  var row = store.get(rowKey(dialogKey, internalId));
  if (!row || row.internalId !== internalId) return;
  if (row.owner !== owner) return;
  if (!fields || fields.length === 0) {
    row.reactive = {};
    return;
  }
  var _iterator2 = _createForOfIteratorHelper(fields),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var f = _step2.value;
      if (f === "actionHandlers") {
        delete row.reactive.actionHandlers;
      } else {
        delete row.reactive[f];
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
};
var getReactiveHandlersSnapshot = function getReactiveHandlersSnapshot(dialogKey, internalId, owner) {
  var _row$owner;
  var row = store.get(rowKey(dialogKey, internalId));
  if (!row || row.internalId !== internalId) return undefined;
  if (row.owner !== owner) return undefined;
  var ownerToken = (_row$owner = row.owner) !== null && _row$owner !== void 0 ? _row$owner : owner;
  return _objectSpread2(_objectSpread2({}, row.reactive), {}, {
    internalId: row.internalId,
    ownerToken: ownerToken
  });
};

/**
 * Resolves a reactive handler field: **store value** when set, otherwise **`fallback`** (typically
 * the persisted row config). When the store row is missing, returns **`fallback`**.
 */
var resolveHandler = function resolveHandler(dialogKey, internalId, field, fallback) {
  var row = store.get(rowKey(dialogKey, internalId));
  if (!row || row.internalId !== internalId) return fallback;
  var v = row.reactive[field];
  return v !== undefined ? v : fallback;
};
var resolveActionOnClick = function resolveActionOnClick(dialogKey, internalId, actionId, fallback) {
  var _row$reactive$actionH;
  var row = store.get(rowKey(dialogKey, internalId));
  if (!row || row.internalId !== internalId) return fallback;
  var handler = (_row$reactive$actionH = row.reactive.actionHandlers) === null || _row$reactive$actionH === void 0 ? void 0 : _row$reactive$actionH[actionId];
  return typeof handler === "function" ? handler : fallback;
};
var resolveOnConflictHandler = function resolveOnConflictHandler(dialogKey, internalId, value) {
  var row = store.get(rowKey(dialogKey, internalId));
  if (!row || row.internalId !== internalId) return value;
  if (row.reactive.onConflict !== undefined) return row.reactive.onConflict;
  return value;
};

export { clearDialogHandlersRow, extractReactiveHandlersFromConfig, getReactiveHandlersSnapshot, hasDialogHandlersRow, readOwnerTokenFromOpenConfig, resolveActionOnClick, resolveHandler, resolveOnConflictHandler, resyncDialogHandlersFromConfig, seedDialogHandlers, stripInternalDialogOpenFields, tryClearReactiveHandlers, tryMergeReactiveHandlers };
//# sourceMappingURL=DialogHandlers.js.map
