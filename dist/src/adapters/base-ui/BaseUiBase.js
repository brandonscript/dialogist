"use client";
import { objectWithoutProperties as _objectWithoutProperties, objectSpread2 as _objectSpread2 } from '../../../_virtual/_rollupPluginBabelHelpers.js';
import { Dialog } from '@base-ui-components/react/dialog';
import { useCallback } from 'react';
import { dialogistClasses } from '../../classes.js';
import { classNames } from '../../utils/classNames.js';
import { jsx, jsxs } from 'react/jsx-runtime';

var _excluded = ["children", "className", "hideBackdrop", "onClose", "open", "slotProps", "id", "overflow", "borderRadius", "disableAutoFocus", "disableRestoreFocus", "disableEnforceFocus"];
var POPUP_BASE_STYLE = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  display: "flex",
  flexDirection: "column",
  background: "var(--dialogist-bg-paper, #ffffff)",
  borderRadius: "var(--dialogist-border-radius, 12px)",
  boxShadow: "0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12)",
  maxHeight: "calc(100% - 64px)",
  maxWidth: "min(90vw, 600px)",
  outline: "none",
  zIndex: 1301
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
  var _slotProps$paper, _slotProps$backdrop;
  var children = _ref.children,
    className = _ref.className,
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
  var handleOpenChange = useCallback(function (nextOpen) {
    if (!nextOpen) onClose();
  }, [onClose]);
  var paperSlotProps = (_slotProps$paper = slotProps === null || slotProps === void 0 ? void 0 : slotProps.paper) !== null && _slotProps$paper !== void 0 ? _slotProps$paper : {};
  var backdropSlotProps = (_slotProps$backdrop = slotProps === null || slotProps === void 0 ? void 0 : slotProps.backdrop) !== null && _slotProps$backdrop !== void 0 ? _slotProps$backdrop : {};
  var popupStyle = _objectSpread2(_objectSpread2(_objectSpread2({}, POPUP_BASE_STYLE), {}, {
    overflow: overflow !== null && overflow !== void 0 ? overflow : "hidden"
  }, borderRadius !== undefined && {
    "--dialogist-border-radius": typeof borderRadius === "number" ? "".concat(borderRadius, "px") : borderRadius
  }), paperSlotProps.style);
  var backdropStyle = hideBackdrop ? _objectSpread2(_objectSpread2({}, BACKDROP_STYLE), {}, {
    display: "none"
  }) : _objectSpread2(_objectSpread2({}, BACKDROP_STYLE), backdropSlotProps.style);

  // Honor the existing focus-flag contract by mapping to Base UI's `modal` and
  // popup `initialFocus`/`finalFocus`.
  var modal = disableEnforceFocus ? "trap-focus" : true;
  var initialFocus = disableAutoFocus ? false : undefined;
  var finalFocus = disableRestoreFocus ? false : undefined;
  var containerProps = rest;
  return /*#__PURE__*/jsx(Dialog.Root, {
    open: open,
    onOpenChange: handleOpenChange,
    modal: modal,
    children: /*#__PURE__*/jsxs(Dialog.Portal, {
      keepMounted: false,
      children: [/*#__PURE__*/jsx(Dialog.Backdrop, {
        className: classNames(dialogistClasses.backdrop, backdropSlotProps.className),
        style: backdropStyle
      }), /*#__PURE__*/jsx(Dialog.Popup, {
        ref: paperSlotProps.ref,
        id: id,
        "aria-labelledby": containerProps["aria-labelledby"],
        "aria-describedby": containerProps["aria-describedby"],
        className: classNames(dialogistClasses.base, dialogistClasses.rootPaper, className, paperSlotProps.className),
        style: popupStyle,
        initialFocus: initialFocus,
        finalFocus: finalFocus,
        children: children
      })]
    })
  });
};
BaseUiBase.displayName = "BaseUiBase";

export { BaseUiBase };
//# sourceMappingURL=BaseUiBase.js.map
