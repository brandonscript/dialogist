"use client";

import { FormControl, IconButton, MenuItem, Select, type SelectChangeEvent, Tooltip, Typography } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { LuChevronDown, LuInfo } from "react-icons/lu";

import {
  DEMO_ADAPTERS,
  type DemoAdapterId,
  useDemoAdapter,
} from "../../contexts/AdapterContext";

/**
 * Top-bar control that swaps Dialogist's `slots` bundle so the same demo cards render
 * through MUI / Base UI / shadcn / Tailwind without any code change in the cards
 * themselves. The provider remounts on change (see ClientProviders), which is the
 * cleanest way to swap slots since they aren't reactive.
 */
export const AdapterSwitcher = () => {
  const { adapterId, setAdapterId } = useDemoAdapter();

  const handleChange = (event: SelectChangeEvent<DemoAdapterId>) => {
    const next = event.target.value as DemoAdapterId;
    setAdapterId(next);
  };

  return (
    <FlexBox y="center" gap={1}>
      <Typography variant="caption" sx={{ color: "inherit", fontWeight: 500 }}>
        Render with
      </Typography>
      <FormControl size="small">
        <Select
          value={adapterId}
          onChange={handleChange}
          variant="outlined"
          inputProps={{ "aria-label": "Render with" }}
          IconComponent={({ className }) => (
            <LuChevronDown
              size={14}
              className={className}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "inherit" }}
            />
          )}
          MenuProps={{
            slotProps: {
              paper: {
                sx: {
                  mt: 0.5,
                  minWidth: 140,
                  backgroundColor: "background.secondary",
                  color: "secondary.main",
                  borderRadius: 2,
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  "& .MuiMenuItem-root": {
                    fontSize: "0.75rem",
                    color: "secondary.main",
                    minHeight: 0,
                    py: 0.75,
                    borderRadius: 1,
                    mx: 0.5,
                    px: 1.5,
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.07)" },
                    "&.Mui-selected": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.14)" },
                    },
                  },
                  "& .MuiList-root": { py: 0.75 },
                },
              },
            },
          }}
          sx={{
            minWidth: 110,
            color: "secondary.main",
            fontSize: "0.75rem",
            // Override the global MuiOutlinedInput background (#fff) that would make
            // white text invisible against the white input box on the dark AppBar.
            backgroundColor: "transparent",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.3)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.6)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.8)",
            },
            "& .MuiSelect-select": { py: 0.5 },
          }}
        >
          {DEMO_ADAPTERS.map((entry) => (
            <MenuItem key={entry.id} value={entry.id}>
              {entry.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Tooltip
        title={
          <span>
            Switch the underlying UI library Dialogist's slots render through. The dialog logic,
            state, and CSS variables stay the same — only the components change.
          </span>
        }
      >
        <IconButton
          size="small"
          aria-label="About render-with adapter switcher"
          sx={{ color: "secondary.main", opacity: 0.6, p: 0.25, "&:hover": { opacity: 1, backgroundColor: "rgba(255,255,255,0.08)" } }}
        >
          <LuInfo size={15} />
        </IconButton>
      </Tooltip>
    </FlexBox>
  );
};
