import { objectSpread2 as _objectSpread2 } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { resolveHandler } from '../state/DialogHandlers.js';
import { resolveDialogKey } from './dialogKey.js';

var evaluateDialogCanClose = function evaluateDialogCanClose(dialogKey, internalId, config, reason, actionInfo) {
  var _config$canClose;
  var rKey = resolveDialogKey(dialogKey);
  var resolved = resolveHandler(rKey.str, internalId, "canClose", config.canClose);
  var guard = resolved !== undefined ? resolved : (_config$canClose = config.canClose) !== null && _config$canClose !== void 0 ? _config$canClose : true;
  var willClose = _objectSpread2({
    dialogKey: rKey.str,
    keySegments: rKey.parts,
    config: config,
    reason: reason
  }, actionInfo && {
    action: actionInfo.action,
    actionId: actionInfo.actionId,
    buttonText: actionInfo.buttonText,
    nativeEvent: actionInfo.nativeEvent
  });
  if (typeof guard === "function") {
    try {
      var fnResult = guard(willClose);
      return fnResult;
    } catch (error) {
      console.error("[Dialogist] canClose guard threw an error; blocking close.", error);
      return false;
    }
  }
  return guard !== false;
};

export { evaluateDialogCanClose };
//# sourceMappingURL=dialogCanClose.js.map
