"use client";

import { Chip, Typography } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { useDialog } from "dialogist";
import { memo, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { PiShieldWarningDuotone } from "react-icons/pi";

import { DEMO_PI_DUOTONE_ICON_CLASS } from "@/constants/demoCardIconClasses";
import { useDemoState } from "@/contexts/DemoStateContext";
import { Admonition } from "../common/admonition";
import { BaseDemoCard, type DemoCardAction, DemoCardSwitch } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import { DemoReproList } from "../common/DemoReproList";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withPiDuotoneIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph, Key } from "../common/typography";

const DIALOG_KEY = ["preventing-dialogs-from-closing", "demo"] as const;
const CARD_TITLE = "Preventing dialogs from closing";

const CAN_CLOSE_SNIPPET = `
const [allowClose, setAllowClose] = useState(false);
const dialog = useDialog("my-dialog", {
  type: "confirm",
  // stays in sync with component state
  canClose: () => allowClose,
});

dialog.open({ title: "Save?", message: "…" });

// handle blocked close attempts
dialog.on("closePrevented", ({ reason }) => {
  // reason == why the close was prevented
  // ("backdrop" | "escape" | "action")
});`;

export const PreventingDialogsFromClosingCard = Object.assign(
  memo(function PreventingDialogsFromClosingCard() {
    const [allowClose, setAllowClose] = useState(false);
    const dialog = useDialog(DIALOG_KEY, {
      type: "confirm",
      canClose: () => allowClose,
    });
    const [preventedNotice, setPreventedNotice] = useState<ReactNode | null>(null);
    const [result, setResult] = useState<DialogResult | null>(null);
    const { isFullscreen } = useDemoState();

    useEffect(() => {
      let isMounted = true;
      const unsubscribe = dialog.on("closePrevented", (payload) => {
        if (!isMounted) return;
        if (!payload || typeof payload !== "object") {
          setPreventedNotice("The dialog cannot be closed.");
          return;
        }
        const reason = (payload as { reason?: string }).reason;
        switch (reason) {
          case "backdrop":
            setPreventedNotice(
              <>
                Backdrop clicks are ignored while <Code>canClose()</Code> returns <Code>false</Code>.
              </>,
            );
            break;
          case "escape":
            setPreventedNotice(
              <>
                Pressing <Key>Esc</Key> does nothing while <Code>canClose()</Code> returns <Code>false</Code>.
              </>,
            );
            break;
          case "action":
            setPreventedNotice(
              <>
                Action buttons won't close the dialog while <Code>canClose()</Code> returns <Code>false</Code>.
              </>,
            );
            break;
          default:
            setPreventedNotice(<>Disable the guard to close the dialog.</>);
        }
      });
      return () => {
        isMounted = false;
        unsubscribe();
      };
    }, [dialog]);

    const permitClosing = useCallback(() => {
      setAllowClose(true);
      setPreventedNotice(null);
      dialog.setTitle("This dialog can be closed now");
    }, [dialog]);

    const preventClosing = useCallback(() => {
      setAllowClose(false);
      setPreventedNotice(null);
      dialog.setTitle("This dialog cannot be closed");
    }, [dialog]);

    const openPreventingCloseDemo = useCallback(() => {
      setResult(null);
      setPreventedNotice(null);
      preventClosing();
      void dialog
        .open({
          type: "confirm",
          title: CARD_TITLE,
          message: (
            <FlexBox column gap={1.5}>
              <Typography variant="body1">
                {!allowClose ? "This dialog cannot be closed" : "It is safe to close this dialog now"}
              </Typography>
              <DemoParagraph>
                Try closing this dialog while <Code>canClose</Code> is false. Release the guard from the card to close
                it.
              </DemoParagraph>
              <Chip
                icon={
                  <span className={DEMO_PI_DUOTONE_ICON_CLASS}>
                    <PiShieldWarningDuotone size={16} />
                  </span>
                }
                size="small"
                variant="outlined"
                color="warning"
                label="Saving in progress"
                sx={{ alignSelf: "flex-start" }}
              />
            </FlexBox>
          ),
          okLabel: "Confirm close",
          cancelLabel: "Cancel",
        })
        .then((event) => {
          setResult({
            text: event.buttonText,
            color: event.ok ? "success.main" : "error.main",
          });
        })
        .finally(() => {
          permitClosing();
        });
    }, [allowClose, dialog, permitClosing, preventClosing]);

    const handlePreventClosingToggle = useCallback(
      (_event: unknown, checked: boolean) => {
        setPreventedNotice(null);
        if (checked) {
          preventClosing();
        } else {
          permitClosing();
        }
      },
      [permitClosing, preventClosing],
    );

    const actions: DemoCardAction[] = useMemo(() => {
      return [
        {
          label: "Show close guard demo",
          icon: <PiShieldWarningDuotone />,
          onClick: openPreventingCloseDemo,
          disabled: isFullscreen,
          disabledTooltip: "Switch to windowed mode in the sandbox",
        },
      ];
    }, [isFullscreen, openPreventingCloseDemo]);

    return (
      <BaseDemoCard
        icon={withPiDuotoneIcon(PiShieldWarningDuotone)}
        title={CARD_TITLE}
        dialogKey={DIALOG_KEY}
        description={
          <>
            Guard against dialogs closing when your application state isn't ready (e.g. unsaved changes or incomplete
            actions).
          </>
        }
        actions={actions}
        result={result}
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph>
            Pass a <Code>canClose</Code> predicate to control whether a dialog is allowed to close. It is evaluated on
            every close attempt — backdrop clicks, <Key>Esc</Key> key, and action buttons all go through it.
          </DemoParagraph>
          <DemoParagraph>
            When the predicate returns <Code>false</Code>, the dialog remains open, and emits a "closePrevented" event.
          </DemoParagraph>
          <Admonition variant="tip" sx={{ mt: 1 }}>
            <Code>canClose</Code> is a reactive handler, so it stays in sync with your React state.
          </Admonition>
          <CodeBlock>{CAN_CLOSE_SNIPPET}</CodeBlock>
        </FlexBox>
        <FlexBox column gap={1.5} mt={2}>
          {preventedNotice && (
            <Admonition variant="info" title="">
              {preventedNotice}
            </Admonition>
          )}
          <DemoReproList
            steps={[
              <>
                Open the dialog, then try to close it.{" "}
                <span style={{ opacity: 0.5 }}>
                  (The dialog will be prevented from closing while the guard is active.)
                </span>
              </>,
              "Flip the switch to disable the guard, then try closing the dialog again.",
            ]}
            requiresWindowedMode
          />
          <DemoCardSwitch
            checked={!allowClose}
            onChange={handlePreventClosingToggle}
            label={`Close guard (prevent dialog from closing)`}
            labelPlacement="end"
          />
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
  },
);
