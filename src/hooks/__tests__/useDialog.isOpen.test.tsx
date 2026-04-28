import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

import { DialogProvider } from "../../context/DialogProvider";
import { useDialog } from "../../useDialog";
import { useDialogIsOpen } from "../useDialogState";

const wrapper = ({ children }: { children: ReactNode }) => <DialogProvider>{children}</DialogProvider>;

describe("useDialog isOpen", () => {
  it("is false when the dialog is not on the stack", () => {
    const { result } = renderHook(() => useDialog("use-dialog-isopen-a"), { wrapper });
    expect(result.current.isOpen).toBe(false);
  });

  it("matches useDialogIsOpen for the same key", async () => {
    const { result } = renderHook(
      () => {
        const d = useDialog("use-dialog-isopen-b");
        const fromHook = useDialogIsOpen("use-dialog-isopen-b");
        return { d, fromHook };
      },
      { wrapper },
    );

    expect(result.current.d.isOpen).toBe(result.current.fromHook);

    await act(async () => {
      void result.current.d.open({ type: "alert", message: "x" });
    });
    expect(result.current.d.isOpen).toBe(true);
    expect(result.current.fromHook).toBe(true);

    act(() => {
      result.current.d.close();
    });
    expect(result.current.d.isOpen).toBe(false);
    expect(result.current.fromHook).toBe(false);
  });
});
