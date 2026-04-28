import type { DialogCallbackRegistration, DialogComponents, DialogState } from "../types";
export interface DialogStateContextValue {
    dialogs: DialogState[];
    callbacks: DialogCallbackRegistration;
    slots?: DialogComponents;
}
export declare const DialogStateContext: import("react").Context<DialogStateContextValue | null>;
