import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode, useContext } from "react";
import type { BaseDialogConfig, DialogStoredConfig } from "../../types";
import { useDialog } from "../../useDialog";
import { DialogProvider } from "../DialogProvider";
import { DialogStateContext } from "../DialogStateContext";

const wrapper = ({ children }: { children: ReactNode }) => <DialogProvider>{children}</DialogProvider>;

describe("DialogProvider onConflict replaceSameKey", () => {
  it("updates the same dialog when onConflict is replaceSameKey", async () => {
    const { result } = renderHook(
      () => {
        const dialog = useDialog(["chained-dialog"]);
        const state = useContext(DialogStateContext);
        return { dialog, state };
      },
      { wrapper },
    );

    // 1. Open initial dialog
    await act(async () => {
      result.current.dialog.open({
        type: "confirm",
        title: "Step 1",
        preserveBackdropOnOk: true,
        onConflict: "replaceSameKey",
      });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
      expect((result.current.state?.dialogs[0].config as BaseDialogConfig).title).toBe("Step 1");
    });

    // 2. Simulate user action (OK)
    await act(async () => {
      const row = result.current.state?.dialogs[0];
      row?.resolve?.({
        dialogKey: row.key,
        reason: "action",
        ok: true,
        cancelled: false,
        resolveValue: true,
      });
    });

    // Note: In the real component, the `await dialog.open` resolves,
    // and then we call `dialog.open` again.
    // We can verify the second open updates the state.

    // 3. Open second step (same ID)
    await act(async () => {
      result.current.dialog.open({
        type: "confirm",
        title: "Step 2",
        preserveBackdropOnOk: true,
        onConflict: "replaceSameKey",
      });
    });

    await waitFor(() => {
      // Should still be 1 dialog, but updated
      expect(result.current.state?.dialogs).toHaveLength(1);
      expect((result.current.state?.dialogs[0].config as BaseDialogConfig).title).toBe("Step 2");
      // Should not be in hold state because it was replaced/updated
      expect((result.current.state?.dialogs[0].config as DialogStoredConfig)._backdropHold).toBeFalsy();
    });
  });
});
