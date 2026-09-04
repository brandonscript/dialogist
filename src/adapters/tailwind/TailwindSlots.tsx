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

const TW_TITLE = "px-6 pt-6 pb-2 text-lg font-semibold text-foreground text-center";
const TW_CONTENT = "px-6 py-2 text-sm text-muted-foreground";
const TW_ACTIONS_CONTAINER = "flex flex-col-reverse gap-2 px-6 py-4 sm:flex-row sm:justify-end";
const TW_BUTTON_PRIMARY =
  "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
const TW_BUTTON_OUTLINE =
  "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
const TW_STATUSBAR = "px-6 py-2 text-xs font-semibold text-foreground bg-primary/10";
const TW_FOOTER = "border-t px-6 py-2 text-xs text-muted-foreground";

const ACTIONS_ALIGN_TO_CSS: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly",
};

const TW_BUTTON_DENYLIST = new Set(["variant", "color", "sx"]);
const filterTwButtonProps = (props: Record<string, unknown> | undefined): Record<string, unknown> => {
  if (!props) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (!TW_BUTTON_DENYLIST.has(k)) out[k] = v;
  }
  return out;
};

const getActionKeyPart = (action: DialogActionProps): string =>
  action.id ?? action.title ?? (typeof action.children === "string" ? action.children : "anonymous");

const variantToClass = (variant: unknown): string =>
  variant === "outlined" ? TW_BUTTON_OUTLINE : TW_BUTTON_PRIMARY;

export const TailwindTitle = ({ id, className, children, ...rest }: DialogTitleSlotProps) => (
  <div
    {...(rest as Record<string, unknown>)}
    id={id}
    role="heading"
    aria-level={2}
    className={classNames(TW_TITLE, dialogistClasses.title, className)}
  >
    {children as ReactNode}
  </div>
);
TailwindTitle.displayName = "TailwindTitle";

export const TailwindContent = ({ id, className, style, children, ...rest }: DialogContentSlotProps) => (
  <div
    {...(rest as Record<string, unknown>)}
    id={id}
    className={classNames(TW_CONTENT, dialogistClasses.content, className)}
    style={style}
  >
    {children as ReactNode}
  </div>
);
TailwindContent.displayName = "TailwindContent";

export const TailwindActionsContainer = ({
  className,
  style,
  children,
  ...rest
}: DialogActionsContainerSlotProps) => {
  const passthrough = rest as Record<string, unknown>;
  delete passthrough.sx;
  return (
    <div
      {...passthrough}
      className={classNames(TW_ACTIONS_CONTAINER, dialogistClasses.actionsContainer, className)}
      style={style}
    >
      {children as ReactNode}
    </div>
  );
};
TailwindActionsContainer.displayName = "TailwindActionsContainer";

const TailwindActionButton = ({ action, dialogKey }: { action: DialogActionProps; dialogKey: string }) => {
  const safeProps = filterTwButtonProps(action.props as Record<string, unknown> | undefined);
  const variantClass = variantToClass((action.props as Record<string, unknown> | undefined)?.variant);
  return (
    <button
      type="button"
      {...(safeProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      key={`${dialogKey}-action-${getActionKeyPart(action)}`}
      className={classNames(variantClass, action.className, safeProps.className as string | undefined)}
    >
      {action.children || action.title}
    </button>
  );
};

export const TailwindActions = ({ actionGroups, dialogKey, actionsStyle }: ActionsProps) => {
  const hasMultipleGroups = actionGroups.length > 1;
  const hasSingleGroup = actionGroups.length === 1;
  const justifyFromAlign = actionsStyle?.align ? ACTIONS_ALIGN_TO_CSS[actionsStyle.align] : undefined;
  const justifyContent = justifyFromAlign ?? "center";

  const groupBoxes = actionGroups.map((group) => (
    <div
      key={`${dialogKey}-group-${group.map(getActionKeyPart).join("-")}`}
      className={classNames(dialogistClasses.actionsGroup, "flex gap-2")}
      data-dialogist-layout={hasSingleGroup ? "single" : undefined}
      style={
        {
          "--dialogist-actionsGroup-justify": hasMultipleGroups ? "flex-start" : justifyContent,
        } as CSSProperties
      }
    >
      {group.map((action) => (
        <TailwindActionButton
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
        className={classNames(dialogistClasses.actionsRow, "flex w-full flex-row flex-wrap items-center gap-2")}
        style={
          {
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
TailwindActions.displayName = "TailwindActions";

export const TailwindStatusBar = ({ className, content, ...rest }: StatusBarProps) => {
  const passthrough = rest as Record<string, unknown>;
  delete passthrough.dialogKey;
  delete passthrough.dialogType;
  return (
    <div {...passthrough} className={classNames(TW_STATUSBAR, dialogistClasses.statusBar, className)}>
      {content}
    </div>
  );
};
TailwindStatusBar.displayName = "TailwindStatusBar";

export const TailwindFooter = ({ className, content, ...rest }: FooterProps) => {
  const passthrough = rest as Record<string, unknown>;
  delete passthrough.dialogKey;
  return (
    <div {...passthrough} className={classNames(TW_FOOTER, dialogistClasses.footer, className)}>
      {content}
    </div>
  );
};
TailwindFooter.displayName = "TailwindFooter";
