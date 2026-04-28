import { createContext } from "react";

import type { DialogCallbackRegistration, DialogComponents, DialogState } from "../types";

export interface DialogStateContextValue {
  dialogs: DialogState[];
  callbacks: DialogCallbackRegistration;
  slots?: DialogComponents;
}

export const DialogStateContext = createContext<DialogStateContextValue | null>(null);
