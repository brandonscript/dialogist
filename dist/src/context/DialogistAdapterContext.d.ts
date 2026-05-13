import { type ReactNode } from "react";
/**
 * Adapter-supplied tokens consumed by the framework-agnostic `DialogScaffolding`.
 *
 * Defaults are chosen to match the previous MUI-derived behavior so that opting out of an
 * adapter (or rendering with no provider at all) yields the same animation timings and
 * spacing math the library shipped before going style-agnostic.
 */
export interface DialogistAdapter {
    /**
     * Resolve a numeric or string spacing value to a CSS length string. Numbers are treated
     * as design-system spacing units; the default multiplies by 8px (matching MUI's default
     * `theme.spacing` scale). Adapters may override to consult their own theme.
     */
    resolveSpacing: (value: number | string | undefined, fallback: number) => string;
    /** Duration (ms) for the FLIP resize animation on the dialog paper. */
    transitionDuration: number;
    /** Easing function for the FLIP resize animation on the dialog paper. */
    transitionEasing: string;
}
export declare const DEFAULT_DIALOGIST_ADAPTER: DialogistAdapter;
/**
 * Read the active adapter (or fall back to defaults if no adapter is mounted). Adapters
 * mount via `<DialogistAdapterProvider value={...}>`.
 */
export declare const useDialogistAdapter: () => DialogistAdapter;
export interface DialogistAdapterProviderProps {
    /** Partial overrides; unspecified fields fall back to {@link DEFAULT_DIALOGIST_ADAPTER}. */
    value?: Partial<DialogistAdapter>;
    children: ReactNode;
}
export declare const DialogistAdapterProvider: ({ value, children }: DialogistAdapterProviderProps) => import("react/jsx-runtime").JSX.Element;
