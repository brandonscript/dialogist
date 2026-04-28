"use client";

import { darken, Link as MuiLink } from "@mui/material";
import type { LinkProps as MuiLinkProps } from "@mui/material/Link";
import type { Theme } from "@mui/material/styles";
import type { SxProps } from "@mui/system";
import NextLink from "next/link";
import { forwardRef } from "react";

import { saturate } from "../../../utils/color";

const docLinkSx: SxProps<Theme> = {
  "&:has([data-inline-code])": {
    borderRadius: 0.25,
    textDecoration: "none",
    fontWeight: "inherit",
    "&:hover": {
      textDecoration: "none",
    },
    "& [data-inline-code]": {
      color: (theme) => saturate(darken(theme.palette.primary.darker as string, 0.2), 0.1),
      borderColor: "primary.main",
      backgroundColor: "color-mix(in srgb, currentColor 5%, transparent)",
      transition: (theme) =>
        theme.transitions.create(["color", "border-color", "background-color"], {
          duration: theme.transitions.duration.short,
        }),
    },
    "&:hover [data-inline-code]": {
      color: (theme) => saturate(darken(theme.palette.primary.darker as string, 0.3), 0.15),
      borderColor: "primary.main",
      backgroundColor: "color-mix(in srgb, currentColor 10%, transparent)",
    },
  },
  "&:focus-visible": {
    outline: "2px solid",
    outlineColor: "info.main",
    outlineOffset: 2,
  },
};

export type DocLinkProps = Omit<MuiLinkProps<typeof NextLink>, "component" | "underline">;

/**
 * Next.js + MUI link for prose: `info` palette color and underline so links read as links.
 * When the child is `Code` (`data-inline-code`), the chip is tinted with the same link color instead of underlining.
 */
export const DocLink = forwardRef<HTMLAnchorElement, DocLinkProps>(function DocLink({ sx, ...props }, ref) {
  return (
    <MuiLink
      ref={ref}
      component={NextLink}
      underline="none"
      {...props}
      sx={[docLinkSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    />
  );
});
