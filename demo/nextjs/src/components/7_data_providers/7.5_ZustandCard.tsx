"use client";

import { Link } from "@mui/material";
import { type Dispatch, memo, type SetStateAction, useCallback } from "react";
import { RiBearSmileLine } from "react-icons/ri";
import { create } from "zustand";

import { BaseExternalStateCard } from "../common/BaseExternalStateCard";
import { CodeBlock } from "../common/code";
import { withGenericFillIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph, DemoSectionHeading } from "../common/typography";
import { EMOJI_TODOS, type TodoItem } from "./TodoListDialogContent";

const DIALOG_KEY = "zustand-todos";
const CARD_TITLE = "Using Zustand";

const Icon = withGenericFillIcon(RiBearSmileLine, { rootStrokeZero: true });

/** Comprehensive: dialog body syncs full list via store setTodos. */
const ZUSTAND_EXTERNAL_SYNC_SNIPPET = `
import { create } from "zustand";

const DIALOG_KEY = "todo-dialog";

type Todo = {
  // ...
};

interface TodosStore {
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
}

const todosStore = create<TodosStore>((set) => ({
  todos: [],
  setTodos: (todos) => set({ todos }),
}));

const TodoDialogContent = () => {
  const todos = todosStore((state) => state.todos);

  const [newTodoText, setNewTodoText] = useState("");

  const { value: localTodos, setValue: setLocalTodos } = useDialogExternalSync({
    externalValue: todos,
    setExternalValue: (next) => {
      todosStore.getState().setTodos(next);
    },
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

const App = () => <OpenTodoDialogButton />;
`;

/** Abbreviated: register slots next to store subscriptions (full edit flows use useDialogExternalSync above). */
const ZUSTAND_SLOTS_SNIPPET = `
const TodoList = () => {
  const todos = todosStore((state) => state.todos);
  return (
    <>
      {todos.map((todo) => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </>
  );
};

const TodosController = () => {
  const todos = todosStore((state) => state.todos);
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
  <>
    <TodosController />
    <OpenTodoDialogButton />
  </>
);
`;

const initialTodos: TodoItem[] = [
  { id: "1", text: `${EMOJI_TODOS[0].emoji} ${EMOJI_TODOS[0].text}`, completed: false },
  { id: "2", text: `${EMOJI_TODOS[1].emoji} ${EMOJI_TODOS[1].text}`, completed: false },
  { id: "3", text: `${EMOJI_TODOS[2].emoji} ${EMOJI_TODOS[2].text}`, completed: false },
];

interface TodosStore {
  todos: TodoItem[];
  setTodos: (todos: TodoItem[]) => void;
}

const todosStore = create<TodosStore>((set) => ({
  todos: initialTodos,
  setTodos: (todos) => set({ todos }),
}));

const ZustandCardInner = () => {
  const todos = todosStore((state) => state.todos);
  const setTodosInStore = todosStore((state) => state.setTodos);

  const setTodos = useCallback<Dispatch<SetStateAction<TodoItem[]>>>(
    (value) => {
      const prev = todosStore.getState().todos;
      setTodosInStore(typeof value === "function" ? value(prev) : value);
    },
    [setTodosInStore],
  );

  return (
    <BaseExternalStateCard
      title={CARD_TITLE}
      icon={Icon}
      dialogId={DIALOG_KEY}
      stateLib="zustand"
      description={
        <>
          You can use <Code>useDialogExternalSync()</Code> or <Code>useDialogSlots()</Code> to keep dialog slots in sync
          with Zustand store state.
        </>
      }
      body={
        <>
          <DemoSectionHeading>
            Data binding with <Code>useDialogExternalSync()</Code>
          </DemoSectionHeading>
          <DemoParagraph>
            Hold the list in <Code>todos</Code> and replace it with <Code>setTodos</Code>.{" "}
            <Code>useDialogExternalSync()</Code> flushes a merged list — call{" "}
            <Code>todosStore.getState().setTodos(next)</Code> in <Code>setExternalValue</Code>. What{" "}
            <Code>create()</Code> returns is both a hook (call it with a selector) and a store object with{" "}
            <Code>getState()</Code> — that is Zustand, not Redux. See{" "}
            <Link
              href="https://zustand.docs.pmnd.rs/learn/getting-started/introduction"
              target="_blank"
              rel="noopener noreferrer"
            >
              Zustand
            </Link>{" "}
            for patterns.
          </DemoParagraph>
          <CodeBlock language="tsx">{ZUSTAND_EXTERNAL_SYNC_SNIPPET}</CodeBlock>
          <DemoSectionHeading>
            UI updates with <Code>useDialogSlots()</Code>
          </DemoSectionHeading>
          <DemoParagraph>
            Alternatively, if you prefer to use <Code>useDialogSlots()</Code> instead of{" "}
            <Code>useDialogExternalSync()</Code>, you can mount a small controller next to your tree that uses Zustand
            selectors as slot dependencies.
          </DemoParagraph>
          <CodeBlock language="tsx">{ZUSTAND_SLOTS_SNIPPET}</CodeBlock>
        </>
      }
      todos={todos}
      setTodos={setTodos}
      initialTodos={initialTodos}
      dialogMessage="Edit the todo list. Changes sync with Zustand store."
      logPortalIndex={4}
    />
  );
};

export const ZustandCard = Object.assign(
  memo(function ZustandCard() {
    return <ZustandCardInner />;
  }),
  {
    cardTitle: CARD_TITLE,
  },
);
