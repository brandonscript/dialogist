import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

import { DialogProvider } from "../../context/DialogProvider";
import { useDialogSlots } from "../useDialogSlot";

const wrapper = ({ children }: { children: ReactNode }) => <DialogProvider>{children}</DialogProvider>;

describe("useDialogSlots", () => {
  it("throws when a slot tuple is not exactly two elements", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      renderHook(
        () =>
          useDialogSlots("bad-slot-tuple", {
            // Intentionally malformed at runtime (one element only).
            title: ["title only"] as any,
          }),
        { wrapper },
      );
    }).toThrow(/two-element tuple/);
    consoleError.mockRestore();
  });

  it("throws when a slot tuple has more than two elements", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      renderHook(
        () =>
          useDialogSlots("bad-slot-tuple-len", {
            title: ["a", [1], "extra"] as any,
          }),
        { wrapper },
      );
    }).toThrow(/two-element tuple/);
    consoleError.mockRestore();
  });

  it("does not throw when deps is an empty array", () => {
    expect(() => {
      renderHook(() => useDialogSlots("ok-empty-deps", { title: ["Ok", []] }), { wrapper });
    }).not.toThrow();
  });
});
