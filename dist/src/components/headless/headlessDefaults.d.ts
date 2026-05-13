import type { CSSProperties } from "react";
import type { ActionsProps, DialogActionsContainerSlotProps, DialogContentSlotProps, DialogTitleSlotProps, FooterProps, StatusBarProps } from "../../types";
export declare const HeadlessTitle: {
    ({ id, className, children, ...rest }: DialogTitleSlotProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const HeadlessContent: {
    ({ id, className, style, children, ...rest }: DialogContentSlotProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const HeadlessActionsContainer: {
    ({ className, style, children, ...rest }: DialogActionsContainerSlotProps & {
        style?: CSSProperties;
        className?: string;
    }): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
/**
 * Headless equivalent of the previous MUI-based `DefaultActions`. Renders one or more
 * action groups using plain `<button>` elements and the same row/group CSS classes the
 * theme expects.
 */
export declare const HeadlessActions: {
    ({ actionGroups, dialogKey, actionsStyle }: ActionsProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const HeadlessStatusBar: {
    ({ className, content, ...rest }: StatusBarProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
export declare const HeadlessFooter: {
    ({ className, content, ...rest }: FooterProps): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
