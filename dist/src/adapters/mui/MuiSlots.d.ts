import type { ActionsProps, DialogActionsContainerSlotProps, DialogContentSlotProps, DialogTitleSlotProps, FooterProps, StatusBarProps } from "../../types";
export declare const MuiTitle: {
    ({ id, className, children, ...rest }: DialogTitleSlotProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const MuiContent: {
    ({ id, className, style, children, ...rest }: DialogContentSlotProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const MuiActionsContainer: {
    ({ className, children, ...rest }: DialogActionsContainerSlotProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
/**
 * MUI-backed `Actions` slot. Renders one or more action groups using MUI Button.
 * Mirrors the previous `DefaultActions` behavior from before the adapter split.
 */
export declare const MuiActions: {
    ({ actionGroups, dialogKey, actionsStyle }: ActionsProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const MuiStatusBar: {
    ({ className, content, ...rest }: StatusBarProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const MuiFooter: {
    ({ className, content, ...rest }: FooterProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
