"use client";
import { objectWithoutProperties as _objectWithoutProperties, objectSpread2 as _objectSpread2 } from '../../../_virtual/_rollupPluginBabelHelpers.js';
import { Dialog } from '@base-ui-components/react/dialog';
import { useCallback } from 'react';
import { dialogistClasses } from '../../classes.js';
import { classNames } from '../../utils/classNames.js';
import { jsx, jsxs } from 'react/jsx-runtime';

var _excluded = ["children", "className", "hideBackdrop", "onClose", "open", "slotProps", "id", "overflow", "borderRadius", "disableAutoFocus", "disableRestoreFocus", "disableEnforceFocus"];
var SHADCN_BACKDROP_CLASS = "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out " + "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";
var SHADCN_POPUP_CLASS = "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] " + "gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg " + "data-[state=open]:animate-in data-[state=closed]:animate-out " + "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 " + "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 " + "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] " + "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]";

/**
 * shadcn-style `Base` slot powered by Base UI primitives instead of Radix. Consumers
 * who use shadcn class conventions (and have `tailwindcss-animate` installed) get the
 * same look + animations as a stock shadcn dialog without the Radix dependency.
 *
 * Pair with `<DialogProvider slots={shadcnSlots}>` (see `dialogist/shadcn`).
 */
var ShadcnBase = function ShadcnBase(_ref) {
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
  var popupStyle = _objectSpread2(_objectSpread2({
    overflow: overflow !== null && overflow !== void 0 ? overflow : "hidden"
  }, borderRadius !== undefined && {
    "--dialogist-border-radius": typeof borderRadius === "number" ? "".concat(borderRadius, "px") : borderRadius
  }), paperSlotProps.style);
  var backdropStyle = hideBackdrop ? {
    display: "none"
  } : _objectSpread2({}, backdropSlotProps.style);
  var modal = disableEnforceFocus ? "trap-focus" : true;
  var initialFocus = disableAutoFocus ? false : undefined;
  var finalFocus = disableRestoreFocus ? false : undefined;
  var containerProps = rest;
  return /*#__PURE__*/jsx(Dialog.Root, {
    open: open,
    onOpenChange: handleOpenChange,
    modal: modal,
    children: /*#__PURE__*/jsxs(Dialog.Portal, {
      children: [/*#__PURE__*/jsx(Dialog.Backdrop, {
        className: classNames(SHADCN_BACKDROP_CLASS, dialogistClasses.backdrop, backdropSlotProps.className),
        style: backdropStyle
      }), /*#__PURE__*/jsx(Dialog.Popup, {
        ref: paperSlotProps.ref,
        id: id,
        "aria-labelledby": containerProps["aria-labelledby"],
        "aria-describedby": containerProps["aria-describedby"],
        className: classNames(SHADCN_POPUP_CLASS, dialogistClasses.base, dialogistClasses.rootPaper, className, paperSlotProps.className),
        style: popupStyle,
        initialFocus: initialFocus,
        finalFocus: finalFocus,
        children: children
      })]
    })
  });
};
ShadcnBase.displayName = "ShadcnBase";

export { ShadcnBase };
//# sourceMappingURL=ShadcnBase.js.map
