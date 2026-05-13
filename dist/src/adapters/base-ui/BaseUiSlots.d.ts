import type { DialogContentSlotProps, DialogTitleSlotProps } from "../../types";
/**
 * Base UI title slot. Uses `Dialog.Title` so screen readers announce the title and
 * Base UI wires `aria-labelledby` automatically. We additionally apply our own id so
 * the scaffolding's `aria-labelledby` linkage continues to work.
 */
export declare const BaseUiTitle: {
    ({ id, className, children, ...rest }: DialogTitleSlotProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
/**
 * Base UI content slot. Uses `Dialog.Description` so Base UI links it to the popup via
 * `aria-describedby`. Falls back to a plain `<div>` semantic, but Base UI's component
 * adds the wiring for free.
 */
export declare const BaseUiContent: {
    ({ id, className, style, children, ...rest }: DialogContentSlotProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
