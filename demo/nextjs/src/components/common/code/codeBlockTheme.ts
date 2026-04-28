import everforestLight from "@shikijs/themes/everforest-light";
import type { ThemeRegistrationAny } from "@shikijs/types";

/** Everforest greens / purple used in demo code blocks */
const JSX_COMPONENT_GREEN = "#8da101";
const JSX_PROP_PURPLE = "#8b5aad";
/** Same as everforest `keyword` (if, return, etc.) */
const KEYWORD_FLOW_PINK = "#f85552";
/** Everforest `storage.type` / `null` in type position (`string | null`) — not hit by COLOR_REPLACEMENTS */
const TYPE_PRIMITIVE_BLUE = "#3a94c5";
/** Plain code text / punctuation (`<`, `>`, `/>`, `</` in JSX) */
const CODE_PLAINTEXT = "#606d75";

type TokenColorRule = {
  name?: string;
  scope?: string | string[];
  settings?: { foreground?: string; fontStyle?: string };
};

/**
 * Everforest-light with JSX-specific tweaks: component names green, prop names purple
 * (matches non-JSX storage-keyword purple from COLOR_REPLACEMENTS).
 */
const buildDialogistCodeTheme = () => {
  const base = everforestLight as { name: string; tokenColors: TokenColorRule[] };
  const theme = JSON.parse(JSON.stringify(base)) as typeof base;
  theme.name = "dialogist-everforest-light";

  const tc = theme.tokenColors;

  const spliceRule = (match: (scope: string) => boolean, replacements: TokenColorRule[]) => {
    const i = tc.findIndex((r) => typeof r.scope === "string" && match(r.scope));
    if (i >= 0) tc.splice(i, 1, ...replacements);
  };

  // TSX: const/let/var and => match if/return; type alias keyword stays purple; <MyComponent /> green
  spliceRule(
    (s) => s.includes("support.class.component.tsx") && s.includes("storage.type.tsx"),
    [
      {
        scope: "storage.type.tsx, storage.type.function.arrow.tsx",
        settings: { foreground: KEYWORD_FLOW_PINK },
      },
      { scope: "storage.type.type.tsx", settings: { foreground: JSX_PROP_PURPLE } },
      { scope: "support.class.component.tsx", settings: { foreground: JSX_COMPONENT_GREEN } },
    ],
  );

  // TSX/TS: export/import match if/return (namespace import syntax stays magenta)
  spliceRule(
    (s) =>
      s.includes("keyword.control.import.tsx") &&
      s.includes("keyword.control.export.tsx") &&
      s.includes("storage.type.namespace.tsx"),
    [
      {
        scope: "keyword.control.import.tsx, keyword.control.export.tsx",
        settings: { foreground: KEYWORD_FLOW_PINK },
      },
      { scope: "storage.type.namespace.tsx", settings: { foreground: "#df69ba" } },
    ],
  );
  spliceRule(
    (s) =>
      s.includes("keyword.control.import.ts") &&
      s.includes("keyword.control.export.ts") &&
      s.includes("storage.type.namespace.ts") &&
      !s.includes("tsx"),
    [
      {
        scope: "keyword.control.import.ts, keyword.control.export.ts",
        settings: { foreground: KEYWORD_FLOW_PINK },
      },
      { scope: "storage.type.namespace.ts", settings: { foreground: "#df69ba" } },
    ],
  );

  // Plain TypeScript (default CodeBlock lang): const/=> were #f57d26 → purple via COLOR_REPLACEMENTS
  spliceRule(
    (s) =>
      s.includes("storage.type.ts") &&
      s.includes("storage.type.function.arrow.ts") &&
      s.includes("storage.type.type.ts") &&
      !s.includes("tsx"),
    [
      {
        scope: "storage.type.ts, storage.type.function.arrow.ts",
        settings: { foreground: KEYWORD_FLOW_PINK },
      },
      { scope: "storage.type.type.ts", settings: { foreground: JSX_PROP_PURPLE } },
    ],
  );

  // TSX/JSX: `<` `>` `/>` plain; prop names purple
  spliceRule(
    (s) =>
      s.includes("punctuation.definition.tag.directive.tsx") &&
      s.includes("entity.other.attribute-name.tsx"),
    [
      {
        scope:
          "punctuation.definition.tag.directive.tsx, punctuation.definition.tag.begin.tsx, punctuation.definition.tag.end.tsx",
        settings: { foreground: CODE_PLAINTEXT },
      },
      {
        scope: "entity.other.attribute-name.directive.tsx, entity.other.attribute-name.tsx",
        settings: { foreground: JSX_PROP_PURPLE },
      },
    ],
  );

  spliceRule(
    (s) =>
      s.includes("punctuation.definition.tag.jsx") &&
      s.includes("entity.other.attribute-name.jsx") &&
      s.includes("js.jsx"),
    [
      {
        scope:
          "punctuation.definition.tag.jsx, punctuation.definition.tag.begin.js.jsx, punctuation.definition.tag.end.js.jsx",
        settings: { foreground: CODE_PLAINTEXT },
      },
      {
        scope: "entity.other.attribute-name.jsx, entity.other.attribute-name.js.jsx",
        settings: { foreground: JSX_PROP_PURPLE },
      },
    ],
  );

  spliceRule(
    (s) =>
      s.includes("punctuation.definition.tag.directive.ts") &&
      s.includes("entity.other.attribute-name.directive.ts") &&
      !s.includes("tsx"),
    [
      { scope: "punctuation.definition.tag.directive.ts", settings: { foreground: CODE_PLAINTEXT } },
      { scope: "entity.other.attribute-name.directive.ts", settings: { foreground: JSX_PROP_PURPLE } },
    ],
  );

  // Intrinsic JSX tag names (`<div>`, `<span>`): same blue as primitive types (`null` in `T | null`).
  // Appended so it wins over generic `entity.name.tag` (#f57d26 → purple via COLOR_REPLACEMENTS).
  tc.push({
    scope: "entity.name.tag.tsx, entity.name.tag.js.jsx",
    settings: { foreground: TYPE_PRIMITIVE_BLUE },
  });

  return theme;
}

export const DIALOGIST_CODE_THEME = buildDialogistCodeTheme() as ThemeRegistrationAny;
