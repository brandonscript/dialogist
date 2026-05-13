"use client";
import { objectWithoutProperties as _objectWithoutProperties, objectSpread2 as _objectSpread2, slicedToArray as _slicedToArray } from '../../../_virtual/_rollupPluginBabelHelpers.js';
import { Dialog } from '@base-ui-components/react/dialog';
import { dialogistClasses } from '../../classes.js';
import { classNames } from '../../utils/classNames.js';
import { jsx, Fragment } from 'react/jsx-runtime';
import { createElement } from 'react';

var _excluded = ["id", "className", "children"],
  _excluded2 = ["id", "className", "style", "children"],
  _excluded3 = ["className", "style", "children"],
  _excluded4 = ["className", "content"],
  _excluded5 = ["className", "content"];
var ACTIONS_ALIGN_TO_CSS = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly"
};
var SHADCN_TITLE_CLASS = "text-lg font-semibold leading-none tracking-tight";
var SHADCN_CONTENT_CLASS = "text-sm text-muted-foreground";
var SHADCN_ACTIONS_CONTAINER_CLASS = "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2";
var SHADCN_BUTTON_PRIMARY_CLASS = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2";
var SHADCN_BUTTON_OUTLINE_CLASS = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2";
var getActionKeyPart = function getActionKeyPart(action) {
  var _ref, _action$id;
  return (_ref = (_action$id = action.id) !== null && _action$id !== void 0 ? _action$id : action.title) !== null && _ref !== void 0 ? _ref : typeof action.children === "string" ? action.children : "anonymous";
};

/** Map the action `props.variant` field (set by `dialogActions.ts` for built-in actions) onto a shadcn-style class. */
var variantToClass = function variantToClass(variant) {
  var fallback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : SHADCN_BUTTON_PRIMARY_CLASS;
  if (variant === "outlined") return SHADCN_BUTTON_OUTLINE_CLASS;
  return fallback;
};
var SHADCN_BUTTON_DENYLIST = new Set(["variant", "color", "sx"]);
var filterShadcnButtonProps = function filterShadcnButtonProps(props) {
  if (!props) return {};
  var out = {};
  for (var _i = 0, _Object$entries = Object.entries(props); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      k = _Object$entries$_i[0],
      v = _Object$entries$_i[1];
    if (!SHADCN_BUTTON_DENYLIST.has(k)) out[k] = v;
  }
  return out;
};
var ShadcnTitle = function ShadcnTitle(_ref2) {
  var id = _ref2.id,
    className = _ref2.className,
    children = _ref2.children,
    rest = _objectWithoutProperties(_ref2, _excluded);
  return /*#__PURE__*/jsx(Dialog.Title, _objectSpread2(_objectSpread2({}, rest), {}, {
    id: id,
    className: classNames(SHADCN_TITLE_CLASS, dialogistClasses.title, className),
    children: children
  }));
};
ShadcnTitle.displayName = "ShadcnTitle";
var ShadcnContent = function ShadcnContent(_ref3) {
  var id = _ref3.id,
    className = _ref3.className,
    style = _ref3.style,
    children = _ref3.children,
    rest = _objectWithoutProperties(_ref3, _excluded2);
  return /*#__PURE__*/jsx(Dialog.Description, _objectSpread2(_objectSpread2({}, rest), {}, {
    id: id,
    className: classNames(SHADCN_CONTENT_CLASS, dialogistClasses.content, className),
    style: style,
    render: function render(props) {
      return /*#__PURE__*/jsx("div", _objectSpread2({}, props));
    },
    children: children
  }));
};
ShadcnContent.displayName = "ShadcnContent";
var ShadcnActionsContainer = function ShadcnActionsContainer(_ref4) {
  var className = _ref4.className,
    style = _ref4.style,
    children = _ref4.children,
    rest = _objectWithoutProperties(_ref4, _excluded3);
  var passthrough = rest;
  delete passthrough.sx;
  return /*#__PURE__*/jsx("div", _objectSpread2(_objectSpread2({}, passthrough), {}, {
    className: classNames(SHADCN_ACTIONS_CONTAINER_CLASS, dialogistClasses.actionsContainer, className),
    style: style,
    children: children
  }));
};
ShadcnActionsContainer.displayName = "ShadcnActionsContainer";
var ShadcnActionButton = function ShadcnActionButton(_ref5) {
  var _action$props;
  var action = _ref5.action,
    dialogKey = _ref5.dialogKey;
  var safeProps = filterShadcnButtonProps(action.props);
  var variantClass = variantToClass((_action$props = action.props) === null || _action$props === void 0 ? void 0 : _action$props.variant);
  return /*#__PURE__*/createElement("button", _objectSpread2(_objectSpread2({
    type: "button"
  }, safeProps), {}, {
    key: "".concat(dialogKey, "-action-").concat(getActionKeyPart(action)),
    className: classNames(variantClass, action.className, safeProps.className)
  }), action.children || action.title);
};
var ShadcnActions = function ShadcnActions(_ref6) {
  var actionGroups = _ref6.actionGroups,
    dialogKey = _ref6.dialogKey,
    actionsStyle = _ref6.actionsStyle;
  var hasMultipleGroups = actionGroups.length > 1;
  var hasSingleGroup = actionGroups.length === 1;
  var justifyFromAlign = actionsStyle !== null && actionsStyle !== void 0 && actionsStyle.align ? ACTIONS_ALIGN_TO_CSS[actionsStyle.align] : undefined;
  var justifyContent = justifyFromAlign !== null && justifyFromAlign !== void 0 ? justifyFromAlign : "flex-end";
  var groupBoxes = actionGroups.map(function (group) {
    return /*#__PURE__*/jsx("div", {
      className: classNames(dialogistClasses.actionsGroup, "flex gap-2"),
      "data-dialogist-layout": hasSingleGroup ? "single" : undefined,
      style: {
        "--dialogist-actionsGroup-justify": hasMultipleGroups ? "flex-start" : justifyContent
      },
      children: group.map(function (action) {
        return /*#__PURE__*/jsx(ShadcnActionButton, {
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
ShadcnActions.displayName = "ShadcnActions";
var ShadcnStatusBar = function ShadcnStatusBar(_ref7) {
  var className = _ref7.className,
    content = _ref7.content,
    rest = _objectWithoutProperties(_ref7, _excluded4);
  var passthrough = rest;
  delete passthrough.dialogKey;
  delete passthrough.dialogType;
  return /*#__PURE__*/jsx("div", _objectSpread2(_objectSpread2({}, passthrough), {}, {
    className: classNames(dialogistClasses.statusBar, "px-4 py-2 text-xs font-semibold text-foreground", className),
    children: content
  }));
};
ShadcnStatusBar.displayName = "ShadcnStatusBar";
var ShadcnFooter = function ShadcnFooter(_ref8) {
  var className = _ref8.className,
    content = _ref8.content,
    rest = _objectWithoutProperties(_ref8, _excluded5);
  var passthrough = rest;
  delete passthrough.dialogKey;
  return /*#__PURE__*/jsx("div", _objectSpread2(_objectSpread2({}, passthrough), {}, {
    className: classNames(dialogistClasses.footer, "border-t px-4 py-2 text-xs text-muted-foreground", className),
    children: content
  }));
};
ShadcnFooter.displayName = "ShadcnFooter";

export { ShadcnActions, ShadcnActionsContainer, ShadcnContent, ShadcnFooter, ShadcnStatusBar, ShadcnTitle };
//# sourceMappingURL=ShadcnSlots.js.map
