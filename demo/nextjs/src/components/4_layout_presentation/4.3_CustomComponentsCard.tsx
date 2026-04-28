"use client";

import { Typography } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { dialogistClasses, useDialog } from "dialogist";
import { memo, useMemo, useState } from "react";
import { PiPaintBrushDuotone } from "react-icons/pi";
import { RiFootballLine } from "react-icons/ri";
import { TbTipJar } from "react-icons/tb";

import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withPiDuotoneIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph } from "../common/typography";
import { DemoFooter } from "../dialog-components/DemoFooter";
import { DemoStatusBar } from "../dialog-components/DemoStatusBar";

const DIALOG_KEY = "custom-components-demo";
const CARD_TITLE = "Using custom components";

const OPENING_WITH_JSX_SNIPPET = `const message = (
  <Typography component="div" variant="body2">
    You can use <strong>HTML</strong> or <strong>React</strong> components in the body.
  </Typography>
);
const statusBar = <StatusBar isLoading={isLoading} />;
const footer = <Footer lastSavedAt={lastSavedAt} />;

dialog.open({
  type: "confirm",
  message,
  statusBar,
  footer,
});`;

export const CustomComponentsDialogCard = Object.assign(
  memo(function CustomComponentsDialogCard() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<DialogResult | null>(null);
    const dialog = useDialog(DIALOG_KEY);

    const message = useMemo(
      () => (
        <FlexBox column gap={1}>
          <DemoParagraph>
            This dialog's content is JSX, not a string. You can use it to create rich, dynamic content and layouts.
          </DemoParagraph>
          <DemoParagraph>
            <strong>Caveat:</strong> remember, content passed to <Code>dialog.open()</Code> is not reactive. If you want
            the content to update when state changes, you'll need to use one of the reactive patterns described in the{" "}
            <strong>Updating dialog content</strong> section.
          </DemoParagraph>
        </FlexBox>
      ),
      [],
    );

    const statusBar = useMemo(
      () => (
        <DemoStatusBar
          statusText={isLoading ? "Loading..." : "Ready"}
          statusColor={isLoading ? "warning" : "success"}
        />
      ),
      [isLoading],
    );

    const footer = useMemo(
      () => (
        <DemoFooter
          content={
            <FlexBox
              className={dialogistClasses.bottomCorners}
              x="space-between"
              y="center"
              px={2}
              py={1}
              sx={{
                backgroundColor: "background.secondary",
                "& *": { display: "flex", alignItems: "center", gap: 0.5 },
                "& span": { opacity: 0.5 },
              }}
            >
              <Typography variant="caption" color="secondary.main">
                <RiFootballLine size={16} />
                Custom footer content
              </Typography>
              <Typography variant="caption" color="secondary.main" display="flex" alignItems="center" gap={1}>
                Tips appear here <TbTipJar size={16} />
              </Typography>
            </FlexBox>
          }
        />
      ),
      [],
    );

    const openDemo = () => {
      setResult(null);
      setIsLoading(true);
      dialog.open({
        type: "confirm",
        title: "Using custom components",
        message,
        statusBar,
        footer,
        onOkClick: () => {
          setResult({ text: "Confirm", color: "success.main" });
          setIsLoading(false);
        },
        onCancelClick: () => {
          setResult({ text: "Cancel", color: "error.main" });
          setIsLoading(false);
        },
        onClose: () => {
          setIsLoading(false);
        },
      });
    };

    return (
      <BaseDemoCard
        icon={withPiDuotoneIcon(PiPaintBrushDuotone)}
        title={CARD_TITLE}
        dialogKey={DIALOG_KEY}
        description={
          <>
            To use custom layout and content, you can pass a <Code>ReactNode</Code> instead of a string.
          </>
        }
        actions={[{ label: "Show custom components dialog", onClick: openDemo, icon: <PiPaintBrushDuotone /> }]}
        result={result}
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph>
            <Code>message</Code>, <Code>statusBar</Code>, and <Code>footer</Code> accept either a string or a{" "}
            <Code>ReactNode</Code>. You can use JSX for emphasis, to customize layout, or to embed dynamic components.
          </DemoParagraph>
          <DemoParagraph>
            <strong>Caveat:</strong> components passed to <Code>dialog.open()</Code> are not reactive — meaning they
            won't update when state changes. See <strong>Updating dialog content</strong> reactive patterns.
          </DemoParagraph>
          <CodeBlock language="tsx">{OPENING_WITH_JSX_SNIPPET}</CodeBlock>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
  },
);
