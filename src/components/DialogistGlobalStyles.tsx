"use client";

import { useEffect, useMemo, useRef } from "react";

import { dialogistStyles } from "../theme/dialogTheme";
import { serializeStylesToCss } from "../utils/cssSerialize";

const STYLE_TAG_ID = "dialogist-global-styles";
const REGISTRY_KEY = "__dialogistStyleRegistry__";

interface StyleRegistry {
  count: number;
  element: HTMLStyleElement;
}

const getRegistry = (): StyleRegistry | undefined => {
  if (typeof document === "undefined") return undefined;
  const target = document as unknown as { [REGISTRY_KEY]?: StyleRegistry };
  return target[REGISTRY_KEY];
};

const setRegistry = (registry: StyleRegistry | undefined): void => {
  if (typeof document === "undefined") return;
  const target = document as unknown as { [REGISTRY_KEY]?: StyleRegistry };
  if (registry === undefined) {
    delete target[REGISTRY_KEY];
  } else {
    target[REGISTRY_KEY] = registry;
  }
};

/**
 * Inject the static `dialogistStyles` block once per document. Re-mounted providers share
 * a refcount so the `<style>` tag stays in the DOM until the last provider unmounts.
 *
 * Pass `mode="external"` to skip injection entirely (consumers import a CSS file via
 * `import "dialogist/styles.css"` instead). Pass `mode="none"` to opt out completely (an
 * adapter such as the MUI adapter may render its own MUI `GlobalStyles` if preferred).
 */
export type DialogistGlobalStylesMode = "inject" | "external" | "none";

export interface DialogistGlobalStylesProps {
  mode?: DialogistGlobalStylesMode;
}

export const DialogistGlobalStyles = ({ mode = "inject" }: DialogistGlobalStylesProps) => {
  const css = useMemo(() => serializeStylesToCss(dialogistStyles as Record<string, unknown>), []);
  const acquiredRef = useRef(false);

  useEffect(() => {
    if (mode !== "inject") return;
    if (typeof document === "undefined") return;

    let registry = getRegistry();
    if (!registry) {
      const existing = document.getElementById(STYLE_TAG_ID) as HTMLStyleElement | null;
      const element = existing ?? document.createElement("style");
      if (!existing) {
        element.id = STYLE_TAG_ID;
        element.setAttribute("data-dialogist", "global");
        element.appendChild(document.createTextNode(css));
        document.head.appendChild(element);
      } else if (existing.textContent !== css) {
        existing.textContent = css;
      }
      registry = { count: 0, element };
      setRegistry(registry);
    }

    registry.count += 1;
    acquiredRef.current = true;

    return () => {
      const current = getRegistry();
      if (!current) return;
      if (!acquiredRef.current) return;
      acquiredRef.current = false;
      current.count -= 1;
      if (current.count <= 0) {
        current.element.remove();
        setRegistry(undefined);
      }
    };
  }, [mode, css]);

  return null;
};
