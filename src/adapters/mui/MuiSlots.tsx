"use client";

import {
  Box,
  Button,
  DialogActions as MuiDialogActions,
  DialogContent as MuiDialogContent,
  DialogTitle as MuiDialogTitle,
  Typography,
} from "@mui/material";
import type { CSSProperties } from "react";

import { dialogistClasses } from "../../classes";
import type {
  ActionsProps,
  DialogActionProps,
  DialogActionsContainerSlotProps,
  DialogContentSlotProps,
  DialogTitleSlotProps,
  FooterProps,
  StatusBarProps,
} from "../../types";
import { classNames } from "../../utils/classNames";

const ACTIONS_ALIGN_TO_CSS: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly",
};

const getActionKeyPart = (action: DialogActionProps): string =>
  action.id ?? action.title ?? (typeof action.children === "string" ? action.children : "anonymous");

const resolveSpacing = (value: number | string | undefined, fallback: number): string => {
  const v = value === undefined ? fallback : value;
  return typeof v === "number" ? `${v * 8}px` : v;
};

export const MuiTitle = ({ id, className, children, ...rest }: DialogTitleSlotProps) => (
  <MuiDialogTitle {...(rest as Record<string, unknown>)} id={id} className={classNames(dialogistClasses.title, className)}>
    {children}
  </MuiDialogTitle>
);
MuiTitle.displayName = "MuiTitle";

export const MuiContent = ({ id, className, style, children, ...rest }: DialogContentSlotProps) => (
  <MuiDialogContent
    {...(rest as Record<string, unknown>)}
    id={id}
    className={classNames(dialogistClasses.content, className)}
    style={style}
  >
    {children}
  </MuiDialogContent>
);
MuiContent.displayName = "MuiContent";

export const MuiActionsContainer = ({
  className,
  children,
  ...rest
}: DialogActionsContainerSlotProps) => (
  <MuiDialogActions
    {...(rest as Record<string, unknown>)}
    className={classNames(dialogistClasses.actionsContainer, className)}
  >
    {children}
  </MuiDialogActions>
);
MuiActionsContainer.displayName = "MuiActionsContainer";

/**
 * MUI-backed `Actions` slot. Renders one or more action groups using MUI Button.
 * Mirrors the previous `DefaultActions` behavior from before the adapter split.
 */
export const MuiActions = ({ actionGroups, dialogKey, actionsStyle }: ActionsProps) => {
  const hasMultipleGroups = actionGroups.length > 1;
  const hasSingleGroup = actionGroups.length === 1;
  const justifyFromAlign = actionsStyle?.align ? ACTIONS_ALIGN_TO_CSS[actionsStyle.align] : undefined;
  const justifyContent = justifyFromAlign ?? "center";

  const innerGapRaw = hasMultipleGroups
    ? actionsStyle?.intraGroupGap !== undefined
      ? actionsStyle.intraGroupGap
      : 1
    : (actionsStyle?.gap ?? 1);

  const groupBoxes = actionGroups.map((group) => (
    <div
      key={`${dialogKey}-group-${group.map(getActionKeyPart).join("-")}`}
      className={dialogistClasses.actionsGroup}
      data-dialogist-layout={hasSingleGroup ? "single" : undefined}
      style={
        {
          "--dialogist-actionsGroup-gap": resolveSpacing(innerGapRaw, 1),
          "--dialogist-actionsGroup-justify": hasMultipleGroups ? "flex-start" : justifyContent,
        } as CSSProperties
      }
    >
      {group.map((action) => (
        <Button {...(action.props as React.ComponentProps<typeof Button>)} key={`${dialogKey}-action-${getActionKeyPart(action)}`}>
          {action.children || action.title}
        </Button>
      ))}
    </div>
  ));

  if (hasMultipleGroups) {
    return (
      <div
        className={dialogistClasses.actionsRow}
        style={
          {
            "--dialogist-actionsRow-gap": resolveSpacing(actionsStyle?.gap, 1),
            "--dialogist-actionsRow-justify": justifyContent,
          } as CSSProperties
        }
      >
        {groupBoxes}
      </div>
    );
  }

  return <>{groupBoxes}</>;
};
MuiActions.displayName = "MuiActions";

export const MuiStatusBar = ({ className, content, ...rest }: StatusBarProps) => {
  const passthrough = rest as Record<string, unknown>;
  delete passthrough.dialogKey;
  delete passthrough.dialogType;
  return (
    <Box {...passthrough} className={classNames(dialogistClasses.statusBar, dialogistClasses.topCorners, className)}>
      <Typography variant="caption" color="var(--dialogist-statusBar-text)">
        {content}
      </Typography>
    </Box>
  );
};
MuiStatusBar.displayName = "MuiStatusBar";

export const MuiFooter = ({ className, content, ...rest }: FooterProps) => {
  const passthrough = rest as Record<string, unknown>;
  delete passthrough.dialogKey;
  return (
    <Box {...passthrough} className={classNames(dialogistClasses.footer, dialogistClasses.bottomCorners, className)}>
      <Typography variant="caption" color="var(--dialogist-footer-text)">
        {content}
      </Typography>
    </Box>
  );
};
MuiFooter.displayName = "MuiFooter";
