import type { KeyboardEvent, MouseEvent } from "react";
import type { AlertDialogConfig, BaseDialogConfig, ConfirmDialogConfig, CustomDialogConfig, DialogActionProps, DialogActionsInput } from "../types";
import type { DialogCloseEvent } from "../types/callbacks";
export type DialogCloseHandler = (dialogKey: string, options: {
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
}) => void;
export type ConfigForActions = (BaseDialogConfig & Partial<ConfirmDialogConfig> & Partial<AlertDialogConfig> & Partial<CustomDialogConfig>) | ConfirmDialogConfig | AlertDialogConfig | CustomDialogConfig;
/**
 * Normalize actions input to groups. Flat [A,B,C] -> [[A,B,C]]. Nested [[A,B], C] -> [[A,B],[C]].
 * If any top-level element is an array, treat as grouped; otherwise flat.
 */
export declare const normalizeToGroups: (input: DialogActionsInput) => DialogActionProps[][];
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
export declare const deriveEffectiveActions: (config: ConfigForActions, dialogKey: string, dialogInternalId: string, onClose: DialogCloseHandler) => DialogActionProps[][];
