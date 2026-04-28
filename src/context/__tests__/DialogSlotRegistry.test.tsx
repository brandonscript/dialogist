import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

import { DialogSlotRegistryProvider, useDialogSlotRegistry } from "../DialogSlotRegistry";

const wrapper = ({ children }: { children: ReactNode }) => (
  <DialogSlotRegistryProvider>{children}</DialogSlotRegistryProvider>
);

/** Yield a microtask; kept so tests can await any future async notification path. */
const flushSlotNotifications = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

describe("DialogSlotRegistry", () => {
  it("notifies synchronously once per slot type, within the same act", async () => {
    const listener = jest.fn();
    const { result } = renderHook(() => useDialogSlotRegistry(), { wrapper });

    act(() => {
      result.current.onSlotChange(listener);

      result.current.registerSlot({
        key: "debounced-key",
        slotType: "title",
        factory: () => "Title v1",
        deps: [],
      });
      result.current.registerSlot({
        key: "debounced-key",
        slotType: "content",
        factory: () => "Content v1",
        deps: [],
      });
    });

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, "debounced-key", "title");
    expect(listener).toHaveBeenNthCalledWith(2, "debounced-key", "content");

    await flushSlotNotifications();

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("skips notifications when slot value has not changed (no deps mode)", async () => {
    const listener = jest.fn();
    const { result } = renderHook(() => useDialogSlotRegistry(), { wrapper });

    act(() => {
      result.current.onSlotChange(listener);
      result.current.registerSlot({
        key: "stable-value-key",
        slotType: "title",
        factory: () => "Stable title",
        deps: [],
      });
    });

    await flushSlotNotifications();

    expect(listener).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.registerSlot({
        key: "stable-value-key",
        slotType: "title",
        factory: () => "Stable title",
        deps: [],
      });
    });

    await flushSlotNotifications();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("last write wins: same deps but new factory with different resolved value notifies again", async () => {
    const listener = jest.fn();
    const { result } = renderHook(() => useDialogSlotRegistry(), { wrapper });

    act(() => {
      result.current.onSlotChange(listener);
      result.current.registerSlot({
        key: "deps-key",
        slotType: "props",
        factory: () => ({ borderRadius: 8 }),
        deps: [8],
      });
    });

    await flushSlotNotifications();

    expect(listener).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.registerSlot({
        key: "deps-key",
        slotType: "props",
        factory: () => ({ borderRadius: 16 }),
        deps: [8],
      });
    });

    await flushSlotNotifications();

    expect(listener).toHaveBeenCalledTimes(2);
    expect(result.current.getSlot("deps-key", "props")?.value).toEqual({ borderRadius: 16 });
  });

  it("does not notify again when resolved value unchanged even if factory identity differs", async () => {
    const listener = jest.fn();
    const { result } = renderHook(() => useDialogSlotRegistry(), { wrapper });

    act(() => {
      result.current.onSlotChange(listener);
      result.current.registerSlot({
        key: "same-value-key",
        slotType: "title",
        factory: () => "Same",
        deps: [1],
      });
    });

    await flushSlotNotifications();

    expect(listener).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.registerSlot({
        key: "same-value-key",
        slotType: "title",
        factory: () => "Same",
        deps: [1],
      });
    });

    await flushSlotNotifications();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("keeps independent slot types: title and content both populated for one dialog key", async () => {
    const { result } = renderHook(() => useDialogSlotRegistry(), { wrapper });

    act(() => {
      result.current.registerSlot({
        key: "compose-key",
        slotType: "title",
        factory: () => "From title registration",
        deps: [],
      });
      result.current.registerSlot({
        key: "compose-key",
        slotType: "content",
        factory: () => "From content registration",
        deps: [],
      });
    });

    expect(result.current.getSlot("compose-key", "title")?.value).toBe("From title registration");
    expect(result.current.getSlot("compose-key", "content")?.value).toBe("From content registration");
  });

  it("clearSlots removes all slots for a key and notifies listeners for each slot type", async () => {
    const listener = jest.fn();
    const { result } = renderHook(() => useDialogSlotRegistry(), { wrapper });

    act(() => {
      result.current.onSlotChange(listener);
      result.current.registerSlot({
        key: "clear-key",
        slotType: "title",
        factory: () => "T",
        deps: [],
      });
      result.current.registerSlot({
        key: "clear-key",
        slotType: "content",
        factory: () => "C",
        deps: [],
      });
    });

    await flushSlotNotifications();
    expect(listener).toHaveBeenCalledTimes(2);

    act(() => {
      result.current.clearSlots("clear-key");
    });

    await flushSlotNotifications();

    expect(result.current.getSlot("clear-key", "title")).toBeUndefined();
    expect(result.current.getSlot("clear-key", "content")).toBeUndefined();
    expect(listener).toHaveBeenCalledTimes(4);
    expect(listener).toHaveBeenNthCalledWith(3, "clear-key", "title");
    expect(listener).toHaveBeenNthCalledWith(4, "clear-key", "content");
  });

  it("removeSlot deletes a slot and notifies listeners", async () => {
    const listener = jest.fn();
    const { result } = renderHook(() => useDialogSlotRegistry(), { wrapper });

    act(() => {
      result.current.onSlotChange(listener);
      result.current.registerSlot({
        key: "rm-key",
        slotType: "title",
        factory: () => "T",
        deps: [],
      });
    });

    await flushSlotNotifications();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(result.current.getSlot("rm-key", "title")).toBeDefined();

    act(() => {
      result.current.removeSlot("rm-key", "title");
    });

    await flushSlotNotifications();

    expect(result.current.getSlot("rm-key", "title")).toBeUndefined();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
