import type { KeyboardEvent, MouseEvent } from "react";
import { resolveActionOnClick, resolveHandler } from "../state/DialogHandlers";
import type {
  AlertDialogConfig,
  BaseDialogConfig,
  ConfirmDialogConfig,
  CustomDialogConfig,
  DialogActionProps,
  DialogActionsInput,
} from "../types";
import type { DialogCloseEvent } from "../types/callbacks";

export type DialogCloseHandler = (
  dialogKey: string,
  options: {
    cancelled?: boolean;
    preserveBackdrop?: boolean;
    actionEvent?: {
      action: DialogCloseEvent["action"];
      actionId?: string;
      buttonText?: string;
      nativeEvent?: MouseEvent | KeyboardEvent;
    };
    resolveValue?: unknown;
    reason?: import("../types").DialogCloseReason;
  },
) => void;

export type ConfigForActions =
  | (BaseDialogConfig & Partial<ConfirmDialogConfig> & Partial<AlertDialogConfig> & Partial<CustomDialogConfig>)
  | ConfirmDialogConfig
  | AlertDialogConfig
  | CustomDialogConfig;

const getConfigOkClick = (
  config: ConfigForActions,
): AlertDialogConfig["onOkClick"] | ConfirmDialogConfig["onOkClick"] =>
  (config as AlertDialogConfig).onOkClick ?? (config as ConfirmDialogConfig).onOkClick;

/**
 * Normalize actions input to groups. Flat [A,B,C] -> [[A,B,C]]. Nested [[A,B], C] -> [[A,B],[C]].
 * If any top-level element is an array, treat as grouped; otherwise flat.
 */
export const normalizeToGroups = (input: DialogActionsInput): DialogActionProps[][] => {
  if (!Array.isArray(input) || input.length === 0) return [];
  const hasNestedArray = input.some((el) => Array.isArray(el));
  if (!hasNestedArray) {
    return [input as DialogActionProps[]];
  }
  return (input as (DialogActionProps | DialogActionProps[])[]).map((slot) => (Array.isArray(slot) ? slot : [slot]));
};

/**
 * Action ids for alert and confirm dialogs.
 * - alert: one button, id "ok"
 * - confirm: two buttons, id "ok" (primary) and "cancel"
 * - custom: any action id other than "ok" or "cancel" (e.g. "draft", "save")
 */
const ALERT_CONFIRM_ACTION_IDS = new Set(["ok", "cancel"]);

/** When `id` is omitted on alert/confirm, infer built-in ids from layout (see {@link restrictActionsForType}). */
const inferBuiltInActionId = (
  action: DialogActionProps,
  indexInFlat: number,
  flatLength: number,
  dialogType: "alert" | "confirm",
): string | undefined => {
  if (action.id !== undefined) return action.id;
  if (dialogType === "alert") {
    return flatLength === 1 ? "ok" : undefined;
  }
  if (dialogType === "confirm" && flatLength === 2) {
    return indexInFlat === 0 ? "cancel" : "ok";
  }
  return undefined;
};

/**
 * Returns true if any action has an **explicit** id other than ok or cancel.
 * Omitted ids stay in built-in alert/confirm mode (ids inferred in {@link restrictActionsForType}).
 */
const hasCustomActionIds = (rawGroups: DialogActionProps[][]): boolean => {
  for (const group of rawGroups) {
    for (const a of group) {
      if (a.id !== undefined && !ALERT_CONFIRM_ACTION_IDS.has(a.id)) return true;
    }
  }
  return false;
}

/**
 * Filters actions for alert/confirm dialogs when all action ids are ok/cancel.
 * Alert: only id=ok. Confirm: cancel + ok.
 * Returns built-in actions when type is alert/confirm and no valid explicit actions.
 */
const restrictActionsForType = (
  config: ConfigForActions,
  rawGroups: DialogActionProps[][],
): DialogActionProps[][] | null => {
  const type = config.type;
  if (type !== "alert" && type !== "confirm") return null;

  const allowedIds = type === "alert" ? new Set(["ok"]) : new Set(["cancel", "ok"]);
  const flat = rawGroups.flat();
  const filtered: DialogActionProps[] = [];
  let flatIdx = 0;
  for (const group of rawGroups) {
    for (const a of group) {
      const inferred = inferBuiltInActionId(a, flatIdx, flat.length, type);
      flatIdx += 1;
      const id = a.id ?? inferred;
      if (id !== undefined && allowedIds.has(id)) filtered.push(a);
    }
  }

  if (filtered.length === 0) return null;

  if (type === "alert") {
    const okAction = filtered.find((a) => (a.id ?? "custom") === "ok") ?? filtered[0];
    return [[okAction]];
  }
  const cancelAction = filtered.find((a) => (a.id ?? "custom") === "cancel");
  const okAction = filtered.find((a) => (a.id ?? "custom") === "ok");
  const actions: DialogActionProps[] = [];
  if (cancelAction) actions.push(cancelAction);
  if (okAction) actions.push(okAction);
  return actions.length > 0 ? [actions] : null;
}

/**
 * Derives the effective action groups for a dialog.
 *
 * Three dialog types:
 * 1. alert — one button; user customizes via action id "ok"
 * 2. confirm — two buttons; user customizes via action ids "ok" and/or "cancel"
 * 3. custom — any action ids other than "ok" or "cancel"; all actions are rendered
 *
 * If config.actions contains any id other than ok/cancel, treat as custom.
 * Otherwise apply alert/confirm semantics. If no explicit actions, use built-in from type.
 */
export const deriveEffectiveActions = (
  config: ConfigForActions,
  dialogKey: string,
  dialogInternalId: string,
  onClose: DialogCloseHandler,
): DialogActionProps[][] => {
  const configActions = (config as BaseDialogConfig).actions;
  const actionsIsDefined = Array.isArray(configActions);
  const hasExplicitActions = actionsIsDefined && configActions.length > 0;

  // Explicitly empty array means "no actions at all" — hide the actions slot entirely
  if (actionsIsDefined && !hasExplicitActions) {
    return [];
  }

  if (hasExplicitActions) {
    const rawGroups = normalizeToGroups(configActions as DialogActionsInput);
    const type = config.type;

    // If any action has id other than ok/cancel, treat as custom: render all actions
    if (hasCustomActionIds(rawGroups)) {
      return rawGroups.map((group) => group.map((a) => hydrateAction(a, config, dialogKey, dialogInternalId, onClose)));
    }

    // All actions are ok/cancel only: apply alert or confirm semantics
    if (type === "alert" || type === "confirm") {
      const restricted = restrictActionsForType(config, rawGroups);
      if (restricted) {
        return restricted.map((group) =>
          group.map((a) => hydrateAction(a, config, dialogKey, dialogInternalId, onClose)),
        );
      }
      // Invalid/mismatched: fall through to built-in actions
    } else {
      return rawGroups.map((group) => group.map((a) => hydrateAction(a, config, dialogKey, dialogInternalId, onClose)));
    }
  }

  // Generate built-in actions from type (always one group)
  const type = config.type;
  let builtInActions: DialogActionProps[];
  if (type === "confirm") {
    const confirmConfig = config as ConfirmDialogConfig;
    const cancelLabel = confirmConfig.cancelLabel ?? "Cancel";
    const okLabel = confirmConfig.okLabel ?? "Confirm";
    builtInActions = [
      {
        id: "cancel",
        title: cancelLabel,
        resolveValue: false,
        preserveBackdrop: confirmConfig.preserveBackdropOnCancel,
        props: { variant: "outlined" as const },
      },
      {
        id: "ok",
        title: okLabel,
        resolveValue: true,
        preserveBackdrop: confirmConfig.preserveBackdropOnOk,
        props: { variant: "contained" as const, autoFocus: true },
      },
    ];
  } else if (type === "alert") {
    const alertConfig = config as AlertDialogConfig;
    builtInActions = [
      {
        id: "ok",
        title: alertConfig.okLabel ?? "OK",
        resolveValue: false,
        props: { variant: "contained" as const, autoFocus: true },
      },
    ];
  } else if (type === "custom") {
    builtInActions = [
      { id: "close", title: "Close", resolveValue: false, props: { variant: "contained" as const, autoFocus: true } },
    ];
  } else {
    builtInActions = [
      { id: "close", title: "Close", resolveValue: false, props: { variant: "contained" as const, autoFocus: true } },
    ];
  }
  return [builtInActions.map((a) => hydrateAction(a, config, dialogKey, dialogInternalId, onClose))];
};

/**
 * Ensures each action has a working onClick. If the action has resolveValue and no props.onClick,
 * injects an onClick that calls onClose with that resolveValue.
 */
const hydrateAction = (
  action: DialogActionProps,
  config: ConfigForActions,
  dialogKey: string,
  dialogInternalId: string,
  onClose: DialogCloseHandler,
): DialogActionProps => {
  const actionId = action.id ?? "custom";
  const propsRecord = action.props as Record<string, unknown> | undefined;
  const hasCustomOnClick = typeof propsRecord?.onClick === "function";

  if (hasCustomOnClick) {
    const fallback = propsRecord?.onClick as (e: MouseEvent | KeyboardEvent) => void;
    return {
      ...action,
      props: {
        ...action.props,
        onClick: (nativeEvent: MouseEvent | KeyboardEvent) => {
          const fn = resolveActionOnClick(dialogKey, dialogInternalId, actionId, fallback);
          fn(nativeEvent);
        },
      },
    };
  }

  const resolveValue = action.resolveValue;
  const buttonText = action.title ?? action.children ?? "";

  const onClick = (nativeEvent: MouseEvent | KeyboardEvent) => {
    const cancelled = actionId === "cancel";
    const closeEvent = {
      dialogKey,
      reason: "action" as const,
      ok: !cancelled,
      cancelled,
      action: actionIdToEventAction(actionId),
      actionId,
      buttonText: String(buttonText),
      nativeEvent,
    } as import("../types/callbacks").DialogActionEvent;
    const onCancelClick = resolveHandler(
      dialogKey,
      dialogInternalId,
      "onCancelClick",
      (config as ConfirmDialogConfig).onCancelClick,
    );
    const onOkClick = resolveHandler(dialogKey, dialogInternalId, "onOkClick", getConfigOkClick(config));
    if (actionId === "cancel" && onCancelClick) {
      onCancelClick(closeEvent);
    } else if (actionId === "ok" && onOkClick) {
      onOkClick(closeEvent);
    }
    // config.onClose is called from DialogProvider for all close paths

    const preserveBackdrop = action.preserveBackdrop;

    onClose(dialogKey, {
      cancelled,
      preserveBackdrop,
      actionEvent: {
        action: closeEvent.action,
        actionId: closeEvent.actionId,
        buttonText: closeEvent.buttonText,
        nativeEvent,
      },
      resolveValue: Object.hasOwn(action, "resolveValue") ? resolveValue : undefined,
      reason: "action",
    });
  };

  return {
    ...action,
    props: {
      ...action.props,
      onClick,
    },
  };
}

const actionIdToEventAction = (id: string): `${string}Clicked` => {
  return `${id}Clicked`;
}
