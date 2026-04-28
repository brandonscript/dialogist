"use client";

import { FlexBox } from "@mui-flexy/v7";
import type { ReactNode } from "react";

import { DemoParagraph, ResultButtonValue } from "./typography";

export interface DialogResult {
  text: string | ReactNode | undefined;
  color: string;
}

interface DialogResultDisplayProps {
  result?: DialogResult | null;
  /** Override the default "You clicked" label. */
  label?: string;
}

export const DialogResultDisplay = ({ result, label = "You clicked" }: DialogResultDisplayProps) => {
  return (
    <FlexBox y="center" gap={1} width="100%" height={20}>
      {result && (
        <>
          <DemoParagraph>{label}</DemoParagraph>
          <ResultButtonValue
            color={(result.color?.split(".")[0] as "success" | "error" | "warning" | "info" | "secondary") ?? undefined}
          >
            {result.text}
          </ResultButtonValue>
        </>
      )}
    </FlexBox>
  );
}
