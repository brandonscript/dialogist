import type { DialogSlot } from "../DialogSlotRegistry";
import { getRegisteredSlotContent, mergeSlotsWithConfig } from "../mergeSlotsWithConfig";

describe("mergeSlotsWithConfig", () => {
  it("uses cached slot value and does not invoke factory when value is set", () => {
    const factory = jest.fn(() => "from-factory");
    const slot: DialogSlot = {
      key: "k",
      slotType: "title",
      factory,
      deps: [],
      value: "cached-title",
    };
    const registry = { getAllSlots: () => [slot] };
    const merged = mergeSlotsWithConfig(registry, { type: "custom", message: "body", dialogKey: ["k"] }, "k", ["k"]);
    expect(factory).not.toHaveBeenCalled();
    expect(merged.title).toBe("cached-title");
  });

  it("getRegisteredSlotContent falls back to factory when value is unset", () => {
    const factory = jest.fn(() => 42);
    const slot: DialogSlot = { key: "k", slotType: "props", factory, deps: [] };
    expect(getRegisteredSlotContent(slot)).toBe(42);
    expect(factory).toHaveBeenCalledTimes(1);
  });
});
