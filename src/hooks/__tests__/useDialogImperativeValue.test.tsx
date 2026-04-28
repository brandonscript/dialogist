import { act, renderHook } from "@testing-library/react";
import type { MutableRefObject } from "react";

import { clearDialogImperativeHandle, registerDialogImperativeHandle } from "../../context/DialogImperativeHandles";
import { useDialogImperativeValue } from "../useDialogImperativeValue";

const flushImperativeNotifications = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

describe("useDialogImperativeValue", () => {
  const dialogKey = "imperative-subscribe-test";

  afterEach(async () => {
    await act(async () => {
      clearDialogImperativeHandle(dialogKey);
      await Promise.resolve();
    });
  });

  it("updates snapshot when imperative handle current changes", async () => {
    const ref: MutableRefObject<{ count: number } | null> = { current: null };
    registerDialogImperativeHandle(dialogKey, ref);

    const { result } = renderHook(() => useDialogImperativeValue<{ count: number } | null>(dialogKey));

    await flushImperativeNotifications();
    expect(result.current).toBeNull();

    await act(async () => {
      ref.current = { count: 1 };
      await Promise.resolve();
    });

    expect(result.current).toEqual({ count: 1 });

    await act(async () => {
      ref.current = { count: 2 };
      await Promise.resolve();
    });

    expect(result.current).toEqual({ count: 2 });
  });

  it("returns null after the handle is cleared", async () => {
    const ref: MutableRefObject<{ ready: boolean } | null> = { current: { ready: true } };
    registerDialogImperativeHandle(dialogKey, ref);

    const { result } = renderHook(() => useDialogImperativeValue<{ ready: boolean } | null>(dialogKey));

    await flushImperativeNotifications();
    expect(result.current).toEqual({ ready: true });

    await act(async () => {
      clearDialogImperativeHandle(dialogKey);
      await Promise.resolve();
    });

    expect(result.current).toBeNull();
  });
});
