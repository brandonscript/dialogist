import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode, useRef, useState } from "react";

import { DialogProvider } from "../../context/DialogProvider";
import { useDialog } from "../../useDialog";
import { useDialogImperativeHandle } from "../useDialogImperativeHandle";
import { useDialogImperativeValue } from "../useDialogImperativeValue";

const wrapper = ({ children }: { children: ReactNode }) => <DialogProvider>{children}</DialogProvider>;

describe("useDialogImperativeHandle", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("exposes dialog body state to the parent via a registered ref", async () => {
    const { result } = renderHook(
      () => {
        const [isValid, setIsValid] = useState(false);

        // Parent side: register the target ref first so imperativeHandle() finds it
        const ref = useRef<{ isValid: boolean } | null>(null);
        const dialog = useDialog("ih-test");
        dialog.setImperativeHandle(ref);

        // Dialog body side: combined hook binds the init factory to the registered ref
        useDialogImperativeHandle("ih-test", () => ({ isValid }), [isValid]);

        // Reader: subscribe to live value
        const value = useDialogImperativeValue<{ isValid: boolean } | null>("ih-test");

        return { setIsValid, value };
      },
      { wrapper },
    );

    // Initial state
    act(() => {
      jest.advanceTimersByTime(16);
    });
    await waitFor(() => expect(result.current.value?.isValid).toBe(false));

    // Update state
    act(() => {
      result.current.setIsValid(true);
      jest.advanceTimersByTime(16);
    });
    await waitFor(() => expect(result.current.value?.isValid).toBe(true));
  });

  it("accepts an array-style dialog key", async () => {
    const { result } = renderHook(
      () => {
        const [count, setCount] = useState(0);

        // Parent side: register first
        const ref = useRef<{ count: number } | null>(null);
        const dialog = useDialog(["ih", "array"]);
        dialog.setImperativeHandle(ref);

        // Dialog body side
        useDialogImperativeHandle(["ih", "array"], () => ({ count }), [count]);

        const value = useDialogImperativeValue<{ count: number } | null>(["ih", "array"]);

        return { setCount, value };
      },
      { wrapper },
    );

    act(() => {
      result.current.setCount(7);
      jest.advanceTimersByTime(16);
    });
    await waitFor(() => expect(result.current.value?.count).toBe(7));
  });
});
