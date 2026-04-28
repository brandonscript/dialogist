"use client";

import { useContext } from "react";

import { DialogCallbacksContext } from "../context/DialogCallbacksContext";
import { DialogStateContext } from "../context/DialogStateContext";

export const useDialogContext = () => {
  const state = useContext(DialogStateContext);
  const callbacks = useContext(DialogCallbacksContext);

  if (!state) {
    throw new Error("useDialogContext must be used within a DialogProvider");
  }
  if (!callbacks) {
    throw new Error("useDialogContext requires DialogCallbacksContext — use within DialogProvider");
  }

  return {
    ...state,
    callbacks,
  } as const;
};
