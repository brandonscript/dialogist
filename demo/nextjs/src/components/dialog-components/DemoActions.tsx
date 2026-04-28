"use client";

import { Button as MuiButton } from "@mui/material";
import type { ActionsProps } from "dialogist";
import { dialogistClasses } from "dialogist/classes";

export const DemoActions = ({ actions, dialogKey, ButtonComponent, ActionComponents }: ActionsProps) => {
  return (
    <div className={dialogistClasses.actions}>
      {actions.map((action, index) => {
        // Use specific component for this action index if provided
        const ActionComponent = ActionComponents?.[index];
        // Otherwise use common ButtonComponent or fall back to MuiButton
        const Component = ActionComponent || ButtonComponent || MuiButton;

        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: demo only, ok
          <Component {...action.props} key={`${dialogKey}-action-${index}`}>
            {action.children || action.title}
          </Component>
        );
      })}
    </div>
  );
};
