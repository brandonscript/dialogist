import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { DialogProvider } from "../../context/DialogProvider";
import { useDialog } from "../../useDialog";
import { baseUiSlots } from "../base-ui";

const Trigger = () => {
  const dialog = useDialog("baseui-smoke");
  return (
    <button
      type="button"
      onClick={() =>
        dialog.open({
          type: "alert",
          title: "Base UI smoke",
          message: "Hello from Base UI adapter",
        })
      }
    >
      open
    </button>
  );
};

describe("Base UI adapter smoke", () => {
  it("renders, opens via useDialog, and closes via OK action", async () => {
    render(
      <DialogProvider slots={baseUiSlots} cssMode="none">
        <Trigger />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open/i }));

    await screen.findByText("Base UI smoke");
    expect(screen.getByText("Hello from Base UI adapter")).toBeTruthy();

    const okButton = await screen.findByRole("button", { name: /^OK$/i });
    await act(async () => {
      fireEvent.click(okButton);
    });

    await waitFor(() => {
      expect(screen.queryByText("Base UI smoke")).toBeNull();
    });
  });
});
