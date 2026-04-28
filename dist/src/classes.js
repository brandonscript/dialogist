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
var dialogistClasses = {
  base: "Dialogist-base",
  customBase: "DialogistCustom-base",
  /** Dialog paper - The visible container underlying the dialog's content */
  rootPaper: "Dialogist-rootPaper",
  customRootPaper: "DialogistCustom-rootPaper",
  title: "Dialogist-title",
  customTitle: "DialogistCustom-title",
  content: "Dialogist-content",
  customContent: "DialogistCustom-content",
  actionsContainer: "Dialogist-actionsContainer",
  customActionsContainer: "DialogistCustom-actionsContainer",
  /** Default actions: row between action groups (flow / multi-group). Child of `Dialogist-actionsContainer`. */
  actionsRow: "Dialogist-actionsRow",
  /** Default actions: one flex cluster (e.g. cancel+back, or path buttons). Child of `Dialogist-actionsRow` or standalone under the container. */
  actionsGroup: "Dialogist-actionsGroup",
  /** Flow "Back" button when it first becomes visible (forward transition from step 1 → step 2). */
  flowBackAppear: "Dialogist-flowBackAppear",
  /** Dialog actions/buttons - custom component only */
  actions: "DialogistCustom-actions",
  /** Dialog status bar - default component */
  statusBar: "Dialogist-statusBar",
  /** Dialog status bar - custom component */
  customStatusBar: "DialogistCustom-statusBar",
  /** Dialog footer - default component */
  footer: "Dialogist-footer",
  /** Dialog footer - custom component */
  customFooter: "DialogistCustom-footer",
  /** Dialog backdrop - overlay behind the dialog */
  backdrop: "Dialogist-backdrop",
  /** Dialog backdrop - custom overlay (reserved for future use) */
  customBackdrop: "DialogistCustom-backdrop",
  // Corner radius classes - apply to content elements for border radius
  /** Top corners border radius - for status bar content */
  topCorners: "DialogistCorners-top",
  /** Bottom corners border radius - for footer content */
  bottomCorners: "DialogistCorners-bottom",
  /** All corners border radius - for standalone content */
  allCorners: "DialogistCorners-all"
};

export { dialogistClasses };
//# sourceMappingURL=classes.js.map
