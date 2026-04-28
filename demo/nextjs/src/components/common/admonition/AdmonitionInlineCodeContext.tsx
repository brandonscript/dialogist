import { createContext } from "react";

/** When set, inline <Code> uses these tones to match the surrounding Admonition variant. */
export type AdmonitionInlineCodeTones = {
  mixSource: string;
  bodyText: string;
  /**
   * When true, nested <CodeBlock> uses the default code-well fill at 10% opacity so the admonition
   * surface shows through instead of an opaque white panel.
   */
  nestedCodeBlockShowsAdmonitionBackdrop?: boolean;
};

export const AdmonitionInlineCodeStyleContext = createContext<AdmonitionInlineCodeTones | null>(null);
