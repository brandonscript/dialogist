/**
 * CSS class names for Dialogist components
 *
 * These can be used for styling dialog components or referenced in custom components.
 *
 * @example
 * ```tsx
 * import { dialogistClasses } from 'dialogist';
 *
 * // Use in custom components
 * <Dialog className={`${dialogistClasses.customBase} my-custom-dialog`}>
 *   <DialogTitle className={`${dialogistClasses.customTitle} my-title`}>
 *     Title
 *   </DialogTitle>
 * </Dialog>
 *
 * // Use in CSS
 * .${dialogistClasses.base} {
 *   border-radius: 8px;
 * }
 *
 * .${dialogistClasses.customTitle} {
 *   font-weight: bold;
 * }
 * ```
 */
export declare const dialogistClasses: {
    readonly base: "Dialogist-base";
    readonly customBase: "DialogistCustom-base";
    /** Dialog paper - The visible container underlying the dialog's content */
    readonly rootPaper: "Dialogist-rootPaper";
    readonly customRootPaper: "DialogistCustom-rootPaper";
    readonly title: "Dialogist-title";
    readonly customTitle: "DialogistCustom-title";
    readonly content: "Dialogist-content";
    readonly customContent: "DialogistCustom-content";
    readonly actionsContainer: "Dialogist-actionsContainer";
    readonly customActionsContainer: "DialogistCustom-actionsContainer";
    /** Default actions: row between action groups (flow / multi-group). Child of `Dialogist-actionsContainer`. */
    readonly actionsRow: "Dialogist-actionsRow";
    /** Default actions: one flex cluster (e.g. cancel+back, or path buttons). Child of `Dialogist-actionsRow` or standalone under the container. */
    readonly actionsGroup: "Dialogist-actionsGroup";
    /** Flow "Back" button when it first becomes visible (forward transition from step 1 → step 2). */
    readonly flowBackAppear: "Dialogist-flowBackAppear";
    /** Dialog actions/buttons - custom component only */
    readonly actions: "DialogistCustom-actions";
    /** Dialog status bar - default component */
    readonly statusBar: "Dialogist-statusBar";
    /** Dialog status bar - custom component */
    readonly customStatusBar: "DialogistCustom-statusBar";
    /** Dialog footer - default component */
    readonly footer: "Dialogist-footer";
    /** Dialog footer - custom component */
    readonly customFooter: "DialogistCustom-footer";
    /** Dialog backdrop - overlay behind the dialog */
    readonly backdrop: "Dialogist-backdrop";
    /** Dialog backdrop - custom overlay (reserved for future use) */
    readonly customBackdrop: "DialogistCustom-backdrop";
    /** Top corners border radius - for status bar content */
    readonly topCorners: "DialogistCorners-top";
    /** Bottom corners border radius - for footer content */
    readonly bottomCorners: "DialogistCorners-bottom";
    /** All corners border radius - for standalone content */
    readonly allCorners: "DialogistCorners-all";
};
export type DialogistClasses = typeof dialogistClasses;
