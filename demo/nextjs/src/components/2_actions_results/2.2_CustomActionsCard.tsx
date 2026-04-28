"use client";

import { Button } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { type DialogCloseEvent, useDialog } from "dialogist";
import { memo, useState } from "react";
import { TbClick } from "react-icons/tb";

import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withGenericFillIcon } from "../common/demoCardIconWrappers";
import { BulletList, BulletListItem, Code, DemoParagraph } from "../common/typography";

const DIALOG_KEY = "custom-actions-flat-demo";
const CARD_TITLE = "Custom actions";
const Icon = withGenericFillIcon(TbClick, { accent: "path-last" });

const CUSTOM_ACTIONS_SNIPPET = `const dialog = useDialog(
  // type: "custom" (implied because this dialog uses custom action IDs)
);

// Example: passing a unique identifier from a ref to the resolveValue property:
const getUuid = (): string | undefined => {
  return rowUuidRef?.current;
};

dialog.open({
  actions: [
    { id: "cancel", title: "Cancel", resolveValue: false },
    { id: "draft", title: "Save as draft", resolveValue: { draft: true, uuid: getUuid() } },
    { id: "ok", title: "Save", resolveValue: { save: true, uuid: getUuid() } },
  ],
  actionsStyle: { align: "space-between", gap: 1 },
});
`;

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
};

export const CustomActionsCard = Object.assign(
  memo(function CustomActionsCard() {
    const dialog = useDialog(DIALOG_KEY);
    const [result, setResult] = useState<DialogResult | null>(null);

    const handleFlatClick = () => {
      setResult(null);
      dialog.open({
        type: "confirm",
        title: "Custom actions",
        message: "This dialog uses custom dialog actions: Cancel, Save as draft, and Save.",
        actions: BASE_ACTIONS,
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
            Beyond the built-in actions used by <Code>alert</Code> and <Code>confirm</Code> dialogs, you can define your
            own custom actions.
          </>
        }
        result={result}
      >
        <FlexBox column gap={1.5} sx={{ mt: 1.5 }}>
          <DemoParagraph component="div">
            If your actions include IDs other than <Code>ok</Code> or <Code>cancel</Code>, the dialog is treated as a{" "}
            <Code>custom</Code> type. It supports the following properties:
            <BulletList>
              <BulletListItem>
                <Code>id</Code> – a unique identifier for the action.
              </BulletListItem>
              <BulletListItem>
                <Code>title</Code>, <Code>props</Code> –{" "}
                <span style={{ fontStyle: "italic" }}>see the previous section</span>.
              </BulletListItem>
              <BulletListItem>
                <Code>resolveValue</Code> – passed to <Code>onClose</Code> when the action is clicked (can be any type).
              </BulletListItem>
            </BulletList>
          </DemoParagraph>
          <CodeBlock>{CUSTOM_ACTIONS_SNIPPET}</CodeBlock>
          <FlexBox column gap={1} sx={{ maxWidth: 240, alignSelf: "flex-start", mt: 0.5 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Icon size={18} />}
              onClick={handleFlatClick}
              sx={{ justifyContent: "flex-start", px: 2 }}
            >
              Show custom actions
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
