"use client";

import { TextField, Typography } from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { useDialog, useDialogSlots } from "dialogist";
import { memo, useEffect, useRef, useState } from "react";
import { PiStairsDuotone } from "react-icons/pi";

import { BaseDemoCard } from "../common/BaseDemoCard";
import { CodeBlock } from "../common/code";
import { withPiDuotoneIcon } from "../common/demoCardIconWrappers";
import { BulletList, BulletListItem, DemoParagraph, DemoSectionHeading } from "../common/typography";

const DIALOG_KEY = "dialog-slots-demo";
const CARD_TITLE = "Understanding dialog slots";

const SLOTS_SNIPPET = `
// the title ticks every second
const DialogTitleTicker = memo(function DialogTitleTicker() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(intervalId);
  }, []);

  return seconds === 0 ? "Add a comment" : \`Add a comment (\${seconds}s elapsed)\`;
});

// the body manages comment input independently
const DialogBody = memo(function DialogBody() {
  const [comment, setComment] = useState("");

  // imagine this hook autosaves the comment to an external store which,
  // upstream, has the potential to cause the dialog to re-render
  const [autosaveComment, setAutosaveComment] = useAutoSave(
    "some-unique-comment-id",
    comment,
    { debounceMs: 1000 },
  );

  useEffect(() => {
    setAutosaveComment(comment);
  }, [comment, setAutosaveComment]);

  return (
    <TextField
      label="Your comment"
      multiline
      rows={3}
      fullWidth
      value={comment}
      onChange={(e) => setComment(e.target.value)}
      placeholder="Type something while the title ticks..."
      autoFocus
    />
  );
});
      
// the empty deps arrays [] tell Dialogist these factories never need to be
// re-registered (because the components manage their own state internally)
useDialogSlots("dialog-slots-demo", {
  // each slot is its own isolated component with its own state
  title: [() => <DialogTitleTicker />, []],
  content: [() => <DialogBody />, []],
});`;

const DialogTitleTicker = memo(function DialogTitleTicker() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(intervalId);
  }, []);

  return seconds === 0 ? "Add a comment" : `Add a comment (${seconds}s elapsed)`;
});

const DialogBody = memo(function DialogBody() {
  const [comment, setComment] = useState("");
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  const renderCount = renderCountRef.current;
  // In React Strict Mode (dev), render paths are intentionally invoked twice.
  // Normalize for demo readability so each user-visible update increments by one.
  const displayRenderCount =
    process.env.NODE_ENV === "development" ? Math.max(1, Math.ceil(renderCount / 2)) : renderCount;

  return (
    <FlexBox column gap={2} width="100%" pb={0.5} sx={{ minWidth: { xs: 0, sm: 420 } }}>
      <TextField
        label="Your comment"
        multiline
        rows={3}
        fullWidth
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Type something while the title ticks..."
        autoFocus
      />
      <FlexBox x="space-between" y="center">
        <Typography variant="caption" color="text.secondary">
          Body re-renders: <strong>{displayRenderCount}</strong>
        </Typography>
      </FlexBox>
    </FlexBox>
  );
});

export const UnderstandingDialogSlotsCard = Object.assign(
  memo(function DialogSlotsCard() {
    const dialog = useDialog(DIALOG_KEY, { type: "alert" });

    useDialogSlots(DIALOG_KEY, {
      title: [() => <DialogTitleTicker />, []],
      content: [() => <DialogBody />, []],
    });

    const handleOpen = () => {
      void dialog.open({
        okLabel: "Close",
      });
    };

    return (
      <BaseDemoCard
        icon={withPiDuotoneIcon(PiStairsDuotone)}
        title={CARD_TITLE}
        dialogKey={DIALOG_KEY}
        description={
          <>
            Slots let you update parts of a dialog independently, so changes in one area don&apos;t re-render everything
            else.
          </>
        }
        actions={[
          {
            icon: <PiStairsDuotone />,
            label: "Show slots example dialog",
            onClick: handleOpen,
          },
        ]}
      >
        <FlexBox column gap={2} mt={1.5}>
          <DemoSectionHeading subtitle="Using slots for performance isolation" />
          <DemoParagraph>
            Without slots, any state change that affects a dialog will re-render the entire dialog — title, content, and
            actions all update together. That's fine for simple cases, but it becomes a problem when different parts of
            the dialog change at different rates.
          </DemoParagraph>
          <DemoParagraph component="div">
            For example, you might have:
            <BulletList>
              <BulletListItem>a title that changes based on app state</BulletListItem>
              <BulletListItem>a form body that updates on every keystroke</BulletListItem>
              <BulletListItem>action buttons that depend on validation state</BulletListItem>
            </BulletList>
            Many of these updates and effects may be controlled outside the dialog's scope, like in a parent component,
            or a global state manager. Without slots, all of these updates would trigger every part of the dialog to
            re-render — often creating a re-render loop.
          </DemoParagraph>
          <DemoParagraph>
            But by separating the logical parts of each dialog, slots let you decide what should update, when, and why,
            instead of tying the entire dialog to a single render cycle.
          </DemoParagraph>
          <CodeBlock>{SLOTS_SNIPPET}</CodeBlock>
          <DemoSectionHeading subtitle="Try it out" />
          <DemoParagraph>
            You'll see the title update every second, while the body re-render counter only increments when you type.
            Start typing to confirm the body updates independently, then stop and watch the counter freeze again as the
            title keeps going.
          </DemoParagraph>
        </FlexBox>
      </BaseDemoCard>
    );
  }),
  {
    cardTitle: CARD_TITLE,
    cardSubHeadings: [],
  },
);
