"use client";

import { Checkbox, FormControlLabel } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { memo } from "react";

export type DemoCheckboxLabelProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  sx?: SxProps<Theme>;
};

/** Checkbox + label with demo typography (matches option rows in sandbox cards). */
export const DemoCheckboxLabel = memo(function DemoCheckboxLabel({
  checked,
  onChange,
  label,
  sx,
}: DemoCheckboxLabelProps) {
  return (
    <FormControlLabel
      control={<Checkbox size="small" checked={checked} onChange={(e) => onChange(e.target.checked)} />}
      sx={[{ mr: 0 }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      label={label}
      slotProps={{
        typography: {
          sx: { fontSize: "0.8rem" },
        },
      }}
    />
  );
});
