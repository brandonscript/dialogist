"use client";
import { useCallback, useSyncExternalStore } from 'react';
import { subscribeDialogImperativeHandle, getDialogImperativeHandle } from '../context/DialogImperativeHandles.js';
import { resolveDialogKey } from '../utils/dialogKey.js';

var useDialogImperativeValue = function useDialogImperativeValue(dialogKey) {
  var rKey = resolveDialogKey(dialogKey);
  var subscribe = useCallback(function (listener) {
    return subscribeDialogImperativeHandle(rKey.str, listener);
  }, [rKey.str]);
  var getSnapshot = useCallback(function () {
    var _getDialogImperativeH, _getDialogImperativeH2;
    return (_getDialogImperativeH = (_getDialogImperativeH2 = getDialogImperativeHandle(rKey.str)) === null || _getDialogImperativeH2 === void 0 ? void 0 : _getDialogImperativeH2.current) !== null && _getDialogImperativeH !== void 0 ? _getDialogImperativeH : null;
  }, [rKey.str]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

export { useDialogImperativeValue };
//# sourceMappingURL=useDialogImperativeValue.js.map
