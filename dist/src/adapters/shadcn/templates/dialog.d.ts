import type * as React from "react";
export interface DialogProps {
    open?: boolean;
    onClose: () => void;
    children?: React.ReactNode;
    className?: string;
    hideBackdrop?: boolean;
    id?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
}
export declare const Dialog: ({ open, onClose, children, className, hideBackdrop, id, ...rest }: DialogProps) => import("react/jsx-runtime").JSX.Element;
export declare const DialogTitle: ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => import("react/jsx-runtime").JSX.Element;
export declare const DialogContent: ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => import("react/jsx-runtime").JSX.Element;
