import { type ReactNode } from "react";
import { type DialogistGlobalStylesMode } from "../components/DialogistGlobalStyles";
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
    /**
     * How the provider should publish the framework-agnostic `dialogistStyles`.
     *
     * - `"inject"` (default): inject a `<style id="dialogist-global-styles">` tag once per
     *   document. Refcounted across multiple providers.
     * - `"external"`: do nothing — consumers `import "dialogist/styles.css"` themselves.
     * - `"none"`: opt out entirely (use when an adapter renders its own GlobalStyles).
     */
    cssMode?: DialogistGlobalStylesMode;
}
export declare const DialogProvider: ({ children, defaultOptions, slots, slotProps, onConflict, throwOnConflict, cssMode, }: DialogProviderProps) => import("react/jsx-runtime").JSX.Element;
