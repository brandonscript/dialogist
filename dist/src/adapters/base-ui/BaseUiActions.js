"use client";
import { objectSpread2 as _objectSpread2, slicedToArray as _slicedToArray } from '../../../_virtual/_rollupPluginBabelHelpers.js';
import { Button } from '@base-ui-components/react/button';
import { dialogistClasses } from '../../classes.js';
import { classNames } from '../../utils/classNames.js';
import { createElement } from 'react';
import { jsx, Fragment } from 'react/jsx-runtime';

var ACTIONS_ALIGN_TO_CSS = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly"
};
var BASE_BUTTON_STYLE = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
  padding: "6px 16px",
  fontSize: "0.875rem",
  fontWeight: 500,
  lineHeight: 1.75,
  letterSpacing: "0.02857em",
  cursor: "pointer",
  border: "none",
  outline: "none",
  transition: "background-color 150ms ease, opacity 150ms ease",
  fontFamily: "var(--dialogist-font-family, inherit)"
};
var PRIMARY_STYLE = _objectSpread2(_objectSpread2({}, BASE_BUTTON_STYLE), {}, {
  backgroundColor: "var(--dialogist-primary-main, #1976d2)",
  color: "var(--dialogist-primary-contrastText, #ffffff)"
});
var OUTLINED_STYLE = _objectSpread2(_objectSpread2({}, BASE_BUTTON_STYLE), {}, {
  backgroundColor: "transparent",
  color: "var(--dialogist-primary-main, #1976d2)",
  border: "1px solid var(--dialogist-primary-main, #1976d2)"
});
var BASE_BUTTON_DENYLIST = new Set(["variant", "color", "sx"]);
var filterBaseUiButtonProps = function filterBaseUiButtonProps(props) {
  if (!props) return {};
  var out = {};
  for (var _i = 0, _Object$entries = Object.entries(props); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      k = _Object$entries$_i[0],
      v = _Object$entries$_i[1];
    if (!BASE_BUTTON_DENYLIST.has(k)) out[k] = v;
  }
  return out;
};
var getActionKeyPart = function getActionKeyPart(action) {
  var _ref, _action$id;
  return (_ref = (_action$id = action.id) !== null && _action$id !== void 0 ? _action$id : action.title) !== null && _ref !== void 0 ? _ref : typeof action.children === "string" ? action.children : "anonymous";
};
var resolveSpacing = function resolveSpacing(value, fallback) {
  var v = value === undefined ? fallback : value;
  return typeof v === "number" ? "".concat(v * 8, "px") : v;
};
var BaseUiActionButton = function BaseUiActionButton(_ref2) {
  var _action$props;
  var action = _ref2.action,
    dialogKey = _ref2.dialogKey;
  var safeProps = filterBaseUiButtonProps(action.props);
  var isOutlined = ((_action$props = action.props) === null || _action$props === void 0 ? void 0 : _action$props.variant) === "outlined";
  var buttonStyle = _objectSpread2(_objectSpread2({}, isOutlined ? OUTLINED_STYLE : PRIMARY_STYLE), safeProps.style);
  return /*#__PURE__*/createElement(Button, _objectSpread2(_objectSpread2({}, safeProps), {}, {
    key: "".concat(dialogKey, "-action-").concat(getActionKeyPart(action)),
    className: classNames(action.className, safeProps.className),
    style: buttonStyle
  }), action.children || action.title);
};

/**
 * Base UI-backed `Actions` slot. Uses `@base-ui-components/react/button` (`Button`) for
 * accessible button semantics, styled with Dialogist CSS variables so the buttons
 * automatically reflect the active adapter theme without requiring Tailwind.
 *
 * Mirrors MUI's `MuiActions` layout (row/group) using the same CSS class structure.
 */
var BaseUiActions = function BaseUiActions(_ref3) {
  var _actionsStyle$gap;
  var actionGroups = _ref3.actionGroups,
    dialogKey = _ref3.dialogKey,
    actionsStyle = _ref3.actionsStyle;
  var hasMultipleGroups = actionGroups.length > 1;
  var hasSingleGroup = actionGroups.length === 1;
  var justifyFromAlign = actionsStyle !== null && actionsStyle !== void 0 && actionsStyle.align ? ACTIONS_ALIGN_TO_CSS[actionsStyle.align] : undefined;
  var justifyContent = justifyFromAlign !== null && justifyFromAlign !== void 0 ? justifyFromAlign : "center";
  var innerGapRaw = hasMultipleGroups ? (actionsStyle === null || actionsStyle === void 0 ? void 0 : actionsStyle.intraGroupGap) !== undefined ? actionsStyle.intraGroupGap : 1 : (_actionsStyle$gap = actionsStyle === null || actionsStyle === void 0 ? void 0 : actionsStyle.gap) !== null && _actionsStyle$gap !== void 0 ? _actionsStyle$gap : 1;
  var groupBoxes = actionGroups.map(function (group) {
    return /*#__PURE__*/jsx("div", {
      className: dialogistClasses.actionsGroup,
      "data-dialogist-layout": hasSingleGroup ? "single" : undefined,
      style: {
        "--dialogist-actionsGroup-gap": resolveSpacing(innerGapRaw, 1),
        "--dialogist-actionsGroup-justify": hasMultipleGroups ? "flex-start" : justifyContent
      },
      children: group.map(function (action) {
        return /*#__PURE__*/jsx(BaseUiActionButton, {
          action: action,
          dialogKey: dialogKey
        }, "".concat(dialogKey, "-button-").concat(getActionKeyPart(action)));
      })
    }, "".concat(dialogKey, "-group-").concat(group.map(getActionKeyPart).join("-")));
  });
  if (hasMultipleGroups) {
    return /*#__PURE__*/jsx("div", {
      className: dialogistClasses.actionsRow,
      style: {
        "--dialogist-actionsRow-gap": resolveSpacing(actionsStyle === null || actionsStyle === void 0 ? void 0 : actionsStyle.gap, 1),
        "--dialogist-actionsRow-justify": justifyContent
      },
      children: groupBoxes
    });
  }
  return /*#__PURE__*/jsx(Fragment, {
    children: groupBoxes
  });
};
BaseUiActions.displayName = "BaseUiActions";

export { BaseUiActions };
//# sourceMappingURL=BaseUiActions.js.map
