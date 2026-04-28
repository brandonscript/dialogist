"use client";

import { Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

import { useDemoNavScope } from "../../../contexts/DemoNavScope";
import { DemoCopyLink } from "../DemoCopyLink";
import { buildDemoPath } from "../demoNavData";
import { getSubHeadingElementId, toSlug } from "../demoNavUtils";

export const DemoSectionHeading = ({
  children,
  subtitle,
  slug,
  sx,
  mt,
  mb,
  my,
}: {
  children?: ReactNode;
  /**
   * Sub-nav label; creates a scoped anchor id so the side nav can scroll here.
   * Pair with `children` when the visible heading uses rich text (e.g. inline code).
   * Omit when rendering card-level subtitle from BaseDemoCard (children only — no anchor).
   */
  subtitle?: string;
  /** Optional subsection id segment; defaults to {@link toSlug} of `subtitle` when set. */
  slug?: string;
  sx?: SxProps<Theme>;
  /** Theme spacing multiplier or CSS length. Defaults to `1` when `my` is omitted. */
  mt?: number | string;
  mb?: number | string;
  my?: number | string;
}) => {
  const navScope = useDemoNavScope();
  const subSegment = slug !== undefined ? slug : subtitle !== undefined ? toSlug(subtitle) : undefined;
  const id =
    navScope && subSegment !== undefined
      ? getSubHeadingElementId(navScope.sectionSlug, navScope.cardSlug, subSegment)
      : undefined;

  const display = children !== undefined ? children : subtitle;

  const copyPath =
    navScope && subSegment !== undefined
      ? `${buildDemoPath(navScope.sectionSlug, navScope.cardSlug)}#${encodeURIComponent(subSegment)}`
      : null;

  const typographySx: SxProps<Theme> = {
    fontWeight: 600,
    fontSize: "0.85rem",
    // No top padding when paired with copy icon so flex center aligns with cap height.
    ...(copyPath ? { pt: 0 } : { pt: 0.25 }),
    ...(my !== undefined ? { my } : { mt: mt ?? 1 }),
    ...(mt !== undefined && my !== undefined ? { mt } : {}),
    ...(mb !== undefined ? { mb } : {}),
    ...sx,
  };

  const typography = (
    <Typography
      id={id}
      component="h4"
      variant="subtitle2"
      color="text.secondary"
      sx={{
        ...typographySx,
        ...(copyPath ? { flex: "0 1 auto", minWidth: 0 } : {}),
      }}
    >
      {display}
    </Typography>
  );

  if (!copyPath) {
    return typography;
  }

  return (
    <DemoCopyLink
      variant="subsection"
      pathToCopy={copyPath}
      ariaLabel="Copy link to this subsection"
      sx={{
        alignItems: "center",
        maxWidth: "100%",
      }}
    >
      {typography}
    </DemoCopyLink>
  );
};
