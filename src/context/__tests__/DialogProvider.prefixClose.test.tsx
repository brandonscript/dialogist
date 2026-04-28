import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode, useContext } from "react";
import { useDialogIsOpen } from "../../hooks/useDialogState";
import { useDialog } from "../../useDialog";
import { DialogProvider } from "../DialogProvider";
import { DialogStateContext } from "../DialogStateContext";

const wrapper = ({ children }: { children: ReactNode }) => <DialogProvider>{children}</DialogProvider>;

describe("DialogProvider prefix-key close", () => {
  it("closes a composite-key dialog when close() is called with the root key", async () => {
    const { result } = renderHook(
      () => {
        const rootDialog = useDialog("checkout-flow");
        const state = useContext(DialogStateContext);
        return { rootDialog, state };
      },
      { wrapper },
    );

    // Open a step using the composite key directly (as useDialogFlow would)
    await act(async () => {
      result.current.rootDialog.open({
        type: "custom",
        dialogKey: ["checkout-flow", "shipping"],
        title: "Shipping",
        message: "Enter address",
      });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
      expect(result.current.state?.dialogs[0].key).toBe("checkout-flow::shipping");
    });

    // Close using only the root key — should find and close the composite-key dialog
    await act(async () => {
      result.current.rootDialog.close();
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(0);
    });
  });

  it("does not prefix-match an unrelated dialog that shares a string prefix", async () => {
    const { result } = renderHook(
      () => {
        const d = useDialog(["checkout-flow-extra", "step-1"]);
        const root = useDialog("checkout-flow");
        const state = useContext(DialogStateContext);
        return { d, root, state };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.d.open({ type: "custom", title: "Other", message: " " });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
    });

    // "checkout-flow" should NOT match "checkout-flow-extra::step-1"
    await act(async () => {
      result.current.root.close();
    });

    await waitFor(() => {
      // Dialog should still be open — close had no matching target
      expect(result.current.state?.dialogs).toHaveLength(1);
    });
  });

  it("opening root key while a composite-key step is open is blocked and does not replace the step", async () => {
    const { result } = renderHook(
      () => {
        const step = useDialog(["checkout-flow", "step-1"]);
        const root = useDialog("checkout-flow");
        const state = useContext(DialogStateContext);
        return { step, root, state };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.step.open({
        type: "custom",
        title: "Step 1",
        message: " ",
        onConflict: "replaceSameKey",
      });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
      expect(result.current.state?.dialogs[0].key).toBe("checkout-flow::step-1");
    });

    let rootResult: unknown;
    await act(async () => {
      rootResult = await result.current.root.open({ type: "custom", title: "Root", message: " " });
    });

    expect(rootResult).toEqual(
      expect.objectContaining({ ok: false, cancelled: false, blocked: true, resolveValue: false }),
    );
    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
      expect(result.current.state?.dialogs[0].key).toBe("checkout-flow::step-1");
    });
  });
});

describe("useDialogIsOpen prefix matching", () => {
  it("returns true when a composite-key dialog is open and the root key is queried", async () => {
    const { result } = renderHook(
      () => {
        const step = useDialog(["checkout-flow", "step-1"]);
        const isRootOpen = useDialogIsOpen("checkout-flow");
        return { step, isRootOpen };
      },
      { wrapper },
    );

    expect(result.current.isRootOpen).toBe(false);

    await act(async () => {
      result.current.step.open({ type: "custom", title: "Step 1", message: " " });
    });

    await waitFor(() => {
      expect(result.current.isRootOpen).toBe(true);
    });
  });

  it("returns false for the root key when no step is open", async () => {
    const { result } = renderHook(() => useDialogIsOpen("checkout-flow"), { wrapper });

    expect(result.current).toBe(false);
  });
});
