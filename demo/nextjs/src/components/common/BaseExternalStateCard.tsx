"use client";

import {
  Button,
  ButtonGroup,
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { FlexBox } from "@mui-flexy/v7";
import { deepEqual, useDialog, useDialogSlots } from "dialogist";
import React, {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LuTrash2, LuTreePalm } from "react-icons/lu";
import { RiBearSmileLine } from "react-icons/ri";
import { TbBoxModel2, TbBrandReact, TbBrandRedux } from "react-icons/tb";
import {
  DEMO_ICON_FILL_ACCENT_PATH_LAST_CLASS,
  DEMO_ICON_FILL_CLASS,
  DEMO_ICON_FILL_ROOT_STROKE_ZERO_CLASS,
  DEMO_ICON_OUTLINE_CLASS,
} from "@/constants/demoCardIconClasses";
import {
  demoDebugLog,
  isDialogistDemoDebugLoggingEnabled,
  runDialogistDemoInstrumentation,
  scheduleIdleOrTimeout,
} from "@/utils/demoDebug";
import { ExternalStateSlotsExplainerBody } from "../7_data_providers/externalStateCardDefaults";
import { emitExternalStateChange, useExternalStateResetAll } from "../7_data_providers/globalReset";
import { ExternalStateLogPortal } from "../7_data_providers/logging/ExternalStateLogPortal";
import { appendExternalStateLog, clearExternalStateLogs } from "../7_data_providers/logging/logStore";
import { SourceIndicator } from "../7_data_providers/SourceIndicator";
import { EMOJI_TODOS, type TodoItem, TodoListDialogContent } from "../7_data_providers/TodoListDialogContent";
import { BaseDemoCard, type DemoCardIconComponent } from "./BaseDemoCard";
import { CodeBlock } from "./code";
import { DemoParagraph } from "./typography";

const debugLoggingEnabled = isDialogistDemoDebugLoggingEnabled();

const renderExternalStateButtonIcon = (icon: ReactNode | DemoCardIconComponent, size: number): ReactNode => {
  if (icon == null) return null;
  if (React.isValidElement(icon)) return icon;
  return React.createElement(icon as DemoCardIconComponent, { size, "aria-hidden": true });
};

type StateLibrary = "react-context" | "react-query" | "jotai" | "rtk" | "zustand";

interface BaseExternalStateCardProps {
  /** Card heading (matches sidebar `cardTitle` and log portal label). */
  title: string;
  /** Shown once in the card header (library branding — not the todo-list demo glyph). */
  icon: ReactNode | DemoCardIconComponent;
  /** Passed through to {@link BaseDemoCard} when `icon` is a component. */
  iconSize?: number;
  iconColor?: string;
  dialogId: string;
  description: React.ReactNode;
  stateLib: StateLibrary;
  todos: TodoItem[];
  setTodos: Dispatch<SetStateAction<TodoItem[]>>;
  dialogMessage: string;
  initialTodos: TodoItem[];
  /** Intro copy above the sample code (default: shared explainer from `externalStateCardDefaults`). */
  body?: ReactNode;
  /** Source passed to `CodeBlock`. When omitted, no code block is shown. */
  codeSnippet?: string;
  children?: React.ReactNode;
  logPortalIndex?: number;
}

const stateLibDisplayMap = (stateLibraryName: StateLibrary) => {
  switch (stateLibraryName) {
    case "react-context":
      return "React context";
    case "react-query":
      return "React Query";
    case "jotai":
      return "Jotai";
    case "rtk":
      return "Redux Toolkit (RTK)";
    case "zustand":
      return "Zustand";
    default:
      return stateLibraryName;
  }
};

const externalIconMap: Record<StateLibrary, ReactNode> = {
  "react-context": (
    <span className={DEMO_ICON_OUTLINE_CLASS}>
      <TbBrandReact size={16} aria-hidden />
    </span>
  ),
  "react-query": (
    <span className={`${DEMO_ICON_FILL_CLASS} ${DEMO_ICON_FILL_ACCENT_PATH_LAST_CLASS}`}>
      <LuTreePalm size={16} aria-hidden />
    </span>
  ),
  jotai: (
    <Typography component="span" sx={{ fontSize: "1rem", lineHeight: 1 }}>
      ō
    </Typography>
  ),
  rtk: (
    <span className={DEMO_ICON_OUTLINE_CLASS}>
      <TbBrandRedux size={16} aria-hidden />
    </span>
  ),
  zustand: (
    <span className={`${DEMO_ICON_FILL_CLASS} ${DEMO_ICON_FILL_ROOT_STROKE_ZERO_CLASS}`}>
      <RiBearSmileLine size={16} aria-hidden />
    </span>
  ),
};

export const useExternalStateCard = ({
  dialogId,
  todos,
  setTodos,
  dialogMessage,
  stateLibraryName,
  syncDirection,
  initialTodos,
  instrumentAction,
}: {
  dialogId: string;
  todos: TodoItem[];
  setTodos: Dispatch<SetStateAction<TodoItem[]>>;
  dialogMessage: string;
  stateLibraryName: "react-context" | "react-query" | "jotai" | "rtk" | "zustand";
  syncDirection: "dialog-to-external" | "external-to-dialog";
  initialTodos: TodoItem[];
  instrumentAction?: (action: string, fn: () => void) => void;
}): {
  source: "dialog" | "external";
  handleOpenDialog: () => void;
  handleReset: () => void;
} => {
  const dialog = useDialog(dialogId, { type: "alert" });
  const dialogRef = useRef(dialog);
  dialogRef.current = dialog;
  const prevTodosRef = useRef<TodoItem[]>(todos);
  const prevDirectionRef = useRef(syncDirection);

  const isResettingRef = useRef(false); // Flag to prevent logging during reset

  const title = useMemo(
    () => `${stateLibDisplayMap(stateLibraryName)} todo list (${todos.length} items)`,
    [stateLibraryName, todos.length],
  );

  const props = useMemo(
    () => ({
      overflow: "visible" as const,
    }),
    [],
  );

  useEffect(() => {
    const hasChanges = !deepEqual(todos, initialTodos);
    emitExternalStateChange(dialogId, hasChanges);
  }, [dialogId, initialTodos, todos]);

  useDialogSlots(dialogId, {
    title: [title, [todos.length]],
    content: [
      () => (
        <TodoListDialogContent
          dialogId={dialogId}
          currentTodos={todos}
          message={dialogMessage}
          syncDirection={syncDirection}
          setExternalTodos={setTodos}
        />
      ),
      [todos, dialogMessage, syncDirection, setTodos],
    ],
    props: [props, []],
  });

  const runInstrumented = useCallback(
    (action: string, fn: () => void) => {
      if (instrumentAction) {
        instrumentAction(action, fn);
      } else {
        fn();
      }
    },
    [instrumentAction],
  );

  useEffect(() => {
    if (prevDirectionRef.current !== syncDirection) {
      prevTodosRef.current = todos;
      prevDirectionRef.current = syncDirection;
    }
  }, [syncDirection, todos]);

  const describeChange = useCallback(
    (oldTodos: TodoItem[], newTodos: TodoItem[], origin: "dialog" | "external"): string | undefined => {
      const oldIds = new Set(oldTodos.map((t) => t.id));
      const newIds = new Set(newTodos.map((t) => t.id));
      const label = origin === "dialog" ? "dialog" : "card";

      const added = newTodos.filter((t) => !oldIds.has(t.id));
      if (added.length > 0) {
        return `${label} added "${added.map((t) => t.text).join('", "')}"`;
      }

      const removed = oldTodos.filter((t) => !newIds.has(t.id));
      if (removed.length > 0) {
        return `${label} removed "${removed.map((t) => t.text).join('", "')}"`;
      }

      const oldMap = new Map(oldTodos.map((t) => [t.id, t.completed]));
      const toggled = newTodos.filter((t) => oldMap.get(t.id) !== t.completed);
      if (toggled.length > 0) {
        const completed = toggled.filter((t) => t.completed).map((t) => t.text);
        const uncompleted = toggled.filter((t) => !t.completed).map((t) => t.text);
        const parts: string[] = [];
        if (completed.length > 0) parts.push(`${label} completed "${completed.join('", "')}"`);
        if (uncompleted.length > 0) parts.push(`${label} uncompleted "${uncompleted.join('", "')}"`);
        return parts.join(", ");
      }

      return undefined;
    },
    [],
  );

  // Track changes for logging when dialog is SoR and syncs back to external
  useEffect(() => {
    if (syncDirection !== "dialog-to-external") return;
    if (isResettingRef.current) return;

    const prev = prevTodosRef.current;
    if (deepEqual(prev, todos)) return;

    scheduleIdleOrTimeout(() => {
      const change = describeChange(prev, todos, "dialog");
      if (change) {
        appendExternalStateLog(dialogId, { sor: "dialog", change, timestamp: Date.now() });
      }
    });

    prevTodosRef.current = todos;
  }, [todos, syncDirection, dialogId, describeChange]);

  const handleOpenDialog = useCallback(() => {
    if (debugLoggingEnabled) {
      demoDebugLog(
        "[ExternalStateCard] Open dialog clicked – SoR:",
        syncDirection === "dialog-to-external" ? "dialog" : "external",
      );
    }
    dialogRef.current.open();
  }, [syncDirection]);

  const handleReset = useCallback(() => {
    runInstrumented("reset", () => {
      if (debugLoggingEnabled) {
        demoDebugLog(
          "[ExternalStateCard] Reset clicked – SoR:",
          syncDirection === "dialog-to-external" ? "dialog" : "external",
        );
      }
      const nextTodos = initialTodos.map((todo) => ({ ...todo }));

      isResettingRef.current = true;
      clearExternalStateLogs(dialogId);

      prevTodosRef.current = nextTodos;
      if (syncDirection === "dialog-to-external") {
        dialogRef.current.emit("resetTodos", nextTodos);
      }

      setTodos(nextTodos);

      scheduleIdleOrTimeout(() => {
        isResettingRef.current = false;
      });
    });
  }, [dialogId, initialTodos, runInstrumented, setTodos, syncDirection]);

  useExternalStateResetAll(handleReset);

  const source = syncDirection === "dialog-to-external" ? "dialog" : "external";

  return { source, handleOpenDialog, handleReset };
}

export const BaseExternalStateCard = ({
  title,
  icon,
  iconSize,
  iconColor,
  dialogId,
  description,
  stateLib: stateLibraryName,
  todos,
  setTodos,
  dialogMessage: dialogContentDescription,
  initialTodos,
  body = <ExternalStateSlotsExplainerBody />,
  codeSnippet,
  children,
  logPortalIndex = 0,
}: BaseExternalStateCardProps) => {
  const [syncDirection, setSyncDirection] = useState<"dialog-to-external" | "external-to-dialog">("dialog-to-external");
  const instrumentAction = useCallback(
    (action: string, fn: () => void) => {
      runDialogistDemoInstrumentation(
        `ExternalStateCard:${stateLibraryName}:${dialogId}:${syncDirection}:${action}`,
        fn,
      );
    },
    [dialogId, stateLibraryName, syncDirection],
  );
  const { source, handleOpenDialog, handleReset } = useExternalStateCard({
    dialogId,
    todos,
    setTodos,
    dialogMessage: dialogContentDescription,
    stateLibraryName,
    syncDirection,
    initialTodos,
    instrumentAction,
  });

  const handleAddTodo = useCallback(() => {
    instrumentAction("addTodo", () => {
      if (debugLoggingEnabled) {
        demoDebugLog(
          "[ExternalStateCard] Add todo clicked – SoR:",
          syncDirection === "dialog-to-external" ? "dialog" : "external",
        );
      }
      const randomTodo = EMOJI_TODOS[Math.floor(Math.random() * EMOJI_TODOS.length)];
      const newTodo: TodoItem = {
        id: `${Date.now()}-${Math.random()}`,
        text: `${randomTodo.emoji} ${randomTodo.text}`,
        completed: false,
      };
      setTodos((prev) => [newTodo, ...prev]);
    });
  }, [instrumentAction, setTodos, syncDirection]);

  const handleToggle = useCallback(
    (id: string) => {
      instrumentAction("toggleTodo", () => {
        setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
      });
    },
    [instrumentAction, setTodos],
  );

  const handleDelete = useCallback(
    (id: string) => {
      instrumentAction("deleteTodo", () => {
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
      });
    },
    [instrumentAction, setTodos],
  );

  return (
    <>
      <ExternalStateLogPortal dialogId={dialogId} title={title} index={logPortalIndex} badgeCount={todos.length} />
      <BaseDemoCard
        icon={icon}
        iconSize={iconSize}
        iconColor={iconColor}
        title={title}
        dialogKey={dialogId}
        description={description}
        result={null}
      >
        <FlexBox column gap={2} mt={1.5} mb={1}>
          {body}
          {codeSnippet ? <CodeBlock language="tsx">{codeSnippet}</CodeBlock> : null}
        </FlexBox>
        <FlexBox column gap={2} mt={1} width="100%">
          <FlexBox x="space-between" y="center" width="100%">
            <DemoParagraph>
              {todos.length} {todos.length === 1 ? "item" : "items"}
            </DemoParagraph>
            {source === "dialog" && <SourceIndicator source="dialog" label="Dialog update" />}
          </FlexBox>

          <List dense sx={{ width: "100%", maxHeight: 200, overflow: "auto", py: 0 }}>
            {todos.map((todo) => (
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
                    <span className={DEMO_ICON_OUTLINE_CLASS}>
                      <LuTrash2 size={18} />
                    </span>
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

          <FlexBox column gap={1} width="100%">
            <FlexBox gap={1} width="100%">
              <Button
                variant="contained"
                onClick={handleOpenDialog}
                size="small"
                sx={{ flex: 1 }}
                startIcon={renderExternalStateButtonIcon(icon, 16)}
              >
                Show dialog
              </Button>
              <Button variant="outlined" onClick={handleAddTodo} size="small" sx={{ flex: 1 }}>
                Add todo
              </Button>
              <Button variant="outlined" onClick={handleReset} size="small" sx={{ flex: 1 }}>
                Reset
              </Button>
            </FlexBox>
            <FlexBox gap={1} y="center">
              <Typography variant="caption" color="text.secondary">
                System of record
              </Typography>
              <ButtonGroup size="small">
                <Button
                  startIcon={
                    <span className={DEMO_ICON_OUTLINE_CLASS}>
                      <TbBoxModel2 size={16} aria-hidden />
                    </span>
                  }
                  variant={syncDirection === "dialog-to-external" ? "contained" : "outlined"}
                  onClick={() => setSyncDirection("dialog-to-external")}
                >
                  Dialog
                </Button>
                <Button
                  startIcon={externalIconMap[stateLibraryName]}
                  variant={syncDirection === "external-to-dialog" ? "contained" : "outlined"}
                  onClick={() => setSyncDirection("external-to-dialog")}
                >
                  External
                </Button>
              </ButtonGroup>
            </FlexBox>
          </FlexBox>
          {children}
        </FlexBox>
      </BaseDemoCard>
    </>
  );
}

export {
  EXTERNAL_STATE_SLOTS_SNIPPET,
  ExternalStateSlotsExplainerBody,
} from "../7_data_providers/externalStateCardDefaults";
