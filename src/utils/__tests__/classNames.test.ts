import { classNames } from "../classNames";

describe("classNames", () => {
  it("joins defined class names with spaces", () => {
    expect(classNames("alpha", undefined, "beta")).toBe("alpha beta");
  });

  it("filters empty strings and trims the result", () => {
    expect(classNames("", "primary", "")).toBe("primary");
  });
});
