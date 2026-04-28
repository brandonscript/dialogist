import type { ReactiveDialogHandlers } from "../state/DialogHandlers";
import type { DialogKey } from "../types";
/**
 * Keeps live dialog handlers in sync for a key when the dialog was opened without `useDialog`
 * (e.g. utility `open()`), or when you want to push handler overrides from a separate component.
 * Merge `ownerToken` into `open({ ..., ownerToken: ownerToken })` so this hook owns writes.
 */
export declare const useDialogHandlers: (dialogKey: DialogKey, handlers: Partial<ReactiveDialogHandlers>) => {
    ownerToken: symbol;
};
