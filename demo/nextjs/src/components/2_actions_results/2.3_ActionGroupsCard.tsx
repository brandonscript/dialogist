"use client";

import { Button } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { type DialogCloseEvent, useDialog } from "dialogist";
import { memo, useState } from "react";
import { LuGroup } from "react-icons/lu";

import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withGenericFillIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph } from "../common/typography";

const DIALOG_KEY = "custom-actions-grouped-demo";
const CARD_TITLE = "Action groups";
const Icon = withGenericFillIcon(LuGroup, { accent: "rect-first" });

const GROUPED_ACTIONS_SNIPPET = `dialog.open({
  actions: [
    [
      { id: "cancel", title: "Cancel", resolveValue: false },
      { id: "draft", title: "Save as draft", resolveValue: { draft: true, uuid: getUuid() } },
    ],
    { id: "save", title: "Save", resolveValue: { save: true, uuid: getUuid() } },
  ],
  actionsStyle: { align: "space-between", gap: 1 },
});`;

const BASE_ACTIONS = [
  { id: "cancel", title: "Cancel", resolveValue: false, props: { variant: "outlined" } },
  { id: "draft", title: "Save as draft", resolveValue: "draft", props: { variant: "outlined" } },
  {
    id: "save",
    title: "Save",
    resolveValue: "save" as const,
    props: { variant: "contained" as const, autoFocus: true },
  },
];

const buildDialogResult = (label: string, color: string): DialogResult => {
  return {
    text: label,
    color,
  };
}

export const ActionGroupsCard = Object.assign(
  memo(function ActionGroupsCard() {
    const dialog = useDialog(DIALOG_KEY);
    const [result, setResult] = useState<DialogResult | null>(null);

    const handleGroupedClick = () => {
      setResult(null);
      dialog.open({
        type: "confirm",
        title: "Action groups",
        message: "This dialog uses grouped actions — Cancel and Save as draft are grouped together.",
        actions: [[BASE_ACTIONS[0], BASE_ACTIONS[1]], BASE_ACTIONS[2]],
        contentStyle: { align: "space-between", textAlign: "center", maxWidth: 400 },
        actionsStyle: { align: "space-between", gap: 1 },
        onClose: (event: DialogCloseEvent) => {
          const buttonText = event.reason === "action" ? (event.buttonText ?? "Close") : "Close";
          const color =
            buttonText === "Save" ? "success.main" : buttonText === "Save as draft" ? "info.main" : "text.secondary";
          setResult(buildDialogResult(buttonText, color));
        },
      });
    };

    return (
      <BaseDemoCard
        icon={Icon}
        title={CARD_TITLE}
        dialogKey={DIALOG_KEY}
        description={
          <>
            Nest <Code>actions</Code> in arrays to organize buttons into groups.
          </>
        }
        result={result}
      >
        <FlexBox column gap={1.5} sx={{ mt: 1.5 }}>
          <DemoParagraph>
            You can group actions when you want them aligned together — for example, placing <strong>Cancel</strong> and{" "}
            <strong>Save as draft</strong> together while keeping <strong>Save</strong> on its own. This creates a
            clearer visual hierarchy and makes the primary action easier to find.
          </DemoParagraph>
          <CodeBlock>{GROUPED_ACTIONS_SNIPPET}</CodeBlock>
          <FlexBox column gap={1} sx={{ maxWidth: 240, alignSelf: "flex-start", mt: 0.5 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Icon size={18} />}
              onClick={handleGroupedClick}
              sx={{ justifyContent: "flex-start", px: 2 }}
            >
              Show grouped actions
            </Button>
          </FlexBox>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
    cardSubHeadings: [],
  },
);
