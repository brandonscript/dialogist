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
var TW_TITLE = "px-6 pt-6 pb-2 text-lg font-semibold text-foreground text-center";
var TW_CONTENT = "px-6 py-2 text-sm text-muted-foreground";
var TW_ACTIONS_CONTAINER = "flex flex-col-reverse gap-2 px-6 py-4 sm:flex-row sm:justify-end";
var TW_BUTTON_PRIMARY = "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
var TW_BUTTON_OUTLINE = "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
var TW_STATUSBAR = "px-6 py-2 text-xs font-semibold text-foreground bg-primary/10";
var TW_FOOTER = "border-t px-6 py-2 text-xs text-muted-foreground";
var ACTIONS_ALIGN_TO_CSS = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly"
};
var TW_BUTTON_DENYLIST = new Set(["variant", "color", "sx"]);
var filterTwButtonProps = function filterTwButtonProps(props) {
  if (!props) return {};
  var out = {};
  for (var _i = 0, _Object$entries = Object.entries(props); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      k = _Object$entries$_i[0],
      v = _Object$entries$_i[1];
    if (!TW_BUTTON_DENYLIST.has(k)) out[k] = v;
  }
  return out;
};
var getActionKeyPart = function getActionKeyPart(action) {
  var _ref, _action$id;
  return (_ref = (_action$id = action.id) !== null && _action$id !== void 0 ? _action$id : action.title) !== null && _ref !== void 0 ? _ref : typeof action.children === "string" ? action.children : "anonymous";
};
var variantToClass = function variantToClass(variant) {
  return variant === "outlined" ? TW_BUTTON_OUTLINE : TW_BUTTON_PRIMARY;
};
var TailwindTitle = function TailwindTitle(_ref2) {
  var id = _ref2.id,
    className = _ref2.className,
    children = _ref2.children,
    rest = _objectWithoutProperties(_ref2, _excluded);
  return /*#__PURE__*/jsx("div", _objectSpread2(_objectSpread2({}, rest), {}, {
    id: id,
    role: "heading",
    "aria-level": 2,
    className: classNames(TW_TITLE, dialogistClasses.title, className),
    children: children
  }));
};
TailwindTitle.displayName = "TailwindTitle";
var TailwindContent = function TailwindContent(_ref3) {
  var id = _ref3.id,
    className = _ref3.className,
    style = _ref3.style,
    children = _ref3.children,
    rest = _objectWithoutProperties(_ref3, _excluded2);
  return /*#__PURE__*/jsx("div", _objectSpread2(_objectSpread2({}, rest), {}, {
    id: id,
    className: classNames(TW_CONTENT, dialogistClasses.content, className),
    style: style,
    children: children
  }));
};
TailwindContent.displayName = "TailwindContent";
var TailwindActionsContainer = function TailwindActionsContainer(_ref4) {
  var className = _ref4.className,
    style = _ref4.style,
    children = _ref4.children,
    rest = _objectWithoutProperties(_ref4, _excluded3);
  var passthrough = rest;
  delete passthrough.sx;
  return /*#__PURE__*/jsx("div", _objectSpread2(_objectSpread2({}, passthrough), {}, {
    className: classNames(TW_ACTIONS_CONTAINER, dialogistClasses.actionsContainer, className),
    style: style,
    children: children
  }));
};
TailwindActionsContainer.displayName = "TailwindActionsContainer";
var TailwindActionButton = function TailwindActionButton(_ref5) {
  var _action$props;
  var action = _ref5.action,
    dialogKey = _ref5.dialogKey;
  var safeProps = filterTwButtonProps(action.props);
  var variantClass = variantToClass((_action$props = action.props) === null || _action$props === void 0 ? void 0 : _action$props.variant);
  return /*#__PURE__*/createElement("button", _objectSpread2(_objectSpread2({
    type: "button"
  }, safeProps), {}, {
    key: "".concat(dialogKey, "-action-").concat(getActionKeyPart(action)),
    className: classNames(variantClass, action.className, safeProps.className)
  }), action.children || action.title);
};
var TailwindActions = function TailwindActions(_ref6) {
  var actionGroups = _ref6.actionGroups,
    dialogKey = _ref6.dialogKey,
    actionsStyle = _ref6.actionsStyle;
  var hasMultipleGroups = actionGroups.length > 1;
  var hasSingleGroup = actionGroups.length === 1;
  var justifyFromAlign = actionsStyle !== null && actionsStyle !== void 0 && actionsStyle.align ? ACTIONS_ALIGN_TO_CSS[actionsStyle.align] : undefined;
  var justifyContent = justifyFromAlign !== null && justifyFromAlign !== void 0 ? justifyFromAlign : "center";
  var groupBoxes = actionGroups.map(function (group) {
    return /*#__PURE__*/jsx("div", {
      className: classNames(dialogistClasses.actionsGroup, "flex gap-2"),
      "data-dialogist-layout": hasSingleGroup ? "single" : undefined,
      style: {
        "--dialogist-actionsGroup-justify": hasMultipleGroups ? "flex-start" : justifyContent
      },
      children: group.map(function (action) {
        return /*#__PURE__*/jsx(TailwindActionButton, {
          action: action,
          dialogKey: dialogKey
        }, "".concat(dialogKey, "-button-").concat(getActionKeyPart(action)));
      })
    }, "".concat(dialogKey, "-group-").concat(group.map(getActionKeyPart).join("-")));
  });
  if (hasMultipleGroups) {
    return /*#__PURE__*/jsx("div", {
      className: classNames(dialogistClasses.actionsRow, "flex w-full flex-row flex-wrap items-center gap-2"),
      style: {
        "--dialogist-actionsRow-justify": justifyContent
      },
      children: groupBoxes
    });
  }
  return /*#__PURE__*/jsx(Fragment, {
    children: groupBoxes
  });
};
TailwindActions.displayName = "TailwindActions";
var TailwindStatusBar = function TailwindStatusBar(_ref7) {
  var className = _ref7.className,
    content = _ref7.content,
    rest = _objectWithoutProperties(_ref7, _excluded4);
  var passthrough = rest;
  delete passthrough.dialogKey;
  delete passthrough.dialogType;
  return /*#__PURE__*/jsx("div", _objectSpread2(_objectSpread2({}, passthrough), {}, {
    className: classNames(TW_STATUSBAR, dialogistClasses.statusBar, className),
    children: content
  }));
};
TailwindStatusBar.displayName = "TailwindStatusBar";
var TailwindFooter = function TailwindFooter(_ref8) {
  var className = _ref8.className,
    content = _ref8.content,
    rest = _objectWithoutProperties(_ref8, _excluded5);
  var passthrough = rest;
  delete passthrough.dialogKey;
  return /*#__PURE__*/jsx("div", _objectSpread2(_objectSpread2({}, passthrough), {}, {
    className: classNames(TW_FOOTER, dialogistClasses.footer, className),
    children: content
  }));
};
TailwindFooter.displayName = "TailwindFooter";

export { TailwindActions, TailwindActionsContainer, TailwindContent, TailwindFooter, TailwindStatusBar, TailwindTitle };
//# sourceMappingURL=TailwindSlots.js.map
