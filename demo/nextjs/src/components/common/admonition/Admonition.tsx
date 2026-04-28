"use client";

import { alpha, Box, Typography } from "@mui/material";
import { type SxProps, type Theme, useTheme } from "@mui/material/styles";
import { FlexBox } from "@mui-flexy/v7";
import type { ReactNode } from "react";
import { MdInfoOutline } from "react-icons/md";
import { RiErrorWarningLine, RiLightbulbFlashLine } from "react-icons/ri";
import { TbAlertTriangleFilled } from "react-icons/tb";

import { AdmonitionInlineCodeStyleContext } from "./AdmonitionInlineCodeContext";

export type AdmonitionVariant = "plain" | "note" | "info" | "tip" | "important" | "caution";

type TintedAdmonitionVariant = Exclude<AdmonitionVariant, "plain">;

const DEFAULT_TITLES: Record<TintedAdmonitionVariant, string> = {
  note: "Note",
  info: "Info",
  tip: "Tip",
  important: "Important",
  caution: "Caution",
};

type PaletteKey = "info" | "success" | "warning" | "error";

const VARIANT_META: Record<TintedAdmonitionVariant, { Icon: typeof MdInfoOutline; paletteKey: PaletteKey }> = {
  note: { Icon: MdInfoOutline, paletteKey: "info" },
  info: { Icon: MdInfoOutline, paletteKey: "info" },
  tip: { Icon: RiLightbulbFlashLine, paletteKey: "success" },
  important: { Icon: RiErrorWarningLine, paletteKey: "warning" },
  caution: { Icon: TbAlertTriangleFilled, paletteKey: "error" },
};

/** Padding and radius shared with the card description well. */
export const DEMO_CARD_DESCRIPTION_LAYOUT_SX: SxProps<Theme> = {
  px: 1.25,
  py: 0.75,
  borderRadius: 1,
};

/** Neutral description panel (card intros). */
export const DEMO_CARD_DESCRIPTION_WELL_SX: SxProps<Theme> = {
  ...DEMO_CARD_DESCRIPTION_LAYOUT_SX,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "grey.50",
};

const variantTones = (theme: Theme, variant: TintedAdmonitionVariant) => {
  const { paletteKey } = VARIANT_META[variant];
  const p = theme.palette[paletteKey];
  const mode = theme.palette.mode;
  const bgAlpha = mode === "light" ? 0.09 : 0.16;
  const borderAlpha = mode === "light" ? 0.32 : 0.45;

  let mixSource = p.main;

  if (variant === "important") {
    mixSource = "#e5b801";
  }

  const stroke = mixSource;
  let bg = alpha(p.main, bgAlpha);
  let border = alpha(mixSource, borderAlpha);
  let labelText = `color-mix(in srgb, ${mixSource}, ${theme.palette.text.secondary} 65%)`;
  let bodyText = labelText;

  if (variant === "important") {
    border = alpha(mixSource, borderAlpha * 1.5);
    bg = alpha(p.main, bgAlpha * 0.8);
    labelText = `color-mix(in srgb, ${mixSource}, #591823 45%)`;
    bodyText = labelText;
  }

  return {
    mixSource,
    stroke,
    bg,
    border,
    labelText,
    bodyText,
  };
}

export interface AdmonitionProps {
  variant?: AdmonitionVariant;
  /**
   * Label before the body (e.g. "Important" for `important`). For tinted variants, defaults per
   * variant. Pass "" to omit. Plain has no default title and no icon.
   */
  title?: string;
  children: ReactNode;
  sx?: SxProps<Theme>;
}

/** Matches `BaseDemoCard` description `Typography` (plain variant body). */
const PLAIN_BODY_TYPOGRAPHY_SX = {
  display: "block",
  fontSize: "0.8rem",
  lineHeight: 1.45,
} as const;

/**
 * Card-style callout. Default `plain` matches the demo card description panel (neutral well).
 * Tinted variants add icon, optional title, and soft palette styling.
 */
export const Admonition = ({ variant = "plain", title, children, sx }: AdmonitionProps) => {
  const theme = useTheme();
  const sxList = Array.isArray(sx) ? sx : sx ? [sx] : [];

  if (variant === "plain") {
    const showPlainLabel = title != null && title !== "";
    const plainCodeTones = {
      mixSource: alpha(theme.palette.text.primary, 0.4),
      bodyText: theme.palette.text.secondary,
    };
    return (
      <FlexBox sx={[DEMO_CARD_DESCRIPTION_WELL_SX, ...sxList]}>
        <AdmonitionInlineCodeStyleContext.Provider
          value={{
            ...plainCodeTones,
            nestedCodeBlockShowsAdmonitionBackdrop: true,
          }}
        >
          <Typography component="div" variant="caption" color="text.secondary" sx={PLAIN_BODY_TYPOGRAPHY_SX}>
            {showPlainLabel ? (
              <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                {title}.{" "}
              </Box>
            ) : null}
            {children}
          </Typography>
        </AdmonitionInlineCodeStyleContext.Provider>
      </FlexBox>
    );
  }

  const { Icon } = VARIANT_META[variant];
  const showLabel = title !== "";
  const label = title === undefined ? DEFAULT_TITLES[variant] : title;

  return (
    <FlexBox
      row
      gap={1}
      y="flex-start"
      sx={[
        DEMO_CARD_DESCRIPTION_LAYOUT_SX,
        (theme) => {
          const t = variantTones(theme, variant);
          return {
            border: `1px solid ${t.border}`,
            bgcolor: t.bg,
          };
        },
        ...sxList,
      ]}
    >
      <Box
        className="demo-admonition-icon"
        component="span"
        aria-hidden
        sx={(theme) => ({
          flexShrink: 0,
          mt: 0.125,
          display: "flex",
          lineHeight: 0,
          color: variantTones(theme, variant).stroke,
          "& svg": { width: 18, height: 18 },
        })}
      >
        <Icon />
      </Box>
      <Typography
        component="div"
        variant="caption"
        sx={(theme) => {
          const t = variantTones(theme, variant);
          return {
            display: "block",
            fontSize: "0.8rem",
            lineHeight: 1.45,
            flex: 1,
            minWidth: 0,
            color: t.bodyText,
            "& p": { m: 0 },
            "& p + p": { mt: 1 },
          };
        }}
      >
        <AdmonitionInlineCodeStyleContext.Provider
          value={(() => {
            const t = variantTones(theme, variant);
            return {
              mixSource: t.mixSource,
              bodyText: t.bodyText,
              nestedCodeBlockShowsAdmonitionBackdrop: true,
            };
          })()}
        >
          {showLabel && label ? (
            <Box
              component="span"
              sx={(theme) => ({
                fontWeight: 600,
                color: variantTones(theme, variant).labelText,
              })}
            >
              {label}.{" "}
            </Box>
          ) : null}
          {children}
        </AdmonitionInlineCodeStyleContext.Provider>
      </Typography>
    </FlexBox>
  );
}
