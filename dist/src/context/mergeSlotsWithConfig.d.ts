import type { DialogKey, DialogKeyArray, DialogOpenConfig, DialogStoredConfig } from "../types";
import type { DialogSlot } from "./DialogSlotRegistry";
/** Prefer {@link DialogSlot.value} from {@link DialogSlotRegistry.registerSlot} so merge does not re-run factories. */
export declare const getRegisteredSlotContent: (slot: DialogSlot) => unknown;
export interface MergeSlotsSlotRegistry {
    getAllSlots: (dialogKey: DialogKey) => DialogSlot[];
}
/**
 * Merges registered slot factories (and their cached {@link DialogSlot.value}) into an open config.
 * Slot factories should be pure; resolved values are cached on registration.
 */
export declare const mergeSlotsWithConfig: (slotRegistry: MergeSlotsSlotRegistry, config: DialogOpenConfig | DialogStoredConfig, key: string, keySegments?: DialogKeyArray) => DialogOpenConfig | DialogStoredConfig;
