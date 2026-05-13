import { fireEvent, render } from "@testing-library/react";

import { dialogistClasses } from "../../../classes";
import { HeadlessBase } from "../HeadlessBase";

describe("HeadlessBase", () => {
  it("renders nothing when open is false", () => {
    const { container } = render(
      <HeadlessBase open={false} onClose={jest.fn()}>
        <button type="button">inner</button>
      </HeadlessBase>,
    );
    expect(container.querySelector("[data-dialogist-headless-base]")).toBeNull();
  });

  it("renders a backdrop and dialog with role and aria-modal when open", () => {
    render(
      <HeadlessBase open={true} onClose={jest.fn()} id="test-dialog">
        <button type="button">inner</button>
      </HeadlessBase>,
    );
    const dialog = document.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    expect(dialog?.id).toBe("test-dialog");
    expect(dialog?.classList.contains(dialogistClasses.base)).toBe(true);
    expect(dialog?.classList.contains(dialogistClasses.rootPaper)).toBe(true);
    expect(document.querySelector(`.${dialogistClasses.backdrop}`)).toBeTruthy();
  });

  it("calls onClose when the backdrop layer is clicked", () => {
    const onClose = jest.fn();
    render(
      <HeadlessBase open={true} onClose={onClose}>
        <button type="button">inner</button>
      </HeadlessBase>,
    );
    const backdropContainer = document.querySelector('[data-dialogist-headless-base="true"]') as HTMLElement;
    expect(backdropContainer).toBeTruthy();
    fireEvent.click(backdropContainer);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when the dialog paper itself is clicked", () => {
    const onClose = jest.fn();
    render(
      <HeadlessBase open={true} onClose={onClose}>
        <button type="button">inner</button>
      </HeadlessBase>,
    );
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    fireEvent.click(dialog);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose on Escape", () => {
    const onClose = jest.fn();
    render(
      <HeadlessBase open={true} onClose={onClose}>
        <button type="button">inner</button>
      </HeadlessBase>,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("hides the backdrop layer when hideBackdrop is true", () => {
    render(
      <HeadlessBase open={true} onClose={jest.fn()} hideBackdrop>
        <button type="button">inner</button>
      </HeadlessBase>,
    );
    const backdrop = document.querySelector(`.${dialogistClasses.backdrop}`) as HTMLElement;
    expect(backdrop).toBeTruthy();
    expect(backdrop.style.display).toBe("none");
  });

  it("locks body scroll while open and restores on unmount", () => {
    const previousOverflow = document.body.style.overflow;
    const { unmount } = render(
      <HeadlessBase open={true} onClose={jest.fn()}>
        <button type="button">inner</button>
      </HeadlessBase>,
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe(previousOverflow);
  });

  it("forwards slotProps.paper.ref to the dialog paper element", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <HeadlessBase open={true} onClose={jest.fn()} slotProps={{ paper: { ref } }}>
        <button type="button">inner</button>
      </HeadlessBase>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.getAttribute("role")).toBe("dialog");
  });

  it("moves focus into the dialog after mount", async () => {
    render(
      <HeadlessBase open={true} onClose={jest.fn()}>
        <button type="button" data-testid="first-btn">
          first
        </button>
        <button type="button" data-testid="second-btn">
          second
        </button>
      </HeadlessBase>,
    );
    await new Promise((resolve) => setTimeout(resolve, 5));
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect((document.activeElement as HTMLElement | null)?.dataset.testid).toBe("first-btn");
  });

  it("traps Tab focus inside the dialog (Tab from last cycles back to first)", () => {
    render(
      <HeadlessBase open={true} onClose={jest.fn()}>
        <button type="button" data-testid="a">
          a
        </button>
        <button type="button" data-testid="b">
          b
        </button>
      </HeadlessBase>,
    );
    const last = document.querySelector('[data-testid="b"]') as HTMLElement;
    last.focus();
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(window, { key: "Tab" });
    const first = document.querySelector('[data-testid="a"]') as HTMLElement;
    expect(document.activeElement).toBe(first);
  });
});
