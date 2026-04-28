"use client";

import { useContext } from "react";

import { DialogCallbacksContext } from "../context/DialogCallbacksContext";
import type { DialogCallbackRegistration } from "../types/callbacks";

export const useDialogCallbacksContext = (): DialogCallbackRegistration => {
  const ctx = useContext(DialogCallbacksContext);
  if (!ctx) {
    throw new Error("useDialogCallbacksContext must be used within a DialogProvider");
  }
  return ctx;
};
