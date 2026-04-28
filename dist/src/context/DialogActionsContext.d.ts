import type { DialogContextValue } from "../types";
type Actions = Pick<DialogContextValue, "openDialog" | "closeDialog" | "closeAllDialogs" | "replaceDialog">;
export declare const DialogActionsContext: import("react").Context<Actions | null>;
export declare const useDialogActionsContext: () => Actions;
export {};
