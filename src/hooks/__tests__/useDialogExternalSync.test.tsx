import { act, renderHook } from "@testing-library/react";

import { useDialogExternalSync } from "../useDialogExternalSync";

describe("useDialogExternalSync", () => {
  it("accepts functional setValue like setState", () => {
    const setExternalValue = jest.fn();
    const initialList = [1, 2];

    const { result } = renderHook(() =>
      useDialogExternalSync({
        externalValue: initialList,
        setExternalValue,
        debounceMs: 0,
        throttleMs: 0,
      }),
    );

    act(() => {
      result.current.setValue((prev) => [...prev, 3]);
    });

    expect(result.current.value).toEqual([1, 2, 3]);
  });

  it("chains functional updates using latest local value", () => {
    const setExternalValue = jest.fn();

    const { result } = renderHook(() =>
      useDialogExternalSync({
        externalValue: 0,
        setExternalValue,
        debounceMs: 0,
        throttleMs: 0,
      }),
    );

    act(() => {
      result.current.setValue((n) => n + 1);
      result.current.setValue((n) => n + 1);
    });

    expect(result.current.value).toBe(2);
  });
});
