import type { DependencyList } from "react";
import { type ReactNode } from "react";
import type { DialogKey } from "../types";
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
    onSlotChange: (callback: SlotChangeCallback) => () => void;
}
export declare const DialogSlotRegistryProvider: ({ children }: {
    children: ReactNode;
}) => import("react/jsx-runtime").JSX.Element;
export declare const useDialogSlotRegistry: () => DialogSlotRegistryValue;
export {};
