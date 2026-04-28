"use client";

import { Box, DialogActions, styled } from "@mui/material";
import { dialogistClasses } from "dialogist/classes";

import { RenderTracker, RenderTrackerWrapper } from "../common/RenderTracker";

const StyledActionsContainer = styled(Box)`
  position: relative;
`;

export const DemoActionsContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <StyledActionsContainer className={`${dialogistClasses.customActionsContainer} demo-actions-container`}>
      <DialogActions>{children}</DialogActions>
      <RenderTrackerWrapper>
        <RenderTracker
          componentName="Actions container"
          variant="dark"
          dependencies={[typeof children]}
          showTimestamp={false}
          label="Actions"
        />
      </RenderTrackerWrapper>
    </StyledActionsContainer>
  );
};
