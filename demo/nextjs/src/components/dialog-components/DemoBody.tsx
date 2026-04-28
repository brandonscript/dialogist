"use client";

import { Box, DialogContent, styled } from "@mui/material";
import { dialogistClasses } from "dialogist/classes";

import { RenderTracker, RenderTrackerWrapper } from "../common/RenderTracker";

const BodyContainer = styled(Box)`
  position: relative;
`;

export const DemoBody = ({ children }: React.PropsWithChildren) => {
  return (
    <BodyContainer className={`${dialogistClasses.customContent} demo-body`}>
      <DialogContent>{children}</DialogContent>
      <RenderTrackerWrapper>
        <RenderTracker
          componentName="Dialog content"
          variant="dark"
          dependencies={[typeof children]}
          showTimestamp={false}
          label="Body"
        />
      </RenderTrackerWrapper>
    </BodyContainer>
  );
}
