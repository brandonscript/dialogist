import type { BaseDialogProps } from "../../types";
/**
 * shadcn-style `Base` slot powered by Base UI primitives instead of Radix. Consumers
 * who use shadcn class conventions (and have `tailwindcss-animate` installed) get the
 * same look + animations as a stock shadcn dialog without the Radix dependency.
 *
 * Pair with `<DialogProvider slots={shadcnSlots}>` (see `dialogist/shadcn`).
 */
export declare const ShadcnBase: {
    ({ children, className, hideBackdrop, onClose, open, slotProps, id, overflow, borderRadius, disableAutoFocus, disableRestoreFocus, disableEnforceFocus, ...rest }: BaseDialogProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
