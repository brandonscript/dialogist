import type { ReactNode } from "react";
import type { DialogPartContent } from "../types";
interface DialogMemoization {
    statusBarDeps?: unknown[];
    titleDeps?: unknown[];
    contentDeps?: unknown[];
    propsDeps?: unknown[];
    actionsDeps?: unknown[];
    footerDeps?: unknown[];
}
interface MemoizedDialogContent {
    statusBar: DialogPartContent | undefined;
    title: ReactNode | undefined;
    content: DialogPartContent | undefined;
    props: Record<string, unknown>;
    actions: unknown[];
    footer: DialogPartContent | undefined;
}
export declare const useMemoizedDialogParts: (parts: {
    statusBar: DialogPartContent | undefined;
    title?: ReactNode;
    content: DialogPartContent | undefined;
    props?: Record<string, unknown>;
    actions?: unknown[];
    footer: DialogPartContent | undefined;
}, deps?: DialogMemoization) => MemoizedDialogContent;
export {};
