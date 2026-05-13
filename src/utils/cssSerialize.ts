/**
 * Minimal serializer that converts a JSS-like style object (the same shape used by
 * `dialogistStyles`) into a plain CSS string suitable for an HTML `<style>` tag or a
 * CSS file written to disk.
 *
 * Supports:
 * - Top-level selectors (e.g. `".Dialogist-base"`, `"@keyframes name"`).
 * - Nested selectors using `&` (the parent placeholder) and direct nesting like
 *   `"& .child"`, `"& .a, & .b"`, `":has(.x) .y"`.
 * - CSS custom properties (`"--dialogist-spacing": "32px"`).
 * - Values may be `string | number`. Numbers without a unit get `px` for known
 *   length-y properties; otherwise they are stringified verbatim.
 *
 * This is intentionally tiny — it only needs to handle the static shape of
 * `dialogistStyles`, not arbitrary user input.
 */
type CssValue = string | number;
type CssBlock = { [key: string]: CssValue | CssBlock | undefined };

const UNITLESS_PROPS = new Set([
  "opacity",
  "z-index",
  "font-weight",
  "line-height",
  "flex",
  "flex-grow",
  "flex-shrink",
  "order",
  "tab-size",
  "columns",
  "column-count",
]);

const camelToKebab = (key: string): string => {
  if (key.startsWith("--")) return key;
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
};

const formatValue = (prop: string, value: CssValue): string => {
  if (typeof value === "number" && value !== 0 && !UNITLESS_PROPS.has(prop)) {
    return `${value}px`;
  }
  return String(value);
};

const isStyleObject = (value: unknown): value is CssBlock =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Resolves a nested selector against its parent. Mirrors the subset of nesting we use:
 * - Selectors containing `&` are interpolated against the parent.
 * - Selectors starting with `&` (e.g. `"& .child"`) are joined with a space.
 * - Selectors starting with `:` (e.g. `":has(...)"`) are concatenated to the parent.
 * - Comma-separated lists are split, resolved per-part, then re-joined.
 */
const resolveSelector = (parent: string, child: string): string => {
  const parts = child.split(",").map((p) => p.trim());
  const resolved = parts.map((part) => {
    if (part.includes("&")) return part.replace(/&/g, parent);
    if (part.startsWith(":")) return `${parent}${part}`;
    if (part.startsWith("&")) return part.replace(/^&/, parent);
    return `${parent} ${part}`;
  });
  return resolved.join(", ");
};

const writeBlock = (selector: string, declarations: Array<[string, string]>, out: string[]): void => {
  if (declarations.length === 0) return;
  out.push(`${selector} {`);
  for (const [prop, value] of declarations) {
    out.push(`  ${prop}: ${value};`);
  }
  out.push("}");
};

const writeKeyframes = (name: string, frames: CssBlock, out: string[]): void => {
  out.push(`${name} {`);
  for (const [frame, decls] of Object.entries(frames)) {
    if (!isStyleObject(decls)) continue;
    const declStrings: string[] = [];
    for (const [k, v] of Object.entries(decls)) {
      if (v == null || isStyleObject(v)) continue;
      declStrings.push(`    ${camelToKebab(k)}: ${formatValue(camelToKebab(k), v)};`);
    }
    out.push(`  ${frame} {`);
    out.push(...declStrings);
    out.push("  }");
  }
  out.push("}");
};

const visit = (selector: string, block: CssBlock, out: string[]): void => {
  const declarations: Array<[string, string]> = [];
  const nested: Array<[string, CssBlock]> = [];

  for (const [key, value] of Object.entries(block)) {
    if (value == null) continue;
    if (isStyleObject(value)) {
      nested.push([key, value]);
      continue;
    }
    const prop = camelToKebab(key);
    declarations.push([prop, formatValue(prop, value)]);
  }

  writeBlock(selector, declarations, out);

  for (const [childSelector, childBlock] of nested) {
    if (childSelector.startsWith("@keyframes")) {
      writeKeyframes(childSelector, childBlock, out);
      continue;
    }
    if (childSelector.startsWith("@")) {
      out.push(`${childSelector} {`);
      visit("&", childBlock, out);
      out.push("}");
      continue;
    }
    visit(resolveSelector(selector, childSelector), childBlock, out);
  }
};

/**
 * Serialize a JSS-like style object (the same shape as `dialogistStyles`) into a CSS
 * string. Top-level keys are treated as selectors (or `@keyframes` blocks).
 */
export const serializeStylesToCss = (styles: Record<string, unknown>): string => {
  const out: string[] = [];
  for (const [selector, block] of Object.entries(styles)) {
    if (block == null || typeof block !== "object") continue;
    if (selector.startsWith("@keyframes")) {
      writeKeyframes(selector, block as CssBlock, out);
      continue;
    }
    visit(selector, block as CssBlock, out);
  }
  return out.join("\n");
};
