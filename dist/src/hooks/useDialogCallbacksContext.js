"use client";
import { useContext } from 'react';
import { DialogCallbacksContext } from '../context/DialogCallbacksContext.js';

var useDialogCallbacksContext = function useDialogCallbacksContext() {
  var ctx = useContext(DialogCallbacksContext);
  if (!ctx) {
    throw new Error("useDialogCallbacksContext must be used within a DialogProvider");
  }
  return ctx;
};

export { useDialogCallbacksContext };
//# sourceMappingURL=useDialogCallbacksContext.js.map
