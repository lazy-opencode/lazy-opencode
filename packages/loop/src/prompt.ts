import type { LoopState } from "./types.js";
import { isRecord } from "./utils.js";

export function buildStartPrompt(state: LoopState): string {
  return [
    "User prompt:",
    state.prompt,
    "",
    "Work on exactly one useful step now. Future lazy-loop iterations will continue from this session context.",
    "When the full prompt is complete, put this tag on its own final line:",
    "",
    state.completionTag,
    "",
    "If blocked, unsafe, or user input is needed, put this tag on its own final line:",
    "",
    state.stopTag,
  ].join("\n");
}

export function buildContinuationPrompt(state: LoopState): string {
  return [
    "Continue this lazy-loop prompt from the current session context.",
    "Work on exactly one useful step.",
    "Do not repeat work already done in earlier iterations.",
    "",
    "User prompt:",
    state.prompt,
    "",
    `Iteration: ${state.iteration}`,
    "",
    "When the full prompt is complete, put this tag on its own final line:",
    "",
    state.completionTag,
    "",
    "If blocked, unsafe, or user input is needed, put this tag on its own final line:",
    "",
    state.stopTag,
  ].join("\n");
}

export function extractPromptFromParts(parts: unknown[]): string {
  return parts
    .map((part) => {
      if (!isRecord(part) || typeof part.text !== "string") {
        return "";
      }

      return part.text;
    })
    .join("\n")
    .split("User prompt:")
    .slice(1)
    .join("User prompt:")
    .trim();
}

export function hasProtocolTag(text: string, tag: string): boolean {
  return stripInternalReminders(text).includes(tag);
}

function stripInternalReminders(text: string): string {
  return text.replace(/<internal_reminder>[\s\S]*?<\/internal_reminder>/g, "").trim();
}
