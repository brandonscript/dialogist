import type { BaseDialogProps } from "../../types";
/**
 * Base UI-backed `Base` slot. Wraps Base UI's parts-based Dialog (`Dialog.Root`,
 * `Dialog.Portal`, `Dialog.Backdrop`, `Dialog.Popup`) so Dialogist's slot system can
 * render through them while still controlling open/close via the Provider's state
 * machine. Forwards `slotProps.paper.ref` for the FLIP resize animation.
 */
export declare const BaseUiBase: {
    ({ children, className, hideBackdrop, onClose, open, slotProps, id, overflow, borderRadius, disableAutoFocus, disableRestoreFocus, disableEnforceFocus, ...rest }: BaseDialogProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
