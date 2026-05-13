import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { DialogProvider } from "../../context/DialogProvider";
import { useDialog } from "../../useDialog";
import { muiSlots } from "../mui";

const Trigger = () => {
  const dialog = useDialog("mui-smoke");
  return (
    <button
      type="button"
      onClick={() =>
        dialog.open({
          type: "alert",
          title: "MUI smoke",
          message: "Hello from MUI adapter",
        })
      }
    >
      open
    </button>
  );
};

describe("MUI adapter smoke", () => {
  it("renders, opens via useDialog, and closes via OK action", async () => {
    render(
      <DialogProvider slots={muiSlots} cssMode="none">
        <Trigger />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open/i }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(screen.getByText("MUI smoke")).toBeTruthy();
    expect(screen.getByText("Hello from MUI adapter")).toBeTruthy();

    const okButton = await screen.findByRole("button", { name: /^OK$/i });
    await act(async () => {
      fireEvent.click(okButton);
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
