"use client";

import type { SxProps, Theme } from "@mui/material/styles";
import { FlexBox } from "@mui-flexy/v7";
import { LuSquare } from "react-icons/lu";

type ActionSquaresIconProps = {
  count?: number;
  gap?: number;
  twoTone?: boolean;
  sx?: SxProps<Theme>;
};

export const ActionSquaresIcon = ({ count = 1, gap = 0.25, twoTone = true, sx }: ActionSquaresIconProps) => {
  const baseSx = {
    color: "text.primary",
    "& svg": {
      width: 14,
      height: 16,
      flexShrink: 0,
      strokeWidth: 3,
      ...(twoTone ? { fill: "color-mix(in srgb, currentColor 18%, transparent)" } : null),
    },
  };

  return (
    <FlexBox
      row
      gap={gap}
      sx={sx === undefined ? baseSx : [baseSx, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {Array.from({ length: count }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: decorative fixed-length array, no meaningful identifier
        <LuSquare key={index} />
      ))}
    </FlexBox>
  );
}
