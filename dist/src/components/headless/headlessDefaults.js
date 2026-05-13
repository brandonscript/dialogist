"use client";
import { objectWithoutProperties as _objectWithoutProperties, objectSpread2 as _objectSpread2, slicedToArray as _slicedToArray } from '../../../_virtual/_rollupPluginBabelHelpers.js';
import { dialogistClasses } from '../../classes.js';
import { classNames } from '../../utils/classNames.js';
import { jsx, Fragment } from 'react/jsx-runtime';
import { createElement } from 'react';

var _excluded = ["id", "className", "children"],
  _excluded2 = ["id", "className", "style", "children"],
  _excluded3 = ["className", "style", "children"],
  _excluded4 = ["className", "content"],
  _excluded5 = ["className", "content"];
var DOM_BUTTON_DENYLIST = new Set(["variant", "color", "sx"]);
var filterDomButtonProps = function filterDomButtonProps(props) {
  if (!props) return {};
  var out = {};
  for (var _i = 0, _Object$entries = Object.entries(props); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      k = _Object$entries$_i[0],
      v = _Object$entries$_i[1];
    if (!DOM_BUTTON_DENYLIST.has(k)) out[k] = v;
  }
  return out;
};
var HeadlessTitle = function HeadlessTitle(_ref) {
  var id = _ref.id,
    className = _ref.className,
    children = _ref.children,
    rest = _objectWithoutProperties(_ref, _excluded);
  return /*#__PURE__*/jsx("div", _objectSpread2(_objectSpread2({}, rest), {}, {
    id: id,
    className: classNames(dialogistClasses.title, className),
    role: "heading",
    "aria-level": 2,
    children: children
  }));
};
HeadlessTitle.displayName = "HeadlessTitle";
var HeadlessContent = function HeadlessContent(_ref2) {
  var id = _ref2.id,
    className = _ref2.className,
    style = _ref2.style,
    children = _ref2.children,
    rest = _objectWithoutProperties(_ref2, _excluded2);
  var passthrough = rest;
  return /*#__PURE__*/jsx("div", _objectSpread2(_objectSpread2({}, passthrough), {}, {
    id: id,
    className: classNames(dialogistClasses.content, className),
    style: style,
    children: children
  }));
};
HeadlessContent.displayName = "HeadlessContent";
var HeadlessActionsContainer = function HeadlessActionsContainer(_ref3) {
  var className = _ref3.className,
    style = _ref3.style,
    children = _ref3.children,
    rest = _objectWithoutProperties(_ref3, _excluded3);
  var passthrough = rest;
  // Drop MUI's `sx` if a consumer passed it via slotProps.actionsContainer; the headless
  // container is a plain `<div>` and would emit React unknown-attribute warnings.
  delete passthrough.sx;
  return /*#__PURE__*/jsx("div", _objectSpread2(_objectSpread2({}, passthrough), {}, {
    className: classNames(dialogistClasses.actionsContainer, className),
    style: style,
    children: children
  }));
};
HeadlessActionsContainer.displayName = "HeadlessActionsContainer";
var getActionKeyPart = function getActionKeyPart(action) {
  var _ref4, _action$id;
  return (_ref4 = (_action$id = action.id) !== null && _action$id !== void 0 ? _action$id : action.title) !== null && _ref4 !== void 0 ? _ref4 : typeof action.children === "string" ? action.children : "anonymous";
};
var ACTIONS_ALIGN_TO_CSS = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly"
};
var HeadlessActionButton = function HeadlessActionButton(_ref5) {
  var action = _ref5.action,
    dialogKey = _ref5.dialogKey;
  var safeProps = filterDomButtonProps(action.props);
  return /*#__PURE__*/createElement("button", _objectSpread2(_objectSpread2({
    type: "button"
  }, safeProps), {}, {
    key: "".concat(dialogKey, "-action-").concat(getActionKeyPart(action)),
    className: classNames(action.className, safeProps.className)
  }), action.children || action.title);
};

/**
 * Headless equivalent of the previous MUI-based `DefaultActions`. Renders one or more
 * action groups using plain `<button>` elements and the same row/group CSS classes the
 * theme expects.
 */
var HeadlessActions = function HeadlessActions(_ref6) {
  var _actionsStyle$gap;
  var actionGroups = _ref6.actionGroups,
    dialogKey = _ref6.dialogKey,
    actionsStyle = _ref6.actionsStyle;
  var hasMultipleGroups = actionGroups.length > 1;
  var justifyFromAlign = actionsStyle !== null && actionsStyle !== void 0 && actionsStyle.align ? ACTIONS_ALIGN_TO_CSS[actionsStyle.align] : undefined;
  var hasSingleGroup = actionGroups.length === 1;
  var justifyContent = justifyFromAlign !== null && justifyFromAlign !== void 0 ? justifyFromAlign : "center";
  var innerGapRaw = hasMultipleGroups ? (actionsStyle === null || actionsStyle === void 0 ? void 0 : actionsStyle.intraGroupGap) !== undefined ? actionsStyle.intraGroupGap : 1 : (_actionsStyle$gap = actionsStyle === null || actionsStyle === void 0 ? void 0 : actionsStyle.gap) !== null && _actionsStyle$gap !== void 0 ? _actionsStyle$gap : 1;
  var resolveGap = function resolveGap(value, fallback) {
    var v = value === undefined ? fallback : value;
    return typeof v === "number" ? "".concat(v * 8, "px") : v;
  };
  var groupBoxes = actionGroups.map(function (group) {
    return /*#__PURE__*/jsx("div", {
      className: dialogistClasses.actionsGroup,
      "data-dialogist-layout": hasSingleGroup ? "single" : undefined,
      style: {
        "--dialogist-actionsGroup-gap": resolveGap(innerGapRaw, 1),
        "--dialogist-actionsGroup-justify": hasMultipleGroups ? "flex-start" : justifyContent
      },
      children: group.map(function (action) {
        return /*#__PURE__*/jsx(HeadlessActionButton, {
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
        "--dialogist-actionsRow-gap": resolveGap(actionsStyle === null || actionsStyle === void 0 ? void 0 : actionsStyle.gap, 1),
        "--dialogist-actionsRow-justify": justifyContent
      },
      children: groupBoxes
    });
  }
  return /*#__PURE__*/jsx(Fragment, {
    children: groupBoxes
  });
};
HeadlessActions.displayName = "HeadlessActions";
var HeadlessStatusBar = function HeadlessStatusBar(_ref7) {
  var className = _ref7.className,
    content = _ref7.content,
    rest = _objectWithoutProperties(_ref7, _excluded4);
  var passthrough = rest;
  delete passthrough.dialogKey;
  delete passthrough.dialogType;
  return /*#__PURE__*/jsx("div", _objectSpread2(_objectSpread2({}, passthrough), {}, {
    className: classNames(dialogistClasses.statusBar, className),
    children: /*#__PURE__*/jsx("span", {
      style: {
        fontSize: "var(--dialogist-statusBar-font-size)",
        color: "var(--dialogist-statusBar-text)"
      },
      children: content
    })
  }));
};
HeadlessStatusBar.displayName = "HeadlessStatusBar";
var HeadlessFooter = function HeadlessFooter(_ref8) {
  var className = _ref8.className,
    content = _ref8.content,
    rest = _objectWithoutProperties(_ref8, _excluded5);
  var passthrough = rest;
  delete passthrough.dialogKey;
  return /*#__PURE__*/jsx("div", _objectSpread2(_objectSpread2({}, passthrough), {}, {
    className: classNames(dialogistClasses.footer, className),
    children: /*#__PURE__*/jsx("span", {
      style: {
        fontSize: "var(--dialogist-footer-font-size)",
        color: "var(--dialogist-footer-text)"
      },
      children: content
    })
  }));
};
HeadlessFooter.displayName = "HeadlessFooter";

export { HeadlessActions, HeadlessActionsContainer, HeadlessContent, HeadlessFooter, HeadlessStatusBar, HeadlessTitle };
//# sourceMappingURL=headlessDefaults.js.map
