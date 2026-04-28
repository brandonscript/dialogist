"use client";
import { createContext, useContext } from 'react';

var DialogActionsContext = /*#__PURE__*/createContext(null);
var useDialogActionsContext = function useDialogActionsContext() {
  var ctx = useContext(DialogActionsContext);
  if (!ctx) throw new Error("useDialogActionsContext must be used within a DialogProvider");
  return ctx;
};

export { DialogActionsContext, useDialogActionsContext };
//# sourceMappingURL=DialogActionsContext.js.map
