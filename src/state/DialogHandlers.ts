"use client";

import type { KeyboardEvent, MouseEvent } from "react";

import type {
  AlertDialogConfig,
  BaseDialogConfig,
  ConfirmDialogConfig,
  DialogActionProps,
  DialogActionsInput,
  DialogOpenConfig,
  DialogStoredConfig,
} from "../types";

const rowKey = (dialogKey: string, internalId: string) => `${dialogKey}\0${internalId}`;

type DialogActionClickHandler = (e: MouseEvent | KeyboardEvent) => void;

/** Reactive overrides merged into the per-open handler store (see {@link seedDialogHandlers}). */
export type ReactiveDialogHandlers = Partial<
  Pick<BaseDialogConfig, "canClose" | "onClose" | "onConflict"> &
    Pick<ConfirmDialogConfig, "onOkClick" | "onCancelClick">
> & {
  /** Custom per-action `props.onClick` handlers keyed by action id. */
  actionHandlers?: Record<string, DialogActionClickHandler>;
};

export type DialogHandlersSnapshot = ReactiveDialogHandlers & {
  internalId: string;
  ownerToken: symbol;
};

type StoreRow = {
  key: string;
  internalId: string;
  /** When `open()` omitted {@link BaseDialogConfig.ownerToken}, first successful merge claims the owner. */
  owner: symbol | undefined;
  reactive: ReactiveDialogHandlers;
};

const store = new Map<string, StoreRow>();

const flattenActionsInput = (input: DialogActionsInput | undefined): DialogActionProps[] => {
  if (!Array.isArray(input) || input.length === 0) return [];
  const hasNested = input.some((el) => Array.isArray(el));
  if (!hasNested) {
    return input as DialogActionProps[];
  }
  return (input as (DialogActionProps | DialogActionProps[])[]).flatMap((slot) =>
    Array.isArray(slot) ? slot : [slot],
  );
};

const extractActionHandlersFromConfig = (config: BaseDialogConfig): Record<string, DialogActionClickHandler> => {
  const out: Record<string, DialogActionClickHandler> = {};
  for (const action of flattenActionsInput(config.actions)) {
    const id = action.id ?? "custom";
    const onClick = (action.props as Record<string, unknown> | undefined)?.onClick;
    if (typeof onClick === "function") {
      out[id] = onClick as DialogActionClickHandler;
    }
  }
  return out;
};

/** Pulls handler-shaped fields from an open config for the reactive handler store. */
export const extractReactiveHandlersFromConfig = (config: BaseDialogConfig): ReactiveDialogHandlers => {
  const actionHandlers = extractActionHandlersFromConfig(config);
  const reactive: ReactiveDialogHandlers = {
    canClose: config.canClose,
    onClose: config.onClose,
    onConflict: config.onConflict,
  };
  if ((config as ConfirmDialogConfig).onOkClick !== undefined) {
    reactive.onOkClick = (config as ConfirmDialogConfig).onOkClick;
  }
  if ((config as ConfirmDialogConfig).onCancelClick !== undefined) {
    reactive.onCancelClick = (config as ConfirmDialogConfig).onCancelClick;
  }
  if ((config as AlertDialogConfig).onOkClick !== undefined) {
    reactive.onOkClick = (config as AlertDialogConfig).onOkClick;
  }
  if (Object.keys(actionHandlers).length > 0) {
    reactive.actionHandlers = actionHandlers;
  }
  return reactive;
};

export const readOwnerTokenFromOpenConfig = (config: BaseDialogConfig & { ownerToken?: symbol }): symbol | undefined =>
  config.ownerToken;

/** Removes internal-only open fields before persisting config on a dialog row. */
export const stripInternalDialogOpenFields = (config: DialogOpenConfig): DialogStoredConfig => {
  const { ownerToken: _owner, _dialogDeps: _deps, ...rest } = config;
  return rest as DialogStoredConfig;
};

export const seedDialogHandlers = (
  dialogKey: string,
  internalId: string,
  owner: symbol | undefined,
  initial: ReactiveDialogHandlers,
): void => {
  store.set(rowKey(dialogKey, internalId), {
    key: dialogKey,
    internalId,
    owner,
    reactive: { ...initial },
  });
};

export const clearDialogHandlersRow = (dialogKey: string, internalId: string): void => {
  store.delete(rowKey(dialogKey, internalId));
};

export const hasDialogHandlersRow = (dialogKey: string, internalId: string): boolean =>
  store.has(rowKey(dialogKey, internalId));

const RESYNC_REACTIVE_KEYS = [
  "canClose",
  "onClose",
  "onConflict",
  "onOkClick",
  "onCancelClick",
  "actionHandlers",
] as const satisfies readonly (keyof ReactiveDialogHandlers)[];

export const resyncDialogHandlersFromConfig = (
  dialogKey: string,
  internalId: string,
  extracted: ReactiveDialogHandlers,
): void => {
  const row = store.get(rowKey(dialogKey, internalId));
  if (!row) return;
  // Merge defined fields only so in-place resyncs cannot wipe live-only handlers (e.g. `canClose`
  // merged from `useDialog` when the persisted row config omits them).
  const merged: ReactiveDialogHandlers = { ...row.reactive };
  const writable = merged as Record<keyof ReactiveDialogHandlers, unknown>;
  for (const k of RESYNC_REACTIVE_KEYS) {
    const v = extracted[k];
    if (v !== undefined) {
      writable[k] = v;
    }
  }
  row.reactive = merged;
};

export const tryMergeReactiveHandlers = (
  dialogKey: string,
  internalId: string,
  owner: symbol,
  partial: ReactiveDialogHandlers,
  options?: { silent?: boolean },
): void => {
  const k = rowKey(dialogKey, internalId);
  const row = store.get(k);
  if (!row) {
    if (!options?.silent) {
      console.warn(`[Dialogist] tryMergeReactiveHandlers: no store row for "${dialogKey}"`);
    }
    return;
  }
  if (row.internalId !== internalId) {
    if (!options?.silent) {
      console.warn("[Dialogist] tryMergeReactiveHandlers: internalId mismatch");
    }
    return;
  }
  if (row.owner === undefined) {
    row.owner = owner;
  } else if (row.owner !== owner) {
    if (!options?.silent) {
      console.warn("[Dialogist] tryMergeReactiveHandlers: owner mismatch; merge ignored");
    }
    return;
  }
  row.reactive = { ...row.reactive, ...partial };
};

export const tryClearReactiveHandlers = (
  dialogKey: string,
  internalId: string,
  owner: symbol,
  fields?: Array<keyof ReactiveDialogHandlers>,
): void => {
  const row = store.get(rowKey(dialogKey, internalId));
  if (!row || row.internalId !== internalId) return;
  if (row.owner !== owner) return;
  if (!fields || fields.length === 0) {
    row.reactive = {};
    return;
  }
  for (const f of fields) {
    if (f === "actionHandlers") {
      delete row.reactive.actionHandlers;
    } else {
      delete row.reactive[f];
    }
  }
};

export const getReactiveHandlersSnapshot = (
  dialogKey: string,
  internalId: string,
  owner: symbol,
): DialogHandlersSnapshot | undefined => {
  const row = store.get(rowKey(dialogKey, internalId));
  if (!row || row.internalId !== internalId) return undefined;
  if (row.owner !== owner) return undefined;
  const ownerToken = row.owner ?? owner;
  return {
    ...row.reactive,
    internalId: row.internalId,
    ownerToken,
  };
};

/**
 * Resolves a reactive handler field: **store value** when set, otherwise **`fallback`** (typically
 * the persisted row config). When the store row is missing, returns **`fallback`**.
 */
export const resolveHandler = <K extends keyof ReactiveDialogHandlers>(
  dialogKey: string,
  internalId: string,
  field: K,
  fallback: ReactiveDialogHandlers[K],
): ReactiveDialogHandlers[K] => {
  const row = store.get(rowKey(dialogKey, internalId));
  if (!row || row.internalId !== internalId) return fallback;
  const v = row.reactive[field];
  return (v !== undefined ? v : fallback) as ReactiveDialogHandlers[K];
};

export const resolveActionOnClick = (
  dialogKey: string,
  internalId: string,
  actionId: string,
  fallback: DialogActionClickHandler,
): DialogActionClickHandler => {
  const row = store.get(rowKey(dialogKey, internalId));
  if (!row || row.internalId !== internalId) return fallback;
  const handler = row.reactive.actionHandlers?.[actionId];
  return typeof handler === "function" ? handler : fallback;
};

export const resolveOnConflictHandler = (
  dialogKey: string,
  internalId: string,
  value: BaseDialogConfig["onConflict"],
): BaseDialogConfig["onConflict"] => {
  const row = store.get(rowKey(dialogKey, internalId));
  if (!row || row.internalId !== internalId) return value;
  if (row.reactive.onConflict !== undefined) return row.reactive.onConflict;
  return value;
};
