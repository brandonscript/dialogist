"use client";

import { Button, Collapse, FormHelperText, Grid, TextField, type Theme } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { type DialogActionEvent, type DialogCloseEvent, useDialog } from "dialogist";
import { memo, useState } from "react";
import { PiGearSixDuotone } from "react-icons/pi";

import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withPiDuotoneIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph, DemoSectionHeading } from "../common/typography";

const DIALOG_KEY = "dialog-config-demo";
const CARD_TITLE = "Dialog configuration";

const CARD_SUBHEADINGS = [
  "Dialog defaults",
  "Customizing button labels",
  "Overriding at open time",
  "Reactive handlers",
] as const;

const DIALOG_DEFAULTS_SNIPPET = `const dialog = useDialog("edit-name-dialog", {
  type: "alert",
  title: "Edit your name",
  message: "Choose a display name for your profile before saving.",
});`;

const BUTTON_LABELS_SNIPPET = `const dialog = useDialog("edit-name-dialog", {
  okLabel: "Save",
  cancelLabel: "Cancel",
});`;

const OVERRIDE_AT_OPEN_SNIPPET = `dialog.open({
  type: "confirm",
  title: \`Edit your name, \${name}?\`,
  message: <EditNameDialogContent name={name} />, // JSX is fine too
  okLabel: name.trim() ? "Save" : "Invalid name",
  cancelLabel: "Keep editing",
  a11yRestoreFocus: false, // disable focus restoration on close
});`;

const REACTIVE_HANDLERS_LIST_SNIPPET = `
// action handling:
onOkClick(event: DialogActionEvent)
onCancelClick(event: DialogActionEvent)
onClick(actionId: string, event: DialogActionEvent) // for custom actions

// close handling:
onClose(event: DialogCloseEvent)
canClose: boolean // or
canClose: (willClose: DialogCloseResolver) => boolean

// conflict handling:
onConflict: DialogConflictPolicy // or
onConflict: (conflict: DialogConflictResolver) => DialogConflictPolicy | undefined
`;

const makeSecondaryColor = (theme: Theme) => `color-mix(in srgb, ${theme.palette.secondary.main} 60%, black)`;
const makePrimaryColor = (theme: Theme) => `color-mix(in srgb, ${theme.palette.primary.main} 80%, black)`;

export const DialogConfigurationCard = Object.assign(
  memo(function DialogConfigurationCard() {
    const dialog = useDialog(DIALOG_KEY, {
      title: "Default title",
      okLabel: "Boring confirm",
      cancelLabel: "Unimpressed cancel",
      a11yRestoreFocus: false,
      onOkClick: (event: DialogActionEvent) => {
        setResult({
          text: event.buttonText,
          color: "success.main",
        });
      },
      onCancelClick: (event: DialogActionEvent) => {
        setResult({
          text: event.buttonText,
          color: "error.main",
        });
      },
      minWidth: 320,
    });

    const [result, setResult] = useState<DialogResult | null>(null);
    const [title, setTitle] = useState("This is the way");
    const [confirmLabel, setConfirmLabel] = useState("Oh, yes!");
    const [cancelLabel, setCancelLabel] = useState("Nope");
    const [bodyHtml, setBodyHtml] = useState<string>(
      `<p style="margin:0">
  This <strong>HTML</strong> comes from the card input.
</p>`,
    );

    const bodyUnsafe = /eval\s*\(/i.test(bodyHtml) || /<script/i.test(bodyHtml) || /\)\s*\(/.test(bodyHtml);

    const [okJs, setOkJs] = useState<string>('console.log("Confirm clicked")');
    const [cancelJs, setCancelJs] = useState<string>('console.log("Cancel clicked")');
    const okValid = /^(?:alert\s*\(|console\.[a-zA-Z]+\s*\()/.test(okJs) && /\)\s*$/.test(okJs);
    const cancelValid = /^(?:alert\s*\(|console\.[a-zA-Z]+\s*\()/.test(cancelJs) && /\)\s*$/.test(cancelJs);

    const handleDialogWithDefaults = () => {
      setResult(null);
      dialog.open({
        type: "confirm",
        message: (
          <>
            This dialog is using the static params passed to the <Code>useDialog()</Code> hook.
          </>
        ),
      });
    };

    const handleDialogWithOverrides = () => {
      setResult(null);
      dialog.open({
        type: "confirm",
        title: title,
        message: "This dialog overrides the title and buttons from static params.",
        okLabel: confirmLabel,
        cancelLabel: cancelLabel,
      });
    };

    const handleDialogCompleteOverride = () => {
      setResult(null);
      dialog.open({
        type: "confirm",
        title: title || "Complete override",
        // biome-ignore lint/security/noDangerouslySetInnerHtml: demo only, ok
        message: <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />,
        okLabel: confirmLabel,
        cancelLabel: cancelLabel,
        onOkClick: (event: DialogCloseEvent) => {
          setResult({
            text: event.buttonText,
            color: "secondary.main",
          });
          if (okValid) {
            // biome-ignore lint/security/noGlobalEval: demo only, ok
            eval(okJs);
          }
        },
        onCancelClick: (event: DialogCloseEvent) => {
          setResult({
            text: event.buttonText,
            color: "error.main",
          });
          if (cancelValid) {
            // biome-ignore lint/security/noGlobalEval: demo only, ok
            eval(cancelJs);
          }
        },
      });
    };

    return (
      <BaseDemoCard
        icon={withPiDuotoneIcon(PiGearSixDuotone)}
        title={CARD_TITLE}
        dialogKey={DIALOG_KEY}
        description={"Dialogs support both hook-level defaults and per-call overrides."}
        result={result}
      >
        <FlexBox column gap={1} mt={1.5}>
          {/* Dialog defaults */}
          <DemoSectionHeading subtitle={CARD_SUBHEADINGS[0]} />
          <DemoParagraph>
            Configuration passed to <Code>useDialog()</Code> is the baseline (defaults) for that dialog instance.
          </DemoParagraph>
          <CodeBlock>{DIALOG_DEFAULTS_SNIPPET}</CodeBlock>

          {/* Customizing button labels */}
          <DemoSectionHeading subtitle={CARD_SUBHEADINGS[1]} mt={2} />
          <DemoParagraph>
            You can set button labels on the hook too, so they stay consistent across opens.
          </DemoParagraph>
          <CodeBlock>{BUTTON_LABELS_SNIPPET}</CodeBlock>

          {/* Overriding at open time */}
          <DemoSectionHeading subtitle={CARD_SUBHEADINGS[2]} mt={2} />
          <DemoParagraph>
            Values passed to <Code>open()</Code> can override the defaults for a single interaction.
          </DemoParagraph>
          <CodeBlock>{OVERRIDE_AT_OPEN_SNIPPET}</CodeBlock>

          {/* Reactive handlers */}
          <DemoSectionHeading subtitle={CARD_SUBHEADINGS[3]} mt={2} />
          <DemoParagraph component="div">
            While most config values are stable (i.e. they do not change while the dialog is open), handlers you pass to
            the config object will react to changes in your React state:
          </DemoParagraph>
          <CodeBlock>{REACTIVE_HANDLERS_LIST_SNIPPET}</CodeBlock>
        </FlexBox>

        {/* Try it out */}
        <DemoSectionHeading subtitle={"Try it out"} mt={2.5} />
        <FlexBox
          gap={1}
          mt={3}
          flexWrap="wrap"
          x="space-around"
          y="center"
          row={{ xs: true, md: true }}
          column={{ xs: true, md: false }}
          sx={{
            "@container (max-width: 560px)": {
              flexDirection: "column",
            },
          }}
        >
          <FlexBox column x="center" gap={3} flexWrap="wrap" mb={1} width="100%">
            <TextField
              size="small"
              label="Title"
              value={title}
              fullWidth
              sx={{
                "& .MuiFormLabel-root": { color: "text.secondary" },
              }}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              size="small"
              label="Content (HTML)"
              value={bodyHtml}
              onChange={(e) => setBodyHtml(e.target.value)}
              multiline
              minRows={4}
              fullWidth
              sx={{
                flex: 1,
                minWidth: 280,
                "&.MuiTextField-root": {
                  height: "auto",
                  transition: (theme) =>
                    theme.transitions.create("height", { duration: theme.transitions.duration.short }),
                },
              }}
              helperText={
                <Collapse in={bodyUnsafe} unmountOnExit timeout="auto" style={{ width: "100%" }}>
                  <FormHelperText error sx={{ m: 0 }}>
                    Potentially unsafe content. Don't do that!
                  </FormHelperText>
                </Collapse>
              }
              error={bodyUnsafe}
              slotProps={{
                input: {
                  style: {
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: "0.8rem",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  },
                },
              }}
            />
          </FlexBox>
          <Grid container spacing={1.5} sx={{ "& > div": { width: (theme) => `calc(50% - ${theme.spacing(0.75)})` } }}>
            <TextField
              size="small"
              label="Cancel label"
              value={cancelLabel}
              sx={{
                "& .MuiInputBase-input": {
                  color: makeSecondaryColor,
                },
              }}
              onChange={(e) => setCancelLabel(e.target.value)}
            />
            <TextField
              size="small"
              label="Confirm label"
              value={confirmLabel}
              sx={{
                "& .MuiInputBase-input": {
                  color: makePrimaryColor,
                },
              }}
              onChange={(e) => setConfirmLabel(e.target.value)}
            />
            <TextField
              size="small"
              label="onCancelClick(fn)"
              value={cancelJs}
              onChange={(e) => setCancelJs(e.target.value)}
              error={!cancelValid}
              helperText={!cancelValid ? "Must start with alert( or console.xxx( and end with )" : " "}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  "& .MuiInputBase-input": {
                    fontSize: "0.8rem",
                    color: makeSecondaryColor,
                  },
                },
              }}
            />
            <TextField
              size="small"
              label="onOkClick(fn)"
              value={okJs}
              onChange={(e) => setOkJs(e.target.value)}
              error={!okValid}
              helperText={!okValid ? "Must start with alert( or console.xxx( and end with )" : " "}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  "& .MuiInputBase-input": {
                    fontSize: "0.8rem",
                    color: makePrimaryColor,
                  },
                },
              }}
            />
          </Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDialogWithDefaults}
            startIcon={<PiGearSixDuotone />}
            sx={{ minWidth: 0 }}
          >
            Use all defaults
          </Button>
          <Button
            variant="contained"
            color="info"
            onClick={handleDialogWithOverrides}
            startIcon={<PiGearSixDuotone />}
            sx={{ minWidth: 0 }}
          >
            Override title & buttons
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleDialogCompleteOverride}
            disabled={bodyUnsafe || !okValid || !cancelValid}
            startIcon={<PiGearSixDuotone />}
            sx={{ minWidth: 0 }}
          >
            Override everything
          </Button>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
    cardSubHeadings: CARD_SUBHEADINGS.map((name) => ({ name })),
  },
);
