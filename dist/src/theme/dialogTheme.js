import { defineProperty as _defineProperty } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { dialogistClasses } from '../classes.js';

var _$concat;

/**
 * Framework-agnostic, static base styles with sensible defaults.
 * This does not reference any component library theme; consumers (or adapters) layer
 * their own theme or override variables via CSS.
 *
 * The shape is JSS-like and is consumed in two ways:
 *  - At runtime by {@link DialogProvider} (or an MUI `GlobalStyles`) for inline injection.
 *  - At build time by `scripts/build-styles.mjs` which serializes it to a CSS file
 *    consumers can `import "dialogist/styles.css"`.
 */
var dialogistStyles = _defineProperty(_defineProperty(_defineProperty({
  "@keyframes dialogistFlowBackAppear": {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  },
  "@keyframes dialogistBackdropFadeIn": {
    from: {
      opacity: 0
    }
  },
  // Set backdrop-duration at :root so it cascades to backdrop elements that live
  // outside .Dialogist-base (non-MUI adapters use portals that escape the base element).
  ":root": {
    "--dialogist-backdrop-duration": "225ms"
  }
}, ".".concat(dialogistClasses.base), (_$concat = {
  overflow: "hidden",
  "--dialogist-border-radius": "12px",
  borderRadius: "var(--dialogist-border-radius)",
  "--dialogist-spacing": "32px",
  padding: "var(--dialogist-spacing)",
  "--dialogist-max-width-xs": "min(96vw, 320px)",
  "--dialogist-max-width-sm": "min(90vw, 448px)",
  "--dialogist-max-width-md": "540px",
  "--dialogist-max-width-lg": "540px",
  "--dialogist-max-width-xl": "540px",
  // Default color tokens (MUI defaults as static fallbacks)
  "--dialogist-primary-main": "#1976d2",
  "--dialogist-primary-contrastText": "#ffffff",
  "--dialogist-primary-dark": "color-mix(in oklch, var(--dialogist-primary-main) 50%, black)",
  "--dialogist-secondary-main": "#9c27b0",
  "--dialogist-secondary-contrastText": "#ffffff",
  "--dialogist-text-primary": "rgba(0, 0, 0, 0.87)",
  "--dialogist-text-secondary": "rgba(0, 0, 0, 0.6)",
  "--dialogist-bg-paper": "#ffffff",
  "--dialogist-bg-secondary": "#f5f5f5",
  "--dialogist-bg-statusBar": "var(--dialogist-primary-main)",
  "--dialogist-bg-footer": "#f5f5f5",
  // Typography defaults
  "--dialogist-font-family": 'var(--font-sans, "Roboto","Helvetica","Arial",sans-serif)',
  // Status bar
  "--dialogist-statusBar-font-weight": 600,
  "--dialogist-statusBar-text": "var(--dialogist-text-primary)",
  "--dialogist-statusBar-font-size": "0.75rem",
  "--dialogist-statusBar-align": "left",
  "--dialogist-statusBar-height": "32px",
  // Title
  "--dialogist-title-font-weight": 600,
  "--dialogist-title-text": "var(--dialogist-text-primary)",
  "--dialogist-title-font-size": "1.25rem",
  "--dialogist-title-align": "center",
  // Content
  "--dialogist-content-font-weight": 400,
  "--dialogist-content-font-size": "0.875rem",
  "--dialogist-content-text": "var(--dialogist-text-secondary)",
  "--dialogist-content-align": "left",
  "--dialogist-content-text-align": "var(--dialogist-content-align)",
  "--dialogist-content-display": "block",
  "--dialogist-content-flex-direction": "column",
  "--dialogist-content-align-items": "stretch",
  "--dialogist-content-justify": "flex-start",
  "--dialogist-content-min-width": "auto",
  "--dialogist-content-max-width": "none",
  "--dialogist-content-min-height": "auto",
  "--dialogist-content-max-height": "none",
  // Actions
  "--dialogist-actionsContainer-justify": "center",
  /** Between-group gap on `.Dialogist-actionsRow` (set per dialog via inline style). */
  "--dialogist-actionsRow-gap": "calc(var(--dialogist-spacing) / 4)",
  "--dialogist-actionsRow-justify": "center",
  /** Intra-cluster gap on `.Dialogist-actionsGroup` (set per dialog via inline style). */
  "--dialogist-actionsGroup-gap": "calc(var(--dialogist-spacing) / 4)",
  "--dialogist-actionsGroup-justify": "center",
  /** Default horizontal gap between action clusters (custom actions container / default actions row). */
  "--dialogist-actions-gap": "16px",
  // Flow
  "--dialogist-flow-button-appear": "100ms ease-out",
  // Footer
  "--dialogist-footer-font-weight": 400,
  "--dialogist-footer-text": "var(--dialogist-text-secondary)",
  "--dialogist-footer-font-size": "0.75rem",
  "--dialogist-footer-align": "left",
  "--dialogist-footer-height": "32px"
}, _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_$concat, "& .".concat(dialogistClasses.rootPaper), {
  borderRadius: "var(--dialogist-border-radius)",
  "& [class*='Dialogist']": {
    fontFamily: "var(--dialogist-font-family)"
  }
}), "& .".concat(dialogistClasses.rootPaper, ":has(.").concat(dialogistClasses.footer, "), ") + "& .".concat(dialogistClasses.rootPaper, ":has(.").concat(dialogistClasses.customFooter, "), ") + "& .".concat(dialogistClasses.rootPaper, ":has(.").concat(dialogistClasses.statusBar, "), ") + "& .".concat(dialogistClasses.rootPaper, ":has(.").concat(dialogistClasses.customStatusBar, ")"), {
  backgroundColor: "transparent"
}), "& .".concat(dialogistClasses.statusBar), {
  backgroundColor: "var(--dialogist-bg-statusBar)",
  borderRadius: "var(--dialogist-border-radius) var(--dialogist-border-radius) 0 0",
  color: "var(--dialogist-statusBar-text)",
  minHeight: "var(--dialogist-statusBar-height)",
  padding: "calc(var(--dialogist-spacing) / 4) calc(var(--dialogist-spacing) / 2)",
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: "var(--dialogist-statusBar-font-size)",
  fontWeight: "var(--dialogist-statusBar-font-weight)",
  textAlign: "var(--dialogist-statusBar-align)"
}), "& .".concat(dialogistClasses.title), {
  margin: 0,
  borderRadius: "var(--dialogist-border-radius)",
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  color: "var(--dialogist-title-text)",
  backgroundColor: "var(--dialogist-bg-paper)",
  fontSize: "var(--dialogist-title-font-size)",
  fontWeight: "var(--dialogist-title-font-weight)",
  padding: "calc(var(--dialogist-spacing) * 0.75)",
  // Reduce bottom padding so title→content gap stays the same as before the content paddingTop fix.
  // Total gap = title paddingBottom (spacing/4) + content paddingTop (spacing/2) = 3/4 spacing = same as original.
  paddingBottom: "calc(var(--dialogist-spacing) / 4)",
  textAlign: "var(--dialogist-title-align)"
}), "& .".concat(dialogistClasses.content), {
  borderRadius: 0,
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  display: "var(--dialogist-content-display)",
  flexDirection: "var(--dialogist-content-flex-direction)",
  alignItems: "var(--dialogist-content-align-items)",
  justifyContent: "var(--dialogist-content-justify)",
  alignSelf: "center",
  width: "100%",
  minWidth: "var(--dialogist-content-min-width)",
  maxWidth: "var(--dialogist-content-max-width)",
  minHeight: "var(--dialogist-content-min-height)",
  maxHeight: "var(--dialogist-content-max-height)",
  color: "var(--dialogist-content-text)",
  backgroundColor: "var(--dialogist-bg-paper)",
  fontWeight: "var(--dialogist-content-font-weight)",
  fontSize: "var(--dialogist-content-font-size)",
  textAlign: "var(--dialogist-content-text-align)",
  padding: "calc(var(--dialogist-spacing) / 2) calc(var(--dialogist-spacing) * 0.75) calc(var(--dialogist-spacing) / 4)"
}), "& .".concat(dialogistClasses.content, "[data-dialogist-content-managed=\"true\"] > *"), {
  // Ensure default (non-custom) message nodes follow parent content alignment styles.
  textAlign: "inherit",
  width: "100%"
}), "& .".concat(dialogistClasses.actionsContainer), {
  borderRadius: "0 0 var(--dialogist-border-radius) var(--dialogist-border-radius)",
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  display: "flex",
  flexDirection: "row",
  justifyContent: "var(--dialogist-actionsContainer-justify)",
  gap: "calc(var(--dialogist-spacing) / 2)",
  color: "var(--dialogist-content-text)",
  backgroundColor: "var(--dialogist-bg-paper)",
  padding: "calc(var(--dialogist-spacing) * 0.75)",
  paddingBottom: "var(--dialogist-spacing)"
}), "& .".concat(dialogistClasses.actionsRow), {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  width: "100%",
  gap: "var(--dialogist-actionsRow-gap)",
  justifyContent: "var(--dialogist-actionsRow-justify)"
}), "& .".concat(dialogistClasses.actionsGroup), {
  display: "flex",
  alignItems: "center",
  gap: "var(--dialogist-actionsGroup-gap)",
  justifyContent: "var(--dialogist-actionsGroup-justify)"
}), "& .".concat(dialogistClasses.actionsGroup, "[data-dialogist-layout=\"single\"]"), {
  width: "100%"
}), _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_$concat, "& .".concat(dialogistClasses.footer), {
  borderRadius: "0 0 var(--dialogist-border-radius) var(--dialogist-border-radius)",
  color: "var(--dialogist-footer-text)",
  backgroundColor: "var(--dialogist-bg-footer)",
  fontWeight: "var(--dialogist-footer-font-weight)",
  fontSize: "var(--dialogist-footer-font-size)",
  textAlign: "var(--dialogist-footer-align)",
  padding: "calc(var(--dialogist-spacing) / 4) calc(var(--dialogist-spacing) / 2)",
  borderTop: "1px solid color-mix(in srgb, var(--dialogist-text-primary) 10%, transparent)",
  lineHeight: 1.55
}), "& .".concat(dialogistClasses.customActionsContainer), {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  gap: "var(--dialogist-actions-gap)",
  borderRadius: "0 0 var(--dialogist-border-radius) var(--dialogist-border-radius)"
}), "& .".concat(dialogistClasses.actions), {
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  gap: "var(--dialogist-actions-gap)"
}), "& .".concat(dialogistClasses.customBase), {
  borderRadius: "var(--dialogist-border-radius)"
}), "& .".concat(dialogistClasses.customTitle), {
  borderRadius: "var(--dialogist-border-radius) var(--dialogist-border-radius) 0 0"
}), "& .".concat(dialogistClasses.customContent), {
  borderRadius: 0,
  color: "var(--dialogist-content-text)",
  backgroundColor: "var(--dialogist-bg-paper)",
  fontWeight: "var(--dialogist-content-font-weight)",
  fontSize: "var(--dialogist-content-font-size)",
  textAlign: "var(--dialogist-content-align)"
}), "& .".concat(dialogistClasses.customStatusBar), {
  borderRadius: "var(--dialogist-border-radius) var(--dialogist-border-radius) 0 0",
  // Custom status bars supply their own background; make the base transparent
  "--dialogist-bg-statusBar": "transparent",
  backgroundColor: "transparent"
}), "& .".concat(dialogistClasses.customFooter), {
  borderRadius: "0 0 var(--dialogist-border-radius) var(--dialogist-border-radius)",
  // Custom footers supply their own background
  "--dialogist-bg-footer": "transparent",
  backgroundColor: "transparent"
}), "& .".concat(dialogistClasses.topCorners), {
  borderRadius: "var(--dialogist-border-radius) var(--dialogist-border-radius) 0 0"
}), "& .".concat(dialogistClasses.bottomCorners), {
  borderRadius: "0 0 var(--dialogist-border-radius) var(--dialogist-border-radius)"
}), _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_$concat, "& .".concat(dialogistClasses.allCorners), {
  borderRadius: "var(--dialogist-border-radius)"
}), "& .".concat(dialogistClasses.flowBackAppear), {
  animation: "dialogistFlowBackAppear var(--dialogist-flow-button-appear, 100ms ease-out)"
}), "--dialogist-backdrop-color", "rgba(0, 0, 0, 0.5)"), "--dialogist-backdrop-duration", "var(--dialogist-backdrop-duration, 225ms)"), "& .MuiBackdrop-root, & .".concat(dialogistClasses.backdrop, ", & .").concat(dialogistClasses.customBackdrop), {
  backgroundColor: "var(--dialogist-backdrop-color)",
  backdropFilter: "none"
}), "& .MuiBackdrop-root.".concat(dialogistClasses.backdrop), {
  animation: "none",
  transitionDuration: "var(--dialogist-backdrop-duration, 225ms) !important"
}), ":has(.".concat(dialogistClasses.statusBar, ") .").concat(dialogistClasses.title), {
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0
}), ":has(.".concat(dialogistClasses.customStatusBar, ") .").concat(dialogistClasses.title), {
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0
}), ":has(.".concat(dialogistClasses.footer, ") .").concat(dialogistClasses.actionsContainer), {
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0
}), ":has(.".concat(dialogistClasses.customFooter, ") .").concat(dialogistClasses.actionsContainer), {
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0
}))), ".".concat(dialogistClasses.backdrop, ":not(.MuiBackdrop-root)"), {
  animation: "dialogistBackdropFadeIn var(--dialogist-backdrop-duration, 225ms) ease-out both",
  transition: "opacity var(--dialogist-backdrop-duration, 225ms) ease-in-out"
}), ".".concat(dialogistClasses.backdrop, "[data-closed]"), {
  opacity: 0
});

/** Helper used by adapters to pluck nested style blocks from {@link dialogistStyles}. */

/** Pluck a `& .className` nested block from {@link dialogistStyles}. Used by adapters. */
var pickFromDialogistStyles = function pickFromDialogistStyles(className) {
  var baseBlock = dialogistStyles[".".concat(dialogistClasses.base)];
  var nested = baseBlock["& .".concat(className)];
  return nested !== null && nested !== void 0 ? nested : {};
};

export { dialogistStyles, pickFromDialogistStyles };
//# sourceMappingURL=dialogTheme.js.map
