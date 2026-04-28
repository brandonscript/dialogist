import type { SvgIconProps, SvgIconTypeMap } from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import type { SvgIconPropsSizeOverrides } from "@mui/material/SvgIcon";
import type { Components } from "@mui/material/styles";
import { createSvgIcon } from "@mui/material/utils";
import type { OverridableStringUnion } from "@mui/types";
import { deepmerge } from "deepmerge-ts";
import React, { type NamedExoticComponent, useMemo } from "react";

type Any = any;

export type { ResponsiveStyleValue } from "@mui/system/styleFunctionSx";

// rem units are used for the icon sizes, px / 16 for most screens
// make sure if you change these you also change the template in the icon generator template
export const ICON_SIZES = {
  12: "12px",
  14: "14px",
  16: "16px",
  18: "18px",
  20: "20px",
  24: "24px",
  32: "32px",
  40: "40px",
  46: "46px",
  60: "60px",
} as const;

export const STROKE_WIDTHS = {
  12: 2,
  14: 2,
  16: 2,
  18: 2,
  20: 2,
  24: 2,
  32: 1.75,
  40: 1.625,
  46: 1.5,
  60: 1.25,
} as const;

export type StrNumResponsiveStyleValue<T> = T | Array<T | null> | { [key: string | number]: T | null };

type SvgIconSizeKey = keyof typeof ICON_SIZES;
type SvgIconSizeValue = (typeof ICON_SIZES)[SvgIconSizeKey];

type MuiSvgIconFontSizeProp = OverridableStringUnion<
  "inherit" | "large" | "medium" | "small",
  SvgIconPropsSizeOverrides
>;

declare module "@mui/material/SvgIcon" {
  interface SvgIconPropsSizeOverrides {
    fontSize12: true;
    fontSize14: true;
    fontSize16: true;
    fontSize18: true;
    fontSize20: true;
    fontSize24: true;
    fontSize32: true;
    fontSize40: true;
    fontSize46: true;
    fontSize60: true;
  }

  interface SvgIconOwnProps {
    // @ts-expect-error Numeric fontSize keys extend MUI's string union.
    fontSize?: MuiSvgIconFontSizeProp | SvgIconSizeKey;
  }
}

type SvgIconVariant = SvgIconProps["fontSize"];
type SvgIconFontSize = SvgIconSizeKey;
export const strSvgIconSize = (size: SvgIconFontSize): SvgIconVariant =>
  (!size ? undefined : String(size)) as unknown as SvgIconVariant;

export const ICON_SIZE_KEYS = Object.keys(ICON_SIZES).map((k) => parseInt(k, 10)) as SvgIconSizeKey[];

export const iconSizeToEm = (size?: StrNumResponsiveStyleValue<SvgIconSizeKey>): string => {
  if (!size) return "0em";
  return typeof size === "number"
    ? `${size / 20}em`
    : Array.isArray(size)
      ? // @ts-expect-error Numeric fontSize keys extend MUI's string union.
        size.map(iconSizeToEm).join(" ")
      : typeof size === "object"
        ? Object.entries(size)
            // @ts-expect-error Numeric fontSize keys extend MUI's string union.
            .map(([key, value]) => `${key}: ${iconSizeToEm(value)}`)
            .join("; ")
        : size;
};

export const makeIconStyleOverrides = (sizes: SvgIconSizeKey[]) =>
  sizes.reduce(
    (acc, size) => {
      acc[`&.MuiSvgIcon-fontSize${size}`] = {
        fontSize: ICON_SIZES[size],
        strokeWidth: STROKE_WIDTHS[size],
      };
      return acc;
    },
    {} as Record<string, { fontSize: SvgIconSizeValue; strokeWidth: number }>,
  );

type SvgProps = React.SVGProps<SVGSVGElement>;
type MuiIconComponent = OverridableComponent<SvgIconTypeMap<Record<string, never>, "svg">> & {
  muiName: string;
};

interface IconProps_<P extends SvgProps = SvgProps> extends Omit<SvgIconProps, "fontSize" | "size"> {
  Icon: React.ComponentType<P> | MuiIconComponent | NamedExoticComponent<IconProps>;
  iconName?: string;
  svgProps?: Omit<P, "size" | "fontSize">;
  size?: StrNumResponsiveStyleValue<SvgIconFontSize>;
  outline?: boolean; // Set this to true to switch from 'fill' to 'stroke' for the icon
}

export type IconProps<P extends SvgProps = SvgProps> = Omit<IconProps_<P>, "Icon">;
// export type KnownSvgIcon = React.ComponentType<IconProps>;

export const MuiIconWrapper = <P extends SvgProps = SvgProps>({
  Icon,
  svgProps: _svgProps,
  size,
  iconName: _iconName,
  pointerEvents = "none",
  outline = false,
  className: _className,
  opacity,
  ...muiSvgIconProps
}: IconProps_<P>) => {
  // SvgIcon fontSize is typed as theme string keys; coerce numeric `size` for runtime.
  const fontSize = size ? (String(size) as SvgIconProps["fontSize"]) : undefined;

  const isFunctionComponent = typeof Icon === "function";
  const isMuiReady =
    (Icon as Any)?.muiName === "SvgIcon" ||
    (Icon as Any)?.type?.muiName === "SvgIcon" ||
    (Icon as Any)?.type?.render?.muiName === "SvgIcon";
  const iconName = _iconName ?? (Icon as Any)?.type?.render?.displayName ?? Icon.name ?? `CustomSvg`;
  const className = [_className ?? "", `${iconName}Icon`].join(" ");

  // Merge default SVG attrs (e.g. viewBox) from function icons into SvgIcon.
  const svgProps = useMemo(
    () => ({
      ..._svgProps,
      ...(typeof Icon === "function" ? (Icon as () => Any)().props.attr : {}),
    }),
    [_svgProps, Icon],
  );

  const allProps = useMemo(
    () => ({
      // Spread incoming props first so our outline defaults can intentionally override them
      ...muiSvgIconProps,
      ...(svgProps as P),
      className,
      fontSize,
      // When outline is true, force stroke-only rendering and disable fills.
      // Otherwise, do not force a fill so stroke-only icons remain unfilled by default.
      ...(outline ? { stroke: "currentColor", fill: "none" } : {}),
      sx: deepmerge(
        {
          opacity,
          pointerEvents,
          position: "relative",
          ...muiSvgIconProps.sx,
          // Ensure nested SVG elements respect outline mode, even if generator added
          // presentation attributes or inline styles (override with !important)
          ...(outline ? { "& *": { fill: "none", stroke: "currentColor" } } : { fill: "currentColor" }),
        },
        muiSvgIconProps.sx,
      ),
    }),
    // biome-ignore lint/correctness/useExhaustiveDependencies: muiSvgIconProps is a rest-spread from props and cannot be memoized at the call site
    [outline, muiSvgIconProps, svgProps, className, fontSize, opacity, pointerEvents],
  );

  // For non-function components (e.g., React.memo/forwardRef wrapped icons), render via createElement
  if (!isFunctionComponent) {
    return React.createElement(Icon as Any, { ...(allProps as Any) });
  }

  // If it's a function component already yielding an MUI SvgIcon, render directly
  if (isMuiReady) {
    return React.createElement(Icon as Any, { ...(allProps as Any) });
  }

  // Fallback: function components like react-icons produce an <svg> —
  // render once to extract its children and wrap with MUI's createSvgIcon
  const renderedSvg = (Icon as Any)({ ...(svgProps as Any) });
  const children = React.Children.toArray((renderedSvg as Any)?.props?.children ?? []);
  const IconComponent = createSvgIcon(children, iconName);
  return <IconComponent {...allProps} />;
};

export const makeForIconSizes = <R extends Record<string, Any> = Record<string, Any>>(
  cb: (size: SvgIconSizeKey) => R,
) =>
  ICON_SIZE_KEYS.reduce(
    (acc, size) => {
      const v = cb(size);
      if (typeof v === "object") {
        Object.assign(acc, v);
      } else {
        acc[size] = v as Any;
      }
      return acc;
    },
    {} as Record<SvgIconSizeKey, Components["MuiSvgIcon"]>,
  );

export const extendThemeWithReactIcons = <T extends object = object>(theme: T): T =>
  deepmerge(theme, {
    components: {
      MuiSvgIcon: {
        styleOverrides: {
          root: makeIconStyleOverrides(ICON_SIZE_KEYS),
        },
      },
    },
  }) as unknown as T;

export default MuiIconWrapper;
