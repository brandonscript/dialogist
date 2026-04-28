import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode, useContext, useEffect, useState } from "react";
import { useDialog } from "../../useDialog";
import { useDialogActionsContext } from "../DialogActionsContext";
import { DialogCallbacksContext } from "../DialogCallbacksContext";
import { DialogProvider } from "../DialogProvider";
import { DialogStateContext } from "../DialogStateContext";

const wrapper = ({ children }: { children: ReactNode }) => <DialogProvider>{children}</DialogProvider>;

describe("DialogProvider canClose guard", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("prevents close until _setHandlers allows it", async () => {
    const closePrevented = jest.fn();
    const { result } = renderHook(
      () => {
        const dialog = useDialog("guarded", { type: "alert", message: "Guard me", canClose: false });
        const callbacks = useContext(DialogCallbacksContext);
        const [closeCount, setCloseCount] = useState(0);

        useEffect(() => {
          const unsubscribe = dialog.on("closePrevented", closePrevented);
          return unsubscribe;
        }, [dialog]);

        useEffect(() => {
          if (!callbacks) return;
          const unsubscribe = callbacks.didClose(() => setCloseCount((count) => count + 1));
          return unsubscribe;
        }, [callbacks]);

        return { dialog, closeCount };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.dialog.open();
    });

    expect(result.current.dialog.canClose()).toBe(false);

    await act(async () => {
      result.current.dialog.close();
    });

    await waitFor(() => {
      expect(closePrevented).toHaveBeenCalledTimes(1);
    });
    expect(closePrevented).toHaveBeenCalledWith(expect.objectContaining({ reason: "programmatic" }));
    expect(result.current.closeCount).toBe(0);

    act(() => {
      result.current.dialog._setHandlers({ canClose: true });
    });

    expect(result.current.dialog.canClose()).toBe(true);

    await act(async () => {
      result.current.dialog.close();
    });

    await waitFor(() => expect(result.current.closeCount).toBe(1));
  });

  it("invokes guard functions with close context and blocks until they allow closing", async () => {
    const guardSpy = jest.fn().mockReturnValue(false);
    const { result } = renderHook(
      () => {
        const dialog = useDialog("guarded-confirm");
        const actions = useDialogActionsContext();
        const callbacks = useContext(DialogCallbacksContext);
        const [closeCount, setCloseCount] = useState(0);

        useEffect(() => {
          if (!callbacks) return;
          const unsubscribe = callbacks.didClose(() => setCloseCount((count) => count + 1));
          return unsubscribe;
        }, [callbacks]);

        return { dialog, actions, closeCount };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.dialog.open({ type: "confirm", message: "Confirmation", canClose: guardSpy });
    });

    await act(async () => {
      result.current.actions.closeDialog("guarded-confirm", {
        reason: "action",
        actionEvent: {
          action: "okClicked",
          buttonText: "Confirm",
        },
        resolveValue: true,
      });
    });

    expect(guardSpy).toHaveBeenCalledTimes(1);
    expect(guardSpy.mock.calls[0][0]).toMatchObject({
      dialogKey: "guarded-confirm",
      keySegments: ["guarded-confirm"],
      reason: "action",
      action: "okClicked",
      buttonText: "Confirm",
    });
    expect(result.current.closeCount).toBe(0);

    guardSpy.mockReturnValue(true);

    await act(async () => {
      result.current.actions.closeDialog("guarded-confirm", {
        reason: "action",
        actionEvent: {
          action: "okClicked",
          buttonText: "Confirm",
        },
        resolveValue: true,
      });
    });

    await waitFor(() => expect(result.current.closeCount).toBe(1));
  });

  it("suppresses a replayed action close that reuses the same nativeEvent after canClose unblocks", async () => {
    const guardSpy = jest.fn().mockReturnValue(false);
    const { result } = renderHook(
      () => {
        const dialog = useDialog("dup-native");
        const actions = useDialogActionsContext();
        const callbacks = useContext(DialogCallbacksContext);
        const [closeCount, setCloseCount] = useState(0);

        useEffect(() => {
          if (!callbacks) return;
          const unsubscribe = callbacks.didClose(() => setCloseCount((count) => count + 1));
          return unsubscribe;
        }, [callbacks]);

        return { dialog, actions, closeCount };
      },
      { wrapper },
    );

    const nativeStub = { type: "click", isTrusted: true } as unknown as import("react").MouseEvent;

    await act(async () => {
      result.current.dialog.open({ type: "confirm", message: "Dup native", canClose: guardSpy });
    });

    await act(async () => {
      result.current.actions.closeDialog("dup-native", {
        reason: "action",
        cancelled: true,
        actionEvent: {
          action: "cancelClicked",
          actionId: "cancel",
          buttonText: "Cancel",
          nativeEvent: nativeStub,
        },
        resolveValue: false,
      });
    });

    expect(guardSpy).toHaveBeenCalled();
    expect(result.current.closeCount).toBe(0);

    guardSpy.mockReturnValue(true);

    await act(async () => {
      result.current.actions.closeDialog("dup-native", {
        reason: "action",
        cancelled: true,
        actionEvent: {
          action: "cancelClicked",
          actionId: "cancel",
          buttonText: "Cancel",
          nativeEvent: nativeStub,
        },
        resolveValue: false,
      });
    });

    expect(result.current.closeCount).toBe(0);

    const nativeStub2 = { type: "click", isTrusted: true } as unknown as import("react").MouseEvent;

    await act(async () => {
      result.current.actions.closeDialog("dup-native", {
        reason: "action",
        cancelled: true,
        actionEvent: {
          action: "cancelClicked",
          actionId: "cancel",
          buttonText: "Cancel",
          nativeEvent: nativeStub2,
        },
        resolveValue: false,
      });
    });

    await waitFor(() => expect(result.current.closeCount).toBe(1));
  });
});

describe("closeAllDialogs", () => {
  it("skips close when any row fails canClose unless { force: true }", async () => {
    const { result } = renderHook(
      () => {
        const actions = useDialogActionsContext();
        const state = useContext(DialogStateContext);
        return { actions, state };
      },
      { wrapper },
    );

    await act(async () => {
      void result.current.actions.openDialog({
        type: "alert",
        message: "Guarded",
        dialogKey: "close-all-solo",
        canClose: false,
      });
    });

    await waitFor(() => expect(result.current.state?.dialogs.length).toBe(1));

    await act(async () => {
      result.current.actions.closeAllDialogs();
    });

    expect(result.current.state?.dialogs.length).toBe(1);

    await act(async () => {
      result.current.actions.closeAllDialogs({ force: true });
    });

    await waitFor(() => expect(result.current.state?.dialogs.length).toBe(0));
  });
});
