"use client";

import { Dialog } from "@base-ui-components/react/dialog";
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

const ACTIONS_ALIGN_TO_CSS: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
  "space-around": "space-around",
  "space-evenly": "space-evenly",
};

const SHADCN_TITLE_CLASS = "text-lg font-semibold leading-none tracking-tight";
const SHADCN_CONTENT_CLASS = "text-sm text-muted-foreground";
const SHADCN_ACTIONS_CONTAINER_CLASS = "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2";
const SHADCN_BUTTON_PRIMARY_CLASS =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2";
const SHADCN_BUTTON_OUTLINE_CLASS =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2";

const getActionKeyPart = (action: DialogActionProps): string =>
  action.id ?? action.title ?? (typeof action.children === "string" ? action.children : "anonymous");

/** Map the action `props.variant` field (set by `dialogActions.ts` for built-in actions) onto a shadcn-style class. */
const variantToClass = (variant: unknown, fallback = SHADCN_BUTTON_PRIMARY_CLASS): string => {
  if (variant === "outlined") return SHADCN_BUTTON_OUTLINE_CLASS;
  return fallback;
};

const SHADCN_BUTTON_DENYLIST = new Set(["variant", "color", "sx"]);
const filterShadcnButtonProps = (props: Record<string, unknown> | undefined): Record<string, unknown> => {
  if (!props) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(props)) {
    if (!SHADCN_BUTTON_DENYLIST.has(k)) out[k] = v;
  }
  return out;
};

export const ShadcnTitle = ({ id, className, children, ...rest }: DialogTitleSlotProps) => (
  <Dialog.Title
    {...(rest as Record<string, unknown>)}
    id={id}
    className={classNames(SHADCN_TITLE_CLASS, dialogistClasses.title, className)}
  >
    {children}
  </Dialog.Title>
);
ShadcnTitle.displayName = "ShadcnTitle";

export const ShadcnContent = ({ id, className, style, children, ...rest }: DialogContentSlotProps) => (
  <Dialog.Description
    {...(rest as Record<string, unknown>)}
    id={id}
    className={classNames(SHADCN_CONTENT_CLASS, dialogistClasses.content, className)}
    style={style}
    render={(props) => <div {...props} />}
  >
    {children}
  </Dialog.Description>
);
ShadcnContent.displayName = "ShadcnContent";

export const ShadcnActionsContainer = ({
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
      className={classNames(SHADCN_ACTIONS_CONTAINER_CLASS, dialogistClasses.actionsContainer, className)}
      style={style}
    >
      {children as ReactNode}
    </div>
  );
};
ShadcnActionsContainer.displayName = "ShadcnActionsContainer";

const ShadcnActionButton = ({ action, dialogKey }: { action: DialogActionProps; dialogKey: string }) => {
  const safeProps = filterShadcnButtonProps(action.props as Record<string, unknown> | undefined);
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

export const ShadcnActions = ({ actionGroups, dialogKey, actionsStyle }: ActionsProps) => {
  const hasMultipleGroups = actionGroups.length > 1;
  const hasSingleGroup = actionGroups.length === 1;
  const justifyFromAlign = actionsStyle?.align ? ACTIONS_ALIGN_TO_CSS[actionsStyle.align] : undefined;
  const justifyContent = justifyFromAlign ?? "flex-end";

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
        <ShadcnActionButton
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
ShadcnActions.displayName = "ShadcnActions";

export const ShadcnStatusBar = ({ className, content, ...rest }: StatusBarProps) => {
  const passthrough = rest as Record<string, unknown>;
  delete passthrough.dialogKey;
  delete passthrough.dialogType;
  return (
    <div
      {...passthrough}
      className={classNames(
        dialogistClasses.statusBar,
        "px-4 py-2 text-xs font-semibold text-foreground",
        className,
      )}
    >
      {content}
    </div>
  );
};
ShadcnStatusBar.displayName = "ShadcnStatusBar";

export const ShadcnFooter = ({ className, content, ...rest }: FooterProps) => {
  const passthrough = rest as Record<string, unknown>;
  delete passthrough.dialogKey;
  return (
    <div
      {...passthrough}
      className={classNames(
        dialogistClasses.footer,
        "border-t px-4 py-2 text-xs text-muted-foreground",
        className,
      )}
    >
      {content}
    </div>
  );
};
ShadcnFooter.displayName = "ShadcnFooter";
