import type { DependencyList } from "react";

import type {
  BaseDialogConfig,
  DialogOpenConfig,
  DialogOpenInternalFields,
  DialogState,
  DialogStoredConfig,
} from "../types";
import type { DialogDeps } from "../useDialog";
import { deepEqual, deepEqualDeps } from "../utils/deepCompare";

const stripInternalFieldsForCompare = (
  config: DialogOpenConfig | DialogStoredConfig,
): Omit<DialogOpenConfig | DialogStoredConfig, keyof DialogOpenInternalFields | "ownerToken"> & {
  ownerToken?: symbol;
} => {
  const { _dialogDeps, _backdropHold, ownerToken, ...rest } = config as DialogOpenConfig &
    Partial<DialogOpenInternalFields> & { ownerToken?: symbol };
  return rest;
};

/** Same-key open comparison: `onConflict` (conflict policy) on the config must not force a content update by itself. */
export const stripOnConflictForComparison = (
  config: DialogOpenConfig | DialogStoredConfig,
): DialogOpenConfig | DialogStoredConfig => {
  const {
    onConflict: _oc,
    throwOnConflict: _tc,
    ownerToken: _ho,
    ...rest
  } = config as BaseDialogConfig & {
    ownerToken?: symbol;
  };
  return rest as DialogOpenConfig | DialogStoredConfig;
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
export const shouldDialogUpdate = (
  oldConfig: DialogOpenConfig | DialogStoredConfig,
  newConfig: DialogOpenConfig | DialogStoredConfig,
): boolean => {
  const deps = (newConfig as DialogOpenConfig & { _dialogDeps?: DialogDeps })._dialogDeps;

  if (!deps) {
    // No deps specified - use deep comparison on the entire config (ignore internal open-only fields)
    return !deepEqual(stripInternalFieldsForCompare(oldConfig), stripInternalFieldsForCompare(newConfig));
  }

  // Always deeply compare props - no deps needed for this
  const { _dialogDeps: _oldConfigDeps, ...oldConfigWithoutDeps } = oldConfig as DialogOpenConfig & {
    _dialogDeps?: DialogDeps;
  };
  const { _dialogDeps: _newConfigDeps, ...newConfigWithoutDeps } = newConfig as DialogOpenConfig & {
    _dialogDeps?: DialogDeps;
  };

  if (!deepEqual(oldConfigWithoutDeps, newConfigWithoutDeps)) {
    return true; // Props or other config changed
  }

  // Check specific dependency arrays
  const oldDeps = (oldConfig as DialogOpenConfig & { _dialogDeps?: DialogDeps })._dialogDeps;
  if (!oldDeps) {
    // Old dialog had no deps but new one does - assume update needed
    return true;
  }

  // Compare each dependency array using deep comparison
  const simpleDepsToCheck: (keyof Omit<DialogDeps, "actionsDeps">)[] = [
    "contentDeps",
    "titleDeps",
    "statusBarDeps",
    "footerDeps",
  ];

  // Check simple dependency arrays
  const simpleDepsChanged = simpleDepsToCheck.some((depKey) => {
    const oldDepArray = oldDeps[depKey];
    const newDepArray = deps[depKey];

    // If either is undefined, compare existence
    if (!oldDepArray !== !newDepArray) return true;

    // Both undefined - no change for this dep
    if (!oldDepArray && !newDepArray) return false;

    // Compare arrays using proper deep comparison
    return !deepEqualDeps(oldDepArray as DependencyList, newDepArray as DependencyList);
  });

  if (simpleDepsChanged) return true;

  // Special handling for actionsDeps (nested arrays)
  const oldActionsDeps = oldDeps.actionsDeps;
  const newActionsDeps = deps.actionsDeps;

  // If either is undefined, compare existence
  if (!oldActionsDeps !== !newActionsDeps) return true;

  // Both undefined - no change
  if (!oldActionsDeps && !newActionsDeps) return false;

  // Compare nested arrays - each action can have its own deps
  if (oldActionsDeps?.length !== newActionsDeps?.length) return true;

  return (
    oldActionsDeps?.some((oldActionDep, index) => {
      const newActionDep = newActionsDeps?.[index];
      if (!newActionDep) return true;

      // Compare individual action dependency arrays using proper deep comparison
      return !deepEqualDeps(oldActionDep, newActionDep);
    }) ?? false
  );
}

/**
 * Get the currently active (topmost) dialog ID from the dialog stack.
 *
 * @param dialogs - Array of current dialog states
 * @returns The ID of the active dialog, or null if no dialogs are open
 */
export const getActiveDialogKey = (dialogs: DialogState[]): string | null => {
  // Search backwards for the first dialog that isn't just holding the backdrop
  for (let i = dialogs.length - 1; i >= 0; i--) {
    const dialog = dialogs[i];
    // Cast to access internal property safely
    if (!dialog.config._backdropHold) {
      return dialog.key;
    }
  }
  return null;
}
