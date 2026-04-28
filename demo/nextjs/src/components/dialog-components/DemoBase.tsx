"use client";

import { Dialog } from "@mui/material";
import type { BaseDialogProps } from "dialogist";
import { dialogistClasses } from "dialogist/classes";

import { RenderTracker, RenderTrackerWrapper } from "../common/RenderTracker";

export const DemoBase = ({ children, ...props }: BaseDialogProps) => {
  return (
    <Dialog
      {...props}
      slotProps={{
        paper: {
          sx: {
            overflow: "visible",
            // Inform scaffolding gradient of custom header/footer heights
            "--dialogist-statusbar-height": "32px",
            "--dialogist-footer-height": "32px",
            "& > :first-of-type": { borderTopLeftRadius: 1.5, borderTopRightRadius: 1.5 },
            "& > :last-of-type": { borderBottomLeftRadius: 1.5, borderBottomRightRadius: 1.5 },
          },
        },
      }}
      className={`${dialogistClasses.customBase} demo-base`}
    >
      <RenderTrackerWrapper sx={{ top: -20, right: 20 }}>
        <RenderTracker
          componentName="Dialog container"
          variant="dark"
          dependencies={[props.open]}
          showTimestamp={false}
          label="Dialog (base)"
        />
      </RenderTrackerWrapper>
      {children}
    </Dialog>
  );
}
