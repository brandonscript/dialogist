import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode, useContext } from "react";
import type { DialogStoredConfig } from "../../types";
import { useDialog } from "../../useDialog";
import { DialogActionsContext } from "../DialogActionsContext";
import { DialogProvider } from "../DialogProvider";
import { DialogStateContext } from "../DialogStateContext";

const wrapper = ({ children }: { children: ReactNode }) => <DialogProvider>{children}</DialogProvider>;

describe("DialogProvider backdrop hold", () => {
  it("allows opening a new dialog when the active one is only holding backdrop", async () => {
    const { result } = renderHook(
      () => {
        const primary = useDialog("primary-dialog");
        const secondary = useDialog("secondary-dialog");
        const state = useContext(DialogStateContext);
        const actions = useContext(DialogActionsContext);
        return { primary, secondary, state, actions };
      },
      { wrapper },
    );

    // 1. Open primary dialog
    await act(async () => {
      result.current.primary.open({
        type: "confirm",
        message: "Primary",
        preserveBackdropOnOk: true,
      });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
      expect(result.current.state?.dialogs[0].key).toBe("primary-dialog");
    });

    // 2. Close primary dialog with preserveBackdrop
    await act(async () => {
      result.current.actions?.closeDialog("primary-dialog", {
        preserveBackdrop: true,
        resolveValue: true,
      });
    });

    await waitFor(() => {
      // Should still have 1 dialog, but it should be holding
      expect(result.current.state?.dialogs).toHaveLength(1);
      expect((result.current.state?.dialogs[0].config as DialogStoredConfig)._backdropHold).toBe(true);
    });

    // 3. Open secondary dialog
    // This should succeed because the holding dialog is ignored for chaining checks
    let opened = false;
    await act(async () => {
      result.current.secondary.open({
        type: "alert",
        message: "Secondary",
      });
      opened = true;
    });

    expect(opened).toBe(true);

    await waitFor(() => {
      // Should now have 2 dialogs: [primary(hold), secondary]
      expect(result.current.state?.dialogs).toHaveLength(2);
      expect(result.current.state?.dialogs[0].key).toBe("primary-dialog");
      expect(result.current.state?.dialogs[1].key).toBe("secondary-dialog");
      expect((result.current.state?.dialogs[0].config as DialogStoredConfig)._backdropHold).toBe(true);
      expect((result.current.state?.dialogs[1].config as DialogStoredConfig)._backdropHold).toBeFalsy();
    });
  });
});
