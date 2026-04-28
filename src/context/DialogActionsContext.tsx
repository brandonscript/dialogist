"use client";

import { createContext, useContext } from "react";

import type { DialogContextValue } from "../types";

type Actions = Pick<DialogContextValue, "openDialog" | "closeDialog" | "closeAllDialogs" | "replaceDialog">;

export const DialogActionsContext = createContext<Actions | null>(null);

export const useDialogActionsContext = (): Actions => {
  const ctx = useContext(DialogActionsContext);
  if (!ctx) throw new Error("useDialogActionsContext must be used within a DialogProvider");
  return ctx;
};
