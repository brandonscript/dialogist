"use client";

import {
  DEMO_ICON_FILL_ACCENT_PATH_FIRST_CLASS,
  DEMO_ICON_FILL_ACCENT_PATH_LAST_CLASS,
  DEMO_ICON_FILL_ACCENT_RECT_FIRST_CLASS,
  DEMO_ICON_FILL_ACCENT_RECT_LAST_CLASS,
  DEMO_ICON_FILL_CLASS,
  DEMO_ICON_FILL_ROOT_STROKE_ZERO_CLASS,
  DEMO_ICON_OUTLINE_CLASS,
  DEMO_PI_DUOTONE_ICON_CLASS,
} from "@/constants/demoCardIconClasses";
import type { DemoCardIconComponent } from "./BaseDemoCard";

type IconProps = {
  size?: number;
  className?: string;
  "aria-hidden"?: boolean;
};

const iconDebugName = (Icon: DemoCardIconComponent) =>
  (Icon as { displayName?: string }).displayName ?? (Icon as { name?: string }).name ?? "Icon";

const wrapIcon = (Icon: DemoCardIconComponent, className: string, displayPrefix: string): DemoCardIconComponent => {
  const Wrapped = (props: IconProps) => (
    <span className={className} style={{ lineHeight: 0, display: "inline-flex", alignItems: "center" }}>
      <Icon {...props} />
    </span>
  );
  Wrapped.displayName = `${displayPrefix}(${iconDebugName(Icon)})`;
  return Wrapped as unknown as DemoCardIconComponent;
};

/** Phosphor duotone (`Pi*Duotone`) and the same stroke/fill treatment in the demo theme. */
export const withPiDuotoneIcon = (Icon: DemoCardIconComponent): DemoCardIconComponent =>
  wrapIcon(Icon, DEMO_PI_DUOTONE_ICON_CLASS, "PiDuotone");

export type DemoFillIconAccent = "path-first" | "path-last" | "rect-first" | "rect-last";

export type DemoGenericFillIconOptions = {
  /** Softer fill on a path or rect for a duotone-style read. */
  accent?: DemoFillIconAccent;
  /** Keep the root SVG at stroke width 0 (fill-first marks). */
  rootStrokeZero?: boolean;
};

const accentToClass = (accent: DemoFillIconAccent): string => {
  switch (accent) {
    case "path-first":
      return DEMO_ICON_FILL_ACCENT_PATH_FIRST_CLASS;
    case "path-last":
      return DEMO_ICON_FILL_ACCENT_PATH_LAST_CLASS;
    case "rect-first":
      return DEMO_ICON_FILL_ACCENT_RECT_FIRST_CLASS;
    case "rect-last":
      return DEMO_ICON_FILL_ACCENT_RECT_LAST_CLASS;
    default: {
      const _exhaustive: never = accent;
      return _exhaustive;
    }
  }
};

/**
 * Fill-first icons: optional duotone-style accent or `rootStrokeZero`; plain fill (no options)
 * gets a hairline on `path:not([stroke])`. Accents / `rootStrokeZero` skip that hairline in the theme
 * so paths stay at stroke width 0 (see `demoIconFillHairlineScope` in `demoTheme.ts`).
 */
export const withGenericFillIcon = (
  Icon: DemoCardIconComponent,
  options?: DemoGenericFillIconOptions,
): DemoCardIconComponent => {
  const parts = [DEMO_ICON_FILL_CLASS];
  if (options?.accent) parts.push(accentToClass(options.accent));
  if (options?.rootStrokeZero) parts.push(DEMO_ICON_FILL_ROOT_STROKE_ZERO_CLASS);
  const className = parts.join(" ");
  const Wrapped = (props: IconProps) => (
    <span className={className} style={{ lineHeight: 0, display: "inline-flex", alignItems: "center" }}>
      <Icon {...props} />
    </span>
  );
  Wrapped.displayName = `Fill(${iconDebugName(Icon)})`;
  return Wrapped as unknown as DemoCardIconComponent;
};

/** Outline / stroke-first icons (Lucide outline, Tabler, brand marks): consistent root stroke width. */
export const withGenericOutlineIcon = (Icon: DemoCardIconComponent): DemoCardIconComponent =>
  wrapIcon(Icon, DEMO_ICON_OUTLINE_CLASS, "Outline");
