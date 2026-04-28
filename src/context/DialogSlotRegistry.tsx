"use client";

import type { DependencyList } from "react";
import { createContext, type ReactNode, useCallback, useContext, useMemo } from "react";

import type { DialogKey } from "../types";
import { deepEqual } from "../utils/deepCompare";
import { resolveDialogKey } from "../utils/dialogKey";

export type SlotType = "title" | "content" | "actions" | "statusBar" | "footer" | "props";

export interface DialogSlot {
  key: string;
  slotType: SlotType;
  factory: () => unknown;
  deps: DependencyList;
  /** Cached result of {@link factory} from {@link registerSlot}; used by merge so factories stay pure / single-eval. */
  value?: unknown;
}

export type SlotChangeCallback = (dialogKey: string, slotType: SlotType) => void;

interface DialogSlotRegistryValue {
  registerSlot: (slot: DialogSlot) => void;
  /** Removes one slot type for a dialog key and notifies listeners (e.g. when `useDialogSlots` omits a slot). */
  removeSlot: (dialogKey: DialogKey, slotType: SlotType) => void;
  getSlot: (dialogKey: DialogKey, slotType: SlotType) => DialogSlot | undefined;
  getAllSlots: (dialogKey: DialogKey) => DialogSlot[];
  clearSlots: (dialogKey: DialogKey) => void;
  onSlotChange: (callback: SlotChangeCallback) => () => void; // Subscribe to slot changes
}

const DialogSlotRegistryContext = createContext<DialogSlotRegistryValue | null>(null);

export const DialogSlotRegistryProvider = ({ children }: { children: ReactNode }) => {
  // Map structure: normalized dialogKey string -> slotType -> DialogSlot
  const slotRegistry = useMemo(() => new Map<string, Map<SlotType, DialogSlot>>(), []);
  const changeListeners = useMemo(() => new Set<SlotChangeCallback>(), []);

  const registerSlot = useCallback(
    (slot: DialogSlot) => {
      if (!slotRegistry.has(slot.key)) {
        slotRegistry.set(slot.key, new Map());
      }

      // biome-ignore lint/style/noNonNullAssertion: key guaranteed to exist — set in the block above
      const dialogSlots = slotRegistry.get(slot.key)!;

      const nextValue = slot.factory();
      const existing = dialogSlots.get(slot.slotType);
      const prevValue = existing ? (existing.value ?? existing.factory()) : undefined;

      // Last write wins per (key, slotType): always store the latest factory + resolved value.
      // Notify only when the resolved value actually changed (deps only affect React effect timing).
      dialogSlots.set(slot.slotType, { ...slot, value: nextValue });

      if (existing !== undefined && deepEqual(prevValue, nextValue)) {
        return;
      }

      // Notify synchronously from within useLayoutEffect so React batches the resulting setState
      // calls with the current commit, rendering StableDialogRenderer before the browser paints.
      // React 18 automatic batching merges all setState calls from multiple slots into one render.
      changeListeners.forEach((callback) => { callback(slot.key, slot.slotType); });
    },
    [slotRegistry, changeListeners],
  );

  const removeSlot = useCallback(
    (dialogKey: DialogKey, slotType: SlotType) => {
      const rKey = resolveDialogKey(dialogKey);
      const dialogSlots = slotRegistry.get(rKey.str);
      if (!dialogSlots?.has(slotType)) return;

      dialogSlots.delete(slotType);
      if (dialogSlots.size === 0) {
        slotRegistry.delete(rKey.str);
      }

      changeListeners.forEach((callback) => { callback(rKey.str, slotType); });
    },
    [slotRegistry, changeListeners],
  );

  const getSlot = useCallback(
    (dialogKey: DialogKey, slotType: SlotType): DialogSlot | undefined => {
      const rKey = resolveDialogKey(dialogKey);
      return slotRegistry.get(rKey.str)?.get(slotType);
    },
    [slotRegistry],
  );

  const getAllSlots = useCallback(
    (dialogKey: DialogKey): DialogSlot[] => {
      const rKey = resolveDialogKey(dialogKey);
      const dialogSlots = slotRegistry.get(rKey.str);
      return dialogSlots ? Array.from(dialogSlots.values()) : [];
    },
    [slotRegistry],
  );

  const clearSlots = useCallback(
    (dialogKey: DialogKey) => {
      const rKey = resolveDialogKey(dialogKey);
      const dialogSlots = slotRegistry.get(rKey.str);
      const slotTypes = dialogSlots ? Array.from(dialogSlots.keys()) : [];
      slotRegistry.delete(rKey.str);

      if (slotTypes.length === 0) {
        return;
      }

      slotTypes.forEach((slotType) => {
        changeListeners.forEach((callback) => { callback(rKey.str, slotType); });
      });
    },
    [slotRegistry, changeListeners],
  );

  const onSlotChange = useCallback(
    (callback: SlotChangeCallback) => {
      changeListeners.add(callback);
      // Return unsubscribe function
      return () => changeListeners.delete(callback);
    },
    [changeListeners],
  );

  const contextValue = useMemo(
    () => ({
      registerSlot,
      removeSlot,
      getSlot,
      getAllSlots,
      clearSlots,
      onSlotChange,
    }),
    [registerSlot, removeSlot, getSlot, getAllSlots, clearSlots, onSlotChange],
  );

  return <DialogSlotRegistryContext.Provider value={contextValue}>{children}</DialogSlotRegistryContext.Provider>;
}

export const useDialogSlotRegistry = () => {
  const context = useContext(DialogSlotRegistryContext);
  if (!context) {
    throw new Error("useDialogSlotRegistry must be used within DialogSlotRegistryProvider");
  }
  return context;
}
