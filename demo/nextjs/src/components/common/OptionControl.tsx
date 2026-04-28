"use client";

import { TextField, Typography } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { memo } from "react";

interface OptionControlProps {
  label: string;
  value: number | string;
  onChange: (value: number | string) => void;
  type?: "text" | "number";
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export const OptionControl = memo(function OptionControl({
  label,
  value,
  onChange,
  type = "text",
  min,
  max,
  step = 1,
  disabled,
}: OptionControlProps) {
  return (
    <FlexBox column gap={0.5}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <TextField
        size="small"
        value={value ?? ""}
        type={type}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        slotProps={{
          htmlInput: {
            min,
            max,
            step,
          },
        }}
        sx={{ width: 120 }}
      />
    </FlexBox>
  );
});
