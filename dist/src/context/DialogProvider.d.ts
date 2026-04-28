import { type ReactNode } from "react";
import type { BaseDialogConfig, DialogComponents, DialogSlotProps } from "../types";
/** Default options merged with each `dialog.open()` call (including `onConflict`). */
export type DefaultOptions = Partial<BaseDialogConfig>;
export interface DialogProviderProps {
    children: ReactNode;
    defaultOptions?: DefaultOptions;
    slots?: DialogComponents;
    slotProps?: DialogSlotProps;
    /**
     * Default when merged open config leaves `onConflict` unset (after `defaultOptions` + call).
     * Does not deep-merge into each dialog config; use `defaultOptions.onConflict` for that.
     * Fallback when the active dialog's merged config leaves `onConflict` unset (see {@link DialogConflictResolver}).
     */
    onConflict?: BaseDialogConfig["onConflict"];
    /**
     * Fallback when active and incoming configs leave `throwOnConflict` unset (see {@link DialogConflictResolver}).
     */
    throwOnConflict?: boolean;
}
export declare const DialogProvider: ({ children, defaultOptions, slots, slotProps, onConflict, throwOnConflict, }: DialogProviderProps) => import("react/jsx-runtime").JSX.Element;
