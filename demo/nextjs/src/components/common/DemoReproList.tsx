"use client";

import { Collapse, Fade, List, ListItemText, styled } from "@mui/material";
import type { ListOwnProps } from "@mui/material/List";

import { useDemoState } from "@/contexts/DemoStateContext";

import { DemoCardPaper } from "./BaseDemoCard";
import { RequireWindowedMode, WINDOWED_MODE_PROMPT_MIN_HEIGHT } from "./WindowedModePrompt";

type StyledListProps = ListOwnProps & { component: "ol" | "ul"; isFullscreen?: boolean };

const StyledList = styled(List, { shouldForwardProp: (prop) => prop !== "isFullscreen" })<StyledListProps>(
  ({ isFullscreen, theme }) =>
    theme.unstable_sx({
      listStyleType: isFullscreen ? "none" : "decimal",
      pl: 2,
      minHeight: isFullscreen ? WINDOWED_MODE_PROMPT_MIN_HEIGHT : 96,
      display: "inline-flex",
      flexDirection: "column",
      justifyContent: "center",
      transition: (t) => t.transitions.create(["height", "min-height", "max-height"], { duration: 150 }),
      "& > li": {
        display: "list-item",
        willChange: "height",
        flex: "0 1 auto",
      },
    }),
);

interface DemoReproListProps {
  title?: string;
  requiresWindowedMode?: boolean;
  steps: React.ReactNode[];
  my?: number;
}

export const DemoReproList = ({ title = "Try it out", requiresWindowedMode, steps, my = 0 }: DemoReproListProps) => {
  const { isFullscreen } = useDemoState();

  const stepsList = (listFullscreen: boolean) => (
    <StyledList component="ol" isFullscreen={listFullscreen} dense disablePadding>
      {steps.map((step, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static ordered steps, no unique identifier available
        <Fade key={`step-fade-${index}`} in={!isFullscreen} timeout={1500}>
          <ListItemText
            slotProps={{
              primary: { variant: "body2", component: "span", color: "text.secondary" },
              root: { component: "li" },
            }}
            primary={step}
          />
        </Fade>
      ))}
    </StyledList>
  );

  if (requiresWindowedMode) {
    return (
      <RequireWindowedMode title={title} my={my}>
        {stepsList(false)}
      </RequireWindowedMode>
    );
  }

  return (
    <DemoCardPaper title={title} my={my}>
      <Collapse
        in={!isFullscreen}
        timeout={100}
        collapsedSize={WINDOWED_MODE_PROMPT_MIN_HEIGHT}
        sx={{ transitionTimingFunction: (t) => t.transitions.easing.easeOut }}
      >
        {stepsList(isFullscreen)}
      </Collapse>
    </DemoCardPaper>
  );
}
