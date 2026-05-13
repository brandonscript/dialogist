"use client";
import { objectWithoutProperties as _objectWithoutProperties, objectSpread2 as _objectSpread2 } from '../../../_virtual/_rollupPluginBabelHelpers.js';
import { useRef, useCallback, useLayoutEffect, useEffect } from 'react';
import { dialogistClasses } from '../../classes.js';
import { classNames } from '../../utils/classNames.js';
import { focusFirstElement, handleFocusTrapKeyDown } from './focusTrap.js';
import { jsxs, jsx } from 'react/jsx-runtime';

var _excluded = ["children", "className", "hideBackdrop", "onClose", "open", "slotProps", "id", "overflow", "disableAutoFocus", "disableEnforceFocus", "disableRestoreFocus", "borderRadius"];
var SCROLL_LOCK_COUNTER_KEY = "__dialogistScrollLock__";
var acquireScrollLock = function acquireScrollLock() {
  if (typeof document === "undefined") return;
  var target = document.body;
  var state = target[SCROLL_LOCK_COUNTER_KEY];
  if (!state) {
    var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    state = {
      count: 0,
      previousOverflow: target.style.overflow,
      previousPaddingRight: target.style.paddingRight
    };
    target[SCROLL_LOCK_COUNTER_KEY] = state;
    target.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      target.style.paddingRight = "".concat(scrollbarWidth, "px");
    }
  }
  state.count += 1;
};
var releaseScrollLock = function releaseScrollLock() {
  if (typeof document === "undefined") return;
  var target = document.body;
  var state = target[SCROLL_LOCK_COUNTER_KEY];
  if (!state) return;
  state.count -= 1;
  if (state.count <= 0) {
    target.style.overflow = state.previousOverflow;
    target.style.paddingRight = state.previousPaddingRight;
    delete target[SCROLL_LOCK_COUNTER_KEY];
  }
};

/**
 * Apply a forwarded ref (object or callback) to a DOM node.
 */
var applyRef = function applyRef(ref, node) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(node);
    return;
  }
  ref.current = node;
};
var BACKDROP_BASE_STYLE = {
  position: "fixed",
  inset: 0,
  zIndex: 1300,
  overflow: "auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16
};
var BACKDROP_LAYER_STYLE = {
  position: "fixed",
  inset: 0,
  backgroundColor: "var(--dialogist-backdrop-color, rgba(0, 0, 0, 0.5))",
  pointerEvents: "auto"
};
var HEADLESS_PAPER_BASE_STYLE = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  background: "var(--dialogist-bg-paper, #ffffff)",
  borderRadius: "var(--dialogist-border-radius, 12px)",
  boxShadow: "0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12)",
  maxHeight: "calc(100% - 64px)",
  maxWidth: "min(90vw, 600px)",
  outline: "none",
  zIndex: 1
};

/**
 * Framework-agnostic default `Base` slot used by `DialogScaffolding` when no adapter is
 * provided. Renders a backdrop, paper container, focus trap, Esc handler, scroll lock,
 * and forwards `slotProps.paper.ref` for the FLIP resize animation.
 *
 * Adapters (MUI, Base UI, shadcn) replace this with their own Dialog primitive when
 * mounted via `DialogProvider.slots`.
 */
var HeadlessBase = function HeadlessBase(_ref) {
  var _slotProps$paper2, _slotProps$paper3, _slotProps$backdrop;
  var children = _ref.children,
    className = _ref.className,
    hideBackdrop = _ref.hideBackdrop,
    onClose = _ref.onClose,
    open = _ref.open,
    slotProps = _ref.slotProps,
    id = _ref.id,
    overflow = _ref.overflow,
    disableAutoFocus = _ref.disableAutoFocus,
    disableEnforceFocus = _ref.disableEnforceFocus,
    disableRestoreFocus = _ref.disableRestoreFocus,
    borderRadius = _ref.borderRadius,
    rest = _objectWithoutProperties(_ref, _excluded);
  var paperRef = useRef(null);
  var previouslyFocusedRef = useRef(null);
  var setPaperRef = useCallback(function (node) {
    var _slotProps$paper;
    paperRef.current = node;
    applyRef(slotProps === null || slotProps === void 0 || (_slotProps$paper = slotProps.paper) === null || _slotProps$paper === void 0 ? void 0 : _slotProps$paper.ref, node);
  }, [slotProps === null || slotProps === void 0 || (_slotProps$paper2 = slotProps.paper) === null || _slotProps$paper2 === void 0 ? void 0 : _slotProps$paper2.ref]);
  useLayoutEffect(function () {
    if (!open) return;
    if (typeof document !== "undefined" && !disableRestoreFocus) {
      previouslyFocusedRef.current = document.activeElement;
    }
  }, [open, disableRestoreFocus]);
  useEffect(function () {
    if (!open) return;
    acquireScrollLock();
    return releaseScrollLock;
  }, [open]);
  useEffect(function () {
    if (!open) return;
    if (disableAutoFocus) return;
    var node = paperRef.current;
    if (!node) return;
    var t = window.setTimeout(function () {
      focusFirstElement(node);
    }, 0);
    return function () {
      return window.clearTimeout(t);
    };
  }, [open, disableAutoFocus]);
  useEffect(function () {
    if (!open) return;
    if (typeof window === "undefined") return;
    var onKeyDown = function onKeyDown(event) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (disableEnforceFocus) return;
      var node = paperRef.current;
      if (!node) return;
      handleFocusTrapKeyDown(node, event);
    };
    window.addEventListener("keydown", onKeyDown, true);
    return function () {
      return window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, onClose, disableEnforceFocus]);
  useEffect(function () {
    if (!open) return;
    return function () {
      if (disableRestoreFocus) return;
      var previous = previouslyFocusedRef.current;
      if (previous && typeof previous.focus === "function") {
        previous.focus();
      }
    };
  }, [open, disableRestoreFocus]);
  if (!open) return null;
  var onBackdropClick = function onBackdropClick(event) {
    if (event.target !== event.currentTarget) return;
    onClose();
  };
  var paperSlotProps = (_slotProps$paper3 = slotProps === null || slotProps === void 0 ? void 0 : slotProps.paper) !== null && _slotProps$paper3 !== void 0 ? _slotProps$paper3 : {};
  var backdropSlotProps = (_slotProps$backdrop = slotProps === null || slotProps === void 0 ? void 0 : slotProps.backdrop) !== null && _slotProps$backdrop !== void 0 ? _slotProps$backdrop : {};
  var paperStyle = _objectSpread2(_objectSpread2(_objectSpread2({}, HEADLESS_PAPER_BASE_STYLE), {}, {
    overflow: overflow !== null && overflow !== void 0 ? overflow : "hidden"
  }, borderRadius !== undefined && {
    "--dialogist-border-radius": typeof borderRadius === "number" ? "".concat(borderRadius, "px") : borderRadius
  }), paperSlotProps.style);
  var backdropLayerStyle = hideBackdrop ? _objectSpread2(_objectSpread2({}, BACKDROP_LAYER_STYLE), {}, {
    display: "none"
  }) : _objectSpread2(_objectSpread2({}, BACKDROP_LAYER_STYLE), backdropSlotProps.style);
  var containerProps = rest;
  return /*#__PURE__*/jsxs("div", {
    role: "presentation",
    style: BACKDROP_BASE_STYLE,
    onClick: onBackdropClick,
    "data-dialogist-headless-base": "true",
    children: [/*#__PURE__*/jsx("div", {
      "aria-hidden": "true",
      className: classNames(dialogistClasses.backdrop, backdropSlotProps.className),
      style: backdropLayerStyle
    }), /*#__PURE__*/jsx("div", {
      ref: setPaperRef,
      role: "dialog",
      "aria-modal": "true",
      id: id,
      "aria-labelledby": containerProps["aria-labelledby"],
      "aria-describedby": containerProps["aria-describedby"],
      className: classNames(dialogistClasses.base, dialogistClasses.rootPaper, className, paperSlotProps.className),
      style: paperStyle,
      tabIndex: -1,
      children: children
    })]
  });
};
HeadlessBase.displayName = "HeadlessBase";

export { HeadlessBase };
//# sourceMappingURL=HeadlessBase.js.map
