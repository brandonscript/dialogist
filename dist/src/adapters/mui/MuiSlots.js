"use client";
import { objectSpread2 as _objectSpread2, objectWithoutProperties as _objectWithoutProperties } from '../../../_virtual/_rollupPluginBabelHelpers.js';
import { Button, DialogActions, DialogContent, Box, Typography, DialogTitle } from '@mui/material';
import { dialogistClasses } from '../../classes.js';
import { classNames } from '../../utils/classNames.js';
import { jsx, Fragment } from 'react/jsx-runtime';
import { createElement } from 'react';

var _excluded = ["id", "className", "children"],
  _excluded2 = ["id", "className", "style", "children"],
  _excluded3 = ["className", "children"],
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
var getActionKeyPart = function getActionKeyPart(action) {
  var _ref, _action$id;
  return (_ref = (_action$id = action.id) !== null && _action$id !== void 0 ? _action$id : action.title) !== null && _ref !== void 0 ? _ref : typeof action.children === "string" ? action.children : "anonymous";
};
var resolveSpacing = function resolveSpacing(value, fallback) {
  var v = value === undefined ? fallback : value;
  return typeof v === "number" ? "".concat(v * 8, "px") : v;
};
var MuiTitle = function MuiTitle(_ref2) {
  var id = _ref2.id,
    className = _ref2.className,
    children = _ref2.children,
    rest = _objectWithoutProperties(_ref2, _excluded);
  return /*#__PURE__*/jsx(DialogTitle, _objectSpread2(_objectSpread2({}, rest), {}, {
    id: id,
    className: classNames(dialogistClasses.title, className),
    children: children
  }));
};
MuiTitle.displayName = "MuiTitle";
var MuiContent = function MuiContent(_ref3) {
  var id = _ref3.id,
    className = _ref3.className,
    style = _ref3.style,
    children = _ref3.children,
    rest = _objectWithoutProperties(_ref3, _excluded2);
  return /*#__PURE__*/jsx(DialogContent, _objectSpread2(_objectSpread2({}, rest), {}, {
    id: id,
    className: classNames(dialogistClasses.content, className),
    style: style,
    children: children
  }));
};
MuiContent.displayName = "MuiContent";
var MuiActionsContainer = function MuiActionsContainer(_ref4) {
  var className = _ref4.className,
    children = _ref4.children,
    rest = _objectWithoutProperties(_ref4, _excluded3);
  return /*#__PURE__*/jsx(DialogActions, _objectSpread2(_objectSpread2({}, rest), {}, {
    className: classNames(dialogistClasses.actionsContainer, className),
    children: children
  }));
};
MuiActionsContainer.displayName = "MuiActionsContainer";

/**
 * MUI-backed `Actions` slot. Renders one or more action groups using MUI Button.
 * Mirrors the previous `DefaultActions` behavior from before the adapter split.
 */
var MuiActions = function MuiActions(_ref5) {
  var _actionsStyle$gap;
  var actionGroups = _ref5.actionGroups,
    dialogKey = _ref5.dialogKey,
    actionsStyle = _ref5.actionsStyle;
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
        return /*#__PURE__*/createElement(Button, _objectSpread2(_objectSpread2({}, action.props), {}, {
          key: "".concat(dialogKey, "-action-").concat(getActionKeyPart(action))
        }), action.children || action.title);
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
MuiActions.displayName = "MuiActions";
var MuiStatusBar = function MuiStatusBar(_ref6) {
  var className = _ref6.className,
    content = _ref6.content,
    rest = _objectWithoutProperties(_ref6, _excluded4);
  var passthrough = rest;
  delete passthrough.dialogKey;
  delete passthrough.dialogType;
  return /*#__PURE__*/jsx(Box, _objectSpread2(_objectSpread2({}, passthrough), {}, {
    className: classNames(dialogistClasses.statusBar, dialogistClasses.topCorners, className),
    children: /*#__PURE__*/jsx(Typography, {
      variant: "caption",
      color: "var(--dialogist-statusBar-text)",
      children: content
    })
  }));
};
MuiStatusBar.displayName = "MuiStatusBar";
var MuiFooter = function MuiFooter(_ref7) {
  var className = _ref7.className,
    content = _ref7.content,
    rest = _objectWithoutProperties(_ref7, _excluded5);
  var passthrough = rest;
  delete passthrough.dialogKey;
  return /*#__PURE__*/jsx(Box, _objectSpread2(_objectSpread2({}, passthrough), {}, {
    className: classNames(dialogistClasses.footer, dialogistClasses.bottomCorners, className),
    children: /*#__PURE__*/jsx(Typography, {
      variant: "caption",
      color: "var(--dialogist-footer-text)",
      children: content
    })
  }));
};
MuiFooter.displayName = "MuiFooter";

export { MuiActions, MuiActionsContainer, MuiContent, MuiFooter, MuiStatusBar, MuiTitle };
//# sourceMappingURL=MuiSlots.js.map
