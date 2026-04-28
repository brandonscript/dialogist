"use client";

import { Link } from "@mui/material";
import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type Dispatch, memo, type SetStateAction, useCallback } from "react";
import { TbBrandRedux } from "react-icons/tb";
import { Provider as ReduxProvider, useDispatch, useSelector } from "react-redux";

import { BaseExternalStateCard } from "../common/BaseExternalStateCard";
import { CodeBlock } from "../common/code";
import { withGenericOutlineIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph, DemoSectionHeading } from "../common/typography";
import { EMOJI_TODOS, type TodoItem } from "./TodoListDialogContent";

const DIALOG_KEY = "rtk-todos";
const CARD_TITLE = "Using Redux Toolkit (RTK)";

const Icon = withGenericOutlineIcon(TbBrandRedux);

const RTK_EXTERNAL_SYNC_SNIPPET = `
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { type PayloadAction } from "@reduxjs/toolkit";
import { Provider as ReduxProvider, useDispatch, useSelector } from "react-redux";

const DIALOG_KEY = "todo-dialog";

type Todo = {
  // ...
};

const todosSlice = createSlice({
  name: "todos",
  initialState: { value: [] as Todo[] },
  reducers: {
    set: (state, action: PayloadAction<Todo[]>) => {
      state.value = action.payload;
    },
  },
});

const store = configureStore({
  reducer: { todos: todosSlice.reducer },
});

type RootState = ReturnType<typeof store.getState>;

const TodoDialogContent = () => {
  const todos = useSelector((state: RootState) => state.todos.value);
  const dispatch = useDispatch();

  const [newTodoText, setNewTodoText] = useState("");

  const { value: localTodos, setValue: setLocalTodos } = useDialogExternalSync({
    externalValue: todos,
    setExternalValue: (next) => {
      dispatch(todosSlice.actions.set(next));
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

const App = () => (
  <ReduxProvider store={store}>
    <OpenTodoDialogButton />
  </ReduxProvider>
);
`;

const RTK_SLOTS_SNIPPET = `
const TodoList = () => {
  const todos = useSelector((state: RootState) => state.todos.value);
  return (
    <>
      {todos.map((todo) => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </>
  );
};

const TodosController = () => {
  const todos = useSelector((state: RootState) => state.todos.value);
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
  <ReduxProvider store={store}>
    <TodosController />
    <OpenTodoDialogButton />
  </ReduxProvider>
);
`;

const initialTodos: TodoItem[] = [
  { id: "1", text: `${EMOJI_TODOS[0].emoji} ${EMOJI_TODOS[0].text}`, completed: false },
  { id: "2", text: `${EMOJI_TODOS[1].emoji} ${EMOJI_TODOS[1].text}`, completed: false },
  { id: "3", text: `${EMOJI_TODOS[2].emoji} ${EMOJI_TODOS[2].text}`, completed: false },
];

// Redux slice
const todosSlice = createSlice({
  name: "todos",
  initialState: { value: initialTodos },
  reducers: {
    set: (state, action: PayloadAction<TodoItem[]>) => {
      state.value = action.payload;
    },
  },
});

const store = configureStore({
  reducer: {
    todos: todosSlice.reducer,
  },
});

type RootState = ReturnType<typeof store.getState>;

// Main card component
const RTKCardInner = () => {
  const todos = useSelector((state: RootState) => state.todos.value);
  const dispatch = useDispatch();

  const setTodos = useCallback<Dispatch<SetStateAction<TodoItem[]>>>(
    (value) => {
      const prev = store.getState().todos.value;
      dispatch(todosSlice.actions.set(typeof value === "function" ? value(prev) : value));
    },
    [dispatch],
  );

  return (
    <BaseExternalStateCard
      title={CARD_TITLE}
      icon={Icon}
      dialogId={DIALOG_KEY}
      stateLib="rtk"
      description={
        <>
          You can use <Code>useDialogExternalSync()</Code> or <Code>useDialogSlots()</Code> to keep dialog slots in sync
          with Redux Toolkit store data, slices, and actions.
        </>
      }
      body={
        <>
          <DemoSectionHeading>
            Data binding with <Code>useDialogExternalSync()</Code>
          </DemoSectionHeading>
          <DemoParagraph>
            If you need your dialog to consume and/or write to a{" "}
            <Link href="https://redux-toolkit.js.org/" target="_blank" rel="noopener noreferrer">
              Redux Toolkit
            </Link>{" "}
            store, use <Code>useDialogExternalSync()</Code> to keep a local working copy which is synced back to the
            store (via your slice&apos;s action) at a controlled rate — pass the dispatch function from{" "}
            <Code>useDispatch()</Code> to <Code>setExternalValue</Code>.
          </DemoParagraph>
          <CodeBlock language="tsx">{RTK_EXTERNAL_SYNC_SNIPPET}</CodeBlock>
          <DemoSectionHeading>
            UI updates with <Code>useDialogSlots()</Code>
          </DemoSectionHeading>
          <DemoParagraph>
            Alternatively, if you prefer to use <Code>useDialogSlots()</Code> instead of{" "}
            <Code>useDialogExternalSync()</Code>, you can mount a small controller next to your tree that uses RTK
            slices as slot dependencies.
          </DemoParagraph>
          <CodeBlock language="tsx">{RTK_SLOTS_SNIPPET}</CodeBlock>
        </>
      }
      todos={todos}
      setTodos={setTodos}
      initialTodos={initialTodos}
      dialogMessage="Edit the todo list. Changes sync with Redux Toolkit store."
      logPortalIndex={3}
    />
  );
};

// Wrapper component that provides Redux Provider
export const RTKCard = Object.assign(
  memo(function RTKCard() {
    return (
      <ReduxProvider store={store}>
        <RTKCardInner />
      </ReduxProvider>
    );
  }),
  {
    cardTitle: CARD_TITLE,
  },
);
