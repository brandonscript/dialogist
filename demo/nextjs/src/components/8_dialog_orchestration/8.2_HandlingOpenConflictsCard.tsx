"use client";

import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Switch,
  Typography,
} from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { type DialogConflictPolicy, type DialogConflictResolver, useDialog, useDialogActionsContext } from "dialogist";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { TbLockX } from "react-icons/tb";

import { DEMO_ANIMAL_EMOJI_LIST } from "@/constants/demoAnimalEmojis";
import { useDemoState } from "@/contexts/DemoStateContext";
import { Admonition } from "../common";
import { BaseDemoCard, type DemoCardAction } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import { DemoReproList } from "../common/DemoReproList";
import type { DialogResult } from "../common/DialogResultDisplay";
import { withGenericOutlineIcon } from "../common/demoCardIconWrappers";
import { InlineArrowRight } from "../common/InlineArrowRight";
import { BulletList, BulletListItem, Code, DemoParagraph } from "../common/typography";

const DIALOG_KEY = "conflict-id-demo";
const DIALOG_KEY_OTHER = "other-id-demo";
const CARD_TITLE = "Handling open conflicts";
const DIALOG_KEY_CHILD = ["conflict-id-demo", "child"] as const;
const DIALOG_KEY_CHILD_STR = DIALOG_KEY_CHILD.join("::");

const CONFLICT_POLICY_OPTIONS: { value: DialogConflictPolicy; label: string }[] = [
  { value: "block", label: "Block" },
  { value: "replaceSameKey", label: "Replace same key" },
  { value: "replaceSameRoot", label: "Replace same root" },
  { value: "replaceAny", label: "Replace any" },
];

const CONFLICT_SNIPPET = `const dialogPrimary = useDialog("primary");
const dialogChild = useDialog(["primary", "child"]);
const dialogOther = useDialog(["other"]);

// default: conflicting open() resolves with blocked: true
dialogPrimary.open({ type: "alert", message: "Hello" });

const result = await dialogPrimary.open({ type: "alert", message: "Hello" });
if (result.blocked) {
  // conflicting open() was blocked by policy
}

// reject blocked conflicts instead of resolving the promise
dialogPrimary
  .open({
    type: "alert",
    message: "Hello",
    throwOnConflict: true,
    onConflict: "replaceSameRoot",
  })
  .catch(console.error);

// allow replacement when the dialog key is the same
dialogChild.open({
  type: "alert",
  message: "Hello, again",
  onConflict: "replaceSameKey",
});

// decide dynamically from the conflict object
dialogOther.open({
  type: "alert",
  message: "Hello, another",
  onConflict: (conflict: DialogConflictResolver) => {
    const {
      attemptedDialogKey, // usually this dialog's key — "other"
      activeDialogKey, // the active dialog's key, i.e. "primary" or "primary::child"
      activePolicy, // the active dialog's (or provider's) policy
      keyRelation, // "sameKey" | "sameRoot" | "unrelated"
      decision, // "replace" | "block" (how the conflict will be handled unless overridden)
    } = conflict;
    
    // return a policy string to override; return undefined / void to use the 
    // pre-determined activePolicy
    if (conflict.activeDialogKey?.includes("checkout")) {
      return "block";
    }
    // allows any dialog to replace *this one* whenever it's open,
    // but this won't override the active dialog's policy
    return "replaceAny";
  },
});`;

export const DialogConflictDemoCard = Object.assign(
  memo(function DialogConflictDemoCard() {
    const { closeDialog } = useDialogActionsContext();
    const dialogPrimary = useDialog(DIALOG_KEY);
    const dialogChild = useDialog(DIALOG_KEY_CHILD);
    const dialogOther = useDialog(DIALOG_KEY_OTHER);
    const [conflictPolicy, setConflictPolicy] = useState<DialogConflictPolicy>("block");
    const [secondOpenThrows, setSecondOpenThrows] = useState(false);
    const [conflictNote, setConflictNote] = useState<{ text: string; severity: "info" | "error" } | null>(null);
    const [result, setResult] = useState<DialogResult | null>(null);
    const { isFullscreen } = useDemoState();
    const demoOpenEmojiSeqRef = useRef(0);

    const nextDemoEmoji = useCallback(() => {
      demoOpenEmojiSeqRef.current += 1;
      const n = demoOpenEmojiSeqRef.current;
      return DEMO_ANIMAL_EMOJI_LIST[(n - 1) % DEMO_ANIMAL_EMOJI_LIST.length];
    }, []);

    const clearConflictNote = useCallback(() => {
      setConflictNote(null);
    }, []);

    const handleConflictPolicyChange = useCallback(
      (e: SelectChangeEvent<DialogConflictPolicy>) => {
        setConflictPolicy(e.target.value as DialogConflictPolicy);
        setConflictNote(null);
        // Close sibling keys so a replace does not leave another hook's activeKeyRef stale.
        closeDialog(DIALOG_KEY_OTHER);
        closeDialog(DIALOG_KEY_CHILD_STR);
        closeDialog(DIALOG_KEY);
      },
      [closeDialog],
    );

    const handleConflict = useCallback(
      (conflict: DialogConflictResolver) => {
        console.log("[conflict demo] onConflict", {
          ...conflict,
          returningPolicy: conflictPolicy,
        });
        return conflictPolicy;
      },
      [conflictPolicy],
    );

    const openPrimary = useCallback(() => {
      clearConflictNote();
      const emoji = nextDemoEmoji();
      dialogPrimary
        .open({
          type: "alert",
          title: "Conflict demo",
          message: (
            <>
              {emoji} Opened with key <Code>{DIALOG_KEY}</Code>.
            </>
          ),
          okLabel: "Close",
          throwOnConflict: secondOpenThrows,
          onConflict: handleConflict,
          onOkClick: () => {
            setResult({ text: "Primary closed", color: "info.main" });
          },
        })
        .then((ev) => {
          if (ev.blocked) {
            setConflictNote({
              text: `Second open was blocked. Demo policy returned from onConflict: "${conflictPolicy}". Check the console for the last payload — fields include decision and activePolicy (baseline before your return).`,
              severity: "info",
            });
          }
        })
        .catch((err: unknown) => {
          const text = err instanceof Error ? err.message : String(err);
          setConflictNote({ text, severity: "error" });
        });
    }, [dialogPrimary, clearConflictNote, secondOpenThrows, handleConflict, conflictPolicy, nextDemoEmoji]);

    const openSameRoot = useCallback(() => {
      clearConflictNote();
      const emoji = nextDemoEmoji();
      dialogChild
        .open({
          type: "alert",
          title: "Same-root dialog",
          message: (
            <>
              {emoji} Opened with key <Code>{DIALOG_KEY_CHILD_STR}</Code>.
            </>
          ),
          okLabel: "Close",
          throwOnConflict: secondOpenThrows,
          onConflict: handleConflict,
          onOkClick: () => {
            setResult({ text: "Same-root dialog closed", color: "success.main" });
          },
        })
        .then((ev) => {
          if (ev.blocked) {
            setConflictNote({
              text: `Blocked (different dialog is active). Active dialog conflict policy: "${conflictPolicy}".`,
              severity: "info",
            });
          }
        })
        .catch((err: unknown) => {
          const text = err instanceof Error ? err.message : String(err);
          setConflictNote({ text, severity: "error" });
        });
    }, [dialogChild, clearConflictNote, conflictPolicy, secondOpenThrows, handleConflict, nextDemoEmoji]);

    const openOther = useCallback(() => {
      clearConflictNote();
      const emoji = nextDemoEmoji();
      dialogOther
        .open({
          type: "alert",
          title: "Different dialog",
          message: (
            <>
              {emoji} Opened with key <Code>{DIALOG_KEY_OTHER}</Code>.
            </>
          ),
          okLabel: "Close",
          throwOnConflict: secondOpenThrows,
          onConflict: handleConflict,
          onOkClick: () => {
            setResult({ text: "Different dialog closed", color: "success.main" });
          },
        })
        .then((ev) => {
          if (ev.blocked) {
            setConflictNote({
              text: `Blocked (different dialog is active). Active dialog conflict policy: "${conflictPolicy}".`,
              severity: "info",
            });
          }
        })
        .catch((err: unknown) => {
          const text = err instanceof Error ? err.message : String(err);
          setConflictNote({ text, severity: "error" });
        });
    }, [dialogOther, clearConflictNote, conflictPolicy, secondOpenThrows, handleConflict, nextDemoEmoji]);

    const actions: DemoCardAction[] = useMemo(
      () => [
        {
          label: "Open primary dialog",
          onClick: openPrimary,
          disabled: isFullscreen,
          disabledTooltip: "Switch to windowed mode in the sandbox",
        },
        {
          label: "Same root key",
          onClick: openSameRoot,
          variant: "outlined" as const,
          disabled: isFullscreen,
          disabledTooltip: "Switch to windowed mode in the sandbox",
        },
        {
          label: "Different key",
          onClick: openOther,
          variant: "outlined" as const,
          disabled: isFullscreen,
          disabledTooltip: "Switch to windowed mode in the sandbox",
        },
      ],
      [openPrimary, openSameRoot, openOther, isFullscreen],
    );

    return (
      <BaseDemoCard
        icon={withGenericOutlineIcon(TbLockX)}
        title={CARD_TITLE}
        dialogKey={DIALOG_KEY}
        description={
          <>
            By default, when an <Code>open()</Code> call conflicts with the current dialog state, Dialogist blocks it.
            You can override this with a conflict resolution policy.
          </>
        }
        actions={actions}
        result={result}
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoParagraph>
            Dialogist reuses a single dialog instance rather than stacking multiple dialogs in the DOM. Because of this,
            it needs to guard against unwanted or spurious <Code>open()</Code> calls, otherwise multiple parts of your
            app could end up competing for control.
          </DemoParagraph>
          <DemoParagraph>
            When a conflict occurs, Dialogist evaluates a conflict policy and makes a decision about what to do next.
          </DemoParagraph>
          <DemoParagraph component="div">
            You can control this behavior using <Code>onConflict</Code>. This can be a policy string, or a function that
            returns one.
            <BulletList>
              <BulletListItem>
                <Code>"block"</Code> – keep the active dialog; ignore all new <Code>open()</Code> calls.
              </BulletListItem>
              <BulletListItem>
                <Code>"replaceSameKey"</Code> – replace only if the dialog keys are identical.
              </BulletListItem>
              <BulletListItem>
                <Code>"replaceSameRoot"</Code> – replace only if both dialogs share the same root key (e.g.
                <Code>["checkout", "payment"]</Code> <InlineArrowRight /> <Code>["checkout", "shipping"]</Code>).
              </BulletListItem>
              <BulletListItem>
                <Code>"replaceAny"</Code> – always allow any dialog to replace the active one.
              </BulletListItem>
            </BulletList>
          </DemoParagraph>
          <DemoParagraph>
            Conflict resolution is determined by the active dialog's <Code>onConflict</Code> policy, falling back to{" "}
            <Code>DialogProvider</Code>'s config (and <Code>"block"</Code> by default).
          </DemoParagraph>
          <Admonition title="" variant="tip">
            This ensures the active dialog controls whether it can be replaced or updated — later <Code>open()</Code>{" "}
            calls cannot override that decision.
          </Admonition>
          <DemoParagraph>
            Separately, <Code>throwOnConflict</Code> controls how blocked conflicts are surfaced. By default, a blocked{" "}
            <Code>open()</Code> resolves quietly. Setting <Code>throwOnConflict: true</Code> instead causes Dialogist to
            raise an error when it blocks an <Code>open()</Code>.
          </DemoParagraph>
          <CodeBlock>{CONFLICT_SNIPPET}</CodeBlock>
        </FlexBox>
        <FlexBox column gap={2} mt={2}>
          <FormControl
            size="small"
            disabled={isFullscreen}
            sx={{ maxWidth: 280, width: "100%", alignSelf: "flex-start" }}
          >
            <InputLabel id="conflict-policy-demo-label">Active dialog conflict policy</InputLabel>
            <Select<DialogConflictPolicy>
              labelId="conflict-policy-demo-label"
              id="conflict-policy-demo"
              value={conflictPolicy}
              label="Active dialog conflict policy"
              onChange={handleConflictPolicyChange}
            >
              {CONFLICT_POLICY_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  <Typography variant="body2">{opt.label}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch size="small" checked={secondOpenThrows} onChange={(_, checked) => setSecondOpenThrows(checked)} />
            }
            label={<Typography variant="caption">Throw on conflict</Typography>}
          />

          {conflictNote && (
            <Admonition title="" variant={conflictNote.severity === "info" ? "note" : "caution"}>
              {conflictNote.text}
            </Admonition>
          )}
          <DemoReproList
            steps={[
              <>
                Pick a conflict policy, then click <em>Open primary dialog</em>.
              </>,
              <>
                Without closing it, click <em>Open primary dialog</em> again.
                <BulletList sx={{ pb: 0 }}>
                  <BulletListItem>
                    The emoji in the message will change each time you successfully open a dialog.
                  </BulletListItem>
                  <BulletListItem>Check the console for the conflict object and decision.</BulletListItem>
                </BulletList>
              </>,
              <>
                Try the <em>Same root key</em> or <em>Different key</em> buttons with different conflict policies, then
                check the console again.
              </>,
              <>
                Try toggling <em>Throw on conflict</em> to <Code>throw</Code> when a conflict is blocked instead.
              </>,
            ]}
            requiresWindowedMode
          />
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
    cardSubHeadings: [],
  },
);
