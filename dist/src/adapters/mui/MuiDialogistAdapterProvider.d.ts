import { type ReactNode } from "react";
/**
 * MUI-aware {@link DialogistAdapterProvider}. Wires `theme.spacing` and
 * `theme.transitions` from the active MUI theme into the Dialogist adapter context so
 * the FLIP resize animation in `DialogScaffolding` honors MUI tokens.
 */
export declare const MuiDialogistAdapterProvider: {
    ({ children }: {
        children: ReactNode;
    }): import("react/jsx-runtime").JSX.Element;
    displayName: string;
};
