"use client";
import { objectWithoutProperties as _objectWithoutProperties, objectSpread2 as _objectSpread2 } from '../../../_virtual/_rollupPluginBabelHelpers.js';
import { Dialog } from '@base-ui-components/react/dialog';
import { useCallback } from 'react';
import { dialogistClasses } from '../../classes.js';
import { classNames } from '../../utils/classNames.js';
import { jsx, jsxs } from 'react/jsx-runtime';

var _excluded = ["children", "className", "container", "hideBackdrop", "onClose", "open", "slotProps", "id", "overflow", "borderRadius", "disableAutoFocus", "disableRestoreFocus", "disableEnforceFocus"];
var SHADCN_BACKDROP_CLASS = "fixed inset-0 z-50 bg-black/50";
var SHADCN_POPUP_CLASS = "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] " + "gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg " + "data-[state=open]:animate-in data-[state=closed]:animate-out " + "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 " + "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 " + "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] " + "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]";

/**
 * shadcn-style `Base` slot powered by Base UI primitives instead of Radix. Consumers
 * who use shadcn class conventions (and have `tailwindcss-animate` installed) get the
 * same look + animations as a stock shadcn dialog without the Radix dependency.
 *
 * Pair with `<DialogProvider slots={shadcnSlots}>` (see `dialogist/shadcn`).
 */
var ShadcnBase = function ShadcnBase(_ref) {
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

  // When portaling into a sandbox container, use a flex-centering wrapper (matching
  // HeadlessBase) so the popup gets the same content-driven width as MUI.
  // The windowed popup inline style also overrides SHADCN_POPUP_CLASS's fixed/translate/
  // grid/w-full/max-w-lg Tailwind classes so the paper behaves identically to MUI.
  var resolvedContainer = typeof container === "function" ? container() : container;
  var isWindowed = !!resolvedContainer;
  var borderRadiusProp = borderRadius !== undefined ? {
    "--dialogist-border-radius": typeof borderRadius === "number" ? "".concat(borderRadius, "px") : borderRadius
  } : {};

  // Override SHADCN_POPUP_CLASS's fixed/left-[50%]/top-[50%]/translate/grid/w-full/max-w-lg.
  // The centering is now handled by the full-area flex wrapper (not by SHADCN_POPUP_CLASS's
  // Tailwind transforms), so we reset all positioning to `relative` with no offset or
  // translation. Tailwind v4 uses the standalone CSS `translate` property for
  // translate-x-[-50%]/translate-y-[-50%], so `transform: none` alone is insufficient —
  // we must also set `translate: "none"`.
  var popupStyle = _objectSpread2(_objectSpread2({
    position: "relative",
    top: "auto",
    left: "auto",
    translate: "none",
    transform: "none",
    display: "flex",
    flexDirection: "column",
    width: "auto",
    maxWidth: "min(90vw, 600px)",
    maxHeight: "calc(100% - 64px)",
    overflow: overflow !== null && overflow !== void 0 ? overflow : "hidden"
  }, borderRadiusProp), paperSlotProps.style);

  // Full-area flex-centering wrapper — mirrors HeadlessBase's outer div.
  // `inset: 0` gives the popup the same available width across adapters so text
  // metrics match MUI. The `flex: 1 1 auto; minHeight: 0` on DialogScaffolding's
  // inner div (replacing `height: 100%`) prevents the circular height dependency
  // that the flex cross-axis definite cross-size would otherwise cause.
  var centerWrapperStyle = {
    position: isWindowed ? "absolute" : "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    overflow: "auto",
    zIndex: 1301
  };
  var backdropPositionOverride = isWindowed ? {
    position: "absolute"
  } : {};
  var backdropStyle = hideBackdrop ? _objectSpread2(_objectSpread2({}, backdropPositionOverride), {}, {
    display: "none"
  }) : _objectSpread2(_objectSpread2({}, backdropPositionOverride), backdropSlotProps.style);

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
    className: classNames(SHADCN_POPUP_CLASS, dialogistClasses.base, dialogistClasses.rootPaper, className, paperSlotProps.className),
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
      container: (_ref2 = resolvedContainer) !== null && _ref2 !== void 0 ? _ref2 : undefined,
      children: [/*#__PURE__*/jsx(Dialog.Backdrop, {
        className: classNames(SHADCN_BACKDROP_CLASS, dialogistClasses.backdrop, backdropSlotProps.className),
        style: backdropStyle
      }), /*#__PURE__*/jsx("div", {
        style: centerWrapperStyle,
        children: popup
      })]
    })
  });
};
ShadcnBase.displayName = "ShadcnBase";

export { ShadcnBase };
//# sourceMappingURL=ShadcnBase.js.map
