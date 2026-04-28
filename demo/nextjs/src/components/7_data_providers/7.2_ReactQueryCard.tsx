"use client";

import { Link } from "@mui/material";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Dispatch, memo, type SetStateAction, useCallback } from "react";
import { LuTreePalm } from "react-icons/lu";

import { BaseExternalStateCard } from "../common/BaseExternalStateCard";
import { CodeBlock } from "../common/code";
import { withGenericFillIcon } from "../common/demoCardIconWrappers";
import { Code, DemoParagraph, DemoSectionHeading } from "../common/typography";
import { EMOJI_TODOS, type TodoItem } from "./TodoListDialogContent";

const DIALOG_KEY = "react-query-todos";
const CARD_TITLE = "Using React Query";

const Icon = withGenericFillIcon(LuTreePalm, { accent: "path-last" });

const REACT_QUERY_SLOTS_SNIPPET = `
import { useMutation, useQuery, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient(); // query client singleton
const DIALOG_KEY = "todo-dialog";
const TODOS_QUERY_KEY = ["todos"];

type Todo = {
  // ...
};

const useTodos = () => {
  const { data: todos = [] } = useQuery<Todo[]>({
    queryKey: TODOS_QUERY_KEY,
    // your fetch (query) function
    queryFn: async (): Promise<Todo[]> => {
      return (await fetch("/api/todos")).json();
    },
  });
  return { todos };
};

const useAddTodo = () => {
  const { mutate: addTodo } = useMutation({
    // your server write (mutation) function
    mutationFn: async (todo: Todo) => {
      return (await fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify(todo),
      })).json() as Promise<Todo>;
    },
    onSuccess: (newTodo: Todo) => {
      // you could use queryClient.invalidateQueries() to refetch the data
      // but it's more performant just to directly update the cache
      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (prev = []) => [
        ...prev,
        newTodo,
      ]);
    },
  });
  return { addTodo };
};

const TodoList = () => {
  
  const { todos } = useTodos();
  const { addTodo } = useAddTodo();

  const [newTodoText, setNewTodoText] = useState("");

  const handleAddTodo = () => {
    const text = newTodoText.trim();
    if (text) {
      addTodo({ id: crypto.randomUUID(), text });
      setNewTodoText("");
    }
  };

  return (
    <>
      {todos.map((todo) => (
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

// this controller keeps dialog slots in sync with cached query data
// without creating a circular dependency between TodoList and useTodos()
const TodosController = () => {
  const { todos } = useTodos();
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
  <QueryClientProvider client={queryClient}>
    <TodosController />
    <OpenTodoDialogButton />
  </QueryClientProvider>
);
`;

const REACT_QUERY_EXTERNAL_SYNC_SNIPPET = `
const TodoDialogContent = () => {
  
  const { todos } = useTodos();
  const { addTodo } = useAddTodo();

  const { value: localTodos, setValue: setLocalTodos } = useDialogExternalSync({
    externalValue: todos,
    setExternalValue: (next) => {
      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, next);
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
      {todos.map((todo) => (
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
  <QueryClientProvider client={queryClient}>
    {/* no need for the TodosController in this example */}
    <OpenTodoDialogButton />
  </QueryClientProvider>
);
`;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
    },
  },
});

const initialTodos: TodoItem[] = [
  { id: "1", text: `${EMOJI_TODOS[0].emoji} ${EMOJI_TODOS[0].text}`, completed: false },
  { id: "2", text: `${EMOJI_TODOS[1].emoji} ${EMOJI_TODOS[1].text}`, completed: false },
  { id: "3", text: `${EMOJI_TODOS[2].emoji} ${EMOJI_TODOS[2].text}`, completed: false },
];

const ReactQueryCardInner = () => {
  const queryClient = useQueryClient();
  const { data: todos = initialTodos } = useQuery<TodoItem[]>({
    queryKey: ["todos"],
    queryFn: () => queryClient.getQueryData<TodoItem[]>(["todos"]) ?? initialTodos,
    initialData: initialTodos,
  });

  const setTodos = useCallback<Dispatch<SetStateAction<TodoItem[]>>>(
    (value) => {
      queryClient.setQueryData<TodoItem[]>(["todos"], (prev) => {
        const prevData = prev ?? initialTodos;
        return typeof value === "function" ? value(prevData) : value;
      });
    },
    [queryClient],
  );

  return (
    <BaseExternalStateCard
      title={CARD_TITLE}
      icon={Icon}
      dialogId={DIALOG_KEY}
      stateLib="react-query"
      description={
        <>
          You can use <Code>useDialogSlots()</Code> or <Code>useDialogExternalSync()</Code> to keep dialog slots in sync
          with React Query cache data, queries, and mutations.
        </>
      }
      body={
        <>
          <DemoSectionHeading>
            UI updates with <Code>useDialogSlots()</Code>
          </DemoSectionHeading>
          <DemoParagraph>
            You can consume{" "}
            <Link
              href="https://tanstack.com/query/latest/docs/framework/react/overview"
              target="_blank"
              rel="noopener noreferrer"
            >
              React Query
            </Link>{" "}
            data directly inside dialog content. If the dialog (content, title, actions, etc.) needs to stay in sync
            with the cache as you query or mutate, you can register a small component that calls{" "}
            <Code>useDialogSlots()</Code> next to your query hooks so the merged dialog config tracks the latest data.
          </DemoParagraph>
          <CodeBlock language="tsx">{REACT_QUERY_SLOTS_SNIPPET}</CodeBlock>
          <DemoSectionHeading>
            Data binding with <Code>useDialogExternalSync()</Code>
          </DemoSectionHeading>
          <DemoParagraph>
            If the dialog is consuming and/or mutating cache-backed data over time, <Code>useDialogExternalSync()</Code>{" "}
            may be a better fit than <Code>useDialogSlots()</Code>. The dialog keeps a local working copy and syncs
            changes back to the query cache via <Code>setQueryData</Code> at a controlled rate.
          </DemoParagraph>
          <CodeBlock language="tsx">{REACT_QUERY_EXTERNAL_SYNC_SNIPPET}</CodeBlock>
        </>
      }
      todos={todos}
      setTodos={setTodos}
      initialTodos={initialTodos}
      dialogMessage="Edit the todo list. Changes sync with React Query cache."
      logPortalIndex={1}
    />
  );
}

// Wrapper component that provides QueryClient
export const ReactQueryCard = Object.assign(
  memo(function ReactQueryCard() {
    return (
      <QueryClientProvider client={queryClient}>
        <ReactQueryCardInner />
      </QueryClientProvider>
    );
  }),
  {
    cardTitle: CARD_TITLE,
  },
);
