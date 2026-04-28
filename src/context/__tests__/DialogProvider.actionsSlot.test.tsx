import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode, useContext, useState } from "react";

import { useDialogActions } from "../../hooks/useDialogSlot";
import type { DialogActionProps } from "../../types";
import { useDialog } from "../../useDialog";
import { DialogProvider } from "../DialogProvider";
import { DialogStateContext } from "../DialogStateContext";

const wrapper = ({ children }: { children: ReactNode }) => <DialogProvider>{children}</DialogProvider>;

describe("DialogProvider actions slot", () => {
  it("merges actions from the slot registry into dialog config", async () => {
    const { result } = renderHook(
      () => {
        const [actions, setActions] = useState<DialogActionProps[]>([{ title: "Primary" }]);
        useDialogActions("slot-actions", () => actions, [actions]);
        const dialog = useDialog("slot-actions", { type: "confirm", title: "Slot actions" });
        const state = useContext(DialogStateContext);
        return { actions, setActions, dialog, state };
      },
      { wrapper },
    );

    await act(async () => {
      result.current.dialog.open();
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
      const actions = result.current.state?.dialogs[0].config.actions as DialogActionProps[] | undefined;
      expect(actions?.[0]?.title).toBe("Primary");
    });

    act(() => {
      result.current.setActions([{ title: "Secondary" }, { title: "Tertiary" }]);
    });

    await waitFor(() => {
      const actions = (result.current.state?.dialogs[0].config.actions ?? []) as DialogActionProps[];
      expect(actions.map((action) => action.title)).toEqual(["Secondary", "Tertiary"]);
    });
  });
});
