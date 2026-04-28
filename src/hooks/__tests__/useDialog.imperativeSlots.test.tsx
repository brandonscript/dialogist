import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode, useContext, useImperativeHandle, useRef, useState } from "react";

import { DialogProvider } from "../../context/DialogProvider";
import { DialogStateContext, type DialogStateContextValue } from "../../context/DialogStateContext";
import { useDialog } from "../../useDialog";
import { useDialogImperativeValue } from "../useDialogImperativeValue";

const wrapper = ({ children }: { children: ReactNode }) => <DialogProvider>{children}</DialogProvider>;

describe("useDialog imperative slot setters", () => {
  const resolveDialogState = (state: DialogStateContextValue | null) => {
    if (!state) {
      throw new Error("DialogStateContext is not available in test wrapper");
    }
    return state;
  };

  it("updates title, content, status bar, footer, and props via imperative setters", async () => {
    const { result } = renderHook(
      () => {
        const dialog = useDialog("imperative-test", {
          type: "alert",
          title: "Initial title",
          message: "Initial message",
        });
        const state = resolveDialogState(useContext(DialogStateContext));
        return { dialog, state };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.dialog.open();
    });

    await waitFor(() => {
      expect(result.current.state.dialogs).toHaveLength(1);
    });

    act(() => {
      result.current.dialog.setTitle("Updated title");
    });

    await waitFor(() => {
      expect(result.current.state.dialogs[0].config.title).toBe("Updated title");
    });

    act(() => {
      result.current.dialog.setContent("Updated message");
    });

    await waitFor(() => {
      expect(result.current.state.dialogs[0].config.message).toBe("Updated message");
    });

    act(() => {
      result.current.dialog.setStatusBar("Updated status");
      result.current.dialog.setFooter("Updated footer");
    });

    await waitFor(() => {
      expect(result.current.state.dialogs[0].config.statusBar).toBe("Updated status");
      expect(result.current.state.dialogs[0].config.footer).toBe("Updated footer");
    });

    act(() => {
      result.current.dialog.setProps({ borderRadius: 24 });
    });

    await waitFor(() => {
      expect(result.current.state.dialogs[0].config.borderRadius).toBe(24);
    });
  });

  it("accepts factories for slot values", async () => {
    const computeFooter = jest.fn().mockReturnValue("Computed footer");

    const { result } = renderHook(
      () => {
        const dialog = useDialog("imperative-factory", { type: "alert", title: "Factory test", message: "Factory" });
        const state = resolveDialogState(useContext(DialogStateContext));
        return { dialog, state };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.dialog.open();
    });

    await waitFor(() => {
      expect(result.current.state.dialogs).toHaveLength(1);
    });

    act(() => {
      result.current.dialog.setTitle(() => "Factory title");
      result.current.dialog.setContent(() => "Factory content");
      result.current.dialog.setFooter(computeFooter);
      result.current.dialog.setProps(() => ({ overflow: "hidden" }));
    });

    await waitFor(() => {
      const [dialogState] = result.current.state.dialogs;
      expect(dialogState.config.title).toBe("Factory title");
      expect(dialogState.config.message).toBe("Factory content");
      expect(dialogState.config.footer).toBe("Computed footer");
      expect(dialogState.config.overflow).toBe("hidden");
    });

    expect(computeFooter).toHaveBeenCalled();
  });

  it("shares imperative handle refs across hooks scoped by dialog key", () => {
    const { result } = renderHook(
      () => {
        const parentDialog = useDialog("imperative-handle-share");
        const childDialog = useDialog("imperative-handle-share");
        const sharedRef = useRef<{ value?: string } | null>(null);
        return { parentDialog, childDialog, sharedRef };
      },
      { wrapper },
    );

    act(() => {
      result.current.parentDialog.setImperativeHandle(result.current.sharedRef);
    });

    const childHandle = result.current.childDialog.imperativeHandle<{ value?: string } | null>();
    expect(childHandle).toBe(result.current.sharedRef);

    act(() => {
      if (childHandle) {
        (childHandle as React.MutableRefObject<{ value?: string } | null>).current = { value: "live" };
      }
    });

    expect(result.current.sharedRef.current).toEqual({ value: "live" });
  });

  it("clears imperative handle registry entries when the owner unmounts", () => {
    const { unmount } = renderHook(
      () => {
        const dialog = useDialog("imperative-handle-cleanup");
        const sharedRef = useRef<{ done?: boolean } | null>(null);
        dialog.setImperativeHandle(sharedRef);
        return { sharedRef };
      },
      { wrapper },
    );

    unmount();

    const { result: fresh } = renderHook(
      () => {
        const handle = useDialog("imperative-handle-cleanup").imperativeHandle<{ done?: boolean } | null>();
        return { handle };
      },
      { wrapper },
    );

    expect(fresh.current.handle?.current).toBeNull();
  });

  it("provides live snapshots via useDialogImperativeValue", () => {
    const { result } = renderHook(
      () => {
        const parentDialog = useDialog("imperative-snapshot");
        const childDialog = useDialog("imperative-snapshot");
        const ref = useRef<{ count: number } | null>(null);
        const [count, setCount] = useState(0);
        parentDialog.setImperativeHandle(ref);
        const value = useDialogImperativeValue<{ count: number } | null>("imperative-snapshot");
        const childHandle = childDialog.imperativeHandle<{ count: number } | null>();
        useImperativeHandle(childHandle, () => ({ count }), [count]);
        return { value, setCount };
      },
      { wrapper },
    );

    expect(result.current.value?.count ?? 0).toBe(0);

    act(() => {
      result.current.setCount(5);
    });

    return waitFor(() => {
      expect(result.current.value?.count).toBe(5);
    });
  });
});
