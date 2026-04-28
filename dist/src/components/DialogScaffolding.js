"use client";
import { objectWithoutProperties as _objectWithoutProperties, objectSpread2 as _objectSpread2 } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { styled, Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { memo, useRef, useLayoutEffect, useMemo, useCallback, createElement } from 'react';
import { createPortal } from 'react-dom';
import { dialogistClasses } from '../classes.js';
import { useDeepMemo } from '../hooks/useDeepCompare.js';
import { useMemoizedDialogParts } from '../hooks/useMemoizedDialogParts.js';
import { classNames } from '../utils/classNames.js';
import { deriveEffectiveActions } from '../utils/dialogActions.js';
import { resolveDialogPartContent } from '../utils/resolveDialogPartContent.js';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

var _excluded = ["className", "slotProps", "hideBackdrop", "container"],
  _excluded2 = ["className", "id"],
  _excluded3 = ["className", "id"],
  _excluded4 = ["className"];
var ACTIONS_ALIGN_TO_CSS = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly"
};
var resolveActionsGap = function resolveActionsGap(theme, value, fallback) {
  var v = value === undefined ? fallback : value;
  return typeof v === "number" ? theme.spacing(v) : v;
};

// Default Actions: one inner row when multiple groups so DialogActions has a single child — theme
// `gap` on `.Dialogist-actionsContainer` then does not space every button. Row `gap` = between
// groups; each cluster uses `intraGroupGap` (see {@link import("../types").ActionsStyle}).
// Layout tokens use CSS variables consumed by `.Dialogist-actionsRow` / `.Dialogist-actionsGroup`
// in `dialogistStyles` (no MUI `sx` on these wrappers).
var DefaultActions = function DefaultActions(_ref) {
  var _actionsStyle$gap;
  var actionGroups = _ref.actionGroups,
    dialogKey = _ref.dialogKey,
    actionsStyle = _ref.actionsStyle;
  var theme = useTheme();
  var hasMultipleGroups = actionGroups.length > 1;
  var justifyFromAlign = actionsStyle !== null && actionsStyle !== void 0 && actionsStyle.align ? ACTIONS_ALIGN_TO_CSS[actionsStyle.align] : undefined;
  var hasSingleGroup = actionGroups.length === 1;
  /** Matches `--dialogist-actionsContainer-justify` default when `align` is omitted. */
  var justifyContent = justifyFromAlign !== null && justifyFromAlign !== void 0 ? justifyFromAlign : "center";
  var innerGapRaw = hasMultipleGroups ? (actionsStyle === null || actionsStyle === void 0 ? void 0 : actionsStyle.intraGroupGap) !== undefined ? actionsStyle.intraGroupGap : 1 : (_actionsStyle$gap = actionsStyle === null || actionsStyle === void 0 ? void 0 : actionsStyle.gap) !== null && _actionsStyle$gap !== void 0 ? _actionsStyle$gap : 1;
  var groupBoxes = actionGroups.map(function (group, gi) {
    return (
      /*#__PURE__*/
      // biome-ignore lint/suspicious/noArrayIndexKey: action groups have no stable id; order is fixed per config
      jsx("div", {
        className: dialogistClasses.actionsGroup,
        "data-dialogist-layout": hasSingleGroup ? "single" : undefined,
        style: {
          "--dialogist-actionsGroup-gap": resolveActionsGap(theme, innerGapRaw, 1),
          "--dialogist-actionsGroup-justify": hasMultipleGroups ? "flex-start" : justifyContent
        },
        children: group.map(function (action, ai) {
          return (
            /*#__PURE__*/
            // biome-ignore lint/suspicious/noArrayIndexKey: action items have no stable id; order is fixed per config
            createElement(Button, _objectSpread2(_objectSpread2({}, action.props), {}, {
              key: "".concat(dialogKey, "-action-").concat(gi, "-").concat(ai)
            }), action.children || action.title)
          );
        })
      }, "".concat(dialogKey, "-group-").concat(gi))
    );
  });
  if (hasMultipleGroups) {
    return /*#__PURE__*/jsx("div", {
      className: dialogistClasses.actionsRow,
      style: {
        "--dialogist-actionsRow-gap": resolveActionsGap(theme, actionsStyle === null || actionsStyle === void 0 ? void 0 : actionsStyle.gap, 1),
        "--dialogist-actionsRow-justify": justifyContent
      },
      children: groupBoxes
    });
  }
  return /*#__PURE__*/jsx(Fragment, {
    children: groupBoxes
  });
};
var DefaultStyledDialog = styled(function (_ref2) {
  var className = _ref2.className,
    slotProps = _ref2.slotProps,
    hideBackdrop = _ref2.hideBackdrop,
    container = _ref2.container,
    props = _objectWithoutProperties(_ref2, _excluded);
  return /*#__PURE__*/jsx(Dialog, _objectSpread2(_objectSpread2({
    className: "".concat(dialogistClasses.base, " ").concat(className || "").trim()
  }, props), {}, {
    container: container,
    disableAutoFocus: props.disableAutoFocus,
    disableEnforceFocus: props.disableEnforceFocus,
    disableRestoreFocus: props.disableRestoreFocus,
    PaperProps: _objectSpread2({
      className: classNames(dialogistClasses.rootPaper, className)
    }, slotProps === null || slotProps === void 0 ? void 0 : slotProps.paper),
    slotProps: {
      backdrop: hideBackdrop ? {
        style: {
          display: "none"
        }
      } : _objectSpread2({
        className: dialogistClasses.backdrop
      }, slotProps === null || slotProps === void 0 ? void 0 : slotProps.backdrop)
    }
  }));
}, {
  shouldForwardProp: function shouldForwardProp(prop) {
    return prop !== "overflow" && prop !== "borderRadius";
  }
})(function (_ref3) {
  var overflow = _ref3.overflow;
  return {
    overflow: overflow || "hidden"
  };
});

// Stable dialog renderer that only updates when dialog content changes
var StableDialogRenderer = /*#__PURE__*/memo(function (_ref4) {
  var _ref4$DialogComponent = _ref4.DialogComponent,
    DialogComponent = _ref4$DialogComponent === void 0 ? DefaultStyledDialog : _ref4$DialogComponent,
    dialog = _ref4.dialog,
    onClose = _ref4.onClose,
    overflow = _ref4.overflow,
    slots = _ref4.slots,
    slotProps = _ref4.slotProps,
    suppressBackdrop = _ref4.suppressBackdrop;
  var dialogKey = dialog.key,
    type = dialog.type,
    config = dialog.config;
  var theme = useTheme();

  // Ref for the Paper element (Dialog content container) to animate transitions
  var paperRef = useRef(null);
  // Ref to store the previous dimensions for FLIP animation
  var prevRect = useRef(undefined);
  // Ref for the transition cleanup timeout
  var transitionTimeout = useRef(undefined);
  // Preserve any existing inline transition (avoid capturing our own mid-animation value)
  var baseInlineTransition = useRef(undefined);
  useLayoutEffect(function () {
    var _theme$transitions, _theme$transitions$ea, _theme$transitions2, _theme$transitions3;
    var element = paperRef.current;
    if (!element) return;
    if (baseInlineTransition.current === undefined) {
      baseInlineTransition.current = element.style.transition;
    }
    var resizeDuration = typeof ((_theme$transitions = theme.transitions) === null || _theme$transitions === void 0 || (_theme$transitions = _theme$transitions.duration) === null || _theme$transitions === void 0 ? void 0 : _theme$transitions.shortest) === "number" ? theme.transitions.duration.shortest : 150;
    var resizeEasing = (_theme$transitions$ea = (_theme$transitions2 = theme.transitions) === null || _theme$transitions2 === void 0 || (_theme$transitions2 = _theme$transitions2.easing) === null || _theme$transitions2 === void 0 ? void 0 : _theme$transitions2.easeOut) !== null && _theme$transitions$ea !== void 0 ? _theme$transitions$ea : "cubic-bezier(0.4, 0, 0.2, 1)";
    var resizeTransition = (_theme$transitions3 = theme.transitions) !== null && _theme$transitions3 !== void 0 && _theme$transitions3.create ? theme.transitions.create(["width", "height"], {
      duration: resizeDuration,
      easing: resizeEasing
    }) : "width ".concat(resizeDuration, "ms ").concat(resizeEasing, ", height ").concat(resizeDuration, "ms ").concat(resizeEasing);

    // 1. Check if currently locked/animating
    var isLocked = element.style.width !== "" || element.style.height !== "";

    // 2. Measure current visual size (Start point for interruption)
    var visualRect = element.getBoundingClientRect();

    // 3. Unlock to measure natural size
    // We temporarily remove explicit sizes to let content dictate size
    element.style.width = "";
    element.style.height = "";

    // 4. Measure target natural size
    var targetRect = element.getBoundingClientRect();

    // 5. Determine Start Rect
    // If we were locked, we start from where we visually were.
    // If we were auto, we start from the previous natural size (prevRect).
    // If no prevRect (first render), we don't animate (Start = Target).
    var startRect = isLocked ? visualRect : prevRect.current || targetRect;

    // 6. Check for significant change
    var widthChanged = Math.abs(startRect.width - targetRect.width) > 1;
    var heightChanged = Math.abs(startRect.height - targetRect.height) > 1;
    if (widthChanged || heightChanged) {
      // FLIP Animation

      // Clear cleanup timeout
      if (transitionTimeout.current) clearTimeout(transitionTimeout.current);

      // Set to Start (Instant)
      element.style.transition = "none";
      element.style.width = "".concat(startRect.width, "px");
      element.style.height = "".concat(startRect.height, "px");

      // Force Reflow
      void element.offsetHeight;

      // Animate to Target
      // Match MUI transition timings/easing (keep enter/exit transitions intact)
      element.style.transition = resizeTransition;
      element.style.width = "".concat(targetRect.width, "px");
      element.style.height = "".concat(targetRect.height, "px");

      // Cleanup after transition
      transitionTimeout.current = setTimeout(function () {
        element.style.width = "";
        element.style.height = "";
        element.style.transition = baseInlineTransition.current || "";
      }, resizeDuration + 25);
    }

    // Update prevRect for next time
    prevRect.current = targetRect;
  });

  // Extract custom components with MUI defaults as fallbacks.
  // Memoize wrappers so their identity is stable across renders.
  var Base = useMemo(function () {
    var _slots$Base;
    return (_slots$Base = slots === null || slots === void 0 ? void 0 : slots.Base) !== null && _slots$Base !== void 0 ? _slots$Base : DialogComponent;
  }, [slots === null || slots === void 0 ? void 0 : slots.Base, DialogComponent]);
  var Title = useMemo(function () {
    if (slots !== null && slots !== void 0 && slots.Title) return slots.Title;
    return function (_ref5) {
      var _slotProps$title;
      var className = _ref5.className,
        id = _ref5.id,
        props = _objectWithoutProperties(_ref5, _excluded2);
      var mergedProps = _objectSpread2(_objectSpread2(_objectSpread2({}, props), slotProps === null || slotProps === void 0 ? void 0 : slotProps.title), {}, {
        className: classNames(dialogistClasses.title, className, slotProps === null || slotProps === void 0 || (_slotProps$title = slotProps.title) === null || _slotProps$title === void 0 ? void 0 : _slotProps$title.className),
        id: id
      });
      return /*#__PURE__*/jsx(DialogTitle, _objectSpread2({}, mergedProps));
    };
  }, [slots === null || slots === void 0 ? void 0 : slots.Title, slotProps === null || slotProps === void 0 ? void 0 : slotProps.title]);
  var Content = useMemo(function () {
    if (slots !== null && slots !== void 0 && slots.Content) return slots.Content;
    return function (_ref6) {
      var _contentSlotProps$sx, _contentSlotProps$sty;
      var className = _ref6.className,
        id = _ref6.id,
        props = _objectWithoutProperties(_ref6, _excluded3);
      var contentSlotProps = slotProps === null || slotProps === void 0 ? void 0 : slotProps.content;
      var mergedProps = _objectSpread2(_objectSpread2(_objectSpread2({}, props), contentSlotProps), {}, {
        sx: _objectSpread2(_objectSpread2({}, props.sx), (_contentSlotProps$sx = contentSlotProps === null || contentSlotProps === void 0 ? void 0 : contentSlotProps.sx) !== null && _contentSlotProps$sx !== void 0 ? _contentSlotProps$sx : {}),
        style: _objectSpread2(_objectSpread2({}, props.style), (_contentSlotProps$sty = contentSlotProps === null || contentSlotProps === void 0 ? void 0 : contentSlotProps.style) !== null && _contentSlotProps$sty !== void 0 ? _contentSlotProps$sty : {}),
        className: classNames(dialogistClasses.content, className, contentSlotProps === null || contentSlotProps === void 0 ? void 0 : contentSlotProps.className),
        id: id
      });
      return /*#__PURE__*/jsx(DialogContent, _objectSpread2({}, mergedProps));
    };
  }, [slots === null || slots === void 0 ? void 0 : slots.Content, slotProps === null || slotProps === void 0 ? void 0 : slotProps.content]);
  var ActionsContainer = useMemo(function () {
    if (slots !== null && slots !== void 0 && slots.ActionsContainer) return slots.ActionsContainer;
    return function (_ref7) {
      var _slotProps$actionsCon;
      var className = _ref7.className,
        props = _objectWithoutProperties(_ref7, _excluded4);
      var mergedProps = _objectSpread2(_objectSpread2(_objectSpread2({}, props), slotProps === null || slotProps === void 0 ? void 0 : slotProps.actionsContainer), {}, {
        // @ts-expect-error: className might not exist on generic props
        className: classNames(dialogistClasses.actionsContainer, className, slotProps === null || slotProps === void 0 || (_slotProps$actionsCon = slotProps.actionsContainer) === null || _slotProps$actionsCon === void 0 ? void 0 : _slotProps$actionsCon.className)
      });
      return /*#__PURE__*/jsx(DialogActions, _objectSpread2({}, mergedProps));
    };
  }, [slots === null || slots === void 0 ? void 0 : slots.ActionsContainer, slotProps === null || slotProps === void 0 ? void 0 : slotProps.actionsContainer]);
  var StatusBar = slots === null || slots === void 0 ? void 0 : slots.StatusBar;
  var Footer = slots === null || slots === void 0 ? void 0 : slots.Footer;
  var Actions = (slots === null || slots === void 0 ? void 0 : slots.Actions) || DefaultActions;

  // Stable ARIA ids for accessibility
  var baseDomId = useMemo(function () {
    return "dialogist-".concat(dialogKey);
  }, [dialogKey]);
  var titleId = useMemo(function () {
    return "dialogist-".concat(dialogKey, "-title");
  }, [dialogKey]);
  var contentId = useMemo(function () {
    return "dialogist-".concat(dialogKey, "-content");
  }, [dialogKey]);
  var handleDialogSurfaceClose = useCallback(function (_event, muiReason) {
    var mappedReason = muiReason === "backdropClick" ? "backdrop" : muiReason === "escapeKeyDown" ? "escape" : "action";
    onClose(dialogKey, {
      cancelled: true,
      reason: mappedReason
    });
  }, [onClose, dialogKey]);

  // Use memoized dialog parts to prevent unnecessary re-renders
  var customConfig = type === "custom" ? config : null;
  var _useMemoizedDialogPar = useMemoizedDialogParts({
      statusBar: config.statusBar,
      title: config.title,
      content: config.message,
      props: (customConfig === null || customConfig === void 0 ? void 0 : customConfig.props) || {},
      footer: config.footer
    }, {
      statusBarDeps: [config.statusBar],
      titleDeps: [config.title],
      contentDeps: [config.message],
      propsDeps: [customConfig === null || customConfig === void 0 ? void 0 : customConfig.props],
      footerDeps: [config.footer]
    }),
    title = _useMemoizedDialogPar.title,
    content = _useMemoizedDialogPar.content,
    props = _useMemoizedDialogPar.props,
    statusBarRaw = _useMemoizedDialogPar.statusBar,
    footerRaw = _useMemoizedDialogPar.footer;

  // Memoize dialog content to prevent unnecessary re-renders using deep comparison
  var dialogContent = useDeepMemo(function () {
    var _slotProps$statusBar, _slotProps$statusBar2, _slotProps$footer, _slotProps$footer2, _slotProps$base, _slotProps$base2, _slotProps$base3, _config$actionsStyle, _config$actionsStyle2, _slotProps$actionsCon2;
    var statusBarResolved = statusBarRaw != null && statusBarRaw !== false ? resolveDialogPartContent(statusBarRaw) : null;
    var statusBar = statusBarRaw != null && statusBarRaw !== false ? StatusBar ? /*#__PURE__*/jsx(StatusBar, _objectSpread2({
      content: statusBarResolved,
      dialogKey: dialogKey,
      dialogType: type,
      className: classNames(dialogistClasses.statusBar, slotProps === null || slotProps === void 0 || (_slotProps$statusBar = slotProps.statusBar) === null || _slotProps$statusBar === void 0 ? void 0 : _slotProps$statusBar.className)
    }, slotProps === null || slotProps === void 0 ? void 0 : slotProps.statusBar)) : typeof statusBarRaw === "string" ? /*#__PURE__*/jsx(Box, {
      className: classNames(dialogistClasses.statusBar, dialogistClasses.topCorners, slotProps === null || slotProps === void 0 || (_slotProps$statusBar2 = slotProps.statusBar) === null || _slotProps$statusBar2 === void 0 ? void 0 : _slotProps$statusBar2.className),
      children: /*#__PURE__*/jsx(Typography, {
        variant: "caption",
        color: "var(--dialogist-primary-contrastText)",
        children: statusBarRaw
      })
    }) : statusBarResolved : null;
    var footerResolved = footerRaw != null && footerRaw !== false ? resolveDialogPartContent(footerRaw) : null;
    var footer = footerRaw != null && footerRaw !== false ? Footer ? /*#__PURE__*/jsx(Footer, _objectSpread2({
      content: footerResolved,
      dialogKey: dialogKey,
      className: classNames(dialogistClasses.footer, slotProps === null || slotProps === void 0 || (_slotProps$footer = slotProps.footer) === null || _slotProps$footer === void 0 ? void 0 : _slotProps$footer.className)
    }, slotProps === null || slotProps === void 0 ? void 0 : slotProps.footer)) : typeof footerRaw === "string" ? /*#__PURE__*/jsx(Box, {
      className: classNames(dialogistClasses.footer, dialogistClasses.bottomCorners, slotProps === null || slotProps === void 0 || (_slotProps$footer2 = slotProps.footer) === null || _slotProps$footer2 === void 0 ? void 0 : _slotProps$footer2.className),
      children: /*#__PURE__*/jsx(Typography, {
        variant: "caption",
        color: "var(--dialogist-footer-text)",
        children: footerRaw
      })
    }) : footerResolved : null;

    // Unified actions path: derive from config (explicit actions or built-in actions)
    var effectiveActions = deriveEffectiveActions(config, dialogKey, dialog.internalId, onClose);
    var contentStyle = config.contentStyle;
    var contentSlot;
    if (type === "custom") {
      if (content == null || content === false) {
        throw new Error("No message or content for custom dialog \"".concat(dialogKey, "\". Provide message, content, or a registered content slot."));
      }
      var customOnClose = props.onClose;
      var customProps = _objectSpread2(_objectSpread2({}, props), {}, {
        onClose: customOnClose ? function (result) {
          customOnClose(result);
          onClose(dialogKey, {
            resolveValue: result,
            reason: "action"
          });
        } : function (result) {
          return onClose(dialogKey, {
            resolveValue: result,
            reason: "action"
          });
        },
        dialog: dialog
      });
      contentSlot = resolveDialogPartContent(content, customProps);
    } else {
      contentSlot = resolveDialogPartContent(content, {});
    }
    return /*#__PURE__*/jsx(Base, _objectSpread2(_objectSpread2({
      id: baseDomId,
      open: true,
      onClose: handleDialogSurfaceClose,
      overflow: overflow,
      disableRestoreFocus: config.a11yRestoreFocus === false,
      "aria-labelledby": title ? titleId : undefined,
      "aria-describedby": contentId,
      className: slotProps === null || slotProps === void 0 || (_slotProps$base = slotProps.base) === null || _slotProps$base === void 0 ? void 0 : _slotProps$base.className
    }, slotProps === null || slotProps === void 0 ? void 0 : slotProps.base), {}, {
      slotProps: _objectSpread2({
        paper: _objectSpread2({
          ref: paperRef,
          sx: _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({
            borderRadius: "var(--dialogist-border-radius)"
          }, config.width !== undefined && {
            width: typeof config.width === "number" ? "".concat(config.width, "px") : config.width
          }), config.minWidth !== undefined && {
            minWidth: typeof config.minWidth === "number" ? "".concat(config.minWidth, "px") : config.minWidth
          }), config.maxWidth !== undefined && {
            maxWidth: config.maxWidth
          }), config.borderRadius !== undefined && {
            "--dialogist-border-radius": typeof config.borderRadius === "number" ? "".concat(config.borderRadius, "px") : config.borderRadius
          })
        }, slotProps === null || slotProps === void 0 || (_slotProps$base2 = slotProps.base) === null || _slotProps$base2 === void 0 || (_slotProps$base2 = _slotProps$base2.slotProps) === null || _slotProps$base2 === void 0 ? void 0 : _slotProps$base2.paper)
      }, slotProps === null || slotProps === void 0 || (_slotProps$base3 = slotProps.base) === null || _slotProps$base3 === void 0 ? void 0 : _slotProps$base3.slotProps),
      hideBackdrop: suppressBackdrop,
      children: /*#__PURE__*/jsxs("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          minHeight: 0,
          backgroundColor: "var(--dialogist-bg-paper)"
        },
        children: [statusBar, title && /*#__PURE__*/jsx(Title, {
          id: titleId,
          children: title
        }), type === "custom" ? /*#__PURE__*/jsx(Content, {
          id: contentId,
          children: contentSlot
        }) : /*#__PURE__*/jsx(Content, {
          id: contentId,
          "data-dialogist-content-managed": "true",
          style: _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({
            backgroundColor: "var(--dialogist-bg-paper)",
            color: "var(--dialogist-content-text)"
          }, (contentStyle === null || contentStyle === void 0 ? void 0 : contentStyle.align) && {
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: ACTIONS_ALIGN_TO_CSS[contentStyle.align]
          }), (contentStyle === null || contentStyle === void 0 ? void 0 : contentStyle.align) && {
            "--dialogist-content-display": "flex",
            "--dialogist-content-flex-direction": "column",
            "--dialogist-content-align-items": "stretch",
            "--dialogist-content-justify": ACTIONS_ALIGN_TO_CSS[contentStyle.align]
          }), (contentStyle === null || contentStyle === void 0 ? void 0 : contentStyle.textAlign) && {
            textAlign: contentStyle.textAlign
          }), (contentStyle === null || contentStyle === void 0 ? void 0 : contentStyle.textAlign) && {
            "--dialogist-content-text-align": contentStyle.textAlign
          }), (contentStyle === null || contentStyle === void 0 ? void 0 : contentStyle.minWidth) !== undefined && {
            minWidth: typeof contentStyle.minWidth === "number" ? "".concat(contentStyle.minWidth, "px") : contentStyle.minWidth
          }), (contentStyle === null || contentStyle === void 0 ? void 0 : contentStyle.minWidth) !== undefined && {
            "--dialogist-content-min-width": typeof contentStyle.minWidth === "number" ? "".concat(contentStyle.minWidth, "px") : contentStyle.minWidth
          }), (contentStyle === null || contentStyle === void 0 ? void 0 : contentStyle.maxWidth) !== undefined && {
            maxWidth: typeof contentStyle.maxWidth === "number" ? "".concat(contentStyle.maxWidth, "px") : contentStyle.maxWidth
          }), (contentStyle === null || contentStyle === void 0 ? void 0 : contentStyle.maxWidth) !== undefined && {
            "--dialogist-content-max-width": typeof contentStyle.maxWidth === "number" ? "".concat(contentStyle.maxWidth, "px") : contentStyle.maxWidth
          }), (contentStyle === null || contentStyle === void 0 ? void 0 : contentStyle.minHeight) !== undefined && {
            minHeight: typeof contentStyle.minHeight === "number" ? "".concat(contentStyle.minHeight, "px") : contentStyle.minHeight
          }), (contentStyle === null || contentStyle === void 0 ? void 0 : contentStyle.minHeight) !== undefined && {
            "--dialogist-content-min-height": typeof contentStyle.minHeight === "number" ? "".concat(contentStyle.minHeight, "px") : contentStyle.minHeight
          }), (contentStyle === null || contentStyle === void 0 ? void 0 : contentStyle.maxHeight) !== undefined && {
            maxHeight: typeof contentStyle.maxHeight === "number" ? "".concat(contentStyle.maxHeight, "px") : contentStyle.maxHeight
          }), (contentStyle === null || contentStyle === void 0 ? void 0 : contentStyle.maxHeight) !== undefined && {
            "--dialogist-content-max-height": typeof contentStyle.maxHeight === "number" ? "".concat(contentStyle.maxHeight, "px") : contentStyle.maxHeight
          }),
          children: contentSlot
        }), effectiveActions.length > 0 && /*#__PURE__*/jsx(ActionsContainer, _objectSpread2(_objectSpread2({
          sx: _objectSpread2(_objectSpread2(_objectSpread2({}, ((_config$actionsStyle = config.actionsStyle) === null || _config$actionsStyle === void 0 ? void 0 : _config$actionsStyle.align) && {
            "--dialogist-actionsContainer-justify": ACTIONS_ALIGN_TO_CSS[config.actionsStyle.align]
          }), ((_config$actionsStyle2 = config.actionsStyle) === null || _config$actionsStyle2 === void 0 ? void 0 : _config$actionsStyle2.gap) !== undefined && (slots === null || slots === void 0 ? void 0 : slots.Actions) && {
            gap: config.actionsStyle.gap
          }), slotProps === null || slotProps === void 0 || (_slotProps$actionsCon2 = slotProps.actionsContainer) === null || _slotProps$actionsCon2 === void 0 ? void 0 : _slotProps$actionsCon2.sx)
        }, slotProps === null || slotProps === void 0 ? void 0 : slotProps.actionsContainer), {}, {
          children: /*#__PURE__*/jsx(Actions, _objectSpread2({
            actions: effectiveActions.flat(),
            actionGroups: effectiveActions,
            actionsStyle: config.actionsStyle,
            dialogKey: dialogKey
          }, slotProps === null || slotProps === void 0 ? void 0 : slotProps.actions))
        })), footer]
      })
    }));
  }, [type, title, content, props, config, onClose, handleDialogSurfaceClose, dialog, overflow, statusBarRaw, footerRaw, config.width, config.minWidth, config.maxWidth, config.borderRadius, dialogKey, slots, slotProps, Base, Title, Content, ActionsContainer, StatusBar, Footer, Actions, suppressBackdrop]);
  return dialogContent;
});
StableDialogRenderer.displayName = "StableDialogRenderer";

// Stable scaffolding component that uses portals
var DialogScaffolding = /*#__PURE__*/memo(function (_ref8) {
  var dialogs = _ref8.dialogs,
    onClose = _ref8.onClose,
    DialogComponent = _ref8.DialogComponent,
    overflow = _ref8.overflow,
    slots = _ref8.slots,
    slotProps = _ref8.slotProps;
  // Only render if we have dialogs and document is available
  if (typeof document === "undefined" || dialogs.length === 0) {
    return null;
  }

  // Find the active dialog (last non-held dialog, or last dialog if none are held)
  // With replaceDialog, dialogs update in-place, so we just render the last dialog
  var activeDialog = dialogs.length > 0 ? dialogs[dialogs.length - 1] : null;
  return /*#__PURE__*/createPortal(/*#__PURE__*/jsx("div", {
    id: "dialogist-portal",
    style: {
      isolation: "isolate"
    },
    children: activeDialog && /*#__PURE__*/jsx(StableDialogRenderer, {
      dialog: activeDialog,
      onClose: onClose,
      DialogComponent: DialogComponent,
      overflow: overflow,
      suppressBackdrop: false,
      slots: slots,
      slotProps: slotProps
    }, activeDialog.internalId)
  }), document.body);
});
DialogScaffolding.displayName = "DialogScaffolding";

export { DialogScaffolding };
//# sourceMappingURL=DialogScaffolding.js.map
