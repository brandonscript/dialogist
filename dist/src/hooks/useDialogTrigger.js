"use client";
import { deepmerge } from '../../node_modules/deepmerge-ts/dist/node/index.js';
import { useMemo } from 'react';
import { useDialog } from '../useDialog.js';
import { chainEventHandlers } from '../utils/chainEventHandlers.js';

var useDialogTrigger = function useDialogTrigger(dialogKey) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var config = options.config,
    alwaysAriaControls = options.alwaysAriaControls;
  var dialog = useDialog(dialogKey);
  var domId = "dialogist-".concat(dialogKey);
  var ariaProps = useMemo(function () {
    var controls = alwaysAriaControls || false ? domId : undefined;
    return {
      "aria-haspopup": "dialog",
      "aria-controls": controls
    };
  }, [domId, alwaysAriaControls]);
  var bindTrigger = function bindTrigger(props) {
    var injected = {
      onClick: function () {
        dialog.open(config);
      }
    };
    return deepmerge({}, props !== null && props !== void 0 ? props : {}, ariaProps, chainEventHandlers(props, injected));
  };
  var bindToggle = function bindToggle(props) {
    var injected = {
      onClick: function () {
        dialog.toggle(config);
      }
    };
    return deepmerge({}, props !== null && props !== void 0 ? props : {}, ariaProps, chainEventHandlers(props, injected));
  };
  return {
    bindTrigger: bindTrigger,
    bindToggle: bindToggle,
    dialog: dialog,
    dialogDomId: domId
  };
};

export { useDialogTrigger };
//# sourceMappingURL=useDialogTrigger.js.map
