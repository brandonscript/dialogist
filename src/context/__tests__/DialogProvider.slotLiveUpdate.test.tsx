import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode, StrictMode, useContext, useState } from "react";

import { useDialogSlots } from "../../hooks/useDialogSlot";
import { useDialog } from "../../useDialog";
import { DialogProvider } from "../DialogProvider";
import { DialogStateContext } from "../DialogStateContext";

const wrapper = ({ children }: { children: ReactNode }) => <DialogProvider>{children}</DialogProvider>;

const strictWrapper = ({ children }: { children: ReactNode }) => (
  <StrictMode>
    <DialogProvider>{children}</DialogProvider>
  </StrictMode>
);

describe("DialogProvider slot live updates while open", () => {
  it("updates message and contentStyle when content and props slots change", async () => {
    const { result } = renderHook(
      () => {
        const [align, setAlign] = useState<"start" | "end">("start");
        useDialogSlots("slot-live-align", {
          title: ["Align demo", []],
          content: [() => `Flex line: ${align}`, [align]],
          actions: [
            () => [
              { id: "cancel", title: "Cancel" },
              { id: "ok", title: "OK" },
            ],
            [],
          ],
          props: [
            () => ({
              contentStyle: { align },
            }),
            [align],
          ],
        });
        const dialog = useDialog("slot-live-align");
        const state = useContext(DialogStateContext);
        return { align, setAlign, dialog, state };
      },
      { wrapper },
    );

    await act(async () => {
      void result.current.dialog.open({
        type: "confirm",
        onConflict: "replaceSameKey",
      });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
      expect(String(result.current.state?.dialogs[0].config.message)).toContain("start");
      expect(
        (result.current.state?.dialogs[0].config as { contentStyle?: { align?: string } }).contentStyle?.align,
      ).toBe("start");
    });

    await act(async () => {
      result.current.setAlign("end");
    });

    await waitFor(
      () => {
        expect(String(result.current.state?.dialogs[0].config.message)).toContain("end");
        expect(
          (result.current.state?.dialogs[0].config as { contentStyle?: { align?: string } }).contentStyle?.align,
        ).toBe("end");
      },
      { timeout: 3000 },
    );
  });

  it("updates slots under React StrictMode (regression: listener must re-attach after dev double-mount)", async () => {
    const { result } = renderHook(
      () => {
        const [align, setAlign] = useState<"start" | "end">("start");
        useDialogSlots("slot-live-strict", {
          title: ["Strict", []],
          content: [() => `Align: ${align}`, [align]],
        });
        const dialog = useDialog("slot-live-strict");
        const state = useContext(DialogStateContext);
        return { align, setAlign, dialog, state };
      },
      { wrapper: strictWrapper },
    );

    await act(async () => {
      void result.current.dialog.open({ type: "confirm", onConflict: "replaceSameKey" });
    });

    await waitFor(() => {
      expect(result.current.state?.dialogs).toHaveLength(1);
      expect(String(result.current.state?.dialogs[0].config.message)).toContain("start");
    });

    await act(async () => {
      result.current.setAlign("end");
    });

    await waitFor(
      () => {
        expect(String(result.current.state?.dialogs[0].config.message)).toContain("end");
      },
      { timeout: 3000 },
    );
  });
});
