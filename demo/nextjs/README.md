# Dialogist Next.js demo

This is a Next.js demo application showcasing Dialogist. It aliases the `dialogist` package to the library **`src/`** tree (see `next.config.mjs`) so hot reload matches the code you are editing.

Interactive docs: [https://brandonscript.github.io/dialogist/](https://brandonscript.github.io/dialogist/). Markdown API guide: [`docs/`](../../docs/index.md).

## Getting started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5607`.

Restart the dev server after changing the `dialogist` alias in `next.config.mjs`.

## Demo features

The demo includes examples of:

- Alert, confirm, and custom dialogs
- Promise-based `open()` for async flows
- Custom actions, slot hooks, conflict policies, and multi-step flows
- Adapters for MUI, Base UI, shadcn, and Tailwind (use the "Rendered with" picker)

## Usage example

```tsx
import { useDialog } from "dialogist";

function MyComponent() {
  const dialog = useDialog("delete-item");

  const handleDelete = async () => {
    const event = await dialog.open({
      type: "confirm",
      title: "Delete item",
      message: "Are you sure? This cannot be undone.",
      okLabel: "Delete",
      cancelLabel: "Cancel",
    });

    if (event.ok) {
      await dialog.open({
        type: "alert",
        title: "Success",
        message: "Item deleted successfully.",
      });
    }
  };

  return <button onClick={handleDelete}>Delete item</button>;
}
```

## Development

From the repository root you can also run `npm run demo:nextjs`. Changes to the library `src/` are picked up via the Next.js alias; you do not need to rebuild the package for the demo.
