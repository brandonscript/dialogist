"use client";

import { FormControlLabel, Link, Paper, Switch, Typography } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { type KeyboardEvent, memo, useCallback, useEffect, useRef, useState } from "react";
import { LuMonitor, LuMonitorStop } from "react-icons/lu";
import { useDemoState } from "../../contexts/DemoStateContext";
import { DemoSubNav } from "./DemoSubNav";
import { SUBNAV_WIDTH } from "./demoNavData";
import { DemoParagraph } from "./typography";

type SandboxMainProps = {
  isFullscreen: boolean;
  onToggle: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
};

const SandboxMain = memo(function SandboxMain({ isFullscreen, onToggle, onKeyDown }: SandboxMainProps) {
  return (
    <>
      <FlexBox column id="sandbox-header" mb={8} x="center" maxWidth={600} mx="auto">
        <Typography
          variant="h1"
          component="h1"
          sx={{
            textTransform: "lowercase",
            letterSpacing: "-0.025em",
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          Dialogist
          <Typography
            variant="h2"
            component="span"
            sx={{
              fontSize: "70% !important",
              textTransform: "lowercase",
              letterSpacing: "-0.01em",
              lineHeight: "1",
              mt: 0.5,
            }}
          >
            demo &amp; docs
          </Typography>
        </Typography>
        <DemoParagraph sx={{ mt: 1, maxWidth: "90%", mx: "auto" }}>
          <strong>Dialogist</strong> is a stateful dialog orchestration system for React that centralizes lifecycle,
          presentation, and control flow. This demo and docs are built with{" "}
          <Link href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
            Next.js
          </Link>{" "}
          and{" "}
          <Link href="https://mui.com" target="_blank" rel="noopener noreferrer">
            MUI
          </Link>
          .
        </DemoParagraph>
      </FlexBox>

      <Paper
        id="sandbox-info"
        elevation={1}
        sx={{
          p: 4,
          maxWidth: 600,
          width: "100%",
          textAlign: "center",
          backgroundColor: (t) => t.palette.background.paper,
          border: (t) => `1px solid ${t.palette.divider}`,
          cursor: "pointer",
          display: { xs: "none", md: "block" },
        }}
        role="button"
        aria-pressed={isFullscreen}
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={onKeyDown}
      >
        <FlexBox x="space-between" y="center" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Sandbox
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={isFullscreen}
                onChange={(event) => {
                  event.stopPropagation();
                  onToggle();
                }}
                onClick={(event) => event.stopPropagation()}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Fullscreen
              </Typography>
            }
            sx={{
              m: 0,
              "& .MuiFormControlLabel-label": {
                fontSize: "0.875rem",
              },
            }}
          />
        </FlexBox>
        <Typography variant="body1" color="text.secondary">
          In a real app, dialogs are rendered in fullscreen, but you can switch to windowed mode to explore and learn
          how Dialogist works.
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mt: 2,
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            ...(isFullscreen
              ? { "& rect": { fill: `color-mix(in srgb, currentColor 25%, transparent)` } }
              : {
                  "& rect:last-of-type": { fill: `color-mix(in srgb, currentColor 25%, transparent)` },
                }),
          }}
          aria-label={`Current mode: ${isFullscreen ? "fullscreen" : "windowed"}`}
        >
          {isFullscreen ? <LuMonitor aria-hidden size={24} /> : <LuMonitorStop aria-hidden size={24} />}
        </Typography>
      </Paper>
    </>
  );
});

export const Sandbox = () => {
  const { isFullscreen, toggleFullscreen, setSandboxContainer } = useDemoState();
  const sandboxRef = useRef<HTMLDivElement | null>(null);
  const [sandboxId, setSandboxId] = useState<string | null>(null);

  const handleToggle = useCallback(() => {
    toggleFullscreen();
  }, [toggleFullscreen]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleFullscreen();
      }
    },
    [toggleFullscreen],
  );

  useEffect(() => {
    if (sandboxRef.current && !sandboxId) {
      const element = sandboxRef.current;
      const id = element.id || `dialog-sandbox-${Math.random().toString(36).slice(2, 8)}`;
      element.id = id;
      setSandboxId(id);
      setSandboxContainer(element);
    }
  }, [sandboxId, setSandboxContainer]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const sandboxEl = sandboxRef.current;

    if (!sandboxId || !sandboxEl) {
      document.body.removeAttribute("data-dialog-sandbox-container");
      setSandboxContainer(null);
      return;
    }

    if (isFullscreen) {
      document.body.removeAttribute("data-dialog-sandbox-container");
      setSandboxContainer(null);
      return;
    }

    document.body.setAttribute("data-dialog-sandbox-container", sandboxId);
    setSandboxContainer(sandboxEl);

    return () => {
      document.body.removeAttribute("data-dialog-sandbox-container");
    };
  }, [sandboxId, isFullscreen, setSandboxContainer]);

  return (
    <FlexBox
      ref={sandboxRef}
      column
      x="center"
      y="center"
      sx={{
        height: "100%",
        p: 4,
        "& #sandbox-header, & #sandbox-info": {
          transform: { xs: "translateY(-4dvh)", lg: `translate(${SUBNAV_WIDTH / -2}px, -4dvh)` },
        },
        position: "relative",
        backgroundColor: (t) => t.palette.background.default,
        "& .MuiDialog-root, & .MuiBackdrop-root": {
          position: "absolute",
          inset: 0,
          borderRadius: 0,
        },
      }}
    >
      <SandboxMain isFullscreen={isFullscreen} onToggle={handleToggle} onKeyDown={handleKeyDown} />
      <DemoSubNav />
    </FlexBox>
  );
};
