import "dialogist";

/**
 * Demo-only custom dialog events. Apps should follow the same pattern in their own `.d.ts`.
 */
declare module "dialogist" {
  interface DialogistEventMap {
    borderRadius: number;
    resetTodos: import("./components/7_data_providers/TodoListDialogContent").TodoItem[];
  }
}
