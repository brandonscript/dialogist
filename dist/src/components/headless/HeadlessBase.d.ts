import type { BaseDialogProps } from "../../types";
/**
 * Framework-agnostic default `Base` slot used by `DialogScaffolding` when no adapter is
 * provided. Renders a backdrop, paper container, focus trap, Esc handler, scroll lock,
 * and forwards `slotProps.paper.ref` for the FLIP resize animation.
 *
 * Adapters (MUI, Base UI, shadcn) replace this with their own Dialog primitive when
 * mounted via `DialogProvider.slots`.
 */
export declare const HeadlessBase: {
    ({ children, className, container, hideBackdrop, onClose, open, slotProps, id, overflow, disableAutoFocus, disableEnforceFocus, disableRestoreFocus, borderRadius, ...rest }: BaseDialogProps): import("react/jsx-runtime").JSX.Element | null;
    displayName: string;
};
