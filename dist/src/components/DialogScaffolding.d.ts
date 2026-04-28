import type { BaseDialogProps, DialogComponents, DialogSlotProps, DialogState } from "../types";
interface DialogScaffoldingProps<C extends React.ComponentType<BaseDialogProps> = React.ComponentType<BaseDialogProps>> {
    dialogs: DialogState[];
    onClose: (id: string, options?: {
        cancelled?: boolean;
        preserveBackdrop?: boolean;
    }) => void;
    DialogComponent?: C;
    overflow?: "visible" | "hidden";
    slots?: DialogComponents;
    slotProps?: DialogSlotProps;
}
export declare const DialogScaffolding: import("react").MemoExoticComponent<(<C extends React.ComponentType<BaseDialogProps> = import("react").ComponentType<BaseDialogProps>>({ dialogs, onClose, DialogComponent, overflow, slots, slotProps, }: DialogScaffoldingProps<C>) => import("react").ReactPortal | null)>;
export {};
