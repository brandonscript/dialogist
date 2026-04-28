"use client";

import { AppBar, Button, FormControlLabel, Switch, styled, Toolbar, Tooltip, Typography } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";

import { useRenderTracking } from "../../contexts/RenderTrackingContext";
import { emitExternalStateResetAll, useHasDirtyExternalState } from "../7_data_providers/globalReset";
import { Span } from "./Elements";
import { RenderTracker } from "./RenderTracker";

const SWITCH_WIDTH = 44;

const LabeledSwitch = styled(Switch)(({ theme }) =>
  theme.unstable_sx({
    "&.MuiSwitch-root": {
      width: SWITCH_WIDTH,
    },
    "& .MuiSwitch-thumb": {
      backgroundColor: (theme) => `color-mix(in srgb, ${theme.palette.primary.main} 100%, black)`,
      transition: "background-color 150ms",
      boxSizing: "border-box",
      boxShadow: "0 2px 4px 0 rgba(0,0,0,0.2)",
    },
    "& .MuiSwitch-track": {
      borderRadius: 16,
      backgroundColor: "rgba(255,255,255,0.2)",
      opacity: 1,
      position: "relative",
      px: `${SWITCH_WIDTH / 4}px`,
      "&:before": {
        content: '"OFF"',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        top: "50%",
        left: "auto",
        right: 5,
        transform: "translateY(-50%)",
        color: `color-mix(in srgb, ${theme.palette.primary.main} 40%, white)`,
        fontSize: "0.55rem",
        fontWeight: 600,
        lineHeight: 1,
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        transition: "opacity 150ms",
      },
    },
    "&:has(.Mui-checked) .MuiSwitch-switchBase": {
      transform: `translateX(${SWITCH_WIDTH / 2}px) translateY(-1px)`,
    },
    "&:has(.Mui-checked) .MuiSwitch-thumb": {
      backgroundColor: "white",
    },
    "&:has(.Mui-checked+.MuiSwitch-track) .MuiSwitch-track": {
      opacity: 1,
      backgroundColor: (theme) => `color-mix(in srgb, ${theme.palette.primary.main} 90%, white)`,
      "&:before": {
        color: `color-mix(in srgb, ${theme.palette.primary.main} 40%, black)`,
        content: '"ON"',
        left: 6.5,
        right: "auto",
      },
    },
  }),
);

export const AppTopBar = () => {
  const { showRenderTracking, toggleRenderTracking, resetRenderTracking } = useRenderTracking();
  const hasDirtyExternalState = useHasDirtyExternalState();

  return (
    <AppBar
      position="static"
      color="secondary"
      elevation={0}
      sx={{ bgcolor: "background.secondary", color: "secondary.main", borderRadius: 0 }}
    >
      <Toolbar sx={{ minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Typography color="secondary.main" variant="h6" sx={{ fontWeight: 700, textTransform: "lowercase" }}>
          Dialogist
        </Typography>
        <FlexBox y="center" gap={2} ml="auto" flexGrow={1}>
          <Tooltip
            title={
              <span>
                When enabled, the <Span sx={{ fontWeight: 800, color: "primary.main" }}>dialogist</Span> demo will show
                a badge on each element or slot with a unique identifier that changes with every render, and count of
                how many times it has rendered since the last reset.
              </span>
            }
          >
            <FormControlLabel
              control={<LabeledSwitch checked={showRenderTracking} onChange={() => toggleRenderTracking()} />}
              label={"Render tracking"}
              slotProps={{ typography: { variant: "caption" } }}
              labelPlacement="start"
              sx={{ m: 0, color: "inherit", gap: 1, alignItems: "center", fontWeight: 500, lineHeight: "auto" }}
            />
          </Tooltip>
          <FlexBox gap={1}>
            <Button variant="contained" color="primary" size="tiny" onClick={resetRenderTracking}>
              Reset
            </Button>
            {hasDirtyExternalState && (
              <Button
                variant="contained"
                color="primary"
                size="tiny"
                onClick={() => emitExternalStateResetAll()}
              >
                Clear state
              </Button>
            )}
          </FlexBox>
        </FlexBox>
        <RenderTracker componentName="HomePage" variant="light" sx={{ position: "static", m: 0 }} />
      </Toolbar>
    </AppBar>
  );
}
