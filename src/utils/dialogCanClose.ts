import { resolveHandler } from "../state/DialogHandlers";
import type {
  DialogCloseReason,
  DialogCloseResolver,
  DialogKey,
  DialogKeyArray,
  DialogOpenConfig,
  DialogStoredConfig,
} from "../types";
import type { DialogCloseEvent } from "../types/callbacks";
import { resolveDialogKey } from "./dialogKey";

type DialogCanCloseConfig = DialogOpenConfig | DialogStoredConfig;

export const evaluateDialogCanClose = (
  dialogKey: DialogKey | DialogKeyArray,
  internalId: string,
  config: DialogCanCloseConfig,
  reason: DialogCloseReason,
  actionInfo?: {
    action: NonNullable<DialogCloseEvent["action"]>;
    actionId?: string;
    buttonText?: string;
    nativeEvent?: DialogCloseEvent["nativeEvent"];
  },
): boolean => {
  const rKey = resolveDialogKey(dialogKey);
  const resolved = resolveHandler(rKey.str, internalId, "canClose", config.canClose);
  const guard = resolved !== undefined ? resolved : (config.canClose ?? true);
  const willClose: DialogCloseResolver = {
    dialogKey: rKey.str,
    keySegments: rKey.parts as DialogKeyArray,
    config,
    reason,
    ...(actionInfo && {
      action: actionInfo.action,
      actionId: actionInfo.actionId,
      buttonText: actionInfo.buttonText,
      nativeEvent: actionInfo.nativeEvent,
    }),
  };

  if (typeof guard === "function") {
    try {
      const fnResult = guard(willClose);
      return fnResult;
    } catch (error) {
      console.error("[Dialogist] canClose guard threw an error; blocking close.", error);
      return false;
    }
  }

  return guard !== false;
};
