import type { DialogCloseReason, DialogKey, DialogKeyArray, DialogOpenConfig, DialogStoredConfig } from "../types";
import type { DialogCloseEvent } from "../types/callbacks";
type DialogCanCloseConfig = DialogOpenConfig | DialogStoredConfig;
export declare const evaluateDialogCanClose: (dialogKey: DialogKey | DialogKeyArray, internalId: string, config: DialogCanCloseConfig, reason: DialogCloseReason, actionInfo?: {
    action: NonNullable<DialogCloseEvent["action"]>;
    actionId?: string;
    buttonText?: string;
    nativeEvent?: DialogCloseEvent["nativeEvent"];
}) => boolean;
export {};
