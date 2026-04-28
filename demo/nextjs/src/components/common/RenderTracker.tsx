"use client";

import { Box, Skeleton, type SkeletonProps, type SxProps, type Theme, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { renderLogger } from "@/utils/renderLogger";
import createSoftShadows from "@/utils/shadows";
import styledSx from "@/utils/styledSx";

import { useRenderTracking } from "../../contexts/RenderTrackingContext";
import { emojiColorMap, type RenderCountStrategy, useRenderTracker } from "../../hooks/useRenderTracker";

interface RenderTrackerProps {
  componentName?: string;
  variant?: "light" | "dark" | "default";
  label?: string;
  dependencies?: any[]; // ← ID changes when these change
  showTimestamp?: boolean; // ← Hide timestamp display
  showId?: boolean; // ← Hide ID display
  showLabel?: boolean; // ← Hide label display
  showEmoji?: boolean; // ← Hide emoji display
  countStrategy?: RenderCountStrategy;
  sx?: SxProps<Theme>;
}

export const RenderTrackerWrapper = styledSx(Box)(() => ({
  p: 2,
  position: "absolute",
  left: "100%",
  top: "50%",
  transform: "translateY(-50%)",
  width: 140,
  height: 40,
  display: "flex",
  justifyContent: "flex-start",
  "*:first-of-type": {
    top: "unset",
    right: "unset",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export const RenderTracker = ({
  componentName = "Component",
  variant = "default",
  label,
  dependencies,
  showTimestamp = true,
  showId = true,
  showLabel = label !== undefined,
  showEmoji = false,
  countStrategy = "all-renders",
  sx,
}: RenderTrackerProps) => {
  const { showRenderTracking, notifyTrackerReady } = useRenderTracking();
  const renderInfo = useRenderTracker(componentName, dependencies, countStrategy);
  const [isClient, setIsClient] = useState(false);

  // Fix hydration issues by ensuring client-only rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Custom precise relative time formatter
  const formatPreciseRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diffInSeconds = Math.floor((now - timestamp) / 1000);

    if (diffInSeconds < 1) return "Rendered just now";
    if (diffInSeconds < 60) return `Rendered ${diffInSeconds} second${diffInSeconds === 1 ? "" : "s"} ago`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Rendered ${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Rendered ${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `Rendered ${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  };

  const IdSkeleton = styledSx((props: SkeletonProps) => (
    <Skeleton {...props} className="render-tracker-id-loading" variant="text" width={60} height={14} />
  ))({
    bgcolor: variant === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
  });

  // Component that calculates time when tooltip renders, not when parent renders
  const LiveTooltipContent = () => {
    if (!isClient || renderInfo.renderId === "loading") {
      return (
        <Skeleton
          variant="text"
          width={120}
          height={16}
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            display: "inline-block",
          }}
        />
      );
    }
    try {
      return <>{formatPreciseRelativeTime(renderInfo.lastRenderTime)}</>;
    } catch {
      return <>Rendered just now</>;
    }
  };

  // Log a global render increment when tracking is enabled
  useEffect(() => {
    if (showRenderTracking) {
      renderLogger.log();
    }
  }, [showRenderTracking]);

  // Notify global context once this tracker has a stable, non-loading id
  useEffect(() => {
    if (isClient && renderInfo.renderId !== "loading") {
      notifyTrackerReady();
    }
  }, [isClient, renderInfo.renderId, notifyTrackerReady]);

  if (!showRenderTracking) {
    return null;
  }

  // Extract emoji and text from the id for overlay rendering
  const rawId = isClient && renderInfo.renderId !== "loading" ? String(renderInfo.renderId) : "";
  const [maybeEmoji, restPart] = rawId.split(" ", 2);
  const [, animal] = restPart?.split("-") ?? [];
  const hasEmoji = /\p{Extended_Pictographic}/u.test(maybeEmoji || "") && !!restPart;
  const emojiOverlay = hasEmoji && showEmoji ? maybeEmoji : null;
  const idTextFromId = hasEmoji ? restPart : rawId;

  return (
    <Box
      className={`render-tracker render-tracker-variant-${variant}`}
      sx={{
        position: "absolute",
        top: (theme) => theme.spacing(2),
        right: (theme) => theme.spacing(2),
        display: "flex",
        alignItems: "center",
        gap: 1,
        zIndex: 1000,
        ...sx,
      }}
    >
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <Box
          className="render-tracker-base"
          sx={{
            borderRadius: 3,
            height: 24,
            display: "flex",
            alignItems: "center",
            fontSize: "0.7rem",
            fontWeight: 500,
            fontFamily: "monospace",
            boxShadow: ["light", "default"].includes(variant) ? createSoftShadows(1)[3] : "none",
            overflow: "hidden",
            whiteSpace: "nowrap",
            zIndex: 19,
            bgcolor: (theme) =>
              ["light", "default"].includes(variant)
                ? "background.paper"
                : `color-mix(in srgb, ${theme.palette.background.paper} 15%, black)`,
          }}
        >
          {(showId || showLabel) && (
            <Box
              className="render-tracker-id"
              sx={{
                bgcolor:
                  variant === "light"
                    ? "white"
                    : variant === "default"
                      ? emojiColorMap[animal as keyof typeof emojiColorMap]
                      : "transparent",
                color: (theme) =>
                  ["light", "default"].includes(variant)
                    ? "text.primary"
                    : `color-mix(in srgb, ${theme.palette.text.secondary} 15%, white)`,
                pl: emojiOverlay ? 3.5 : 1.25,
                pr: 1,
                height: "100%",
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              {label?.length ? label : !isClient || renderInfo.renderId === "loading" ? <IdSkeleton /> : idTextFromId}
            </Box>
          )}
          <Box
            className="render-tracker-count"
            sx={{
              bgcolor: (theme) =>
                variant === "dark"
                  ? `color-mix(in srgb, ${theme.palette.secondary.main} 25%, black)`
                  : variant === "default"
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(245,245,245,0.90)",
              borderLeft:
                variant === "default"
                  ? "1px solid rgba(0,0,0,0.03)"
                  : variant === "light"
                    ? "1px solid rgba(0,0,0,0.05)"
                    : "none",
              color: (theme) =>
                ["light", "default"].includes(variant)
                  ? "text.primary"
                  : `color-mix(in srgb, ${theme.palette.secondary.main} 80%, black)`,
              pl: 1,
              pr: 1.25,
              fontSize: "0.65rem",
              textAlign: "middle",
              height: "100%",
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
              ...(!showId && { borderRadius: 8 }),
            }}
          >
            {isClient ? renderInfo.renderCount : 1}
          </Box>
        </Box>

        {emojiOverlay && variant === "default" && (
          <Box
            className="render-tracker-emoji"
            sx={{
              position: "absolute",
              left: -6,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "2rem",
              lineHeight: 0,
              pointerEvents: "none",
              zIndex: 20,
            }}
          >
            {emojiOverlay}
          </Box>
        )}
      </Box>

      {showTimestamp && (
        <Tooltip
          title={<LiveTooltipContent />}
          placement="top"
          slotProps={{ tooltip: { sx: { boxShadow: createSoftShadows(1)[8] } } }}
        >
          <Typography
            className="render-tracker-date"
            variant="caption"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.625rem",
              color: variant === "dark" ? "white" : "text.secondary",
              opacity: variant === "light" ? 1 : 0.8,
              bgcolor: variant === "default" ? "callout.main" : variant === "light" ? "white" : `rgba(0,0,0,0.7)`,
              pl: 2,
              pr: 0.75,
              py: 0.25,
              transform: (theme) => `translateX(${theme.spacing(-2)})`,
              backdropFilter: "blur(40px)",
              borderRadius: 1,
              boxShadow: "none",
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          >
            {isClient && renderInfo.renderId !== "loading" ? (
              formatTime(renderInfo.currentRenderTime)
            ) : (
              <Skeleton
                className="render-tracker-date-loading"
                variant="text"
                width={75}
                height={16}
                sx={{
                  bgcolor: variant === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
                  display: "inline-block",
                }}
              />
            )}
          </Typography>
        </Tooltip>
      )}
    </Box>
  );
};
