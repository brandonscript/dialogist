import type { ReactNode } from "react";
import type {
  BaseDialogConfig,
  DialogActionsInput,
  DialogKey,
  DialogKeyArray,
  DialogOpenConfig,
  DialogPartContent,
  DialogStoredConfig,
} from "../types";
import { ensureDialogKeyArray } from "../utils/dialogKey";
import type { DialogSlot } from "./DialogSlotRegistry";

/** Prefer {@link DialogSlot.value} from {@link DialogSlotRegistry.registerSlot} so merge does not re-run factories. */
export const getRegisteredSlotContent = (slot: DialogSlot): unknown =>
  slot.value !== undefined ? slot.value : slot.factory();

export interface MergeSlotsSlotRegistry {
  getAllSlots: (dialogKey: DialogKey) => DialogSlot[];
}

/**
 * Merges registered slot factories (and their cached {@link DialogSlot.value}) into an open config.
 * Slot factories should be pure; resolved values are cached on registration.
 */
export const mergeSlotsWithConfig = (
  slotRegistry: MergeSlotsSlotRegistry,
  config: DialogOpenConfig | DialogStoredConfig,
  key: string,
  keySegments?: DialogKeyArray,
): DialogOpenConfig | DialogStoredConfig => {
  const registeredSlots = slotRegistry.getAllSlots(key);

  if (registeredSlots.length === 0) {
    if (keySegments) {
      const resolvedKeySegments = ensureDialogKeyArray(config.dialogKey as DialogKey) ?? keySegments;
      return { ...config, dialogKey: resolvedKeySegments } as DialogOpenConfig | DialogStoredConfig;
    }
    return config;
  }

  const mergedConfig = { ...config };

  if (keySegments) {
    (mergedConfig as BaseDialogConfig).dialogKey =
      ensureDialogKeyArray(mergedConfig.dialogKey as DialogKey) ?? keySegments;
  }

  registeredSlots.forEach((slot) => {
    const slotContent = getRegisteredSlotContent(slot);

    switch (slot.slotType) {
      case "title":
        mergedConfig.title = slotContent as ReactNode;
        break;
      case "content":
        mergedConfig.message = slotContent as DialogPartContent;
        break;
      case "statusBar":
        mergedConfig.statusBar = slotContent as DialogPartContent;
        break;
      case "footer":
        mergedConfig.footer = slotContent as DialogPartContent;
        break;
      case "props":
        Object.assign(mergedConfig, slotContent);
        break;
      case "actions":
        if (Array.isArray(slotContent)) {
          (mergedConfig as BaseDialogConfig).actions = slotContent as DialogActionsInput;
        }
        break;
    }
  });

  if (!keySegments) {
    return mergedConfig;
  }

  return {
    ...mergedConfig,
    dialogKey: ensureDialogKeyArray(mergedConfig.dialogKey as DialogKey) ?? keySegments,
  };
};
