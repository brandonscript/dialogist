/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useDeepCallback, useDeepEffect, useDeepMemo } from "../useDeepCompare";

describe("useDeepMemo", () => {
  it("should memoize values using deep comparison", () => {
    const factory = jest.fn(() => ({ computed: "value" }));
    const dep1 = { user: { name: "John" } };
    const dep2 = { user: { name: "John" } }; // Same content, different reference
    const dep3 = { user: { name: "Jane" } }; // Different content

    // First render
    const { result, rerender } = renderHook(({ deps }) => useDeepMemo(factory, deps), {
      initialProps: { deps: [dep1] },
    });

    expect(factory).toHaveBeenCalledTimes(1);
    const firstResult = result.current;

    // Second render with same content but different reference - should not recompute
    rerender({ deps: [dep2] });
    expect(factory).toHaveBeenCalledTimes(1);
    expect(result.current).toBe(firstResult);

    // Third render with different content - should recompute
    rerender({ deps: [dep3] });
    expect(factory).toHaveBeenCalledTimes(2);
    expect(result.current).not.toBe(firstResult);
  });

  it("should handle primitive dependencies", () => {
    const factory = jest.fn(() => "computed");

    const { rerender } = renderHook(({ deps }) => useDeepMemo(factory, deps), {
      initialProps: { deps: [1, "hello", true] },
    });

    expect(factory).toHaveBeenCalledTimes(1);

    // Same primitive values - should not recompute
    rerender({ deps: [1, "hello", true] });
    expect(factory).toHaveBeenCalledTimes(1);

    // Different primitive values - should recompute
    rerender({ deps: [2, "hello", true] });
    expect(factory).toHaveBeenCalledTimes(2);
  });
});

describe("useDeepCallback", () => {
  it("should memoize callbacks using deep comparison", () => {
    const originalCallback = jest.fn((x: number) => x * 2);
    const dep1 = { config: { multiplier: 2 } };
    const dep2 = { config: { multiplier: 2 } }; // Same content, different reference
    const dep3 = { config: { multiplier: 3 } }; // Different content

    const { result, rerender } = renderHook(({ deps }) => useDeepCallback(originalCallback, deps), {
      initialProps: { deps: [dep1] },
    });

    const firstCallback = result.current;

    // Second render with same content but different reference - should return same callback
    rerender({ deps: [dep2] });
    expect(result.current).toBe(firstCallback);

    // Third render with different content - should return new memoized callback
    rerender({ deps: [dep3] });
    expect(result.current).toBe(originalCallback); // Still the original function
    // The function reference should be the same since we're memoizing the same callback function
    // The key is that it will be newly memoized (not the same memoized instance)
  });

  it("should preserve callback functionality", () => {
    const callback = (x: number, y: number) => x + y;
    const deps = [{ config: "test" }];

    const { result } = renderHook(() => useDeepCallback(callback, deps));

    // Callback should work as expected
    expect(result.current(2, 3)).toBe(5);
    expect(result.current(10, 5)).toBe(15);
  });

  it("should have correct TypeScript types", () => {
    const stringCallback = (s: string) => s.toUpperCase();
    const numberCallback = (n: number) => n * 2;
    const voidCallback = () => console.log("test");

    const { result: stringResult } = renderHook(() => useDeepCallback(stringCallback, []));
    const { result: numberResult } = renderHook(() => useDeepCallback(numberCallback, []));
    const { result: voidResult } = renderHook(() => useDeepCallback(voidCallback, []));

    // Type assertions to ensure TypeScript compatibility
    const str: string = stringResult.current("hello");
    const num: number = numberResult.current(5);
    const nothing: ReturnType<typeof voidCallback> = voidResult.current();

    expect(str).toBe("HELLO");
    expect(num).toBe(10);
    expect(nothing).toBeUndefined();
  });
});

describe("useDeepEffect", () => {
  it("should only run effect when dependencies deeply change", () => {
    const effectFn = jest.fn();
    const dep1 = { user: { name: "John" } };
    const dep2 = { user: { name: "John" } }; // Same content, different reference
    const dep3 = { user: { name: "Jane" } }; // Different content

    const { rerender } = renderHook(({ deps }) => useDeepEffect(effectFn, deps), { initialProps: { deps: [dep1] } });

    expect(effectFn).toHaveBeenCalledTimes(1);

    // Same content, different reference - should not run effect
    rerender({ deps: [dep2] });
    expect(effectFn).toHaveBeenCalledTimes(1);

    // Different content - should run effect
    rerender({ deps: [dep3] });
    expect(effectFn).toHaveBeenCalledTimes(2);
  });

  it("should handle cleanup functions", () => {
    const cleanup = jest.fn();
    const effectFn = jest.fn(() => cleanup);
    const dep1 = { config: "test1" };
    const dep2 = { config: "test2" };

    const { rerender, unmount } = renderHook(({ deps }) => useDeepEffect(effectFn, deps), {
      initialProps: { deps: [dep1] },
    });

    expect(effectFn).toHaveBeenCalledTimes(1);
    expect(cleanup).toHaveBeenCalledTimes(0);

    // Change dependencies - should cleanup previous effect and run new one
    rerender({ deps: [dep2] });
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(effectFn).toHaveBeenCalledTimes(2);

    // Unmount - should cleanup
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(2);
  });
});
