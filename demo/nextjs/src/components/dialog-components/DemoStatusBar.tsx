"use client";

import { Box, CircularProgress, type SxProps, styled, type Theme } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { dialogistClasses } from "dialogist/classes";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { useRenderTracking } from "../../contexts/RenderTrackingContext";
import { RenderTracker, RenderTrackerWrapper } from "../common/RenderTracker";

const StatusBarContainer = styled(Box)(() => ({
  position: "relative",
}));

const StatusBarContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: "0.75rem",
  minHeight: 44,
}));

const StatusBarInfo = styled("span")(() => ({
  opacity: 0.8,
  fontFamily: "monospace",
  fontSize: "0.7rem",
}));

interface DemoStatusBarProps {
  content?: ReactNode | string;
  dialogKey?: string;
  dialogType?: string;
  statusText?: string;
  statusColor?: "primary" | "success" | "warning" | "error" | "info";
  showSpinner?: boolean;
  initialAutoLoadingMs?: number;
  loadingText?: string;
  sx?: SxProps<Theme>;
}

export const DemoStatusBar = ({
  content,
  dialogKey,
  dialogType,
  statusText,
  statusColor,
  showSpinner,
  initialAutoLoadingMs = 0,
  loadingText = "Loading...",
  sx,
}: DemoStatusBarProps) => {
  const [localLoading, setLocalLoading] = useState(initialAutoLoadingMs > 0);
  const { showRenderTracking } = useRenderTracking();

  useEffect(() => {
    if (initialAutoLoadingMs > 0) {
      setLocalLoading(true);
      const to = setTimeout(() => setLocalLoading(false), initialAutoLoadingMs);
      return () => clearTimeout(to);
    }
  }, [initialAutoLoadingMs]);

  const effectiveSpinner = !!showSpinner || localLoading;
  const effectiveColor = useMemo(
    () => statusColor ?? (effectiveSpinner ? "warning" : undefined),
    [statusColor, effectiveSpinner],
  );
  const statusBarSx = useMemo(
    () => ({
      backgroundColor: effectiveColor ? `${effectiveColor}.main` : undefined,
      color: effectiveColor ? `${effectiveColor}.contrastText` : undefined,
      ...sx,
    }),
    [effectiveColor, sx],
  );
  return (
    <StatusBarContainer className={`${dialogistClasses.customStatusBar} demo-status-bar`}>
      <RenderTrackerWrapper>
        <RenderTracker
          componentName="Status bar"
          variant="dark"
          dependencies={[typeof content, dialogKey, dialogType]}
          showTimestamp={false}
          label="Status bar"
        />
      </RenderTrackerWrapper>
      {(() => {
        let text = typeof content === "string" ? content : statusText;
        if (localLoading) {
          text = loadingText;
        }
        if (text) {
          return (
            <StatusBarContent className={dialogistClasses.topCorners} sx={statusBarSx}>
              <FlexBox y="center" gap={1}>
                {effectiveSpinner && <CircularProgress size={12} thickness={5} color="inherit" />}
                <span>{text}</span>
              </FlexBox>
              {showRenderTracking && <StatusBarInfo>{dialogKey}</StatusBarInfo>}
            </StatusBarContent>
          );
        }
        return content || null;
      })()}
    </StatusBarContainer>
  );
}
