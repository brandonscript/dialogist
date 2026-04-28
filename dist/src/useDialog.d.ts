import { type ReactNode, type RefObject } from "react";
import { type ReactiveDialogHandlers } from "./state/DialogHandlers";
import type { DialogCloseEvent, DialogConfig, DialogConfigWithTypedMessage, DialogKey, DialogPartContent, UseDialogEmit, UseDialogOff, UseDialogOn } from "./types";
export type DependencyArray = ReadonlyArray<unknown>;
export interface DialogDeps {
    contentDeps?: DependencyArray;
    actionsDeps?: DependencyArray[];
    titleDeps?: DependencyArray;
    statusBarDeps?: DependencyArray;
    footerDeps?: DependencyArray;
}
type ImperativeHandleRefType<Handle = unknown> = RefObject<Handle | null> | null;
/**
 * Hook for opening and controlling dialogs.
 *
 * @template TResolveValue - Default type for resolveValue when the dialog closes via an action.
 * Use dialog.open<T>() to override per-call, or useDialog<T>() to set a default for this dialog.
 * @template TActionId - Union of custom action ids. Default (never) = built-in "ok" | "cancel" only. Specify e.g. "draft" | "delete" to add custom ids.
 *
 * Includes `isOpen`: true when a dialog with this key is on the stack. Use `useDialogIsOpen(key)` only when you need that without the rest of the API.
 */
export declare const useDialog: <TResolveValue = unknown, TActionId extends string = never>(key?: DialogKey, initialConfig?: Partial<DialogConfig>, deps?: DialogDeps) => {
    open: {
        <T = TResolveValue, A extends string = TActionId extends string ? TActionId : never, P extends Record<string, unknown> = Record<string, unknown>>(config: DialogConfigWithTypedMessage<P>): Promise<DialogCloseEvent<T, A>>;
        <T = TResolveValue, A_1 extends string = TActionId extends string ? TActionId : never>(keyOrConfig?: DialogKey | Partial<DialogConfig>, config?: Partial<DialogConfig>): Promise<DialogCloseEvent<T, A_1>>;
    };
    isOpen: boolean;
    replace: <T = TResolveValue, A_2 extends string = TActionId extends string ? TActionId : never>(keyOrConfig: DialogKey | Partial<DialogConfig>, config?: Partial<DialogConfig>) => Promise<DialogCloseEvent<T, A_2>>;
    next: (step: string | number, config?: Partial<DialogConfig>) => Promise<DialogCloseEvent<TResolveValue, TActionId>>;
    back: (targetStep?: string | number) => Promise<unknown> | undefined;
    toggle: (keyOrConfig?: DialogKey | Partial<DialogConfig>, config?: Partial<DialogConfig>) => void;
    close: (result?: unknown, options?: Omit<import("./types").DialogCloseOptions, "resolveValue">) => void;
    closeAll: (options?: {
        force?: boolean;
    }) => void;
    /**
     * Register an event handler scoped to this dialog.
     * Extend `DialogistEventMap` via declaration merging to register custom event names and payload types.
     * @param event - Event name
     * @param handler - Event handler function
     * @returns A function to unregister the event handler
     */
    on: UseDialogOn;
    /**
     * Unregister an event handler scoped to this dialog
     * @param event - Event name
     * @param handler - Event handler function
     */
    off: UseDialogOff;
    emit: UseDialogEmit;
    imperativeHandle: <Handle = unknown, RefType extends React.RefObject<Handle | null> = RefObject<Handle | null>>() => RefType | null;
    _setHandlers: (partial: ReactiveDialogHandlers) => void;
    _clearHandlers: (fields?: Array<keyof ReactiveDialogHandlers>) => void;
    _getHandlers: () => import("./state/DialogHandlers").DialogHandlersSnapshot | undefined;
    canClose: () => boolean;
    setTitle: (next: ReactNode | (() => ReactNode)) => void;
    setContent: (next: DialogPartContent | (() => DialogPartContent)) => void;
    setStatusBar: (next: DialogPartContent | (() => DialogPartContent)) => void;
    setFooter: (next: DialogPartContent | (() => DialogPartContent)) => void;
    setProps: (next: Record<string, unknown> | (() => Record<string, unknown>)) => void;
    setImperativeHandle: <RefType_1 extends ImperativeHandleRefType<unknown>>(ref?: RefType_1) => void;
};
export {};
