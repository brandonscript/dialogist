import type { ActionsProps, DialogActionsContainerSlotProps, DialogContentSlotProps, DialogTitleSlotProps, FooterProps, StatusBarProps } from "../../types";
export declare const TailwindTitle: {
    ({ id, className, children, ...rest }: DialogTitleSlotProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const TailwindContent: {
    ({ id, className, style, children, ...rest }: DialogContentSlotProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const TailwindActionsContainer: {
    ({ className, style, children, ...rest }: DialogActionsContainerSlotProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const TailwindActions: {
    ({ actionGroups, dialogKey, actionsStyle }: ActionsProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const TailwindStatusBar: {
    ({ className, content, ...rest }: StatusBarProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const TailwindFooter: {
    ({ className, content, ...rest }: FooterProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
