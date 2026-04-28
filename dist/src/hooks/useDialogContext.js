"use client";
import { objectSpread2 as _objectSpread2 } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { useContext } from 'react';
import { DialogCallbacksContext } from '../context/DialogCallbacksContext.js';
import { DialogStateContext } from '../context/DialogStateContext.js';

var useDialogContext = function useDialogContext() {
  var state = useContext(DialogStateContext);
  var callbacks = useContext(DialogCallbacksContext);
  if (!state) {
    throw new Error("useDialogContext must be used within a DialogProvider");
  }
  if (!callbacks) {
    throw new Error("useDialogContext requires DialogCallbacksContext — use within DialogProvider");
  }
  return _objectSpread2(_objectSpread2({}, state), {}, {
    callbacks: callbacks
  });
};

export { useDialogContext };
//# sourceMappingURL=useDialogContext.js.map
