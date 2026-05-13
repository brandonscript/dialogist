import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { DialogProvider } from "../../context/DialogProvider";
import { useDialog } from "../../useDialog";
import { shadcnSlots } from "../shadcn";

const Trigger = () => {
  const dialog = useDialog("shadcn-smoke");
  return (
    <button
      type="button"
      onClick={() =>
        dialog.open({
          type: "alert",
          title: "shadcn smoke",
          message: "Hello from shadcn adapter",
        })
      }
    >
      open
    </button>
  );
};

describe("shadcn adapter smoke", () => {
  it("renders, opens via useDialog, and closes via OK action", async () => {
    render(
      <DialogProvider slots={shadcnSlots} cssMode="none">
        <Trigger />
      </DialogProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /open/i }));

    await screen.findByText("shadcn smoke");
    expect(screen.getByText("Hello from shadcn adapter")).toBeTruthy();

    const okButton = await screen.findByRole("button", { name: /^OK$/i });
    await act(async () => {
      fireEvent.click(okButton);
    });

    await waitFor(() => {
      expect(screen.queryByText("shadcn smoke")).toBeNull();
    });
  });
});
