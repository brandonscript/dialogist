import { createForOfIteratorHelper as _createForOfIteratorHelper, objectSpread2 as _objectSpread2 } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { resolveActionOnClick, resolveHandler } from '../state/DialogHandlers.js';

var getConfigOkClick = function getConfigOkClick(config) {
  var _onOkClick;
  return (_onOkClick = config.onOkClick) !== null && _onOkClick !== void 0 ? _onOkClick : config.onOkClick;
};

/**
 * Normalize actions input to groups. Flat [A,B,C] -> [[A,B,C]]. Nested [[A,B], C] -> [[A,B],[C]].
 * If any top-level element is an array, treat as grouped; otherwise flat.
 */
var normalizeToGroups = function normalizeToGroups(input) {
  if (!Array.isArray(input) || input.length === 0) return [];
  var hasNestedArray = input.some(function (el) {
    return Array.isArray(el);
  });
  if (!hasNestedArray) {
    return [input];
  }
  return input.map(function (slot) {
    return Array.isArray(slot) ? slot : [slot];
  });
};

/**
 * Action ids for alert and confirm dialogs.
 * - alert: one button, id "ok"
 * - confirm: two buttons, id "ok" (primary) and "cancel"
 * - custom: any action id other than "ok" or "cancel" (e.g. "draft", "save")
 */
var ALERT_CONFIRM_ACTION_IDS = new Set(["ok", "cancel"]);

/** When `id` is omitted on alert/confirm, infer built-in ids from layout (see {@link restrictActionsForType}). */
var inferBuiltInActionId = function inferBuiltInActionId(action, indexInFlat, flatLength, dialogType) {
  if (action.id !== undefined) return action.id;
  if (dialogType === "alert") {
    return flatLength === 1 ? "ok" : undefined;
  }
  if (dialogType === "confirm" && flatLength === 2) {
    return indexInFlat === 0 ? "cancel" : "ok";
  }
  return undefined;
};

/**
 * Returns true if any action has an **explicit** id other than ok or cancel.
 * Omitted ids stay in built-in alert/confirm mode (ids inferred in {@link restrictActionsForType}).
 */
var hasCustomActionIds = function hasCustomActionIds(rawGroups) {
  var _iterator = _createForOfIteratorHelper(rawGroups),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var group = _step.value;
      var _iterator2 = _createForOfIteratorHelper(group),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var a = _step2.value;
          if (a.id !== undefined && !ALERT_CONFIRM_ACTION_IDS.has(a.id)) return true;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return false;
};

/**
 * Filters actions for alert/confirm dialogs when all action ids are ok/cancel.
 * Alert: only id=ok. Confirm: cancel + ok.
 * Returns built-in actions when type is alert/confirm and no valid explicit actions.
 */
var restrictActionsForType = function restrictActionsForType(config, rawGroups) {
  var type = config.type;
  if (type !== "alert" && type !== "confirm") return null;
  var allowedIds = type === "alert" ? new Set(["ok"]) : new Set(["cancel", "ok"]);
  var flat = rawGroups.flat();
  var filtered = [];
  var flatIdx = 0;
  var _iterator3 = _createForOfIteratorHelper(rawGroups),
    _step3;
  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var group = _step3.value;
      var _iterator4 = _createForOfIteratorHelper(group),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var _a$id4;
          var a = _step4.value;
          var inferred = inferBuiltInActionId(a, flatIdx, flat.length, type);
          flatIdx += 1;
          var id = (_a$id4 = a.id) !== null && _a$id4 !== void 0 ? _a$id4 : inferred;
          if (id !== undefined && allowedIds.has(id)) filtered.push(a);
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
  if (filtered.length === 0) return null;
  if (type === "alert") {
    var _filtered$find;
    var _okAction = (_filtered$find = filtered.find(function (a) {
      var _a$id;
      return ((_a$id = a.id) !== null && _a$id !== void 0 ? _a$id : "custom") === "ok";
    })) !== null && _filtered$find !== void 0 ? _filtered$find : filtered[0];
    return [[_okAction]];
  }
  var cancelAction = filtered.find(function (a) {
    var _a$id2;
    return ((_a$id2 = a.id) !== null && _a$id2 !== void 0 ? _a$id2 : "custom") === "cancel";
  });
  var okAction = filtered.find(function (a) {
    var _a$id3;
    return ((_a$id3 = a.id) !== null && _a$id3 !== void 0 ? _a$id3 : "custom") === "ok";
  });
  var actions = [];
  if (cancelAction) actions.push(cancelAction);
  if (okAction) actions.push(okAction);
  return actions.length > 0 ? [actions] : null;
};

/**
 * Derives the effective action groups for a dialog.
 *
 * Three dialog types:
 * 1. alert — one button; user customizes via action id "ok"
 * 2. confirm — two buttons; user customizes via action ids "ok" and/or "cancel"
 * 3. custom — any action ids other than "ok" or "cancel"; all actions are rendered
 *
 * If config.actions contains any id other than ok/cancel, treat as custom.
 * Otherwise apply alert/confirm semantics. If no explicit actions, use built-in from type.
 */
var deriveEffectiveActions = function deriveEffectiveActions(config, dialogKey, dialogInternalId, onClose) {
  var configActions = config.actions;
  var actionsIsDefined = Array.isArray(configActions);
  var hasExplicitActions = actionsIsDefined && configActions.length > 0;

  // Explicitly empty array means "no actions at all" — hide the actions slot entirely
  if (actionsIsDefined && !hasExplicitActions) {
    return [];
  }
  if (hasExplicitActions) {
    var rawGroups = normalizeToGroups(configActions);
    var _type = config.type;

    // If any action has id other than ok/cancel, treat as custom: render all actions
    if (hasCustomActionIds(rawGroups)) {
      return rawGroups.map(function (group) {
        return group.map(function (a) {
          return hydrateAction(a, config, dialogKey, dialogInternalId, onClose);
        });
      });
    }

    // All actions are ok/cancel only: apply alert or confirm semantics
    if (_type === "alert" || _type === "confirm") {
      var restricted = restrictActionsForType(config, rawGroups);
      if (restricted) {
        return restricted.map(function (group) {
          return group.map(function (a) {
            return hydrateAction(a, config, dialogKey, dialogInternalId, onClose);
          });
        });
      }
      // Invalid/mismatched: fall through to built-in actions
    } else {
      return rawGroups.map(function (group) {
        return group.map(function (a) {
          return hydrateAction(a, config, dialogKey, dialogInternalId, onClose);
        });
      });
    }
  }

  // Generate built-in actions from type (always one group)
  var type = config.type;
  var builtInActions;
  if (type === "confirm") {
    var _confirmConfig$cancel, _confirmConfig$okLabe;
    var confirmConfig = config;
    var cancelLabel = (_confirmConfig$cancel = confirmConfig.cancelLabel) !== null && _confirmConfig$cancel !== void 0 ? _confirmConfig$cancel : "Cancel";
    var okLabel = (_confirmConfig$okLabe = confirmConfig.okLabel) !== null && _confirmConfig$okLabe !== void 0 ? _confirmConfig$okLabe : "Confirm";
    builtInActions = [{
      id: "cancel",
      title: cancelLabel,
      resolveValue: false,
      preserveBackdrop: confirmConfig.preserveBackdropOnCancel,
      props: {
        variant: "outlined"
      }
    }, {
      id: "ok",
      title: okLabel,
      resolveValue: true,
      preserveBackdrop: confirmConfig.preserveBackdropOnOk,
      props: {
        variant: "contained",
        autoFocus: true
      }
    }];
  } else if (type === "alert") {
    var _alertConfig$okLabel;
    var alertConfig = config;
    builtInActions = [{
      id: "ok",
      title: (_alertConfig$okLabel = alertConfig.okLabel) !== null && _alertConfig$okLabel !== void 0 ? _alertConfig$okLabel : "OK",
      resolveValue: false,
      props: {
        variant: "contained",
        autoFocus: true
      }
    }];
  } else if (type === "custom") {
    builtInActions = [{
      id: "close",
      title: "Close",
      resolveValue: false,
      props: {
        variant: "contained",
        autoFocus: true
      }
    }];
  } else {
    builtInActions = [{
      id: "close",
      title: "Close",
      resolveValue: false,
      props: {
        variant: "contained",
        autoFocus: true
      }
    }];
  }
  return [builtInActions.map(function (a) {
    return hydrateAction(a, config, dialogKey, dialogInternalId, onClose);
  })];
};

/**
 * Ensures each action has a working onClick. If the action has resolveValue and no props.onClick,
 * injects an onClick that calls onClose with that resolveValue.
 */
var hydrateAction = function hydrateAction(action, config, dialogKey, dialogInternalId, onClose) {
  var _action$id, _ref, _action$title;
  var actionId = (_action$id = action.id) !== null && _action$id !== void 0 ? _action$id : "custom";
  var propsRecord = action.props;
  var hasCustomOnClick = typeof (propsRecord === null || propsRecord === void 0 ? void 0 : propsRecord.onClick) === "function";
  if (hasCustomOnClick) {
    var fallback = propsRecord === null || propsRecord === void 0 ? void 0 : propsRecord.onClick;
    return _objectSpread2(_objectSpread2({}, action), {}, {
      props: _objectSpread2(_objectSpread2({}, action.props), {}, {
        onClick: function onClick(nativeEvent) {
          var fn = resolveActionOnClick(dialogKey, dialogInternalId, actionId, fallback);
          fn(nativeEvent);
        }
      })
    });
  }
  var resolveValue = action.resolveValue;
  var buttonText = (_ref = (_action$title = action.title) !== null && _action$title !== void 0 ? _action$title : action.children) !== null && _ref !== void 0 ? _ref : "";
  var onClick = function onClick(nativeEvent) {
    var cancelled = actionId === "cancel";
    var closeEvent = {
      dialogKey: dialogKey,
      reason: "action",
      ok: !cancelled,
      cancelled: cancelled,
      action: actionIdToEventAction(actionId),
      actionId: actionId,
      buttonText: String(buttonText),
      nativeEvent: nativeEvent
    };
    var onCancelClick = resolveHandler(dialogKey, dialogInternalId, "onCancelClick", config.onCancelClick);
    var onOkClick = resolveHandler(dialogKey, dialogInternalId, "onOkClick", getConfigOkClick(config));
    if (actionId === "cancel" && onCancelClick) {
      onCancelClick(closeEvent);
    } else if (actionId === "ok" && onOkClick) {
      onOkClick(closeEvent);
    }
    // config.onClose is called from DialogProvider for all close paths

    var preserveBackdrop = action.preserveBackdrop;
    onClose(dialogKey, {
      cancelled: cancelled,
      preserveBackdrop: preserveBackdrop,
      actionEvent: {
        action: closeEvent.action,
        actionId: closeEvent.actionId,
        buttonText: closeEvent.buttonText,
        nativeEvent: nativeEvent
      },
      resolveValue: Object.hasOwn(action, "resolveValue") ? resolveValue : undefined,
      reason: "action"
    });
  };
  return _objectSpread2(_objectSpread2({}, action), {}, {
    props: _objectSpread2(_objectSpread2({}, action.props), {}, {
      onClick: onClick
    })
  });
};
var actionIdToEventAction = function actionIdToEventAction(id) {
  return "".concat(id, "Clicked");
};

export { deriveEffectiveActions, normalizeToGroups };
//# sourceMappingURL=dialogActions.js.map
