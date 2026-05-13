import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { DialogProvider } from "../../context/DialogProvider";
import { useDialog } from "../../useDialog";
import { tailwindSlots } from "../tailwind";

const Trigger = () => {
  const dialog = useDialog("tailwind-smoke");
  return (
    <button
      type="button"
      onClick={() =>
        dialog.open({
          type: "alert",
          title: "Tailwind smoke",
          message: "Hello from Tailwind adapter",
        })
      }
    >
      open
    </button>
  );
};

describe("Tailwind adapter smoke", () => {
  it("renders, opens via useDialog, and closes via OK action", async () => {
    render(
      <DialogProvider slots={tailwindSlots} cssMode="external">
        <Trigger />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open/i }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeTruthy();
    expect(screen.getByText("Tailwind smoke")).toBeTruthy();
    expect(screen.getByText("Hello from Tailwind adapter")).toBeTruthy();

    const okButton = await screen.findByRole("button", { name: /^OK$/i });
    await act(async () => {
      fireEvent.click(okButton);
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
