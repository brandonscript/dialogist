"use client";

import { Box, DialogTitle } from "@mui/material";
import { dialogistClasses } from "dialogist/classes";

import { styledSx } from "../../utils/styledSx";
import { RenderTracker, RenderTrackerWrapper } from "../common/RenderTracker";

const TitleContainer = styledSx(Box)({
  position: "relative",
});

const StyledDialogTitle = styledSx(DialogTitle)({
  // Add any custom styling here using sx syntax
  // Example: p: 2, color: 'primary.main', etc.
});

export const DemoTitle = ({ children }: React.PropsWithChildren) => {
  return (
    <TitleContainer className={`${dialogistClasses.customTitle} demo-title`}>
      <StyledDialogTitle>{children}</StyledDialogTitle>
      <RenderTrackerWrapper>
        <RenderTracker
          componentName="Dialog title"
          variant="dark"
          dependencies={[typeof children]}
          showTimestamp={false}
          label="Title"
        />
      </RenderTrackerWrapper>
    </TitleContainer>
  );
}
