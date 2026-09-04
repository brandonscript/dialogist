"use client";

/**
 * Demo-specific Actions slot for the Base UI adapter.
 *
 * `BaseUiActions` in the library uses inline styles on its buttons so they render
 * *something* without requiring a stylesheet. Inline styles can't be overridden by
 * external CSS rules, so to match the demo's MUI button look we use a custom slot
 * component here instead of CSS overrides.
 *
 * This component is wired in via `slotsForAdapter` in `ClientProviders.tsx` when
 * the "base-ui" adapter is active. The library's `BaseUiActions` is left unchanged
 * and continues to ship its own opinionated defaults.
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * HOW TO COPY THIS INTO YOUR OWN APP
 * ──────────────────────────────────────────────────────────────────────────────
 * Register this component (or a variant of it) as the `Actions` slot:
 *
 *   <DialogProvider slots={{ ...baseUiSlots, Actions: MyBaseUiActions }}>
 *
 * Adjust the inline styles below to match your app's design system.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { Button } from "@base-ui-components/react/button";
import type { CSSProperties } from "react";

import { dialogistClasses } from "dialogist/classes";
import type { ActionsProps, DialogActionProps } from "dialogist";

const ACTIONS_ALIGN_TO_CSS: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly",
};

/**
 * Base button styles matched to the demo's MUI small button theme:
 * size="small" variant: height 32px, padding "0 12px", fontSize 0.85rem
 * styleOverrides.root: textTransform none, fontWeight 450, lineHeight 1, letterSpacing 0
 */
const BASE_BUTTON_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 4,
  height: 32,
  padding: "0 12px",
  fontSize: "0.85rem",
  fontWeight: 450,
  lineHeight: 1,
  letterSpacing: 0,
  textTransform: "none",
  cursor: "pointer",
  border: "none",
  outline: "none",
  minWidth: 60,
  whiteSpace: "nowrap",
  transition: "background-color 0.15s ease, border-color 0.15s ease",
  fontFamily: "var(--dialogist-font-family, inherit)",
};

/** halfSoftShadows[2] from demo/nextjs/src/utils/shadows.ts — matches MUI button elevation. */
const BUTTON_SHADOW =
  "0px 0.7px 1.4px -0.7px rgba(0,0,0,0.025), 0px 1.4px 1.4px -1.4px rgba(0,0,0,0.04), 0px 0.7px 3.5px 0px rgba(0,0,0,0.03)";

/**
 * Contained (primary) button: filled with the dialog's primary color.
 * Uses CSS variables set by ThemeVarsInjector → same palette as MUI dialogs.
 */
const PRIMARY_STYLE: CSSProperties = {
  ...BASE_BUTTON_STYLE,
  backgroundColor: "var(--dialogist-primary-main, #1976d2)",
  color: "var(--dialogist-primary-contrastText, #ffffff)",
  boxShadow: BUTTON_SHADOW,
};

/**
 * Outlined button: transparent background with a darker accessible text/border
 * color (--dialogist-primary-dark) to match MUI's accessible textColor derivation.
 * box-sizing: border-box ensures the 1px border is included in the 32px height.
 */
const OUTLINED_STYLE: CSSProperties = {
  ...BASE_BUTTON_STYLE,
  boxSizing: "border-box",
  backgroundColor: "color-mix(in srgb, var(--dialogist-primary-main, #1976d2) 3%, transparent)",
  color: "var(--dialogist-primary-dark, #1976d2)",
  border: "1px solid var(--dialogist-primary-dark, #1976d2)",
  boxShadow: BUTTON_SHADOW,
};

const BASE_BUTTON_DENYLIST = new Set(["variant", "color", "sx"]);

const filterProps = (props: Record<string, unknown> | undefined): Record<string, unknown> => {
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

const DemoBaseUiActionButton = ({ action, dialogKey }: { action: DialogActionProps; dialogKey: string }) => {
  const safeProps = filterProps(action.props as Record<string, unknown> | undefined);
  const isOutlined = (action.props as Record<string, unknown> | undefined)?.variant === "outlined";
  const buttonStyle: CSSProperties = {
    ...(isOutlined ? OUTLINED_STYLE : PRIMARY_STYLE),
    ...(safeProps.style as CSSProperties | undefined),
  };

  return (
    <Button
      {...(safeProps as React.ComponentProps<typeof Button>)}
      key={`${dialogKey}-action-${getActionKeyPart(action)}`}
      className={action.className as string | undefined}
      style={buttonStyle}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(action.children as any) || action.title}
    </Button>
  );
};

export const DemoBaseUiActions = ({ actionGroups, dialogKey, actionsStyle }: ActionsProps) => {
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
        <DemoBaseUiActionButton
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

DemoBaseUiActions.displayName = "DemoBaseUiActions";
