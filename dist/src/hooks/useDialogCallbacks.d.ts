import type { DialogCallbackRegistration, DialogCallbacksTriggerFn } from "../types/callbacks";
export declare const useDialogCallbacks: () => DialogCallbackRegistration & {
    trigger: DialogCallbacksTriggerFn;
};
