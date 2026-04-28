"use client";

import { alpha, Box } from "@mui/material";
import { memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import { codeToHtml } from "shiki/bundle/web";

import { AdmonitionInlineCodeStyleContext } from "../admonition/AdmonitionInlineCodeContext";
import { DIALOGIST_CODE_THEME } from "./codeBlockTheme";

interface CodeBlockProps {
  children: string;
  language?: string;
  /** Remove shared leading whitespace from the code string */
  dedent?: boolean;
  mt?: number;
  mb?: number;
  my?: number;
}

const FALLBACK_BG = "#FDFEFE";
const FALLBACK_FG = "#5C6A72";

const COLOR_REPLACEMENTS: Record<string, string> = {
  "#dfa000": "#c08c00", // strings: darken the gold for better contrast on light bg
  "#35a77c": "var(--demo-form-control-accent)", // aqua/teal → matches demo form accent
  "#f57d26": "#8b5aad", // everforest orange (const, let, operators, etc.) → purple
};

const MONO_FONT =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

/** Drops leading/trailing lines that are empty or whitespace-only (template-literal padding). */
const trimSnippetEdges = (code: string): string => {
  const lines = code.split("\n");
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start].trim() === "") {
    start += 1;
  }
  while (end > start && lines[end - 1].trim() === "") {
    end -= 1;
  }
  return lines.slice(start, end).join("\n");
}

const dedentCode = (code: string): string => {
  const lines = code.split("\n");
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  if (nonEmpty.length === 0) return code;
  const minIndent = Math.min(...nonEmpty.map((l) => l.match(/^(\s*)/)?.[1].length ?? 0));
  if (minIndent === 0) return code;
  return lines.map((l) => l.slice(minIndent)).join("\n");
}

export const CodeBlock = memo(function CodeBlock({
  children,
  language = "typescript",
  dedent: shouldDedent,
  mt,
  mb,
  my,
}: CodeBlockProps) {
  const admonitionTones = useContext(AdmonitionInlineCodeStyleContext);
  const preBackground =
    admonitionTones?.nestedCodeBlockShowsAdmonitionBackdrop === true ? alpha(FALLBACK_BG, 0.6) : FALLBACK_BG;

  const code = useMemo(() => {
    const trimmed = trimSnippetEdges(children);
    return shouldDedent ? dedentCode(trimmed) : trimmed;
  }, [children, shouldDedent]);

  const [html, setHtml] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    codeToHtml(code, {
      lang: language,
      theme: DIALOGIST_CODE_THEME,
      colorReplacements: COLOR_REPLACEMENTS,
    }).then((result) => {
      if (mountedRef.current) setHtml(result);
    });
    return () => {
      mountedRef.current = false;
    };
  }, [code, language]);

  return (
    <Box
      sx={{
        borderRadius: 1.5,
        overflow: "hidden",
        fontSize: "0.8rem",
        lineHeight: 1.65,
        border: "1px solid",
        borderColor: "divider",
        mt,
        mb,
        my,
        "@media screen and (min-resolution: 2dppx)": {
          borderWidth: "0.5px",
        },
        "& pre": {
          m: 0,
          py: 1.25,
          px: 1.5,
          overflow: "auto",
          fontFamily: MONO_FONT,
          backgroundColor: `${preBackground} !important`,
        },
        "& code": {
          fontFamily: "inherit",
        },
      }}
    >
      {html ? (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized shiki output
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre
          style={{
            margin: 0,
            padding: "10px 12px",
            background: preBackground,
            color: FALLBACK_FG,
            overflow: "auto",
            fontFamily: MONO_FONT,
          }}
        >
          {code}
        </pre>
      )}
    </Box>
  );
});
