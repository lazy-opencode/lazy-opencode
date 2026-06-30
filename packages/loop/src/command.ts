import {
  COMMAND_CANCEL,
  COMMAND_CANCEL_TEMPLATE,
  COMMAND_START,
  COMMAND_START_TEMPLATE,
  COMMAND_STATUS,
  COMMAND_STATUS_TEMPLATE,
} from "./constants.js";
import type { LoopOutput } from "./types.js";

export function getLazyLoopCommand(command: string): string | undefined {
  const normalizedCommand = command.startsWith("/") ? command.slice(1) : command;

  if (normalizedCommand === COMMAND_START || command === COMMAND_START_TEMPLATE) {
    return COMMAND_START;
  }

  if (normalizedCommand === COMMAND_CANCEL || command === COMMAND_CANCEL_TEMPLATE) {
    return COMMAND_CANCEL;
  }

  if (normalizedCommand === COMMAND_STATUS || command === COMMAND_STATUS_TEMPLATE) {
    return COMMAND_STATUS;
  }

  return undefined;
}

export function setOutputText(output: LoopOutput, text: string): void {
  output.parts.length = 0;
  output.parts.push({ type: "text", text });
}
