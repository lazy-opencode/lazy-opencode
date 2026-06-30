import type { JsonRecord, LoopOutput, LoopPluginOptions, LoopState } from "./types.js";
import { DEFAULT_COMPLETION_TAG, DEFAULT_STOP_TAG } from "./constants.js";
import { log, fetchSessionMessages, promptSession } from "./client.js";
import {
  buildContinuationPrompt,
  buildStartPrompt,
  extractPromptFromParts,
  hasProtocolTag,
} from "./prompt.js";
import { deleteLoopState, getStatePath, readLoopState, writeLoopState } from "./state.js";
import { setOutputText } from "./command.js";
import { getLastAssistantText, stringifyError } from "./utils.js";
import { writeDebugLog } from "./debug.js";

export async function startLoop(
  projectDirectory: string,
  sessionID: string,
  rawPrompt: string,
  output: LoopOutput,
): Promise<void> {
  const prompt = rawPrompt.trim() || extractPromptFromParts(output.parts).trim();

  if (!prompt) {
    setOutputText(output, "Usage: /lazy-loop <prompt>");
    return;
  }

  const now = new Date().toISOString();
  const state: LoopState = {
    version: 1,
    active: true,
    sessionID,
    directory: projectDirectory,
    prompt,
    iteration: 0,
    completionTag: DEFAULT_COMPLETION_TAG,
    stopTag: DEFAULT_STOP_TAG,
    createdAt: now,
    updatedAt: now,
  };

  await writeLoopState(projectDirectory, state);
  setOutputText(output, buildStartPrompt(state));
}

export async function continueLoop(
  projectDirectory: string,
  client: JsonRecord,
  sessionID: string,
  options: LoopPluginOptions,
): Promise<void> {
  await writeDebugLog(options, projectDirectory, {
    hook: "continueLoop",
    step: "start",
    sessionID,
  });

  const state = await readLoopState(projectDirectory, sessionID);

  if (!state?.active || state.sessionID !== sessionID) {
    await writeDebugLog(options, projectDirectory, {
      hook: "continueLoop",
      step: "inactive-or-missing-state",
      sessionID,
      hasState: state !== null,
      stateSessionID: state?.sessionID ?? null,
      active: state?.active ?? null,
    });
    return;
  }

  await writeDebugLog(options, projectDirectory, {
    hook: "continueLoop",
    step: "state-loaded",
    sessionID,
    iteration: state.iteration,
  });

  try {
    const messages = await fetchSessionMessages(client, sessionID, state.directory);
    const lastAssistantText = getLastAssistantText(messages);
    const hasCompletionTag = hasProtocolTag(lastAssistantText, state.completionTag);
    const hasStopTag = hasProtocolTag(lastAssistantText, state.stopTag);

    await writeDebugLog(options, projectDirectory, {
      hook: "continueLoop",
      step: "messages-inspected",
      sessionID,
      messageCount: messages.length,
      lastAssistantTextLength: lastAssistantText.length,
      hasCompletionTag,
      hasStopTag,
    });

    if (hasCompletionTag) {
      await deleteLoopState(projectDirectory, sessionID);
      await writeDebugLog(options, projectDirectory, {
        hook: "continueLoop",
        step: "completed",
        sessionID,
      });
      log(client, "info", `lazy-loop completed for session ${sessionID}.`);
      return;
    }

    if (hasStopTag) {
      await deleteLoopState(projectDirectory, sessionID);
      await writeDebugLog(options, projectDirectory, {
        hook: "continueLoop",
        step: "stopped-by-assistant",
        sessionID,
      });
      log(client, "info", `lazy-loop stopped by assistant for session ${sessionID}.`);
      return;
    }
  } catch (error) {
    const errorMessage = stringifyError(error);

    await writeLoopState(projectDirectory, {
      ...state,
      lastError: errorMessage,
      updatedAt: new Date().toISOString(),
    });
    await writeDebugLog(options, projectDirectory, {
      hook: "continueLoop",
      step: "inspect-error",
      sessionID,
      error: errorMessage,
    });
    log(client, "error", `lazy-loop could not inspect session ${sessionID}.`, error);
    return;
  }

  const now = new Date().toISOString();
  const nextState: LoopState = {
    ...state,
    iteration: state.iteration + 1,
    updatedAt: now,
    lastAutoReplyAt: now,
  };

  await writeLoopState(projectDirectory, nextState);
  await writeDebugLog(options, projectDirectory, {
    hook: "continueLoop",
    step: "state-updated-before-prompt",
    sessionID,
    iteration: nextState.iteration,
  });

  try {
    await promptSession(client, sessionID, buildContinuationPrompt(nextState));
    await writeDebugLog(options, projectDirectory, {
      hook: "continueLoop",
      step: "prompt-sent",
      sessionID,
      iteration: nextState.iteration,
    });
  } catch (error) {
    const errorMessage = stringifyError(error);

    await writeLoopState(projectDirectory, {
      ...nextState,
      lastError: errorMessage,
      updatedAt: new Date().toISOString(),
    });
    await writeDebugLog(options, projectDirectory, {
      hook: "continueLoop",
      step: "prompt-error",
      sessionID,
      error: errorMessage,
    });
    log(client, "error", `lazy-loop could not prompt session ${sessionID}.`, error);
  }
}

export async function cancelLoop(projectDirectory: string, sessionID: string): Promise<string> {
  const state = await readLoopState(projectDirectory, sessionID);

  if (!state?.active || state.sessionID !== sessionID) {
    return `lazy-loop is inactive for session ${sessionID}.`;
  }

  await deleteLoopState(projectDirectory, sessionID);
  return `lazy-loop cancelled for session ${sessionID}.`;
}

export async function getStatus(projectDirectory: string, sessionID: string): Promise<string> {
  const state = await readLoopState(projectDirectory, sessionID);

  if (!state?.active || state.sessionID !== sessionID) {
    return `lazy-loop is inactive for session ${sessionID}.`;
  }

  return [
    `lazy-loop is active for session ${sessionID}.`,
    "User prompt:",
    state.prompt,
    `Iteration: ${state.iteration}`,
    `State: ${getStatePath(projectDirectory, sessionID)}`,
    state.lastError ? `Last error: ${state.lastError}` : undefined,
  ]
    .filter((line): line is string => typeof line === "string")
    .join("\n");
}
