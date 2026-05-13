"use client";

import { GlobalStyles } from "@mui/material";
import type { ThemeOptions } from "@mui/material/styles";
import { deepmerge } from "deepmerge-ts";

import { dialogistClasses } from "../../classes";
import { dialogistStyles, pickFromDialogistStyles } from "../../theme/dialogTheme";

/**
 * MUI theme `components` block that maps Dialogist CSS variables onto MUI Dialog
 * primitives. Layered over the consuming theme via {@link dialogistExtendMuiTheme}.
 */
const baseDialogistMuiComponents: ThemeOptions["components"] = {
  MuiDialog: {
    styleOverrides: {
      root: ({ theme }: { theme: import("@mui/material/styles").Theme }) => ({
        [`&.${dialogistClasses.base}`]: {
          "--dialogist-primary-main": theme.palette.primary.main,
          "--dialogist-primary-contrastText": theme.palette.primary.contrastText,
          "--dialogist-secondary-main": theme.palette.secondary.main,
          "--dialogist-secondary-contrastText": theme.palette.secondary.contrastText,
          "--dialogist-text-primary": theme.palette.text.primary,
          "--dialogist-text-secondary": theme.palette.text.secondary,
          "--dialogist-bg-paper": theme.palette.background.paper,
          "--dialogist-bg-secondary": (theme.palette.grey as unknown as Record<number, string>)[100] ?? "#f5f5f5",
          "--dialogist-title-text": theme.palette.text.primary,
          "--dialogist-content-text": theme.palette.text.secondary,
          "--dialogist-footer-text": theme.palette.text.secondary,
          "--dialogist-font-family": `var(--font-sans, ${theme.typography.fontFamily})`,
          "--dialogist-spacing": typeof theme.spacing === "function" ? theme.spacing(4) : "32px",
          "--dialogist-title-font-size": theme.typography.h6.fontSize,
          "--dialogist-statusBar-font-size": theme.typography.caption.fontSize,
          "--dialogist-content-font-size": theme.typography.body2.fontSize,
          "--dialogist-backdrop-color":
            (theme as { palette: { mode?: string } }).palette.mode === "dark"
              ? "rgba(0, 0, 0, 0.7)"
              : "rgba(0, 0, 0, 0.5)",
        },
        // Keep backdrop visible if provider sets data attribute on the portal container
        '& [data-preserve-backdrop="true"] .MuiBackdrop-root': {
          opacity: 1,
          transition: "none",
        },
      }),
      paper: pickFromDialogistStyles(dialogistClasses.rootPaper),
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        ...pickFromDialogistStyles(dialogistClasses.title),
      },
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: {
        ...pickFromDialogistStyles(dialogistClasses.content),
      },
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: {
        ...pickFromDialogistStyles(dialogistClasses.actionsContainer),
        "&.MuiDialogActions-spacing > :not(:first-of-type)": {
          marginLeft: 0,
        },
      },
    },
  },
  MuiBackdrop: {
    styleOverrides: {
      root: pickFromDialogistStyles(dialogistClasses.backdrop),
    },
  },
} as const;

/**
 * Layer Dialogist-friendly MUI overrides into a host MUI theme. Consumer values win over
 * Dialogist defaults via `deepmerge`. Pass the result to MUI's `<ThemeProvider theme={...}>`.
 */
export const dialogistExtendMuiTheme = <T extends object = object>(theme: T): T =>
  deepmerge(theme, {
    components: baseDialogistMuiComponents,
  }) as T;

/**
 * Render `dialogistStyles` via MUI's `GlobalStyles` instead of the framework-agnostic
 * `<style>` injector. Use when consumers want emotion's deduping / SSR pipeline rather
 * than the built-in injector. Pair with `<DialogProvider cssMode="none" />`.
 */
export const DialogistMuiGlobalStyles = () => <GlobalStyles styles={dialogistStyles} />;
DialogistMuiGlobalStyles.displayName = "DialogistMuiGlobalStyles";
