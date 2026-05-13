"use client";

import type { CSSProperties, ReactNode } from "react";

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

/**
 * Strip MUI-specific props that should not be forwarded to a plain DOM `<button>`.
 * Adapter slot components keep these (e.g. MUI Button reads `variant`/`color`).
 */
const DOM_BUTTON_DENYLIST = new Set(["variant", "color", "sx"]);

const filterDomButtonProps = (props: Record<string, unknown> | undefined): Record<string, unknown> => {
  if (!props) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (!DOM_BUTTON_DENYLIST.has(k)) out[k] = v;
  }
  return out;
};

export const HeadlessTitle = ({ id, className, children, ...rest }: DialogTitleSlotProps) => (
  <div
    {...(rest as Record<string, unknown>)}
    id={id}
    className={classNames(dialogistClasses.title, className)}
    role="heading"
    aria-level={2}
  >
    {children as ReactNode}
  </div>
);
HeadlessTitle.displayName = "HeadlessTitle";

export const HeadlessContent = ({ id, className, style, children, ...rest }: DialogContentSlotProps) => {
  const passthrough = rest as Record<string, unknown>;
  return (
    <div
      {...passthrough}
      id={id}
      className={classNames(dialogistClasses.content, className)}
      style={style}
    >
      {children as ReactNode}
    </div>
  );
};
HeadlessContent.displayName = "HeadlessContent";

export const HeadlessActionsContainer = ({
  className,
  style,
  children,
  ...rest
}: DialogActionsContainerSlotProps & { style?: CSSProperties; className?: string }) => {
  const passthrough = rest as Record<string, unknown>;
  // Drop MUI's `sx` if a consumer passed it via slotProps.actionsContainer; the headless
  // container is a plain `<div>` and would emit React unknown-attribute warnings.
  delete passthrough.sx;
  return (
    <div {...passthrough} className={classNames(dialogistClasses.actionsContainer, className)} style={style}>
      {children as ReactNode}
    </div>
  );
};
HeadlessActionsContainer.displayName = "HeadlessActionsContainer";

const getActionKeyPart = (action: DialogActionProps): string =>
  action.id ?? action.title ?? (typeof action.children === "string" ? action.children : "anonymous");

const ACTIONS_ALIGN_TO_CSS: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly",
};

const HeadlessActionButton = ({ action, dialogKey }: { action: DialogActionProps; dialogKey: string }) => {
  const safeProps = filterDomButtonProps(action.props as Record<string, unknown> | undefined);
  return (
    <button
      type="button"
      {...(safeProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      key={`${dialogKey}-action-${getActionKeyPart(action)}`}
      className={classNames(action.className, safeProps.className as string | undefined)}
    >
      {action.children || action.title}
    </button>
  );
};

/**
 * Headless equivalent of the previous MUI-based `DefaultActions`. Renders one or more
 * action groups using plain `<button>` elements and the same row/group CSS classes the
 * theme expects.
 */
export const HeadlessActions = ({ actionGroups, dialogKey, actionsStyle }: ActionsProps) => {
  const hasMultipleGroups = actionGroups.length > 1;
  const justifyFromAlign = actionsStyle?.align ? ACTIONS_ALIGN_TO_CSS[actionsStyle.align] : undefined;
  const hasSingleGroup = actionGroups.length === 1;
  const justifyContent = justifyFromAlign ?? "center";

  const innerGapRaw = hasMultipleGroups
    ? actionsStyle?.intraGroupGap !== undefined
      ? actionsStyle.intraGroupGap
      : 1
    : (actionsStyle?.gap ?? 1);

  const resolveGap = (value: number | string | undefined, fallback: number): string => {
    const v = value === undefined ? fallback : value;
    return typeof v === "number" ? `${v * 8}px` : v;
  };

  const groupBoxes = actionGroups.map((group) => (
    <div
      key={`${dialogKey}-group-${group.map(getActionKeyPart).join("-")}`}
      className={dialogistClasses.actionsGroup}
      data-dialogist-layout={hasSingleGroup ? "single" : undefined}
      style={
        {
          "--dialogist-actionsGroup-gap": resolveGap(innerGapRaw, 1),
          "--dialogist-actionsGroup-justify": hasMultipleGroups ? "flex-start" : justifyContent,
        } as CSSProperties
      }
    >
      {group.map((action) => (
        <HeadlessActionButton
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
            "--dialogist-actionsRow-gap": resolveGap(actionsStyle?.gap, 1),
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
HeadlessActions.displayName = "HeadlessActions";

export const HeadlessStatusBar = ({ className, content, ...rest }: StatusBarProps) => {
  const passthrough = rest as Record<string, unknown>;
  delete passthrough.dialogKey;
  delete passthrough.dialogType;
  return (
    <div {...passthrough} className={classNames(dialogistClasses.statusBar, className)}>
      <span style={{ fontSize: "var(--dialogist-statusBar-font-size)", color: "var(--dialogist-statusBar-text)" }}>
        {content}
      </span>
    </div>
  );
};
HeadlessStatusBar.displayName = "HeadlessStatusBar";

export const HeadlessFooter = ({ className, content, ...rest }: FooterProps) => {
  const passthrough = rest as Record<string, unknown>;
  delete passthrough.dialogKey;
  return (
    <div {...passthrough} className={classNames(dialogistClasses.footer, className)}>
      <span style={{ fontSize: "var(--dialogist-footer-font-size)", color: "var(--dialogist-footer-text)" }}>
        {content}
      </span>
    </div>
  );
};
HeadlessFooter.displayName = "HeadlessFooter";
