"use client";

import { Box, styled } from "@mui/material";
import { dialogistClasses } from "dialogist/classes";
import type { ReactNode } from "react";

import { RenderTracker, RenderTrackerWrapper } from "../common/RenderTracker";

const FooterContainer = styled(Box)(() => ({
  position: "relative",
}));

const FooterContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  borderTop: "1px solid rgba(0,0,0,0.1)",
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
}));

interface DemoFooterProps {
  content?: ReactNode | string;
  dialogKey?: string;
}

export const DemoFooter = ({ content, dialogKey }: DemoFooterProps) => {
  return (
    <FooterContainer className={`${dialogistClasses.customFooter} demo-footer`}>
      {typeof content === "string" ? (
        <FooterContent className={dialogistClasses.bottomCorners}>{content}</FooterContent>
      ) : (
        content
      )}
      <RenderTrackerWrapper>
        <RenderTracker
          componentName="Footer"
          variant="dark"
          dependencies={[typeof content, dialogKey]}
          showTimestamp={false}
          label="Footer"
        />
      </RenderTrackerWrapper>
    </FooterContainer>
  );
}
