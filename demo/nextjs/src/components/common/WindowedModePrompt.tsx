"use client";

import { Collapse, Switch, Typography } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import type { ReactNode } from "react";

import { RightArrowIcon } from "@/components/icons/Arrows";
import { useDemoState } from "@/contexts/DemoStateContext";

import { DemoCardPaper } from "./BaseDemoCard";

export const WINDOWED_MODE_PROMPT_MIN_HEIGHT = 36;
const COLLAPSE_MS = 100;
const DEFAULT_SWITCH_LABEL = "Switch to windowed mode to try";

export interface WindowedModePromptProps {
  children?: ReactNode;
  /**
   * Fullscreen prompt corner label. When there are `children`, windowed content is wrapped in
   * `DemoCardPaper` with this title (omit to leave windowed children unwrapped).
   */
  title?: string;
  mt?: number;
  my?: number;
  mb?: number;
  innerMargin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  switchLabel?: string;
}

const WindowedModeToggle = ({ label }: { label: string }) => {
  const { isFullscreen, toggleFullscreen } = useDemoState();
  return (
    <FlexBox component="span" x="center" y="center" gap={1} width="100%" minHeight={WINDOWED_MODE_PROMPT_MIN_HEIGHT}>
      <Typography variant="caption" color="text.secondary" component="span" sx={{ mr: 0.25 }}>
        {label}
      </Typography>
      <RightArrowIcon size={18} sx={{ color: "var(--demo-form-control-accent)" }} opacity={0.75} />
      <Switch size="small" checked={!isFullscreen} onChange={() => toggleFullscreen()} />
    </FlexBox>
  );
};

/** Fullscreen: card + toggle. Windowed: `children`, optionally inside DemoCardPaper when `title` is set. */
export const RequireWindowedMode = ({
  children,
  title,
  mt,
  my,
  mb,
  innerMargin,
  switchLabel = DEFAULT_SWITCH_LABEL,
}: WindowedModePromptProps) => {
  const { isFullscreen, isMobile } = useDemoState();
  const hasChildren = children != null && children !== false;

  const innerContent = (innerChildren: ReactNode = <WindowedModeToggle label={switchLabel} />) => (
    <DemoCardPaper
      title={title}
      mt={hasChildren ? 0 : mt}
      my={hasChildren ? 0 : my}
      mb={hasChildren ? 0 : mb}
      innerMargin={innerMargin}
    >
      {innerChildren}
    </DemoCardPaper>
  );

  if (isMobile) {
    return (
      <FlexBox column width="100%" sx={{ mt, my, mb }}>
        <DemoCardPaper mt={0} my={0} mb={0} innerMargin={innerMargin}>
          <Typography variant="caption" color="text.secondary" component="span">
            This demo works best with windowed mode on a larger screen. The buttons below still open dialogs in
            fullscreen.
          </Typography>
        </DemoCardPaper>
        {hasChildren && innerContent(children)}
      </FlexBox>
    );
  }

  if (!hasChildren) {
    return (
      <Collapse in={isFullscreen} timeout={COLLAPSE_MS}>
        {innerContent()}
      </Collapse>
    );
  }

  return (
    <FlexBox column width="100%" sx={{ mt, my, mb }}>
      <Collapse in={isFullscreen} timeout={COLLAPSE_MS}>
        {innerContent()}
      </Collapse>
      <Collapse in={!isFullscreen} timeout={COLLAPSE_MS}>
        {innerContent(children)}
      </Collapse>
    </FlexBox>
  );
};
