import { objectWithoutProperties as _objectWithoutProperties } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { deepEqual as _deepEqual, deepEqualDeps } from '../utils/deepCompare.js';

var _excluded = ["_dialogDeps", "_backdropHold", "ownerToken"],
  _excluded2 = ["onConflict", "throwOnConflict", "ownerToken"],
  _excluded3 = ["_dialogDeps"],
  _excluded4 = ["_dialogDeps"];
var stripInternalFieldsForCompare = function stripInternalFieldsForCompare(config) {
  var _ref = config;
    _ref._dialogDeps;
    _ref._backdropHold;
    _ref.ownerToken;
    var rest = _objectWithoutProperties(_ref, _excluded);
  return rest;
};

/** Same-key open comparison: `onConflict` (conflict policy) on the config must not force a content update by itself. */
var stripOnConflictForComparison = function stripOnConflictForComparison(config) {
  var _ref2 = config;
    _ref2.onConflict;
    _ref2.throwOnConflict;
    _ref2.ownerToken;
    var rest = _objectWithoutProperties(_ref2, _excluded2);
  return rest;
};

/**
 * Helper function to determine if a dialog should be updated when opened with the same ID.
 *
 * Comparison logic:
 * 1. If no deps specified - performs deep comparison on entire config
 * 2. If deps specified - compares props (always) and specified dependencies
 * 3. For actionsDeps - supports nested arrays for per-action dependencies
 *
 * @param oldConfig - The existing dialog configuration
 * @param newConfig - The new dialog configuration to compare against
 * @returns true if dialog should update, false if no update needed
 */
var shouldDialogUpdate = function shouldDialogUpdate(oldConfig, newConfig) {
  var _oldActionsDeps$some;
  var deps = newConfig._dialogDeps;
  if (!deps) {
    // No deps specified - use deep comparison on the entire config (ignore internal open-only fields)
    return !_deepEqual(stripInternalFieldsForCompare(oldConfig), stripInternalFieldsForCompare(newConfig));
  }

  // Always deeply compare props - no deps needed for this
  var _ref3 = oldConfig;
    _ref3._dialogDeps;
    var oldConfigWithoutDeps = _objectWithoutProperties(_ref3, _excluded3);
  var _ref4 = newConfig;
    _ref4._dialogDeps;
    var newConfigWithoutDeps = _objectWithoutProperties(_ref4, _excluded4);
  if (!_deepEqual(oldConfigWithoutDeps, newConfigWithoutDeps)) {
    return true; // Props or other config changed
  }

  // Check specific dependency arrays
  var oldDeps = oldConfig._dialogDeps;
  if (!oldDeps) {
    // Old dialog had no deps but new one does - assume update needed
    return true;
  }

  // Compare each dependency array using deep comparison
  var simpleDepsToCheck = ["contentDeps", "titleDeps", "statusBarDeps", "footerDeps"];

  // Check simple dependency arrays
  var simpleDepsChanged = simpleDepsToCheck.some(function (depKey) {
    var oldDepArray = oldDeps[depKey];
    var newDepArray = deps[depKey];

    // If either is undefined, compare existence
    if (!oldDepArray !== !newDepArray) return true;

    // Both undefined - no change for this dep
    if (!oldDepArray && !newDepArray) return false;

    // Compare arrays using proper deep comparison
    return !deepEqualDeps(oldDepArray, newDepArray);
  });
  if (simpleDepsChanged) return true;

  // Special handling for actionsDeps (nested arrays)
  var oldActionsDeps = oldDeps.actionsDeps;
  var newActionsDeps = deps.actionsDeps;

  // If either is undefined, compare existence
  if (!oldActionsDeps !== !newActionsDeps) return true;

  // Both undefined - no change
  if (!oldActionsDeps && !newActionsDeps) return false;

  // Compare nested arrays - each action can have its own deps
  if ((oldActionsDeps === null || oldActionsDeps === void 0 ? void 0 : oldActionsDeps.length) !== (newActionsDeps === null || newActionsDeps === void 0 ? void 0 : newActionsDeps.length)) return true;
  return (_oldActionsDeps$some = oldActionsDeps === null || oldActionsDeps === void 0 ? void 0 : oldActionsDeps.some(function (oldActionDep, index) {
    var newActionDep = newActionsDeps === null || newActionsDeps === void 0 ? void 0 : newActionsDeps[index];
    if (!newActionDep) return true;

    // Compare individual action dependency arrays using proper deep comparison
    return !deepEqualDeps(oldActionDep, newActionDep);
  })) !== null && _oldActionsDeps$some !== void 0 ? _oldActionsDeps$some : false;
};

/**
 * Get the currently active (topmost) dialog ID from the dialog stack.
 *
 * @param dialogs - Array of current dialog states
 * @returns The ID of the active dialog, or null if no dialogs are open
 */
var getActiveDialogKey = function getActiveDialogKey(dialogs) {
  // Search backwards for the first dialog that isn't just holding the backdrop
  for (var i = dialogs.length - 1; i >= 0; i--) {
    var dialog = dialogs[i];
    // Cast to access internal property safely
    if (!dialog.config._backdropHold) {
      return dialog.key;
    }
  }
  return null;
};

export { getActiveDialogKey, shouldDialogUpdate, stripOnConflictForComparison };
//# sourceMappingURL=DialogProvider.utils.js.map
