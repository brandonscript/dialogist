"use client";

import { Box, Tooltip } from "@mui/material";
import { type KeyboardEvent, type ReactNode, useCallback, useRef, useState } from "react";
import { LuCheck, LuLink2 } from "react-icons/lu";

import { getDemoAbsoluteUrl } from "../../hooks/useDemoRouteScroll";

const SUCCESS_HOLD_MS = 900;
const FADE_MS = 450;

/** Pixel size for Lucide link/check icons by demo layout context. */
export type DemoCopyLinkVariant = "section" | "card" | "subsection";

const COPY_LINK_ICON_PX: Record<DemoCopyLinkVariant, number> = {
  section: 20,
  card: 18,
  subsection: 16,
};

const COPY_LINK_ICON_OPACITY: Record<DemoCopyLinkVariant, number> = {
  section: 0.4,
  card: 0.6,
  subsection: 0.5,
};

export const copyLinkIconPx = (variant: DemoCopyLinkVariant): number => {
  return COPY_LINK_ICON_PX[variant];
};

const CopyLinkButton = ({ copied, variant }: { copied: boolean; variant: DemoCopyLinkVariant }) => {
  const onOpacity = COPY_LINK_ICON_OPACITY[variant];
  const px = copyLinkIconPx(variant);
  const pad = Math.max(4, px * 0.15);

  return (
    <Tooltip title={copied ? "Copied" : "Copy link"} describeChild>
      <Box
        className="demo-copy-link-icon-wrap"
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          borderRadius: 1,
          lineHeight: 0,
          transform: variant === "subsection" ? "translateY(4px)" : "none",
          transition: "background-color 0.12s ease",
          "&:hover": {
            bgcolor: "action.hover",
          },
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: "relative",
            width: px + pad * 2,
            height: px + pad * 2,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "currentColor",
          }}
        >
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: copied ? 0 : onOpacity,
              transition: `opacity ${FADE_MS}ms ease`,
              color: "currentColor",
            }}
          >
            <LuLink2 size={px} style={{ display: "block" }} />
          </Box>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: copied ? onOpacity : 0,
              transition: `opacity ${FADE_MS}ms ease`,
            }}
          >
            <LuCheck size={px * 0.8} strokeWidth={2.5} style={{ display: "block" }} />
          </Box>
        </Box>
      </Box>
    </Tooltip>
  );
};

export type DemoCopyLinkRowProps = {
  /** Relative path (and optional hash), e.g. `/getting-started` or `/a/b#subsection`. */
  pathToCopy: string;
  children: ReactNode;
  ariaLabel?: string;
  /** Controls link/check icon size for section, card, or subsection layout. */
  variant?: DemoCopyLinkVariant;
  sx?: object;
};

/**
 * Clickable row: copy on click anywhere (text or icon). Link icon is hidden until
 * hover on the row (not :focus-within, so a click that focuses the row does not
 * leave the icon visible after the copied state clears); tooltip and icon hover
 * background only on the icon.
 */
export const DemoCopyLink = ({
  pathToCopy,
  children,
  ariaLabel = "Copy link to this section",
  variant = "card",
  sx,
}: DemoCopyLinkRowProps) => {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runCopy = useCallback(async () => {
    if (resetTimer.current) {
      clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
    const full = getDemoAbsoluteUrl(pathToCopy);
    await navigator.clipboard.writeText(full);
    setCopied(true);
    resetTimer.current = setTimeout(() => {
      setCopied(false);
      resetTimer.current = null;
    }, SUCCESS_HOLD_MS);
  }, [pathToCopy]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      void runCopy();
    }
  };

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.preventDefault();
        void runCopy();
      }}
      onKeyDown={onKeyDown}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        maxWidth: "100%",
        minWidth: 0,
        cursor: "pointer",
        textAlign: "left",
        border: "none",
        background: "none",
        padding: 0,
        margin: 0,
        font: "inherit",
        color: "inherit",
        borderRadius: 0.5,
        outline: "none",
        "&:focus-visible": {
          outline: (t) => `2px solid ${t.palette.primary.main}`,
          outlineOffset: 2,
        },
        // Reveal link icon on row hover only, or while showing checkmark (copied).
        // Omit :focus-within so clicking the label does not keep the icon visible.
        "& .demo-copy-link-icon-wrap": {
          opacity: copied ? 1 : 0,
          transition: "opacity 0.18s ease",
        },
        "&:hover .demo-copy-link-icon-wrap": {
          opacity: 1,
        },
        ...sx,
      }}
    >
      <Box sx={{ minWidth: 0, flex: "0 1 auto" }}>{children}</Box>
      <CopyLinkButton copied={copied} variant={variant} />
    </Box>
  );
};
