/** @jest-environment jsdom */

import { renderHook } from "@testing-library/react";

import { clearDialogStateValue, useDialogStateSource, useDialogStateValue } from "../DialogState";

describe("useDialogStateValue", () => {
  afterEach(() => {
    clearDialogStateValue("test-dialog", "counter");
  });

  it("does not warn when initialValue is stable", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    renderHook(() => useDialogStateValue("test-dialog", "counter", 0));
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("warns once when initialValue changes for the same dialog key + state key", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = renderHook(
      ({ initial }: { initial: number }) => useDialogStateValue("test-dialog", "counter", initial),
      {
        initialProps: { initial: 0 },
      },
    );
    rerender({ initial: 1 });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toEqual(expect.stringContaining("useDialogStateValue"));
    expect(warn.mock.calls[0]?.[0]).toEqual(expect.stringContaining("initialValue"));
    warn.mockRestore();
  });

  it("does not warn when the store key changes (new dialogKey or key)", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const { rerender } = renderHook(
        ({ dialogKey }: { dialogKey: string }) => useDialogStateValue(dialogKey, "counter", 0),
        { initialProps: { dialogKey: "dlg-a" } },
      );
      rerender({ dialogKey: "dlg-b" });
      expect(warn).not.toHaveBeenCalled();
    } finally {
      clearDialogStateValue("dlg-a", "counter");
      clearDialogStateValue("dlg-b", "counter");
      warn.mockRestore();
    }
  });
});

describe("useDialogStateSource", () => {
  afterEach(() => {
    clearDialogStateValue("test-dialog", "src");
  });

  it("warns when initial source changes for the same store key", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const initialProps: { initial: "dialog" | "external" } = { initial: "external" };
    const { rerender } = renderHook(
      ({ initial }: { initial: "dialog" | "external" }) => useDialogStateSource("test-dialog", "src", initial),
      { initialProps },
    );
    rerender({ initial: "dialog" });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toEqual(expect.stringContaining("useDialogStateSource"));
    warn.mockRestore();
  });
});
