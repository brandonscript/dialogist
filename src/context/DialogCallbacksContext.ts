import { createContext } from "react";

import type { DialogCallbackRegistration } from "../types/callbacks";

// Lightweight context to expose callback registration to app children without
// subscribing them to dialog state updates.
export const DialogCallbacksContext = createContext<DialogCallbackRegistration | null>(null);
