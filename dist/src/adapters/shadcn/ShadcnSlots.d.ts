import type { ActionsProps, DialogActionsContainerSlotProps, DialogContentSlotProps, DialogTitleSlotProps, FooterProps, StatusBarProps } from "../../types";
export declare const ShadcnTitle: {
    ({ id, className, children, ...rest }: DialogTitleSlotProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const ShadcnContent: {
    ({ id, className, style, children, ...rest }: DialogContentSlotProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const ShadcnActionsContainer: {
    ({ className, style, children, ...rest }: DialogActionsContainerSlotProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const ShadcnActions: {
    ({ actionGroups, dialogKey, actionsStyle }: ActionsProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const ShadcnStatusBar: {
    ({ className, content, ...rest }: StatusBarProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const ShadcnFooter: {
    ({ className, content, ...rest }: FooterProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
