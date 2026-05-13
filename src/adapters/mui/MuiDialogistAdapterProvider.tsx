"use client";

import { useTheme } from "@mui/material/styles";
import { type ReactNode, useMemo } from "react";

import {
  type DialogistAdapter,
  DialogistAdapterProvider,
} from "../../context/DialogistAdapterContext";

/**
 * MUI-aware {@link DialogistAdapterProvider}. Wires `theme.spacing` and
 * `theme.transitions` from the active MUI theme into the Dialogist adapter context so
 * the FLIP resize animation in `DialogScaffolding` honors MUI tokens.
 */
export const MuiDialogistAdapterProvider = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();
  const adapter = useMemo<Partial<DialogistAdapter>>(
    () => ({
      resolveSpacing: (value, fallback) => {
        const v = value === undefined ? fallback : value;
        return typeof v === "number" ? theme.spacing(v) : v;
      },
      transitionDuration:
        typeof theme.transitions?.duration?.shortest === "number" ? theme.transitions.duration.shortest : 150,
      transitionEasing: theme.transitions?.easing?.easeOut ?? "cubic-bezier(0.4, 0, 0.2, 1)",
    }),
    [theme],
  );
  return <DialogistAdapterProvider value={adapter}>{children}</DialogistAdapterProvider>;
};
MuiDialogistAdapterProvider.displayName = "MuiDialogistAdapterProvider";
