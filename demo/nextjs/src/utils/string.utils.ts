import React, { type ReactElement, type ReactNode } from "react";
import { isValidElementType } from "react-is";

const isNodeWithChildren = (node: ReactNode): node is ReactElement => {
  return isValidElementType(node) && React.Children.count(node) > 0;
};

export const extractStringsFromReactNode = (node: ReactNode, joiner = " "): string => {
  if (["string", "number", "boolean", "undefined", "null"].includes(typeof node)) return String(node);
  if (Array.isArray(node)) return node.map((n) => extractStringsFromReactNode(n, joiner)).join(joiner);
  if (isNodeWithChildren(node)) {
    return React.Children.map(node, (child) => extractStringsFromReactNode(child, joiner)).join(joiner);
  }
  if (typeof node === "object" && node) {
    try {
      return JSON.stringify(node);
    } catch {
      return "[non-serializable]";
    }
  }
  return "";
};
