"use client";

import { Button } from "@base-ui-components/react/button";
import type { CSSProperties } from "react";

import { dialogistClasses } from "../../classes";
import type { ActionsProps, DialogActionProps } from "../../types";
import { classNames } from "../../utils/classNames";

const ACTIONS_ALIGN_TO_CSS: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly",
};

const BASE_BUTTON_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
  padding: "6px 16px",
  fontSize: "0.875rem",
  fontWeight: 500,
  lineHeight: 1.75,
  letterSpacing: "0.02857em",
  cursor: "pointer",
  border: "none",
  outline: "none",
  transition: "background-color 150ms ease, opacity 150ms ease",
  fontFamily: "var(--dialogist-font-family, inherit)",
};

const PRIMARY_STYLE: CSSProperties = {
  ...BASE_BUTTON_STYLE,
  backgroundColor: "var(--dialogist-primary-main, #1976d2)",
  color: "var(--dialogist-primary-contrastText, #ffffff)",
};

const OUTLINED_STYLE: CSSProperties = {
  ...BASE_BUTTON_STYLE,
  backgroundColor: "transparent",
  color: "var(--dialogist-primary-main, #1976d2)",
  border: "1px solid var(--dialogist-primary-main, #1976d2)",
};

const BASE_BUTTON_DENYLIST = new Set(["variant", "color", "sx"]);

const filterBaseUiButtonProps = (props: Record<string, unknown> | undefined): Record<string, unknown> => {
  if (!props) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (!BASE_BUTTON_DENYLIST.has(k)) out[k] = v;
  }
  return out;
};

const getActionKeyPart = (action: DialogActionProps): string =>
  action.id ?? action.title ?? (typeof action.children === "string" ? action.children : "anonymous");

const resolveSpacing = (value: number | string | undefined, fallback: number): string => {
  const v = value === undefined ? fallback : value;
  return typeof v === "number" ? `${v * 8}px` : v;
};

const BaseUiActionButton = ({ action, dialogKey }: { action: DialogActionProps; dialogKey: string }) => {
  const safeProps = filterBaseUiButtonProps(action.props as Record<string, unknown> | undefined);
  const isOutlined = (action.props as Record<string, unknown> | undefined)?.variant === "outlined";
  const buttonStyle: CSSProperties = {
    ...(isOutlined ? OUTLINED_STYLE : PRIMARY_STYLE),
    ...(safeProps.style as CSSProperties | undefined),
  };

  return (
    <Button
      {...(safeProps as React.ComponentProps<typeof Button>)}
      key={`${dialogKey}-action-${getActionKeyPart(action)}`}
      className={classNames(action.className, safeProps.className as string | undefined)}
      style={buttonStyle}
    >
      {action.children || action.title}
    </Button>
  );
};

/**
 * Base UI-backed `Actions` slot. Uses `@base-ui-components/react/button` (`Button`) for
 * accessible button semantics, styled with Dialogist CSS variables so the buttons
 * automatically reflect the active adapter theme without requiring Tailwind.
 *
 * Mirrors MUI's `MuiActions` layout (row/group) using the same CSS class structure.
 */
export const BaseUiActions = ({ actionGroups, dialogKey, actionsStyle }: ActionsProps) => {
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
        <BaseUiActionButton
          action={action}
          dialogKey={dialogKey}
          key={`${dialogKey}-button-${getActionKeyPart(action)}`}
        />
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

BaseUiActions.displayName = "BaseUiActions";
