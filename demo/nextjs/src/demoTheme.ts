import {
  alpha,
  createTheme,
  type PaletteColor,
  responsiveFontSizes,
  type Theme,
  type ThemeOptions,
} from "@mui/material/styles";
import { blend, darken, getLuminance, lighten } from "@mui/system/colorManipulator";
import { dialogistExtendMuiTheme } from "dialogist/mui";

import { extendThemeWithReactIcons } from "./components/icons/_MuiIconWrapper";
import {
  DEMO_BASE_DEMO_CARD_CLASS,
  DEMO_ICON_FILL_ACCENT_PATH_FIRST_CLASS,
  DEMO_ICON_FILL_ACCENT_PATH_LAST_CLASS,
  DEMO_ICON_FILL_ACCENT_RECT_FIRST_CLASS,
  DEMO_ICON_FILL_ACCENT_RECT_LAST_CLASS,
  DEMO_ICON_FILL_CLASS,
  DEMO_ICON_FILL_ROOT_STROKE_ZERO_CLASS,
  DEMO_ICON_OUTLINE_CLASS,
  DEMO_PI_DUOTONE_ICON_CLASS,
} from "./constants/demoCardIconClasses";
import { desaturate, saturate } from "./utils/color";
import { halfSoftShadows } from "./utils/shadows";

/** Hairline stroke for Phosphor duotone paths and raw icons on `BaseDemoCard` buttons (keep in sync). */
const DEMO_CARD_DUOTONE_PATH_STROKE_WIDTH = 4;

/** Raw `startIcon` / `IconButton` SVGs on demo cards: skip when a wrapped fill icon already encodes stroke (accents / root 0). */
const demoCardButtonHairlineExclude = `:not(:has(.${DEMO_ICON_FILL_ACCENT_PATH_FIRST_CLASS})):not(:has(.${DEMO_ICON_FILL_ACCENT_PATH_LAST_CLASS})):not(:has(.${DEMO_ICON_FILL_ACCENT_RECT_FIRST_CLASS})):not(:has(.${DEMO_ICON_FILL_ACCENT_RECT_LAST_CLASS})):not(:has(.${DEMO_ICON_FILL_ROOT_STROKE_ZERO_CLASS}))`;

// Module augmentation to add a custom 'pink' color to the palette
declare module "@mui/material/styles" {
  interface Palette {
    pink: Palette["primary"];
    callout: Palette["primary"];
  }
  interface PaletteOptions {
    pink?: PaletteOptions["primary"];
    callout?: PaletteOptions["primary"];
  }
  interface TypeBackground {
    secondary: string;
  }

  interface PaletteColor {
    darker?: string;
  }
  /** Extends palette option objects; `PaletteColorOptions` is a type alias and cannot be augmented. */
  interface SimplePaletteColorOptions {
    darker?: string;
  }
}

// Allow `color="pink"` on common components
declare module "@mui/material/Button" {
  interface ButtonPropsSizeOverrides {
    tiny: true;
  }
  interface ButtonPropsColorOverrides {
    pink: true;
    callout: true;
  }
}
declare module "@mui/material/Chip" {
  interface ChipPropsColorOverrides {
    pink: true;
    callout: true;
  }
}

const lightPrimaryColor = "#ABDCD8";
const lightPrimaryDarkColor = darken(lightPrimaryColor, 0.1);
const lightPrimaryDarkerColor = saturate(darken(lightPrimaryColor, 0.25), 0.05);
const lightPrimaryContrastTextColor = blend(lightPrimaryColor, "#000000", 0.7);
const lightSecondaryColor = "#FFFFFF";
const lightSecondaryContrastTextColor = "#27222C";

const lightH1Color = "#1d1d20";
const lightTextSecondaryColor = "#737375";
const lightTextPrimaryColor = "#2A2A2E";
const lightBody2Color = "#5b5b63";
const lightCaptionColor = "#6b7280";

const lightBorderColor = "#DADBDC";
const lightPaperColor = "#FFFFFF";
const lightPageBackgroundColor = "#FCFCFC";
const lightPageSecondaryBackgroundColor = "#27222C";

const lightSuccessColor = "#52b8a0";
const lightSuccessContrastTextColor =
  getLuminance(lightSuccessColor) > 0.5
    ? blend(lightSuccessColor, "#0d1f1a", 0.88)
    : blend(lightSuccessColor, "#ffffff", 0.7);
const lightErrorColor = "#CD4F6C";
const lightErrorContrastTextColor = blend(lightErrorColor, "#ffffff", 0.7);
const lightWarningColor = "#FACD16";
const lightWarningContrastTextColor = blend(lightWarningColor, "#000000", 0.7);
/** Gold anchor for important-style callouts (`Admonition` important). Keeps outlined warning chips readable on white. */
const importantCalloutMixSource = "#e5b801";
const lightInfoColor = "#257191";
const lightInfoContrastTextColor = blend(lightInfoColor, "#ffffff", 0.8);
const lightPinkColor = "#ff6fae";
const lightPinkContrastTextColor = blend(lightPinkColor, "#ffffff", 0.7);
const lightCalloutColor = "#F3F3F2";
const lightCalloutContrastTextColor = "#27222C";
const lightDisabledBackgroundColor = "#B6B2AF";

const palette: ThemeOptions["palette"] = {
  mode: "light",
  primary: {
    main: lightPrimaryColor,
    light: lighten(lightPrimaryColor, 0.05),
    dark: lightPrimaryDarkColor,
    darker: lightPrimaryDarkerColor,
    contrastText: lightPrimaryContrastTextColor,
  },
  secondary: {
    main: lightSecondaryColor,
    light: lighten(lightSecondaryColor, 0.05),
    dark: darken(lightSecondaryColor, 0.05),
    darker: darken(lightSecondaryColor, 0.15),
    contrastText: lightSecondaryContrastTextColor,
  },
  pink: {
    main: lightPinkColor,
    light: lighten(lightPinkColor, 0.05),
    dark: darken(lightPinkColor, 0.05),
    contrastText: lightPinkContrastTextColor,
  },
  success: {
    main: lightSuccessColor,
    light: lighten(lightSuccessColor, 0.05),
    dark: darken(lightSuccessColor, 0.05),
    contrastText: lightSuccessContrastTextColor,
  },
  error: {
    main: lightErrorColor,
    light: lighten(lightErrorColor, 0.05),
    dark: darken(lightErrorColor, 0.05),
    contrastText: lightErrorContrastTextColor,
  },
  warning: {
    main: lightWarningColor,
    light: lighten(lightWarningColor, 0.05),
    dark: darken(lightWarningColor, 0.05),
    contrastText: lightWarningContrastTextColor,
  },
  info: {
    main: lightInfoColor,
    light: lighten(lightInfoColor, 0.05),
    dark: darken(lightInfoColor, 0.05),
    contrastText: lightInfoContrastTextColor,
  },
  callout: {
    main: lightCalloutColor,
    light: lighten(lightCalloutColor, 0.05),
    dark: darken(lightCalloutColor, 0.05),
    contrastText: lightCalloutContrastTextColor,
  },
  background: {
    default: lightPageBackgroundColor,
    paper: lightPaperColor,
    secondary: lightPageSecondaryBackgroundColor,
  },
  divider: lightBorderColor,
  text: {
    primary: lightTextPrimaryColor,
    secondary: lightTextSecondaryColor,
  },
};

const makeContainedButtonStyle = (color: string, contrastTextColor: string) => ({
  color: contrastTextColor,
  backgroundColor: color,
  boxShadow: halfSoftShadows[2],
  "&:hover": { backgroundColor: blend(color, "#ffffff", 0.05), boxShadow: halfSoftShadows[3] },
  "&:active": { backgroundColor: blend(color, "#000000", 0.05), boxShadow: halfSoftShadows[1] },
});

const chipOutlinedWarningImportantStyle = ({ theme }: { theme: Theme }) => {
  const p = theme.palette.warning;
  const mode = theme.palette.mode;
  const bgAlpha = mode === "light" ? 0.09 : 0.16;
  const borderAlpha = mode === "light" ? 0.32 : 0.45;
  const bg = alpha(p.main, bgAlpha * 0.8);
  const border = alpha(importantCalloutMixSource, borderAlpha * 1.5);
  const labelText = `color-mix(in srgb, ${importantCalloutMixSource}, #591823 45%)`;
  return {
    backgroundColor: bg,
    border: `1px solid ${border}`,
    color: labelText,
    "& .MuiChip-icon": {
      color: importantCalloutMixSource,
    },
    "&.MuiChip-clickable:hover": {
      backgroundColor: alpha(p.main, bgAlpha * 0.8 + 0.05),
    },
    "&.MuiChip-clickable.Mui-focusVisible": {
      backgroundColor: alpha(p.main, bgAlpha * 0.8 + 0.08),
    },
    "& .MuiChip-deleteIcon": {
      color: alpha(importantCalloutMixSource, 0.72),
      "&:hover, &:active": {
        color: labelText,
      },
    },
  };
};

const makeOutlinedButtonStyle = (colorKey: keyof typeof palette) => {
  const paletteColor = palette[colorKey] as PaletteColor | undefined;
  const colorValue = paletteColor?.main ?? String(colorKey);
  let textColor = colorValue;

  // loop darken( 0.05) around the textColor until its luminance is less than 0.5
  let i = 0;
  while (getLuminance(textColor as string) > 0.3) {
    if (i > 10) break;
    textColor = darken(desaturate(textColor as string, 0.1), 0.05);
    i++;
  }

  const borderColor = `color-mix(in oklch, ${textColor}, rgba(0,0,0,0.1) 85%)`;

  return {
    backgroundColor: `color-mix(in srgb, ${colorValue} 3%, transparent)`,
    border: `1px solid ${borderColor ?? textColor}`,
    boxShadow: halfSoftShadows[2],
    color: textColor,
    "&:hover": {
      backgroundColor: `color-mix(in srgb, ${colorValue} 5%, transparent)`,
      borderColor: borderColor ?? colorValue,
      boxShadow: halfSoftShadows[3],
      color: darken(textColor as string, 0.07),
    },
    "&:active": {
      backgroundColor: `color-mix(in srgb, ${colorValue} 6%, transparent)`,
      borderColor: borderColor ?? colorValue,
      boxShadow: halfSoftShadows[1],
      color: darken(textColor as string, 0.1),
    },
  };
};

const baseTheme: ThemeOptions = {
  palette,
  shape: {
    borderRadius: 5,
  },
  spacing: 8,
  typography: {
    fontFamily:
      'var(--font-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    h1: { fontSize: "3rem", fontWeight: 750, letterSpacing: "-0.02em", lineHeight: 1.8, color: lightH1Color },
    h2: { fontSize: "2rem", fontWeight: 300, letterSpacing: "-0.01em", lineHeight: 1.5, color: lightTextPrimaryColor },
    h4: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.35, color: lightTextPrimaryColor },
    h5: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.35, color: lightTextPrimaryColor },
    h6: { fontSize: "1rem", fontWeight: 650, lineHeight: 1.35, color: lightTextPrimaryColor },
    body1: { fontSize: "0.9rem", fontWeight: 400, lineHeight: 1.55, color: lightTextPrimaryColor },
    body2: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.5, color: lightBody2Color },
    caption: { fontSize: "0.75rem", lineHeight: 1.4, color: lightCaptionColor },
    button: { textTransform: "none", fontWeight: 550 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "h1 [data-inline-code], h2 [data-inline-code], h3 [data-inline-code], h4 [data-inline-code], h5 [data-inline-code], h6 [data-inline-code]":
          { color: "inherit", fontWeight: "inherit" },
        /** Skip SVGs under `.demo-admonition-icon` (see `Admonition.tsx`). */
        'svg:not(.demo-admonition-icon *) path[fill]:not([fill="none" i])': {
          opacity: 0.5,
        },
        /** Phosphor duotone: hairline on paths without `stroke` (presentation attrs on `<svg>`). */
        [`.${DEMO_PI_DUOTONE_ICON_CLASS} svg path:not([stroke])`]: {
          strokeWidth: DEMO_CARD_DUOTONE_PATH_STROKE_WIDTH,
        },
        /**
         * Raw react-icons in `startIcon` / `IconButton` on `BaseDemoCard` (no `withPiDuotoneIcon` wrapper).
         * Match the title stroke; skip subtrees that already use fill accent / `rootStrokeZero` wrappers.
         */
        [`.${DEMO_BASE_DEMO_CARD_CLASS} :is(.MuiButton-root, .MuiIconButton-root)${demoCardButtonHairlineExclude} svg path:not([stroke])`]:
          {
            strokeWidth: DEMO_CARD_DUOTONE_PATH_STROKE_WIDTH,
          },
        /**
         * Generic fill: same hairline only when not using a duotone accent or `root-stroke-zero`
         * (those wrappers need stroke width 0 on paths; `:not([stroke])` on the hairline rule
         * previously out-ranked any two-class override).
         */
        [`.${DEMO_ICON_FILL_CLASS}.${DEMO_ICON_FILL_ACCENT_PATH_FIRST_CLASS} svg path:first-of-type`]: {
          fill: "color-mix(in srgb, currentColor 20%, transparent)",
        },
        [`.${DEMO_ICON_FILL_CLASS}.${DEMO_ICON_FILL_ACCENT_PATH_LAST_CLASS} svg path:last-of-type`]: {
          fill: "color-mix(in srgb, currentColor 20%, transparent)",
        },
        [`.${DEMO_ICON_FILL_CLASS}.${DEMO_ICON_FILL_ACCENT_RECT_LAST_CLASS}`]: {
          "& svg": { strokeWidth: 2 },
          "& rect:last-of-type": {
            fill: "color-mix(in srgb, currentColor 20%, transparent)",
          },
        },
        [`.${DEMO_ICON_FILL_CLASS}.${DEMO_ICON_FILL_ACCENT_RECT_FIRST_CLASS} svg rect:first-of-type`]: {
          fill: "color-mix(in srgb, currentColor 20%, transparent)",
        },
        [`.${DEMO_ICON_FILL_CLASS}.${DEMO_ICON_FILL_ROOT_STROKE_ZERO_CLASS} svg`]: {
          strokeWidth: "0 !important",
        },
        [`.${DEMO_ICON_OUTLINE_CLASS}`]: {
          lineHeight: 0,
          display: "inline-flex",
          alignItems: "center",
          "& svg": { strokeWidth: 2 },
        },
        body: {
          backgroundColor: "#ffffff",
          color: lightTextPrimaryColor,
          "--app-bar-height": 56,
          /** Checked radios, selected labels, windowed prompt arrow, code token remap */
          "--demo-form-control-accent": lightPrimaryDarkerColor,
          scrollbarColor: `color-mix(in srgb, ${lightSecondaryContrastTextColor} 55%, transparent) transparent`,
          scrollbarWidth: "thin",
          "&::-webkit-scrollbar-thumb": {
            transition: "background-color 0.2s ease",
            scrollbarWidth: "thin",
          },
          "&::-webkit-scrollbar": {
            background: "transparent",
            scrollbarWidth: "thin",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
            scrollbarWidth: "thin",
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { size: "small" },
      variants: [
        {
          props: { size: "tiny" },
          style: { fontSize: "0.725rem", padding: "0 6px", minWidth: "48px", height: "24px", borderRadius: 4 },
        },
        {
          props: { size: "small" },
          style: { fontSize: "0.85rem", padding: "0 12px", minWidth: "60px", height: "32px", borderRadius: 5 },
        },
        {
          props: { size: "medium" },
          style: { fontSize: "0.9rem", padding: "0 14px", minWidth: "60px", height: "36px", borderRadius: 7 },
        },
        {
          props: { size: "large" },
          style: { fontSize: "0.925rem", padding: "0 16px", minWidth: "72px", height: "40px", borderRadius: 9 },
        },
      ],
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 450,
          boxShadow: "none",
          lineHeight: 1,
          letterSpacing: 0,
          whiteSpace: "nowrap",
          transition: "background-color .15s ease, border-color .15s ease, color .15s ease",
          "&:focus-visible": { outline: "2px solid rgba(107,111,227,0.35)", outlineOffset: 2 },
        },
        contained: {
          border: "none",
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
          "&:active": { boxShadow: "none" },
        },
        containedPrimary: {
          ...makeContainedButtonStyle(lightPrimaryColor, lightPrimaryContrastTextColor),
          "&:focus-visible": { boxShadow: "none" },
        },
        containedSecondary: makeContainedButtonStyle(lightSecondaryColor, lightSecondaryContrastTextColor),
        containedSuccess: makeContainedButtonStyle(lightSuccessColor, lightSuccessContrastTextColor),
        containedError: makeContainedButtonStyle(lightErrorColor, lightErrorContrastTextColor),
        containedWarning: makeContainedButtonStyle(lightWarningColor, lightWarningContrastTextColor),
        containedInfo: makeContainedButtonStyle(lightInfoColor, lightInfoContrastTextColor),
        outlinedPrimary: makeOutlinedButtonStyle("primary"),
        outlinedSecondary: makeOutlinedButtonStyle("secondary"),
        outlinedSuccess: makeOutlinedButtonStyle("success"),
        outlinedError: makeOutlinedButtonStyle("error"),
        outlinedWarning: makeOutlinedButtonStyle("warning"),
        outlinedInfo: makeOutlinedButtonStyle("info"),
        textPrimary: {
          color: darken(saturate(lightPrimaryColor, 0.3), 0.3),
        },
        startIcon: { marginRight: 8, "& > *:nth-of-type(1)": { fontSize: 18 } },
        endIcon: { marginLeft: 8, "& > *:nth-of-type(1)": { fontSize: 18 } },
        sizeSmall: { height: 36, padding: "0 16px", borderRadius: 8 },
      },
    },
    MuiButtonBase: { defaultProps: { disableRipple: true } },
    MuiAppBar: { styleOverrides: { root: { borderBottom: "1px solid rgba(255,255,255,0.12)" } } },
    MuiDivider: { styleOverrides: { root: { borderColor: lightBorderColor } } },
    MuiLink: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.primary.darker,
          textDecoration: "underline",
          textUnderlineOffset: "0.18em",
          textDecorationColor: `color-mix(in srgb, currentColor 40%, transparent)`,
          transition: theme.transitions.create(["color", "text-decoration-color", "background-color"], {
            duration: theme.transitions.duration.short,
          }),
          "&:hover": {
            color: darken(lightPrimaryDarkerColor, 0.1),
            textDecoration: "underline",
            textDecorationColor: lightPrimaryDarkerColor,
          },
        }),
      },
    },
    MuiDialog: {},
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          // Reduce title paddingBottom to compensate for body paddingTop added below,
          // keeping the total title→body gap the same as the original (3/4 spacing total).
          ".Dialogist-rootPaper &.Dialogist-title": {
            paddingBottom: "calc(var(--dialogist-spacing) / 4)",
          },
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          // Match the library's 2-class specificity (.Dialogist-rootPaper .Dialogist-content)
          // so this paddingTop isn't reset by the compiled library's padding shorthand.
          // Ensures floating labels on OutlinedInput fields are not clipped by overflow:auto.
          ".Dialogist-rootPaper &.Dialogist-content": {
            paddingTop: "calc(var(--dialogist-spacing) / 2)",
          },
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          position: "fixed",
          height: "100%",
          width: "100%",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { boxShadow: "none", backgroundImage: "none", borderRadius: 10, backgroundColor: lightPaperColor },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: 8,
          color: "inherit",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.06)" },
          "&:focus-visible": { outline: "2px solid rgba(1,111,109,0.35)", outlineOffset: 2 },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: `color-mix(in srgb, rgba(43,38,49,0.2) 25%, ${lightPageSecondaryBackgroundColor})`,
          backdropFilter: "blur(10px)",
          color: "rgba(255,255,255,0.95)",
          borderRadius: 5,
          border: "1px solid rgba(255,255,255,0.08)",
          fontSize: "0.75rem",
          boxShadow: halfSoftShadows[10],
          overflow: "visible",
          padding: "6px 10px",
        },
      },
    },
    MuiTextField: {
      variants: [
        {
          props: { size: "small" },
          style: {
            "& .MuiInputBase-input": { fontSize: "0.85rem" },
            "& .MuiFormLabel-root:not(.MuiInputLabel-shrink)": { fontSize: "0.85rem" },
            "& .MuiOutlinedInput-notchedOutline legend": { fontSize: "0.725rem" },
          },
        },
      ],
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          // Input/textfield labels use the same teal as radio selection
          "&.MuiFormLabel-colorPrimary": {
            color: "var(--demo-form-control-accent)",
          },
          "&.Mui-focused.MuiFormLabel-colorPrimary": {
            color: "var(--demo-form-control-accent)",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#ffffff",
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0,0,0,0.18)" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: lightPrimaryColor },
        },
        notchedOutline: { borderColor: "rgba(0,0,0,0.12)" },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          marginLeft: 0,
          textAlign: "left",
          // When used with Radio: always hide the radio (selected and unselected)
          "&:has(.MuiRadio-root)": {
            "& .MuiRadio-root": {
              width: 0,
              height: 0,
              padding: 0,
              margin: 0,
              minWidth: 0,
              overflow: "hidden",
            },
          },
          // When checked: highlight icon, text, and rectangle outlines
          "&:has(.MuiRadio-root.Mui-checked)": {
            "& .MuiFormControlLabel-label": {
              color: "var(--demo-form-control-accent)",
              "& *, & svg": {
                color: "var(--demo-form-control-accent)",
                borderColor: "var(--demo-form-control-accent)",
              },
            },
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          "&.Mui-checked": {
            color: "var(--demo-form-control-accent)",
          },
        },
      },
    },
    MuiSwitch: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: { "& .MuiSwitch-track": { padding: 0 } },
        sizeSmall: {
          width: 31,
          height: 21,
          padding: 0,
          marginRight: 10,
          borderRadius: 999,
          "& .MuiSwitch-thumb": {
            width: 15,
            height: 15,
          },
          "& .MuiSwitch-switchBase": {
            transform: "translateX(-1px) translateY(-1px)",
          },
          "& .MuiSwitch-switchBase.Mui-checked": {
            transform: "translateX(9px) translateY(-1px)",
          },
        },
        switchBase: {
          "&.MuiSwitch-switchBase": {
            color: "#FFFFFF",
          },
          "&.Mui-checked": {
            color: "#FFFFFF",
          },
          "& .MuiSwitch-track": {
            backgroundColor: lightPrimaryColor,
          },
          "&.Mui-checked+.MuiSwitch-track": {
            opacity: 0.9,
          },
        },
        colorPrimary: {
          padding: 0,
        },
        thumb: {
          boxShadow: "none",
        },
        track: {
          color: "transparent",
          backgroundColor: lightDisabledBackgroundColor,
        },
      },
    },
    MuiMenu: {
      styleOverrides: { paper: { borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)", boxShadow: "none" } },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 36,
          padding: "8px 12px",
          borderRadius: 8,
          "&.Mui-selected": { backgroundColor: "#F3F0FF" },
          "&.Mui-selected:hover": { backgroundColor: "#ECE7FF" },
          "&:hover": { backgroundColor: "#F8F8F9" },
        },
      },
    },
    MuiChip: {
      variants: [
        {
          props: { variant: "outlined", color: "warning" },
          style: chipOutlinedWarningImportantStyle,
        },
      ],
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
          height: 24,
          border: "1px solid rgba(0,0,0,0.12)",
          backgroundColor: "#fff",
        },
        sizeSmall: { height: 22, fontSize: "0.75rem" },
        outlined: ({ theme }) => ({
          fontWeight: 450,
          padding: `${theme.spacing(1.5)} ${theme.spacing(0.5)}`,
          borderColor: "rgba(0,0,0,0.12)",
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          border: `1pt solid ${lightBorderColor}`,
          "@media screen and (min-resolution: 2dppx)": {
            border: `0.5pt solid ${lightBorderColor}`,
          },
          backgroundColor: lightPaperColor,
          "& > .MuiCardContent-root, & > .MuiCardActions-root": { padding: 16 },
          "& > .MuiCardContent-root": { paddingBottom: 0 },
          "& > .MuiCardActions-root": { paddingTop: 16, paddingBottom: 16 },
          transition: "box-shadow .2s ease, transform .2s ease",
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiCardContent: { styleOverrides: { root: { padding: "20px", "&:last-child": { paddingBottom: "20px" } } } },
    MuiCardActions: {
      styleOverrides: { root: { padding: "12px 20px", backgroundColor: "#F6F6F7", borderTop: "none" } },
    },
    MuiContainer: { styleOverrides: { root: { backgroundColor: lightPageBackgroundColor, minHeight: "100vh" } } },
    MuiListItem: {
      defaultProps: { dense: true },
      styleOverrides: { root: { borderRadius: 8, paddingTop: 6, paddingBottom: 6 } },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "6px 10px",
          "&.Mui-selected": { backgroundColor: "#F3F0FF" },
          "&.Mui-selected:hover": { backgroundColor: "#ECE7FF" },
          "&:hover": { backgroundColor: "#F8F8F9" },
        },
      },
    },
    MuiListItemIcon: { styleOverrides: { root: { minWidth: 28, color: "inherit" } } },
    MuiListItemText: {
      styleOverrides: {
        primary: { fontSize: "0.875rem", color: "#2A2A2E" },
        secondary: { fontSize: "0.75rem", color: "#6b7280" },
      },
    },
    MuiSelect: {
      defaultProps: { size: "small" },
      styleOverrides: {
        select: { padding: "6px 32px 6px 12px", minHeight: 0 },
        icon: { top: "calc(50% - 10px)", color: "#6b7280" },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 6, borderRadius: 999, backgroundColor: "#E9E9EB" },
        bar: { borderRadius: 999 },
      },
    },
  },
} as const;

export const theme = responsiveFontSizes(createTheme(dialogistExtendMuiTheme(extendThemeWithReactIcons(baseTheme))));
