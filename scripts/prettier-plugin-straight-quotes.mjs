/**
 * Prettier plugin: replace typographic (smart) quotes with ASCII quotes.
 *
 * Uses the TypeScript scanner/AST so replacements respect string delimiters:
 * inside '...' literals, apostrophe-like characters become \' so parsing still works.
 *
 * Smart → ASCII:
 *   '\u2018' '\u2019' '\u201B' → '
 *   "\u201C" "\u201D" "\u201F" → "
 */

import { parsers as babelParsers } from "prettier/plugins/babel";
import { parsers as typescriptParsers } from "prettier/plugins/typescript";
import ts from "typescript";

const SINGLE_SMART = /[\u2018\u2019\u201B]/g;
const DOUBLE_SMART = /[\u201C\u201D\u201F]/g;

const straightenFree = (text) => text.replace(SINGLE_SMART, "'").replace(DOUBLE_SMART, '"');

const straightenSingleQuotedInner = (text) => text.replace(SINGLE_SMART, () => "\\'").replace(DOUBLE_SMART, '"');

const straightenDoubleQuotedInner = (text) => text.replace(SINGLE_SMART, "'").replace(DOUBLE_SMART, () => '\\"');

/** @typedef {{ start: number, end: number, mode: "single" | "double" | "free" }} Range */

const scriptKindForPath = (filePath) => {
  if (filePath.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (filePath.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (filePath.endsWith(".ts") || filePath.endsWith(".mts") || filePath.endsWith(".cts")) return ts.ScriptKind.TS;
  return ts.ScriptKind.JS;
};

const rangeKey = (r) => `${r.start}:${r.end}:${r.mode}`;

/**
 * @param {string} sourceText
 * @param {string} filePath
 */
const collectRanges = (sourceText, filePath) => {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    scriptKindForPath(filePath),
  );

  /** @type {Range[]} */
  const ranges = [];
  const seen = new Set();

  const push = (start, end, mode) => {
    if (start >= end) return;
    const r = { start, end, mode };
    const k = rangeKey(r);
    if (seen.has(k)) return;
    seen.add(k);
    ranges.push(r);
  };

  const visit = (node) => {
    const fullStart = node.getFullStart();
    ts.forEachLeadingCommentRange(sourceText, fullStart, (start, end) => {
      push(start, end, "free");
    });
    ts.forEachTrailingCommentRange(sourceText, node.end, (start, end) => {
      push(start, end, "free");
    });

    if (ts.isStringLiteral(node)) {
      const start = node.getStart(sourceFile);
      const q = sourceText[start];
      const mode = q === "'" ? "single" : "double";
      push(start + 1, node.getEnd() - 1, mode);
    } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
      const s = node.getStart(sourceFile);
      const e = node.getEnd();
      push(s + 1, e - 1, "free");
    } else if (ts.isTemplateHead(node)) {
      const s = node.getStart(sourceFile);
      const e = node.getEnd();
      push(s + 1, e - 2, "free");
    } else if (ts.isTemplateMiddle(node)) {
      const s = node.getStart(sourceFile);
      const e = node.getEnd();
      push(s + 1, e - 2, "free");
    } else if (ts.isTemplateTail(node)) {
      const s = node.getStart(sourceFile);
      const e = node.getEnd();
      push(s + 1, e - 1, "free");
    } else if (ts.isJsxText(node)) {
      push(node.getStart(sourceFile), node.getEnd(), "free");
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return ranges;
};

/**
 * @param {string} sourceText
 * @param {string} filePath
 */
const straightenSource = (sourceText, filePath) => {
  let ranges;
  try {
    ranges = collectRanges(sourceText, filePath);
  } catch {
    return straightenFree(sourceText);
  }

  const sorted = ranges.sort((a, b) => b.start - a.start);
  let out = sourceText;
  for (const r of sorted) {
    const mid = out.slice(r.start, r.end);
    const next =
      r.mode === "single"
        ? straightenSingleQuotedInner(mid)
        : r.mode === "double"
          ? straightenDoubleQuotedInner(mid)
          : straightenFree(mid);
    out = out.slice(0, r.start) + next + out.slice(r.end);
  }
  return out;
};

const wrap = (parser) => ({
  ...parser,
  preprocess(text, options) {
    const preprocessed = parser.preprocess?.(text, options) ?? text;
    const fp = options.filepath ?? options.parser ?? "file.ts";
    return straightenSource(preprocessed, fp);
  },
});

export default {
  parsers: {
    typescript: wrap(typescriptParsers.typescript),
    babel: wrap(babelParsers.babel),
    "babel-ts": wrap(babelParsers["babel-ts"]),
  },
};
