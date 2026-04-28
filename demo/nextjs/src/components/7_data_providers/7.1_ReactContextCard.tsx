"use client";

import { Link } from "@mui/material";
import { createContext, type Dispatch, memo, type ReactNode, type SetStateAction, useContext, useState } from "react";
import { TbBrandReact } from "react-icons/tb";

import { BaseExternalStateCard } from "../common/BaseExternalStateCard";
import { CodeBlock } from "../common/code";
import { withGenericOutlineIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph, DemoSectionHeading } from "../common/typography";
import { EMOJI_TODOS, type TodoItem } from "./TodoListDialogContent";

const DIALOG_KEY = "react-context-todos";
const CARD_TITLE = "Using React context";

const Icon = withGenericOutlineIcon(TbBrandReact);

const REACT_CONTEXT_SLOTS_SNIPPET = `
const DIALOG_KEY = "todo-dialog";

type Todo = {
  // ...
};

type TodoContextValue = {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
};

const TodoContext = React.createContext<TodoContextValue | null>(null);

const TodoList = () => {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("TodoList must be used within TodoProvider");
  const { todos } = ctx;

  return (
    <>
      {todos.map((todo) => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </>
  );
};

const TodoProvider = ({ children }: { children: React.ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>([]);

  // the provider owns the state and wires it directly into any dialog
  // instance with a matching DIALOG_KEY.
  useDialogSlots(DIALOG_KEY, {
    title: [\`Todo list (\${todos.length} items)\`, [todos.length]],
    content: [() => <TodoList />, []],
    props: [{ overflow: "visible" }, []],
  });

  return (
    <TodoContext.Provider value={{ todos, setTodos }}>
      {children}
    </TodoContext.Provider>
  );
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
  <TodoProvider>
    <OpenTodoDialogButton />
  </TodoProvider>
);`;

const REACT_CONTEXT_EXTERNAL_SYNC_SNIPPET = `
const TodoContext = React.createContext<{
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
} | null>(null);

const useTodos = () => {
  const ctx = React.useContext(TodoContext);
  if (!ctx) throw new Error("useTodos must be used within TodoProvider");
  return ctx;
};

const TodoDialogContent = () => {
  const { todos, setTodos } = useTodos();
  const { value: localTodos, setValue: setLocalTodos } = useDialogExternalSync({
    externalValue: todos,
    setExternalValue: setTodos,
    debounceMs: 300,
  });

  const addTodo = (text: string) => {
    setLocalTodos((prev) => [...prev, { id: crypto.randomUUID(), text }]);
  };

  return (
    <>
      {localTodos.map((todo) => (
        <div key={todo.id}>{todo.text}</div>
      ))}
      <Button onClick={() => addTodo("New todo")}>
        Add todo
      </Button>
    </>
  );
};

const OpenTodoDialogButton = () => {
  const dialog = useDialog("todo-dialog", {
    content: <TodoDialogContent />,
  });

  return (
    <Button onClick={dialog.open}>
      Open dialog
    </Button>
  );
};

const App = () => (
  <TodoProvider>
    <OpenTodoDialogButton />
  </TodoProvider>
);`;

// React Context for todos state
type TodosContextType = {
  value: TodoItem[];
  setValue: Dispatch<SetStateAction<TodoItem[]>>;
};

const TodosContext = createContext<TodosContextType | null>(null);

const useTodos = () => {
  const ctx = useContext(TodosContext);
  if (!ctx) throw new Error("useTodos must be used within TodosProvider");
  return ctx;
};

const TodosProvider = ({ children, initialValue = [] }: { children: ReactNode; initialValue?: TodoItem[] }) => {
  const [value, setValue] = useState<TodoItem[]>(initialValue);
  return <TodosContext.Provider value={{ value, setValue }}>{children}</TodosContext.Provider>;
};

const initialTodos: TodoItem[] = [
  { id: "1", text: `${EMOJI_TODOS[0].emoji} ${EMOJI_TODOS[0].text}`, completed: false },
  { id: "2", text: `${EMOJI_TODOS[1].emoji} ${EMOJI_TODOS[1].text}`, completed: false },
  { id: "3", text: `${EMOJI_TODOS[2].emoji} ${EMOJI_TODOS[2].text}`, completed: false },
];

// Main card component
const ReactContextCardInner = () => {
  const { value: todos, setValue: setTodos } = useTodos();

  return (
    <BaseExternalStateCard
      title={CARD_TITLE}
      icon={Icon}
      dialogId={DIALOG_KEY}
      stateLib="react-context"
      description={
        <>
          You can use <Code>useDialogSlots()</Code> or <Code>useDialogExternalSync()</Code> to keep dialog slots in sync
          with React Context state.
        </>
      }
      body={
        <>
          <DemoSectionHeading>
            UI updates with <Code>useDialogSlots()</Code>
          </DemoSectionHeading>
          <DemoParagraph>
            You can consume context or app state directly inside dialog content. But if the dialog (content, title,
            actions, etc.) needs to stay in sync with state managed by a{" "}
            <Link href="https://react.dev/reference/react/createContext" target="_blank" rel="noopener noreferrer">
              context provider
            </Link>
            , not just in the component that opens it, you can use use <Code>useDialogSlots()</Code> inside the provider
            to keep the dialog in sync.
          </DemoParagraph>
          <CodeBlock language="tsx">{REACT_CONTEXT_SLOTS_SNIPPET}</CodeBlock>
          <DemoSectionHeading>
            Data binding with <Code>useDialogExternalSync()</Code>
          </DemoSectionHeading>
          <DemoParagraph>
            If the dialog is editing a context-backed value over time, <Code>useDialogExternalSync()</Code> may be a
            better fit than
            <Code>useDialogSlots()</Code>. Instead of re-registering dialog content from the provider, the dialog keeps
            a local working copy and syncs changes back to context at a controlled rate.
          </DemoParagraph>
          <CodeBlock language="tsx">{REACT_CONTEXT_EXTERNAL_SYNC_SNIPPET}</CodeBlock>
        </>
      }
      todos={todos}
      setTodos={setTodos}
      initialTodos={initialTodos}
      dialogMessage="Edit the todo list. Changes sync with React Context state."
      logPortalIndex={0}
    />
  );
};

// Wrapper component that provides the context
export const ReactContextCard = Object.assign(
  memo(function ReactContextCard() {
    return (
      <TodosProvider initialValue={initialTodos}>
        <ReactContextCardInner />
      </TodosProvider>
    );
  }),
  {
    cardTitle: CARD_TITLE,
  },
);
