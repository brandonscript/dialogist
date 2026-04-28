"use client";

import type { ReactNode } from "react";

import type { DialogPartContent } from "../types";
import { useDeepMemo } from "./useDeepCompare";

interface DialogMemoization {
  statusBarDeps?: unknown[];
  titleDeps?: unknown[];
  contentDeps?: unknown[];
  propsDeps?: unknown[];
  actionsDeps?: unknown[];
  footerDeps?: unknown[];
}

interface MemoizedDialogContent {
  statusBar: DialogPartContent | undefined;
  title: ReactNode | undefined;
  content: DialogPartContent | undefined;
  props: Record<string, unknown>;
  actions: unknown[];
  footer: DialogPartContent | undefined;
}

export const useMemoizedDialogParts = (
  parts: {
    statusBar: DialogPartContent | undefined;
    title?: ReactNode;
    content: DialogPartContent | undefined;
    props?: Record<string, unknown>;
    actions?: unknown[];
    footer: DialogPartContent | undefined;
  },
  deps: DialogMemoization = {},
): MemoizedDialogContent => {
  const {
    titleDeps = [],
    contentDeps = [],
    propsDeps = [],
    actionsDeps = [],
    footerDeps = [],
    statusBarDeps = [],
  } = deps;

  const memoizedStatusBar = useDeepMemo(() => parts.statusBar, [parts.statusBar, ...statusBarDeps]);

  const memoizedTitle = useDeepMemo(() => parts.title, [parts.title, ...titleDeps]);

  const memoizedContent = useDeepMemo(() => parts.content, [parts.content, ...contentDeps]);

  const memoizedProps = useDeepMemo(() => parts.props || {}, [parts.props, ...propsDeps]);

  const memoizedActions = useDeepMemo(() => parts.actions || [], [parts.actions, ...actionsDeps]);

  const memoizedFooter = useDeepMemo(() => parts.footer, [parts.footer, ...footerDeps]);

  return {
    statusBar: memoizedStatusBar,
    title: memoizedTitle,
    content: memoizedContent,
    props: memoizedProps,
    actions: memoizedActions,
    footer: memoizedFooter,
  };
};
