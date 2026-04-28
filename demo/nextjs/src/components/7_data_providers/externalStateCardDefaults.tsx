"use client";

import { DemoParagraph } from "../common/typography";

/** Default `useDialogSlots` sample shown on external-state demo cards (override per card via `codeSnippet`). */
export const EXTERNAL_STATE_SLOTS_SNIPPET = `// Register dialog slots: each slot is [value, dependencyList]
useDialogSlots(dialogId, {
  title: [\`Todo list (\${todos.length} items)\`, [todos.length]],
  content: [() => <TodoList todos={todos} onChange={setTodos} />, [todos, setTodos]],
  props: [{ overflow: "visible" }, []],
});

// Slots are injected when the dialog opens
dialog.open({ type: "alert" });`;

/** Default intro copy above the sample code (pass a custom `body` from each card to teach library-specific details). */
export const ExternalStateSlotsExplainerBody = () => {
  return (
    <DemoParagraph>
      You register the dialog's content as slots and provide the external state values as dependencies. Whenever
      those values change, the affected slot re-renders automatically — the dialog stays open and always reflects the
      latest state.
    </DemoParagraph>
  );
}
