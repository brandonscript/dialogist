"use client";
import { objectWithoutProperties as _objectWithoutProperties, objectSpread2 as _objectSpread2 } from '../../../_virtual/_rollupPluginBabelHelpers.js';
import { Dialog } from '@base-ui-components/react/dialog';
import { useCallback } from 'react';
import { dialogistClasses } from '../../classes.js';
import { classNames } from '../../utils/classNames.js';
import { jsx, jsxs } from 'react/jsx-runtime';

var _excluded = ["children", "className", "container", "hideBackdrop", "onClose", "open", "slotProps", "id", "overflow", "borderRadius", "disableAutoFocus", "disableRestoreFocus", "disableEnforceFocus"];
var POPUP_STYLE = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  background: "var(--dialogist-bg-paper, #ffffff)",
  borderRadius: "var(--dialogist-border-radius, 12px)",
  boxShadow: "0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12)",
  maxHeight: "calc(100% - 64px)",
  maxWidth: "min(90vw, 600px)",
  outline: "none"
};

/**
 * Full-area flex-centering wrapper — identical in structure to HeadlessBase's outer
 * div. Filling the container with `inset: 0` gives the popup the same available
 * width as HeadlessBase so text metrics match across adapters.
 */
var makeCenterWrapperStyle = function makeCenterWrapperStyle(isWindowed) {
  return {
    position: isWindowed ? "absolute" : "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    overflow: "auto",
    zIndex: 1301
  };
};
var BACKDROP_STYLE = {
  position: "fixed",
  inset: 0,
  backgroundColor: "var(--dialogist-backdrop-color, rgba(0, 0, 0, 0.5))",
  zIndex: 1300
};

/**
 * Base UI-backed `Base` slot. Wraps Base UI's parts-based Dialog (`Dialog.Root`,
 * `Dialog.Portal`, `Dialog.Backdrop`, `Dialog.Popup`) so Dialogist's slot system can
 * render through them while still controlling open/close via the Provider's state
 * machine. Forwards `slotProps.paper.ref` for the FLIP resize animation.
 */
var BaseUiBase = function BaseUiBase(_ref) {
  var _slotProps$paper, _slotProps$backdrop, _ref2;
  var children = _ref.children,
    className = _ref.className,
    container = _ref.container,
    hideBackdrop = _ref.hideBackdrop,
    onClose = _ref.onClose,
    open = _ref.open,
    slotProps = _ref.slotProps,
    id = _ref.id,
    overflow = _ref.overflow,
    borderRadius = _ref.borderRadius,
    disableAutoFocus = _ref.disableAutoFocus,
    disableRestoreFocus = _ref.disableRestoreFocus,
    disableEnforceFocus = _ref.disableEnforceFocus,
    rest = _objectWithoutProperties(_ref, _excluded);
  var handleOpenChange = useCallback(function (nextOpen, eventDetails) {
    if (!nextOpen) {
      var reason = (eventDetails === null || eventDetails === void 0 ? void 0 : eventDetails.reason) === "escape-key" ? "escape" : (eventDetails === null || eventDetails === void 0 ? void 0 : eventDetails.reason) === "outside-press" ? "backdrop" : undefined;
      onClose(reason);
    }
  }, [onClose]);
  var paperSlotProps = (_slotProps$paper = slotProps === null || slotProps === void 0 ? void 0 : slotProps.paper) !== null && _slotProps$paper !== void 0 ? _slotProps$paper : {};
  var backdropSlotProps = (_slotProps$backdrop = slotProps === null || slotProps === void 0 ? void 0 : slotProps.backdrop) !== null && _slotProps$backdrop !== void 0 ? _slotProps$backdrop : {};
  var resolvedContainer = typeof container === "function" ? container() : container;
  var isWindowed = !!resolvedContainer;
  var borderRadiusProp = borderRadius !== undefined ? {
    "--dialogist-border-radius": typeof borderRadius === "number" ? "".concat(borderRadius, "px") : borderRadius
  } : {};
  var popupStyle = _objectSpread2(_objectSpread2(_objectSpread2({}, POPUP_STYLE), {}, {
    overflow: overflow !== null && overflow !== void 0 ? overflow : "hidden"
  }, borderRadiusProp), paperSlotProps.style);
  var backdropPositionOverride = isWindowed ? {
    position: "absolute"
  } : {};
  var backdropStyle = hideBackdrop ? _objectSpread2(_objectSpread2(_objectSpread2({}, BACKDROP_STYLE), backdropPositionOverride), {}, {
    display: "none"
  }) : _objectSpread2(_objectSpread2(_objectSpread2({}, BACKDROP_STYLE), backdropPositionOverride), backdropSlotProps.style);

  // Honor the existing focus-flag contract by mapping to Base UI's `modal` and
  // popup `initialFocus`/`finalFocus`.
  // "trap-focus" traps keyboard focus inside the dialog without blocking pointer events on external
  // elements — matching MUI Dialog's default behaviour. modal={true} would additionally set
  // pointer-events:none / inert on everything outside, preventing clicks on e.g. toggles that live
  // outside the popup while the dialog is open (breaks the canClose demo and similar patterns).
  var modal = disableEnforceFocus ? false : "trap-focus";
  var initialFocus = disableAutoFocus ? false : undefined;
  var finalFocus = disableRestoreFocus ? false : undefined;
  var containerProps = rest;
  var popup = /*#__PURE__*/jsx(Dialog.Popup, {
    ref: paperSlotProps.ref,
    id: id,
    "aria-labelledby": containerProps["aria-labelledby"],
    "aria-describedby": containerProps["aria-describedby"],
    className: classNames(dialogistClasses.base, dialogistClasses.rootPaper, className, paperSlotProps.className),
    style: popupStyle,
    initialFocus: initialFocus,
    finalFocus: finalFocus,
    children: children
  });
  return /*#__PURE__*/jsx(Dialog.Root, {
    open: open,
    onOpenChange: handleOpenChange,
    modal: modal,
    children: /*#__PURE__*/jsxs(Dialog.Portal, {
      keepMounted: false,
      container: (_ref2 = resolvedContainer) !== null && _ref2 !== void 0 ? _ref2 : undefined,
      children: [/*#__PURE__*/jsx(Dialog.Backdrop, {
        className: classNames(dialogistClasses.backdrop, backdropSlotProps.className),
        style: backdropStyle
      }), /*#__PURE__*/jsx("div", {
        style: makeCenterWrapperStyle(isWindowed),
        children: popup
      })]
    })
  });
};
BaseUiBase.displayName = "BaseUiBase";

export { BaseUiBase };
//# sourceMappingURL=BaseUiBase.js.map
