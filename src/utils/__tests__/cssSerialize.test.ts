import { dialogistClasses } from "../../classes";
import { dialogistStyles } from "../../theme/dialogTheme";
import { serializeStylesToCss } from "../cssSerialize";

describe("serializeStylesToCss", () => {
  it("emits top-level selectors with their declarations", () => {
    const css = serializeStylesToCss({
      ".thing": {
        color: "red",
        backgroundColor: "blue",
      },
    });
    expect(css).toContain(".thing {");
    expect(css).toContain("color: red;");
    expect(css).toContain("background-color: blue;");
  });

  it("converts numeric length values to px and leaves unitless props alone", () => {
    const css = serializeStylesToCss({
      ".x": { padding: 12, fontWeight: 500, opacity: 1 },
    });
    expect(css).toContain("padding: 12px;");
    expect(css).toContain("font-weight: 500;");
    expect(css).toContain("opacity: 1;");
    expect(css).not.toContain("opacity: 1px;");
    expect(css).not.toContain("font-weight: 500px;");
  });

  it("preserves CSS custom properties verbatim", () => {
    const css = serializeStylesToCss({
      ".x": {
        "--dialogist-spacing": "32px",
        "--dialogist-padding": 16,
      },
    });
    expect(css).toContain("--dialogist-spacing: 32px;");
    expect(css).toContain("--dialogist-padding: 16px;");
  });

  it("nests `& .child` selectors against the parent", () => {
    const css = serializeStylesToCss({
      ".parent": {
        color: "red",
        "& .child": { color: "blue" },
      },
    });
    expect(css).toContain(".parent .child {");
    expect(css).toContain("color: blue;");
  });

  it("interpolates `&` against the parent for has() selectors", () => {
    const css = serializeStylesToCss({
      ".parent": {
        ":has(.x) .y": { color: "green" },
      },
    });
    expect(css).toContain(".parent:has(.x) .y {");
  });

  it("handles comma-separated nested selectors", () => {
    const css = serializeStylesToCss({
      ".parent": {
        "& .a, & .b": { color: "red" },
      },
    });
    expect(css).toContain(".parent .a, .parent .b {");
  });

  it("emits @keyframes blocks", () => {
    const css = serializeStylesToCss({
      "@keyframes spin": {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
    });
    expect(css).toContain("@keyframes spin {");
    expect(css).toContain("from {");
    expect(css).toContain("opacity: 0;");
    expect(css).toContain("to {");
    expect(css).toContain("opacity: 1;");
  });

  it("serializes the real dialogistStyles object without throwing and includes core classes", () => {
    const css = serializeStylesToCss(dialogistStyles as Record<string, unknown>);
    expect(css).toContain(`.${dialogistClasses.base}`);
    expect(css).toContain(`.${dialogistClasses.title}`);
    expect(css).toContain(`.${dialogistClasses.content}`);
    expect(css).toContain(`.${dialogistClasses.actionsContainer}`);
    expect(css).toContain(`.${dialogistClasses.backdrop}`);
    expect(css).toContain("--dialogist-border-radius: 12px;");
    expect(css).toContain("@keyframes dialogistFlowBackAppear");
  });
});
