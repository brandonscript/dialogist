import type { KeyboardEvent, MouseEvent } from "react";
import type { BaseDialogConfig, ConfirmDialogConfig, DialogOpenConfig, DialogStoredConfig } from "../types";
type DialogActionClickHandler = (e: MouseEvent | KeyboardEvent) => void;
/** Reactive overrides merged into the per-open handler store (see {@link seedDialogHandlers}). */
export type ReactiveDialogHandlers = Partial<Pick<BaseDialogConfig, "canClose" | "onClose" | "onConflict"> & Pick<ConfirmDialogConfig, "onOkClick" | "onCancelClick">> & {
    /** Custom per-action `props.onClick` handlers keyed by action id. */
    actionHandlers?: Record<string, DialogActionClickHandler>;
};
export type DialogHandlersSnapshot = ReactiveDialogHandlers & {
    internalId: string;
    ownerToken: symbol;
};
/** Pulls handler-shaped fields from an open config for the reactive handler store. */
export declare const extractReactiveHandlersFromConfig: (config: BaseDialogConfig) => ReactiveDialogHandlers;
export declare const readOwnerTokenFromOpenConfig: (config: BaseDialogConfig & {
    ownerToken?: symbol;
}) => symbol | undefined;
/** Removes internal-only open fields before persisting config on a dialog row. */
export declare const stripInternalDialogOpenFields: (config: DialogOpenConfig) => DialogStoredConfig;
export declare const seedDialogHandlers: (dialogKey: string, internalId: string, owner: symbol | undefined, initial: ReactiveDialogHandlers) => void;
export declare const clearDialogHandlersRow: (dialogKey: string, internalId: string) => void;
export declare const hasDialogHandlersRow: (dialogKey: string, internalId: string) => boolean;
export declare const resyncDialogHandlersFromConfig: (dialogKey: string, internalId: string, extracted: ReactiveDialogHandlers) => void;
export declare const tryMergeReactiveHandlers: (dialogKey: string, internalId: string, owner: symbol, partial: ReactiveDialogHandlers, options?: {
    silent?: boolean;
}) => void;
export declare const tryClearReactiveHandlers: (dialogKey: string, internalId: string, owner: symbol, fields?: Array<keyof ReactiveDialogHandlers>) => void;
export declare const getReactiveHandlersSnapshot: (dialogKey: string, internalId: string, owner: symbol) => DialogHandlersSnapshot | undefined;
/**
 * Resolves a reactive handler field: **store value** when set, otherwise **`fallback`** (typically
 * the persisted row config). When the store row is missing, returns **`fallback`**.
 */
export declare const resolveHandler: <K extends keyof ReactiveDialogHandlers>(dialogKey: string, internalId: string, field: K, fallback: ReactiveDialogHandlers[K]) => ReactiveDialogHandlers[K];
export declare const resolveActionOnClick: (dialogKey: string, internalId: string, actionId: string, fallback: DialogActionClickHandler) => DialogActionClickHandler;
export declare const resolveOnConflictHandler: (dialogKey: string, internalId: string, value: BaseDialogConfig["onConflict"]) => BaseDialogConfig["onConflict"];
export {};
