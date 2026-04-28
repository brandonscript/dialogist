import { objectSpread2 as _objectSpread2 } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { ensureDialogKeyArray } from '../utils/dialogKey.js';

/** Prefer {@link DialogSlot.value} from {@link DialogSlotRegistry.registerSlot} so merge does not re-run factories. */
var getRegisteredSlotContent = function getRegisteredSlotContent(slot) {
  return slot.value !== undefined ? slot.value : slot.factory();
};
/**
 * Merges registered slot factories (and their cached {@link DialogSlot.value}) into an open config.
 * Slot factories should be pure; resolved values are cached on registration.
 */
var mergeSlotsWithConfig = function mergeSlotsWithConfig(slotRegistry, config, key, keySegments) {
  var _ensureDialogKeyArray3;
  var registeredSlots = slotRegistry.getAllSlots(key);
  if (registeredSlots.length === 0) {
    if (keySegments) {
      var _ensureDialogKeyArray;
      var resolvedKeySegments = (_ensureDialogKeyArray = ensureDialogKeyArray(config.dialogKey)) !== null && _ensureDialogKeyArray !== void 0 ? _ensureDialogKeyArray : keySegments;
      return _objectSpread2(_objectSpread2({}, config), {}, {
        dialogKey: resolvedKeySegments
      });
    }
    return config;
  }
  var mergedConfig = _objectSpread2({}, config);
  if (keySegments) {
    var _ensureDialogKeyArray2;
    mergedConfig.dialogKey = (_ensureDialogKeyArray2 = ensureDialogKeyArray(mergedConfig.dialogKey)) !== null && _ensureDialogKeyArray2 !== void 0 ? _ensureDialogKeyArray2 : keySegments;
  }
  registeredSlots.forEach(function (slot) {
    var slotContent = getRegisteredSlotContent(slot);
    switch (slot.slotType) {
      case "title":
        mergedConfig.title = slotContent;
        break;
      case "content":
        mergedConfig.message = slotContent;
        break;
      case "statusBar":
        mergedConfig.statusBar = slotContent;
        break;
      case "footer":
        mergedConfig.footer = slotContent;
        break;
      case "props":
        Object.assign(mergedConfig, slotContent);
        break;
      case "actions":
        if (Array.isArray(slotContent)) {
          mergedConfig.actions = slotContent;
        }
        break;
    }
  });
  if (!keySegments) {
    return mergedConfig;
  }
  return _objectSpread2(_objectSpread2({}, mergedConfig), {}, {
    dialogKey: (_ensureDialogKeyArray3 = ensureDialogKeyArray(mergedConfig.dialogKey)) !== null && _ensureDialogKeyArray3 !== void 0 ? _ensureDialogKeyArray3 : keySegments
  });
};

export { getRegisteredSlotContent, mergeSlotsWithConfig };
//# sourceMappingURL=mergeSlotsWithConfig.js.map
