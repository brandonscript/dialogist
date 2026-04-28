"use client";

import { Box, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { FlexBox } from "@mui-flexy/v7";
import { memo } from "react";
import { GrFormCheckmark, GrFormClose } from "react-icons/gr";

const ICON_SIZE = 16;

const iconWrapSx = {
  display: "inline-flex",
  alignItems: "center",
  lineHeight: 0,
  flexShrink: 0,
  "& svg": { display: "block" },
} as const;

export type DemoPatternLabelVariant = "dont" | "do";

export const DemoPatternLabel = memo(function DemoPatternLabel({
  variant,
  sx,
}: {
  variant: DemoPatternLabelVariant;
  sx?: SxProps<Theme>;
}) {
  const isDont = variant === "dont";
  const color = isDont ? "error.main" : "success.main";

  return (
    <FlexBox row y="center" gap={0.5} sx={sx}>
      <Box component="span" sx={{ ...iconWrapSx, color }} aria-hidden>
        {isDont ? <GrFormClose size={ICON_SIZE} /> : <GrFormCheckmark size={ICON_SIZE} />}
      </Box>
      <Typography variant="caption" component="span" sx={{ fontWeight: 600, lineHeight: 1, color }}>
        {isDont ? "Don't" : "Do"}
      </Typography>
    </FlexBox>
  );
});
