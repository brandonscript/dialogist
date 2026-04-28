import type { DialogConfig } from "../types";
type ClickHandler<P> = P extends {
    onClick?: (...args: infer Args) => infer Return;
} ? (...args: Args) => Return : (event: unknown) => void;
export interface UseDialogTriggerOptions {
    /** Optional config to merge when opening via trigger */
    config?: Partial<DialogConfig>;
    /** Control whether aria-controls points to the dialog key DOM id when closed */
    alwaysAriaControls?: boolean;
}
export declare const useDialogTrigger: (dialogKey: string, options?: UseDialogTriggerOptions) => {
    readonly bindTrigger: <P extends {
        onClick?: (e: unknown) => void;
    }>(props?: P) => P & {
        onClick: ClickHandler<P>;
    };
    readonly bindToggle: <P extends {
        onClick?: (e: unknown) => void;
    }>(props?: P) => P & {
        onClick: ClickHandler<P>;
    };
    readonly dialog: {
        open: {
            <T = unknown, A extends string = never, P extends Record<string, unknown> = Record<string, unknown>>(config: import("../types").DialogConfigWithTypedMessage<P>): Promise<import("../types").DialogCloseEvent<T, A>>;
            <T = unknown, A extends string = never>(keyOrConfig?: import("../types").DialogKey | Partial<DialogConfig>, config?: Partial<DialogConfig>): Promise<import("../types").DialogCloseEvent<T, A>>;
        };
        isOpen: boolean;
        replace: <T = unknown, A extends string = never>(keyOrConfig: import("../types").DialogKey | Partial<DialogConfig>, config?: Partial<DialogConfig>) => Promise<import("../types").DialogCloseEvent<T, A>>;
        next: (step: string | number, config?: Partial<DialogConfig>) => Promise<import("../types").DialogCloseEvent<unknown, never>>;
        back: (targetStep?: string | number) => Promise<unknown> | undefined;
        toggle: (keyOrConfig?: import("../types").DialogKey | Partial<DialogConfig>, config?: Partial<DialogConfig>) => void;
        close: (result?: unknown, options?: Omit<import("../types").DialogCloseOptions, "resolveValue">) => void;
        closeAll: (options?: {
            force?: boolean;
        } | undefined) => void;
        on: import("../types").UseDialogOn;
        off: import("../types").UseDialogOff;
        emit: import("../types").UseDialogEmit;
        imperativeHandle: <Handle = unknown, RefType extends import("react").RefObject<Handle | null> = import("react").RefObject<Handle | null>>() => RefType | null;
        _setHandlers: (partial: import("..").ReactiveDialogHandlers) => void;
        _clearHandlers: (fields?: Array<keyof import("..").ReactiveDialogHandlers>) => void;
        _getHandlers: () => import("..").DialogHandlersSnapshot | undefined;
        canClose: () => boolean;
        setTitle: (next: import("react").ReactNode | (() => import("react").ReactNode)) => void;
        setContent: (next: import("../types").DialogPartContent | (() => import("../types").DialogPartContent)) => void;
        setStatusBar: (next: import("../types").DialogPartContent | (() => import("../types").DialogPartContent)) => void;
        setFooter: (next: import("../types").DialogPartContent | (() => import("../types").DialogPartContent)) => void;
        setProps: (next: Record<string, unknown> | (() => Record<string, unknown>)) => void;
        setImperativeHandle: <RefType extends import("react").RefObject<unknown> | null>(ref?: RefType | undefined) => void;
    };
    readonly dialogDomId: string;
};
export {};
