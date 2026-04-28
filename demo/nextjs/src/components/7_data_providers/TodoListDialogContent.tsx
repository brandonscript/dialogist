"use client";

import {
  Button,
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { useDialog, useDialogExternalSync } from "dialogist";
import { useCallback, useEffect } from "react";
import { LuTrash2 } from "react-icons/lu";
import { demoDebugLog, isDialogistDemoDebugLoggingEnabled, runDialogistDemoInstrumentation } from "@/utils/demoDebug";
import { DemoParagraph } from "../common/typography";

import { SourceIndicator } from "./SourceIndicator";

const _todoDebugLoggingEnabled = isDialogistDemoDebugLoggingEnabled();

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

// List of emoji todos for random selection
export const EMOJI_TODOS = [
  { text: "Milk", emoji: "🥛" },
  { text: "Eggs", emoji: "🥚" },
  { text: "Apples", emoji: "🍎" },
  { text: "Bananas", emoji: "🍌" },
  { text: "Coffee", emoji: "☕" },
  { text: "Bread", emoji: "🍞" },
  { text: "Cheese", emoji: "🧀" },
  { text: "Carrots", emoji: "🥕" },
  { text: "Broccoli", emoji: "🥦" },
  { text: "Pizza", emoji: "🍕" },
  { text: "Burger", emoji: "🍔" },
  { text: "Salad", emoji: "🥗" },
];

interface TodoListDialogContentProps {
  dialogId: string;
  currentTodos: TodoItem[];
  message: string;
  syncDirection: "dialog-to-external" | "external-to-dialog";
  setExternalTodos: (todos: TodoItem[]) => void;
}

export const TodoListDialogContent = ({
  dialogId,
  currentTodos,
  message,
  syncDirection,
  setExternalTodos,
}: TodoListDialogContentProps) => {
  const dialog = useDialog(dialogId);
  const isDialogSystem = syncDirection === "dialog-to-external";

  const instrumentDialogAction = useCallback(
    (action: string, fn: () => void) => {
      runDialogistDemoInstrumentation(`TodoListDialogContent:${dialogId}:${syncDirection}:${action}`, fn);
    },
    [dialogId, syncDirection],
  );

  // Listen for reset events emitted from the card when dialog is SoR
  useEffect(() => {
    if (!isDialogSystem) return;

    const handler = (payload?: unknown) => {
      const resetTodos = (payload as TodoItem[]) ?? [];
      // Reset external state; sync hook will pick it up and apply to local
      setExternalTodos(resetTodos);
    };

    const off = dialog.on("resetTodos", handler);
    return () => {
      dialog.off("resetTodos", handler);
      off?.();
    };
  }, [dialog, isDialogSystem, setExternalTodos]);

  // Use the new reducer-based sync hook when dialog is SoR
  const syncResult = useDialogExternalSync({
    externalValue: currentTodos,
    setExternalValue: isDialogSystem ? setExternalTodos : () => {},
    debounceMs: 400,
  });

  const localTodos = isDialogSystem ? syncResult.value : currentTodos;

  const applyUpdate = useCallback(
    (updater: (todos: TodoItem[]) => TodoItem[]) => {
      instrumentDialogAction("applyUpdate", () => {
        if (isDialogSystem) {
          const next = updater(syncResult.value);
          syncResult.setValue(next);
        } else {
          const next = updater(currentTodos);
          setExternalTodos(next);
        }
      });
    },
    [currentTodos, instrumentDialogAction, isDialogSystem, setExternalTodos, syncResult],
  );

  const handleToggle = useCallback(
    (id: string) => {
      const sor = isDialogSystem ? "dialog" : "external";
      demoDebugLog("[TodoListDialogContent] Toggle clicked – SoR:", sor);
      applyUpdate((todos) => todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
    },
    [applyUpdate, isDialogSystem],
  );

  const handleAddRandom = useCallback(() => {
    const sor = isDialogSystem ? "dialog" : "external";
    demoDebugLog("[TodoListDialogContent] Add random todo clicked – SoR:", sor);
    const randomTodo = EMOJI_TODOS[Math.floor(Math.random() * EMOJI_TODOS.length)];
    const newTodo: TodoItem = {
      id: `${Date.now()}-${Math.random()}`,
      text: `${randomTodo.emoji} ${randomTodo.text}`,
      completed: false,
    };
    // Prepend so newest items appear at the top
    applyUpdate((todos) => [newTodo, ...todos]);
  }, [applyUpdate, isDialogSystem]);

  const handleDelete = useCallback(
    (id: string) => {
      const sor = isDialogSystem ? "dialog" : "external";
      demoDebugLog("[TodoListDialogContent] Delete clicked – SoR:", sor);
      applyUpdate((todos) => todos.filter((todo) => todo.id !== id));
    },
    [applyUpdate, isDialogSystem],
  );

  const renderedTodos = localTodos;
  const showExternalUpdate = !isDialogSystem && syncResult.meta.hasExternalUpdatePending;
  const showPendingExternalUpdate = isDialogSystem && syncResult.meta.hasExternalUpdatePending;

  return (
    <FlexBox column gap={2}>
      <FlexBox x="space-between" y="center" width="100%" px={2}>
        <DemoParagraph maxWidth={440} textAlign="left">
          {message}
        </DemoParagraph>
        {showExternalUpdate && <SourceIndicator source="external" label="External update" />}
        {showPendingExternalUpdate && isDialogSystem && (
          <SourceIndicator source="external" label="External change pending" />
        )}
      </FlexBox>

      <List
        dense
        sx={{
          width: "100%",
          maxWidth: 440,
          mx: "auto",
          py: 0,
          minHeight: 200,
          maxHeight: 200,
          overflowY: "auto",
        }}
      >
        {renderedTodos.map((todo) => (
          <ListItem
            key={todo.id}
            dense
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDelete(todo.id)}
                size="small"
                sx={{ p: 0.5 }}
              >
                <LuTrash2 size={18} />
              </IconButton>
            }
            disablePadding
            sx={{ py: 0.25 }}
          >
            <ListItemButton onClick={() => handleToggle(todo.id)} dense sx={{ py: 0.25, px: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <Checkbox
                  edge="start"
                  checked={todo.completed}
                  tabIndex={-1}
                  disableRipple
                  size="small"
                  sx={{ p: 0.5 }}
                />
              </ListItemIcon>
              <ListItemText
                primary={todo.text}
                primaryTypographyProps={{ variant: "caption", fontSize: "0.75rem" }}
                sx={{
                  textDecoration: todo.completed ? "line-through" : "none",
                  color: todo.completed ? "text.secondary" : "text.primary",
                  my: 0,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <FlexBox column gap={1} px={2} maxWidth={440} mx="auto" width="100%">
        <Button variant="contained" onClick={handleAddRandom} fullWidth>
          Add random todo
        </Button>
      </FlexBox>
    </FlexBox>
  );
}
