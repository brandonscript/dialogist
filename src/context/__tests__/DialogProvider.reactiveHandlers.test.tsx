import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode, useContext, useEffect, useState } from "react";
import { clearDialogHandlersRow } from "../../state/DialogHandlers";
import { useDialog } from "../../useDialog";
import { DialogCallbacksContext } from "../DialogCallbacksContext";
import { DialogProvider } from "../DialogProvider";
import { DialogStateContext } from "../DialogStateContext";

const wrapper = ({ children }: { children: ReactNode }) => <DialogProvider>{children}</DialogProvider>;

describe("DialogProvider reactive handlers", () => {
  it("canClose predicate reads fresh state after re-render", async () => {
    const { result } = renderHook(
      () => {
        const [allow, setAllow] = useState(false);
        const dialog = useDialog("live-guard", {
          type: "alert",
          message: "M",
          canClose: () => allow,
        });
        const callbacks = useContext(DialogCallbacksContext);
        const [closeCount, setCloseCount] = useState(0);
        useEffect(() => {
          if (!callbacks) return () => {};
          return callbacks.didClose(() => setCloseCount((c) => c + 1));
        }, [callbacks]);
        return { dialog, setAllow, closeCount };
      },
      { wrapper },
    );

    await act(async () => {
      void result.current.dialog.open();
    });

    expect(result.current.dialog.canClose()).toBe(false);

    act(() => {
      result.current.setAllow(true);
    });

    await waitFor(() => {
      expect(result.current.dialog.canClose()).toBe(true);
    });

    await act(async () => {
      result.current.dialog.close();
    });

    await waitFor(() => {
      expect(result.current.closeCount).toBe(1);
    });
  });

  it("_clearHandlers restores canClose from config", async () => {
    const { result } = renderHook(
      () => {
        const dialog = useDialog("clear-guard", {
          type: "alert",
          message: "x",
          canClose: () => false,
        });
        return { dialog };
      },
      { wrapper },
    );

    await act(async () => {
      void result.current.dialog.open();
    });

    expect(result.current.dialog.canClose()).toBe(false);

    act(() => {
      result.current.dialog._setHandlers({ canClose: true });
    });
    expect(result.current.dialog.canClose()).toBe(true);

    act(() => {
      result.current.dialog._clearHandlers(["canClose"]);
    });
    expect(result.current.dialog.canClose()).toBe(false);
  });

  it("_getHandlers returns snapshot only for owning hook", async () => {
    const { result } = renderHook(
      () => {
        const dialog = useDialog("owner-snap", { type: "alert", message: "x" });
        return { dialog };
      },
      { wrapper },
    );

    expect(result.current.dialog._getHandlers()).toBeUndefined();

    await act(async () => {
      void result.current.dialog.open();
    });

    const snap = result.current.dialog._getHandlers();
    expect(snap).toBeDefined();
    expect(snap?.internalId).toBeDefined();
    expect(typeof snap?.ownerToken).toBe("symbol");
  });

  it("re-seeds reactive handlers when the row was cleared while the dialog stayed open", async () => {
    const { result } = renderHook(
      () => {
        const [allow, setAllow] = useState(false);
        const dialog = useDialog("recover-handler-row", {
          type: "alert",
          message: "x",
          canClose: () => allow,
        });
        const state = useContext(DialogStateContext);
        return { dialog, setAllow, state };
      },
      { wrapper },
    );

    await act(async () => {
      void result.current.dialog.open();
    });

    expect(result.current.dialog.canClose()).toBe(false);

    const top = result.current.state?.dialogs[0];
    if (!top) {
      throw new Error("expected dialog on stack");
    }

    act(() => {
      clearDialogHandlersRow(top.key, top.internalId);
    });

    act(() => {
      result.current.setAllow(true);
    });

    await waitFor(() => {
      expect(result.current.dialog.canClose()).toBe(true);
    });
  });
});
