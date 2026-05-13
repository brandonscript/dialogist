"use client";
import { objectWithoutProperties as _objectWithoutProperties, objectSpread2 as _objectSpread2, defineProperty as _defineProperty } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { memo, useRef, useLayoutEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { dialogistClasses } from '../classes.js';
import { useDialogistAdapter } from '../context/DialogistAdapterContext.js';
import { useDeepMemo } from '../hooks/useDeepCompare.js';
import { useMemoizedDialogParts } from '../hooks/useMemoizedDialogParts.js';
import { classNames } from '../utils/classNames.js';
import { deriveEffectiveActions } from '../utils/dialogActions.js';
import { resolveDialogPartContent } from '../utils/resolveDialogPartContent.js';
import { HeadlessBase } from './headless/HeadlessBase.js';
import { HeadlessTitle, HeadlessContent, HeadlessActionsContainer, HeadlessActions, HeadlessStatusBar, HeadlessFooter } from './headless/headlessDefaults.js';
import { jsx, jsxs } from 'react/jsx-runtime';

var _excluded = ["className", "id"],
  _excluded2 = ["className", "id", "style"],
  _excluded3 = ["className"];
var ACTIONS_ALIGN_TO_CSS = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly"
};
// Stable dialog renderer that only updates when dialog content changes
var StableDialogRenderer = /*#__PURE__*/memo(function (_ref) {
  var _slots$Actions;
  var _ref$DialogComponent = _ref.DialogComponent,
    DialogComponent = _ref$DialogComponent === void 0 ? HeadlessBase : _ref$DialogComponent,
    dialog = _ref.dialog,
    onClose = _ref.onClose,
    overflow = _ref.overflow,
    slots = _ref.slots,
    slotProps = _ref.slotProps,
    suppressBackdrop = _ref.suppressBackdrop;
  var dialogKey = dialog.key,
    type = dialog.type,
    config = dialog.config;
  var adapter = useDialogistAdapter();

  // Ref for the Paper element (Dialog content container) to animate transitions
  var paperRef = useRef(null);
  // Ref to store the previous dimensions for FLIP animation
  var prevRect = useRef(undefined);
  // Ref for the transition cleanup timeout
  var transitionTimeout = useRef(undefined);
  // Preserve any existing inline transition (avoid capturing our own mid-animation value)
  var baseInlineTransition = useRef(undefined);
  useLayoutEffect(function () {
    var element = paperRef.current;
    if (!element) return;
    if (baseInlineTransition.current === undefined) {
      baseInlineTransition.current = element.style.transition;
    }
    var resizeDuration = adapter.transitionDuration;
    var resizeEasing = adapter.transitionEasing;
    var resizeTransition = "width ".concat(resizeDuration, "ms ").concat(resizeEasing, ", height ").concat(resizeDuration, "ms ").concat(resizeEasing);

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

  // Extract custom components with headless defaults as fallbacks.
  // Memoize wrappers so their identity is stable across renders.
  var Base = useMemo(function () {
    var _slots$Base;
    return (_slots$Base = slots === null || slots === void 0 ? void 0 : slots.Base) !== null && _slots$Base !== void 0 ? _slots$Base : DialogComponent;
  }, [slots === null || slots === void 0 ? void 0 : slots.Base, DialogComponent]);
  var Title = useMemo(function () {
    if (slots !== null && slots !== void 0 && slots.Title) return slots.Title;
    return function (_ref2) {
      var _slotProps$title;
      var className = _ref2.className,
        id = _ref2.id,
        props = _objectWithoutProperties(_ref2, _excluded);
      return /*#__PURE__*/jsx(HeadlessTitle, _objectSpread2(_objectSpread2(_objectSpread2({}, props), slotProps === null || slotProps === void 0 ? void 0 : slotProps.title), {}, {
        className: classNames(className, slotProps === null || slotProps === void 0 || (_slotProps$title = slotProps.title) === null || _slotProps$title === void 0 ? void 0 : _slotProps$title.className),
        id: id
      }));
    };
  }, [slots === null || slots === void 0 ? void 0 : slots.Title, slotProps === null || slotProps === void 0 ? void 0 : slotProps.title]);
  var Content = useMemo(function () {
    if (slots !== null && slots !== void 0 && slots.Content) return slots.Content;
    return function (_ref3) {
      var _contentSlotProps$sty;
      var className = _ref3.className,
        id = _ref3.id,
        style = _ref3.style,
        props = _objectWithoutProperties(_ref3, _excluded2);
      var contentSlotProps = slotProps === null || slotProps === void 0 ? void 0 : slotProps.content;
      return /*#__PURE__*/jsx(HeadlessContent, _objectSpread2(_objectSpread2(_objectSpread2({}, props), contentSlotProps), {}, {
        className: classNames(className, contentSlotProps === null || contentSlotProps === void 0 ? void 0 : contentSlotProps.className),
        style: _objectSpread2(_objectSpread2({}, style), (_contentSlotProps$sty = contentSlotProps === null || contentSlotProps === void 0 ? void 0 : contentSlotProps.style) !== null && _contentSlotProps$sty !== void 0 ? _contentSlotProps$sty : {}),
        id: id
      }));
    };
  }, [slots === null || slots === void 0 ? void 0 : slots.Content, slotProps === null || slotProps === void 0 ? void 0 : slotProps.content]);
  var ActionsContainer = useMemo(function () {
    if (slots !== null && slots !== void 0 && slots.ActionsContainer) return slots.ActionsContainer;
    return function (_ref4) {
      var className = _ref4.className,
        props = _objectWithoutProperties(_ref4, _excluded3);
      var actionsContainerSlotProps = slotProps === null || slotProps === void 0 ? void 0 : slotProps.actionsContainer;
      return /*#__PURE__*/jsx(HeadlessActionsContainer, _objectSpread2(_objectSpread2(_objectSpread2({}, props), actionsContainerSlotProps), {}, {
        className: classNames(className, actionsContainerSlotProps === null || actionsContainerSlotProps === void 0 ? void 0 : actionsContainerSlotProps.className)
      }));
    };
  }, [slots === null || slots === void 0 ? void 0 : slots.ActionsContainer, slotProps === null || slotProps === void 0 ? void 0 : slotProps.actionsContainer]);
  var StatusBar = slots === null || slots === void 0 ? void 0 : slots.StatusBar;
  var Footer = slots === null || slots === void 0 ? void 0 : slots.Footer;
  var Actions = (_slots$Actions = slots === null || slots === void 0 ? void 0 : slots.Actions) !== null && _slots$Actions !== void 0 ? _slots$Actions : HeadlessActions;

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
    var _slotProps$statusBar, _slotProps$statusBar2, _slotProps$footer, _slotProps$footer2, _slotProps$base, _slotProps$base2, _slotProps$base3, _config$actionsStyle, _config$actionsStyle2, _style, _slotProps$actionsCon;
    var statusBarResolved = statusBarRaw != null && statusBarRaw !== false ? resolveDialogPartContent(statusBarRaw) : null;
    var statusBar = statusBarRaw != null && statusBarRaw !== false ? StatusBar ? /*#__PURE__*/jsx(StatusBar, _objectSpread2({
      content: statusBarResolved,
      dialogKey: dialogKey,
      dialogType: type,
      className: classNames(dialogistClasses.statusBar, slotProps === null || slotProps === void 0 || (_slotProps$statusBar = slotProps.statusBar) === null || _slotProps$statusBar === void 0 ? void 0 : _slotProps$statusBar.className)
    }, slotProps === null || slotProps === void 0 ? void 0 : slotProps.statusBar)) : /*#__PURE__*/jsx(HeadlessStatusBar, _objectSpread2({
      content: statusBarResolved,
      dialogKey: dialogKey,
      dialogType: type,
      className: classNames(dialogistClasses.statusBar, typeof statusBarRaw === "string" ? dialogistClasses.topCorners : undefined, slotProps === null || slotProps === void 0 || (_slotProps$statusBar2 = slotProps.statusBar) === null || _slotProps$statusBar2 === void 0 ? void 0 : _slotProps$statusBar2.className)
    }, slotProps === null || slotProps === void 0 ? void 0 : slotProps.statusBar)) : null;
    var footerResolved = footerRaw != null && footerRaw !== false ? resolveDialogPartContent(footerRaw) : null;
    var footer = footerRaw != null && footerRaw !== false ? Footer ? /*#__PURE__*/jsx(Footer, _objectSpread2({
      content: footerResolved,
      dialogKey: dialogKey,
      className: classNames(dialogistClasses.footer, slotProps === null || slotProps === void 0 || (_slotProps$footer = slotProps.footer) === null || _slotProps$footer === void 0 ? void 0 : _slotProps$footer.className)
    }, slotProps === null || slotProps === void 0 ? void 0 : slotProps.footer)) : /*#__PURE__*/jsx(HeadlessFooter, _objectSpread2({
      content: footerResolved,
      dialogKey: dialogKey,
      className: classNames(dialogistClasses.footer, typeof footerRaw === "string" ? dialogistClasses.bottomCorners : undefined, slotProps === null || slotProps === void 0 || (_slotProps$footer2 = slotProps.footer) === null || _slotProps$footer2 === void 0 ? void 0 : _slotProps$footer2.className)
    }, slotProps === null || slotProps === void 0 ? void 0 : slotProps.footer)) : null;

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
    var paperStyle = _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({
      borderRadius: "var(--dialogist-border-radius)"
    }, config.width !== undefined && {
      width: typeof config.width === "number" ? "".concat(config.width, "px") : config.width
    }), config.minWidth !== undefined && {
      minWidth: typeof config.minWidth === "number" ? "".concat(config.minWidth, "px") : config.minWidth
    }), config.maxWidth !== undefined && {
      maxWidth: typeof config.maxWidth === "number" ? "".concat(config.maxWidth, "px") : config.maxWidth
    }), config.borderRadius !== undefined && _defineProperty({}, "--dialogist-border-radius", typeof config.borderRadius === "number" ? "".concat(config.borderRadius, "px") : config.borderRadius));
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
          style: paperStyle
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
          style: _objectSpread2(_objectSpread2(_objectSpread2({}, ((_config$actionsStyle = config.actionsStyle) === null || _config$actionsStyle === void 0 ? void 0 : _config$actionsStyle.align) && {
            "--dialogist-actionsContainer-justify": ACTIONS_ALIGN_TO_CSS[config.actionsStyle.align]
          }), ((_config$actionsStyle2 = config.actionsStyle) === null || _config$actionsStyle2 === void 0 ? void 0 : _config$actionsStyle2.gap) !== undefined && (slots === null || slots === void 0 ? void 0 : slots.Actions) && {
            gap: adapter.resolveSpacing(config.actionsStyle.gap, 1)
          }), (_style = slotProps === null || slotProps === void 0 || (_slotProps$actionsCon = slotProps.actionsContainer) === null || _slotProps$actionsCon === void 0 ? void 0 : _slotProps$actionsCon.style) !== null && _style !== void 0 ? _style : {})
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
  }, [type, title, content, props, config, onClose, handleDialogSurfaceClose, dialog, overflow, statusBarRaw, footerRaw, config.width, config.minWidth, config.maxWidth, config.borderRadius, dialogKey, slots, slotProps, Base, Title, Content, ActionsContainer, StatusBar, Footer, Actions, suppressBackdrop, adapter]);
  return dialogContent;
});
StableDialogRenderer.displayName = "StableDialogRenderer";

// Stable scaffolding component that uses portals
var DialogScaffolding = /*#__PURE__*/memo(function (_ref6) {
  var dialogs = _ref6.dialogs,
    onClose = _ref6.onClose,
    DialogComponent = _ref6.DialogComponent,
    overflow = _ref6.overflow,
    slots = _ref6.slots,
    slotProps = _ref6.slotProps;
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
