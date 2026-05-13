"use client";
import { objectSpread2 as _objectSpread2, defineProperty as _defineProperty } from '../../../_virtual/_rollupPluginBabelHelpers.js';
import { GlobalStyles } from '@mui/material';
import { deepmerge } from '../../../node_modules/deepmerge-ts/dist/node/index.js';
import { dialogistClasses } from '../../classes.js';
import { pickFromDialogistStyles, dialogistStyles } from '../../theme/dialogTheme.js';
import { jsx } from 'react/jsx-runtime';

var baseDialogistMuiComponents = {
  MuiDialog: {
    styleOverrides: {
      root: function root(_ref) {
        var _;
        var theme = _ref.theme;
        return _defineProperty(_defineProperty({}, "&.".concat(dialogistClasses.base), {
          "--dialogist-primary-main": theme.palette.primary.main,
          "--dialogist-primary-contrastText": theme.palette.primary.contrastText,
          "--dialogist-secondary-main": theme.palette.secondary.main,
          "--dialogist-secondary-contrastText": theme.palette.secondary.contrastText,
          "--dialogist-text-primary": theme.palette.text.primary,
          "--dialogist-text-secondary": theme.palette.text.secondary,
          "--dialogist-bg-paper": theme.palette.background.paper,
          "--dialogist-bg-secondary": (_ = theme.palette.grey[100]) !== null && _ !== void 0 ? _ : "#f5f5f5",
          "--dialogist-title-text": theme.palette.text.primary,
          "--dialogist-content-text": theme.palette.text.secondary,
          "--dialogist-footer-text": theme.palette.text.secondary,
          "--dialogist-font-family": "var(--font-sans, ".concat(theme.typography.fontFamily, ")"),
          "--dialogist-spacing": typeof theme.spacing === "function" ? theme.spacing(4) : "32px",
          "--dialogist-title-font-size": theme.typography.h6.fontSize,
          "--dialogist-statusBar-font-size": theme.typography.caption.fontSize,
          "--dialogist-content-font-size": theme.typography.body2.fontSize,
          "--dialogist-backdrop-color": theme.palette.mode === "dark" ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)"
        }), '& [data-preserve-backdrop="true"] .MuiBackdrop-root', {
          opacity: 1,
          transition: "none"
        });
      },
      paper: pickFromDialogistStyles(dialogistClasses.rootPaper)
    }
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: _objectSpread2({}, pickFromDialogistStyles(dialogistClasses.title))
    }
  },
  MuiDialogContent: {
    styleOverrides: {
      root: _objectSpread2({}, pickFromDialogistStyles(dialogistClasses.content))
    }
  },
  MuiDialogActions: {
    styleOverrides: {
      root: _objectSpread2(_objectSpread2({}, pickFromDialogistStyles(dialogistClasses.actionsContainer)), {}, {
        "&.MuiDialogActions-spacing > :not(:first-of-type)": {
          marginLeft: 0
        }
      })
    }
  },
  MuiBackdrop: {
    styleOverrides: {
      root: pickFromDialogistStyles(dialogistClasses.backdrop)
    }
  }
};

/**
 * Layer Dialogist-friendly MUI overrides into a host MUI theme. Consumer values win over
 * Dialogist defaults via `deepmerge`. Pass the result to MUI's `<ThemeProvider theme={...}>`.
 */
var dialogistExtendMuiTheme = function dialogistExtendMuiTheme(theme) {
  return deepmerge(theme, {
    components: baseDialogistMuiComponents
  });
};

/**
 * Render `dialogistStyles` via MUI's `GlobalStyles` instead of the framework-agnostic
 * `<style>` injector. Use when consumers want emotion's deduping / SSR pipeline rather
 * than the built-in injector. Pair with `<DialogProvider cssMode="none" />`.
 */
var DialogistMuiGlobalStyles = function DialogistMuiGlobalStyles() {
  return /*#__PURE__*/jsx(GlobalStyles, {
    styles: dialogistStyles
  });
};
DialogistMuiGlobalStyles.displayName = "DialogistMuiGlobalStyles";

export { DialogistMuiGlobalStyles, dialogistExtendMuiTheme };
//# sourceMappingURL=theme.js.map
