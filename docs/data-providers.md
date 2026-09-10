# Data providers

The data-provider demos are **patterns** over `useDialogSlots` and `useDialogExternalSync`, not separate Dialogist packages. Wire whatever store you already use into those hooks.

Interactive walkthrough: [Data providers](https://brandonscript.github.io/dialogist/data-providers).

## Shared pattern

Register slots with `[value, deps]`. When the store changes, the matching slot re-renders while the dialog stays open.

```tsx
useDialogSlots(dialogId, {
  title: [`Todo list (${todos.length} items)`, [todos.length]],
  content: [() => <TodoList todos={todos} onChange={setTodos} />, [todos, setTodos]],
  props: [{ overflow: "visible" }, []],
});

dialog.open({ type: "alert" });
```

For in-dialog edits that should not instantly overwrite the store (or vice versa), wrap the store value with `useDialogExternalSync`.

## React context

The provider owns state and registers slots for a shared `DIALOG_KEY`. Any child can `useDialog(DIALOG_KEY)` to open it.

```tsx
const DIALOG_KEY = "todo-dialog";

const TodoContext = React.createContext<{
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
} | null>(null);

const TodoProvider = ({ children }: { children: React.ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>([]);

  useDialogSlots(DIALOG_KEY, {
    title: [`Todo list (${todos.length} items)`, [todos.length]],
    content: [() => <TodoList />, []],
    props: [{ overflow: "visible" }, []],
  });

  return <TodoContext.Provider value={{ todos, setTodos }}>{children}</TodoContext.Provider>;
};

const OpenTodoDialogButton = () => {
  const dialog = useDialog(DIALOG_KEY);
  return (
    <button type="button" onClick={() => dialog.open()}>
      Open dialog
    </button>
  );
};
```

Two-way edits inside the dialog:

```tsx
const TodoDialogContent = () => {
  const { todos, setTodos } = useTodos();
  const { value: localTodos, setValue: setLocalTodos } = useDialogExternalSync({
    externalValue: todos,
    setExternalValue: setTodos,
    debounceMs: 300,
  });

  return (
    <>
      {localTodos.map((todo) => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </>
  );
};
```

## TanStack Query

Put `useQuery` / `useMutation` in the slot content (or a hook the content calls). Update the cache on success so the open dialog reflects the new data.

```tsx
const useTodos = () => {
  const { data: todos = [] } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => (await fetch("/api/todos")).json(),
  });
  return { todos };
};

useDialogSlots("todo-dialog", {
  title: [`Todo list (${todos.length} items)`, [todos.length]],
  content: [() => <TodoList />, [todos]],
});
```

## Zustand

```tsx
const todosStore = create<TodosStore>((set) => ({
  todos: [],
  setTodos: (todos) => set({ todos }),
}));

const TodoDialogContent = () => {
  const todos = todosStore((state) => state.todos);
  const { value: localTodos, setValue: setLocalTodos } = useDialogExternalSync({
    externalValue: todos,
    setExternalValue: (next) => {
      todosStore.getState().setTodos(next);
    },
    debounceMs: 300,
  });

  return (
    <>
      {localTodos.map((todo) => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </>
  );
};
```

## Jotai and Redux Toolkit

Same shape:

1. Read from the atom / slice in the component that registers slots (or inside the content).
2. `useDialogSlots(key, { title, content, … })` with those values in the dependency lists.
3. Optionally `useDialogExternalSync` so typing inside the dialog does not fight incoming store updates.

Jotai: `useAtom(todosAtom)`. RTK: `useSelector` + `dispatch`. The Dialogist API does not change.
