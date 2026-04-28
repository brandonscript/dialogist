"use client";

import { FlexBox } from "@mui-flexy/v7";
import { type DialogCloseEvent, useDialog } from "dialogist";
import { memo, useState } from "react";
import { TbBoxAlignTop } from "react-icons/tb";

import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withGenericFillIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph } from "../common/typography";

const DIALOG_KEY = "status-bar-footer-demo";
const CARD_TITLE = "Status bar & footer";
const Icon = withGenericFillIcon(TbBoxAlignTop, { accent: "path-first" });

const STATUS_FOOTER_SNIPPET = `dialog.open({
  type: "confirm",
  message: "Are you sure?",
  statusBar: "Saving changes…",
  footer: "Last saved at 12:34 PM",
})`;

export const StatusBarFooterDialogCard = Object.assign(
  memo(function StatusBarFooterDialogCard() {
    const dialog = useDialog(DIALOG_KEY, {
      title: "Confirm action",
      okLabel: "Yes, continue",
      cancelLabel: "Cancel",
    });
    const [result, setResult] = useState<DialogResult | null>(null);

    const handleConfirmDialog = (variant: "both" | "status" | "footer" = "both") => {
      setResult(null);
      dialog.open({
        type: "confirm",
        message: "Are you sure you want to proceed with this action?",
        overflow: "visible",
        statusBar: variant === "footer" ? undefined : "Plain text status bar",
        footer: variant === "status" ? undefined : "Plain text footer",
        onOkClick: (event: DialogCloseEvent) => {
          setResult({
            text: event.buttonText,
            color: "success.main",
          });
        },
        onCancelClick: (event: DialogCloseEvent) => {
          setResult({
            text: event.buttonText,
            color: "error.main",
          });
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
            <Code>statusBar</Code> and <Code>footer</Code> are optional panels at the top and bottom of the dialog.
          </>
        }
        actions={[
          { label: "Status bar & footer", onClick: () => handleConfirmDialog("both"), icon: <Icon /> },
          { label: "Status bar only", onClick: () => handleConfirmDialog("status"), variant: "outlined" },
          { label: "Footer only", onClick: () => handleConfirmDialog("footer"), variant: "outlined" },
        ]}
        result={result}
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph>
            Use <Code>statusBar</Code> for things like a loading notice or a warning, and <Code>footer</Code> for
            secondary info like a timestamp or a policy note. Try the buttons below to see them separately or together.
            If you need something more custom — a spinner, a layout — the next card,{" "}
            <strong>Using custom components</strong>, shows how to pass JSX to <Code>message</Code>,{" "}
            <Code>statusBar</Code>, and <Code>footer</Code>.
          </DemoParagraph>
          <CodeBlock>{STATUS_FOOTER_SNIPPET}</CodeBlock>
          <DemoParagraph>
            Styling for the status bar and footer comes from Dialogist&apos;s <Code>--dialogist-*</Code> CSS variables.
            Set them in CSS or map them from your MUI theme with <Code>dialogistExtendMuiTheme()</Code> (see{" "}
            <strong>Dialogist theme & styles</strong> for more details).
          </DemoParagraph>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
  },
);
