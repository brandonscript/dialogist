"use client";

import { Link, Typography } from "@mui/material";
import { atom, Provider as JotaiProvider, useAtom } from "jotai";
import { type Dispatch, memo, type SetStateAction, useCallback } from "react";
import type { IconBaseProps } from "react-icons/lib";
import { BaseExternalStateCard } from "../common/BaseExternalStateCard";
import { CodeBlock } from "../common/code";
import { Code, DemoParagraph, DemoSectionHeading } from "../common/typography";
import { EMOJI_TODOS, type TodoItem } from "./TodoListDialogContent";

const DIALOG_KEY = "jotai-todos";
const CARD_TITLE = "Using Jotai";

const Icon = (props: IconBaseProps) => (
  <Typography
    component="span"
    display="flex"
    alignItems="center"
    justifyContent="center"
    sx={{ fontSize: "1.125rem", lineHeight: 1, height: props?.size ?? 22, width: props?.size ?? 22 }}
  >
    ō
  </Typography>
);

const JOTAI_EXTERNAL_SYNC_SNIPPET = `
import { atom, Provider as JotaiProvider, useAtom } from "jotai";

const DIALOG_KEY = "todo-dialog";

type Todo = {
  // ...
};

const todosAtom = atom<Todo[]>([]);

const TodoDialogContent = () => {
  const [todos, setTodos] = useAtom(todosAtom);
  const [newTodoText, setNewTodoText] = useState("");

  const { value: localTodos, setValue: setLocalTodos } = useDialogExternalSync({
    externalValue: todos,
    setExternalValue: setTodos,
    debounceMs: 300,
  });

  const handleAddTodo = () => {
    const text = newTodoText.trim();
    if (text) {
      setLocalTodos((prev) => [...prev, { id: crypto.randomUUID(), text }]);
      setNewTodoText("");
    }
  };

  return (
    <>
      {localTodos.map((todo) => (
        <div key={todo.id}>{todo.text}</div>
      ))}
      <TextField
        value={newTodoText}
        onChange={(e) => setNewTodoText(e.target.value)}
        placeholder="New todo"
      />
      <Button onClick={handleAddTodo} disabled={!newTodoText.trim()}>
        Add todo
      </Button>
    </>
  );
};

const OpenTodoDialogButton = () => {
  const dialog = useDialog(DIALOG_KEY, {
    content: <TodoDialogContent />,
  });

  return (
    <Button onClick={dialog.open}>
      Open dialog
    </Button>
  );
};

const App = () => (
  <JotaiProvider>
    <OpenTodoDialogButton />
  </JotaiProvider>
);
`;

const JOTAI_SLOTS_SNIPPET = `
const TodoList = () => {
  const [todos] = useAtom(todosAtom);
  return (
    <>
      {todos.map((todo) => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </>
  );
};

const TodosController = () => {
  const [todos] = useAtom(todosAtom);
  useDialogSlots(DIALOG_KEY, {
    title: [\`Todo list (\${todos.length} items)\`, [todos.length]],
    content: [TodoList, [todos]],
    props: [{ overflow: "visible" }, []],
  });
  return null;
};

const OpenTodoDialogButton = () => {
  const dialog = useDialog(DIALOG_KEY);
  return (
    <Button onClick={dialog.open}>
      Open dialog
    </Button>
  );
};

const App = () => (
  <JotaiProvider>
    <TodosController />
    <OpenTodoDialogButton />
  </JotaiProvider>
);
`;

const initialTodos: TodoItem[] = [
  { id: "1", text: `${EMOJI_TODOS[0].emoji} ${EMOJI_TODOS[0].text}`, completed: false },
  { id: "2", text: `${EMOJI_TODOS[1].emoji} ${EMOJI_TODOS[1].text}`, completed: false },
  { id: "3", text: `${EMOJI_TODOS[2].emoji} ${EMOJI_TODOS[2].text}`, completed: false },
];

// Jotai atom for todos
const todosAtom = atom<TodoItem[]>(initialTodos);

// Main card component
const JotaiCardInner = () => {
  const [todos, setAtomTodos] = useAtom(todosAtom);

  const setTodos = useCallback<Dispatch<SetStateAction<TodoItem[]>>>(
    (value) => {
      setAtomTodos(value);
    },
    [setAtomTodos],
  );

  return (
    <BaseExternalStateCard
      title={CARD_TITLE}
      icon={Icon}
      dialogId={DIALOG_KEY}
      stateLib="jotai"
      description={
        <>
          You can use <Code>useDialogExternalSync()</Code> or <Code>useDialogSlots()</Code> to keep dialog slots in sync
          with Jotai atoms.
        </>
      }
      body={
        <>
          <DemoSectionHeading>
            Data binding with <Code>useDialogExternalSync()</Code>
          </DemoSectionHeading>
          <DemoParagraph>
            If you need your dialog to consume and/or write to{" "}
            <Link href="https://jotai.org/" target="_blank" rel="noopener noreferrer">
              Jotai
            </Link>{" "}
            atoms, use <Code>useDialogExternalSync()</Code> to keep a local working copy which is synced back to the the
            atom (via <Code>useAtom</Code>&apos;s setter) at a controlled rate — pass the setter function from{" "}
            <Code>useAtom(...)</Code> to <Code>setExternalValue</Code>.
          </DemoParagraph>
          <CodeBlock language="tsx">{JOTAI_EXTERNAL_SYNC_SNIPPET}</CodeBlock>
          <DemoSectionHeading>
            UI updates with <Code>useDialogSlots()</Code>
          </DemoSectionHeading>
          <DemoParagraph>
            Alternatively, if you prefer to use <Code>useDialogSlots()</Code> instead of{" "}
            <Code>useDialogExternalSync()</Code>, you can mount a small controller next to your tree that uses atom
            state as slot dependencies.
          </DemoParagraph>
          <CodeBlock language="tsx">{JOTAI_SLOTS_SNIPPET}</CodeBlock>
        </>
      }
      todos={todos}
      setTodos={setTodos}
      initialTodos={initialTodos}
      dialogMessage="Edit the todo list. Changes sync with Jotai atom."
      logPortalIndex={2}
    />
  );
}

// Wrapper component that provides Jotai Provider
export const JotaiCard = Object.assign(
  memo(function JotaiCard() {
    return (
      <JotaiProvider>
        <JotaiCardInner />
      </JotaiProvider>
    );
  }),
  {
    cardTitle: CARD_TITLE,
  },
);
