"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";

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

const DEFAULT_RESOLVE_SPACING = (value: number | string | undefined, fallback: number): string => {
  const v = value === undefined ? fallback : value;
  return typeof v === "number" ? `${v * 8}px` : v;
};

export const DEFAULT_DIALOGIST_ADAPTER: DialogistAdapter = {
  resolveSpacing: DEFAULT_RESOLVE_SPACING,
  transitionDuration: 150,
  transitionEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
};

const DialogistAdapterContext = createContext<DialogistAdapter | null>(null);

DialogistAdapterContext.displayName = "DialogistAdapterContext";

/**
 * Read the active adapter (or fall back to defaults if no adapter is mounted). Adapters
 * mount via `<DialogistAdapterProvider value={...}>`.
 */
export const useDialogistAdapter = (): DialogistAdapter => {
  const adapter = useContext(DialogistAdapterContext);
  return adapter ?? DEFAULT_DIALOGIST_ADAPTER;
};

export interface DialogistAdapterProviderProps {
  /** Partial overrides; unspecified fields fall back to {@link DEFAULT_DIALOGIST_ADAPTER}. */
  value?: Partial<DialogistAdapter>;
  children: ReactNode;
}

export const DialogistAdapterProvider = ({ value, children }: DialogistAdapterProviderProps) => {
  const merged = useMemo<DialogistAdapter>(
    () => ({
      ...DEFAULT_DIALOGIST_ADAPTER,
      ...value,
    }),
    [value],
  );
  return <DialogistAdapterContext.Provider value={merged}>{children}</DialogistAdapterContext.Provider>;
};
