# Dialogist Next.js Demo

This is a Next.js demo application showcasing the Dialogist dialog management system. It targets **dialogist@1.0.0** from the repository root (`file:../../`).

## Features

- 🗣️ **Centralized Dialog Management** - All dialogs managed through a single provider
- 📱 **Material-UI Integration** - Beautiful, accessible dialogs using MUI components
- ⚡ **Promise-based API** - Use async/await for dialog interactions
- 🎯 **TypeScript Support** - Full type safety for dialog configurations

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5607` (port spells "LOGS" upside down on a calculator! 📱)

The demo aliases the `dialogist` package to the library **`src/`** tree (see `next.config.mjs`) so hot reload always matches the code you're editing. Restart the dev server after changing that alias.

## Demo Features

The demo includes examples of:

- **Confirmation Dialogs** - With confirm/cancel actions
- **Alert Dialogs** - Simple information dialogs
- **Custom Dialogs** - Custom components (coming soon)
- **Sequential Dialogs** - Multiple dialogs in sequence

## Usage Example

```tsx
import { useDialog } from "dialogist";

function MyComponent() {
  const dialog = useDialog();

  const handleDelete = async () => {
    const confirmed = await dialog.confirm({
      title: "Delete Item",
      message: "Are you sure? This cannot be undone.",
      okLabel: "Delete",
      cancelLabel: "Cancel",
    });

    if (confirmed) {
      // Delete the item
      await dialog.alert({
        title: "Success",
        message: "Item deleted successfully!",
      });
    }
  };

  return <button onClick={handleDelete}>Delete Item</button>;
}
```

## Development

This demo uses the local `dialogist` package via `file:../../` dependency, so any changes to the main library will be reflected here after rebuilding.

To build the main library:

```bash
cd ../..
npm run build
```
