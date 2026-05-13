import { render } from "@testing-library/react";

import { DialogistGlobalStyles } from "../DialogistGlobalStyles";

const STYLE_TAG_ID = "dialogist-global-styles";

afterEach(() => {
  document.head.querySelectorAll(`#${STYLE_TAG_ID}`).forEach((el) => el.remove());
});

describe("DialogistGlobalStyles", () => {
  it("injects a single <style> tag in the document head when mounted", () => {
    expect(document.getElementById(STYLE_TAG_ID)).toBeNull();
    render(<DialogistGlobalStyles />);
    const tag = document.getElementById(STYLE_TAG_ID);
    expect(tag).toBeTruthy();
    expect(tag?.tagName).toBe("STYLE");
    expect(tag?.textContent).toContain(".Dialogist-base");
  });

  it("refcounts so a second provider does not duplicate the tag", () => {
    const a = render(<DialogistGlobalStyles />);
    const b = render(<DialogistGlobalStyles />);
    expect(document.querySelectorAll(`#${STYLE_TAG_ID}`).length).toBe(1);
    a.unmount();
    expect(document.getElementById(STYLE_TAG_ID)).toBeTruthy();
    b.unmount();
    expect(document.getElementById(STYLE_TAG_ID)).toBeNull();
  });

  it("does not inject when mode='external'", () => {
    render(<DialogistGlobalStyles mode="external" />);
    expect(document.getElementById(STYLE_TAG_ID)).toBeNull();
  });

  it("does not inject when mode='none'", () => {
    render(<DialogistGlobalStyles mode="none" />);
    expect(document.getElementById(STYLE_TAG_ID)).toBeNull();
  });
});
