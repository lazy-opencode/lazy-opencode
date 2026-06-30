import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { Plugin } from "@opencode-ai/plugin";

const COMMAND_START = "lazy-loop";
const COMMAND_CANCEL = "lazy-loop-cancel";
const COMMAND_STATUS = "lazy-loop-status";

const STATE_DIRECTORY = ".lazy-opencode/loop";
const STATE_FILE = "state.json";
const DEFAULT_COMPLETION_TAG = "<lazy-opencode>DONE</lazy-opencode>";
const DEFAULT_STOP_TAG = "<lazy-opencode>STOP</lazy-opencode>";

type JsonRecord = Record<string, unknown>;

interface LoopState {
  version: 1;
  active: boolean;
  sessionID: string;
  directory: string;
  task: string;
  iteration: number;
  completionTag: string;
  stopTag: string;
  createdAt: string;
  updatedAt: string;
  lastAutoReplyAt?: string;
  lastError?: string;
}

const lazyLoopPlugin: Plugin = async ({ client, directory }) => {
  const projectDirectory = resolve(directory);
  const runtimeClient = client as unknown as JsonRecord;

  return {
    config: async (config) => {
      const mutableConfig = config as unknown as JsonRecord;
      const commandConfig = isRecord(mutableConfig.command) ? mutableConfig.command : {};

      commandConfig[COMMAND_START] ??= {
        description: "Start a local lazy loop for the current session.",
        template:
          "lazy-loop has been received. The plugin will manage loop state and continuation.",
      };
      commandConfig[COMMAND_CANCEL] ??= {
        description: "Cancel the active lazy loop for the current session.",
        template: "lazy-loop cancellation has been received.",
      };
      commandConfig[COMMAND_STATUS] ??= {
        description: "Show the current lazy loop status.",
        template: "lazy-loop status has been requested.",
      };

      mutableConfig.command = commandConfig;
    },

    "command.execute.before": async (input, output) => {
      const command = stripSlash(input.command);

      if (!isLazyLoopCommand(command)) {
        return;
      }

      if (command === COMMAND_START) {
        await startLoop(projectDirectory, input.sessionID, input.arguments, output);
        log(runtimeClient, "info", `lazy-loop started for session ${input.sessionID}.`);
        return;
      }

      if (command === COMMAND_CANCEL) {
        const message = await cancelLoop(projectDirectory, input.sessionID);
        setOutputText(output, message);
        log(runtimeClient, "info", message);
        return;
      }

      setOutputText(output, await getStatus(projectDirectory, input.sessionID));
      log(runtimeClient, "info", `lazy-loop status requested for session ${input.sessionID}.`);
    },

    event: async ({ event }) => {
      const payload = event as unknown as JsonRecord;
      const type = typeof payload.type === "string" ? payload.type : undefined;

      if (type !== "session.idle" && type !== "session.deleted") {
        return;
      }

      const sessionID = getEventSessionID(payload);

      if (!sessionID) {
        return;
      }

      if (type === "session.deleted") {
        const state = await readLoopState(projectDirectory);

        if (state?.sessionID === sessionID) {
          await deleteLoopState(projectDirectory);
          log(runtimeClient, "info", `lazy-loop cleaned up for deleted session ${sessionID}.`);
        }

        return;
      }

      await continueLoop(projectDirectory, runtimeClient, sessionID);
    },
  };
};

export default lazyLoopPlugin;

async function startLoop(
  projectDirectory: string,
  sessionID: string,
  rawTask: string,
  output: { parts: unknown[] },
): Promise<void> {
  const task = rawTask.trim();

  if (!task) {
    setOutputText(output, "Usage: /lazy-loop <task>");
    return;
  }

  const now = new Date().toISOString();
  const state: LoopState = {
    version: 1,
    active: true,
    sessionID,
    directory: projectDirectory,
    task,
    iteration: 0,
    completionTag: DEFAULT_COMPLETION_TAG,
    stopTag: DEFAULT_STOP_TAG,
    createdAt: now,
    updatedAt: now,
  };

  await writeLoopState(projectDirectory, state);
  setOutputText(
    output,
    [
      `lazy-loop started for session ${sessionID}.`,
      `Completion tag: ${DEFAULT_COMPLETION_TAG}`,
      `Stop tag: ${DEFAULT_STOP_TAG}`,
    ].join("\n"),
  );
}

async function continueLoop(
  projectDirectory: string,
  client: JsonRecord,
  sessionID: string,
): Promise<void> {
  const state = await readLoopState(projectDirectory);

  if (!state?.active || state.sessionID !== sessionID) {
    return;
  }

  try {
    const messages = await fetchSessionMessages(client, sessionID, state.directory);
    const lastAssistantText = getLastAssistantText(messages);

    if (lastAssistantText.includes(state.completionTag)) {
      await deleteLoopState(projectDirectory);
      log(client, "info", `lazy-loop completed for session ${sessionID}.`);
      return;
    }

    if (lastAssistantText.includes(state.stopTag)) {
      await deleteLoopState(projectDirectory);
      log(client, "info", `lazy-loop stopped by assistant for session ${sessionID}.`);
      return;
    }
  } catch (error) {
    await writeLoopState(projectDirectory, {
      ...state,
      lastError: stringifyError(error),
      updatedAt: new Date().toISOString(),
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

  try {
    await promptSession(client, sessionID, buildContinuationPrompt(nextState));
  } catch (error) {
    await writeLoopState(projectDirectory, {
      ...nextState,
      lastError: stringifyError(error),
      updatedAt: new Date().toISOString(),
    });
    log(client, "error", `lazy-loop could not prompt session ${sessionID}.`, error);
  }
}

async function cancelLoop(projectDirectory: string, sessionID: string): Promise<string> {
  const state = await readLoopState(projectDirectory);

  if (!state?.active || state.sessionID !== sessionID) {
    return `lazy-loop is inactive for session ${sessionID}.`;
  }

  await deleteLoopState(projectDirectory);
  return `lazy-loop cancelled for session ${sessionID}.`;
}

async function getStatus(projectDirectory: string, sessionID: string): Promise<string> {
  const state = await readLoopState(projectDirectory);

  if (!state?.active || state.sessionID !== sessionID) {
    return `lazy-loop is inactive for session ${sessionID}.`;
  }

  return [
    `lazy-loop is active for session ${sessionID}.`,
    `Task: ${state.task}`,
    `Iteration: ${state.iteration}`,
    `State: ${getStatePath(projectDirectory)}`,
    state.lastError ? `Last error: ${state.lastError}` : undefined,
  ]
    .filter((line): line is string => typeof line === "string")
    .join("\n");
}

function buildContinuationPrompt(state: LoopState): string {
  return [
    "Continue the user-started lazy loop task.",
    "",
    "Task:",
    state.task,
    "",
    `Iteration: ${state.iteration}`,
    "",
    "Continue from the current session context.",
    "If the task is fully complete, end your response with:",
    "",
    state.completionTag,
    "",
    "If you are blocked, cannot continue safely, or need user input, end your response with:",
    "",
    state.stopTag,
  ].join("\n");
}

function isLazyLoopCommand(command: string): boolean {
  return command === COMMAND_START || command === COMMAND_CANCEL || command === COMMAND_STATUS;
}

function stripSlash(command: string): string {
  return command.startsWith("/") ? command.slice(1) : command;
}

function setOutputText(output: { parts: unknown[] }, text: string): void {
  output.parts = [{ type: "text", text }];
}

async function readLoopState(projectDirectory: string): Promise<LoopState | null> {
  try {
    const raw = await readFile(getStatePath(projectDirectory), "utf8");
    const state = JSON.parse(raw) as unknown;

    return isLoopState(state) ? state : null;
  } catch {
    return null;
  }
}

async function writeLoopState(projectDirectory: string, state: LoopState): Promise<void> {
  await mkdir(resolve(projectDirectory, STATE_DIRECTORY), { recursive: true });
  await writeFile(getStatePath(projectDirectory), `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

async function deleteLoopState(projectDirectory: string): Promise<void> {
  await rm(getStatePath(projectDirectory), { force: true });
}

function getStatePath(projectDirectory: string): string {
  return resolve(projectDirectory, STATE_DIRECTORY, STATE_FILE);
}

function isLoopState(value: unknown): value is LoopState {
  return (
    isRecord(value) &&
    value.version === 1 &&
    typeof value.active === "boolean" &&
    typeof value.sessionID === "string" &&
    typeof value.directory === "string" &&
    typeof value.task === "string" &&
    typeof value.iteration === "number" &&
    typeof value.completionTag === "string" &&
    typeof value.stopTag === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function getEventSessionID(event: JsonRecord): string | undefined {
  const properties = isRecord(event.properties) ? event.properties : undefined;
  const candidates = [
    event.sessionID,
    event.sessionId,
    event.id,
    properties?.sessionID,
    properties?.sessionId,
    properties?.id,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return undefined;
}

async function fetchSessionMessages(
  client: JsonRecord,
  sessionID: string,
  directory: string,
): Promise<unknown[]> {
  const session = isRecord(client.session) ? client.session : undefined;
  const messages = session?.messages;

  if (typeof messages !== "function") {
    return [];
  }

  const response = (await messages({
    path: { id: sessionID },
    query: { directory },
  })) as unknown;

  if (Array.isArray(response)) {
    return response;
  }

  if (isRecord(response) && Array.isArray(response.messages)) {
    return response.messages;
  }

  if (isRecord(response) && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
}

async function promptSession(client: JsonRecord, sessionID: string, prompt: string): Promise<void> {
  const session = isRecord(client.session) ? client.session : undefined;
  const promptMethod = session?.prompt;

  if (typeof promptMethod !== "function") {
    return;
  }

  await promptMethod({
    path: { id: sessionID },
    body: {
      parts: [{ type: "text", text: prompt }],
    },
  });
}

function getLastAssistantText(messages: unknown[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (getMessageRole(message) === "assistant") {
      return extractText(message);
    }
  }

  return messages.length > 0 ? extractText(messages[messages.length - 1]) : "";
}

function getMessageRole(message: unknown): string | undefined {
  if (!isRecord(message)) {
    return undefined;
  }

  const info = isRecord(message.info) ? message.info : undefined;
  const author = isRecord(message.author) ? message.author : undefined;
  const nestedMessage = isRecord(message.message) ? message.message : undefined;
  const candidates = [
    message.role,
    message.type,
    info?.role,
    info?.type,
    author?.role,
    author?.type,
    nestedMessage?.role,
    nestedMessage?.type,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.toLowerCase();
    }
  }

  return undefined;
}

function extractText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(extractText).join(" ").trim();
  }

  if (!isRecord(value)) {
    return "";
  }

  if (typeof value.text === "string") {
    return value.text;
  }

  if (typeof value.content === "string") {
    return value.content;
  }

  if (Array.isArray(value.parts)) {
    return value.parts.map(extractText).join(" ").trim();
  }

  if (Array.isArray(value.content)) {
    return value.content.map(extractText).join(" ").trim();
  }

  if (isRecord(value.message)) {
    return extractText(value.message);
  }

  return "";
}

function log(client: JsonRecord, level: "info" | "error", message: string, error?: unknown): void {
  const app = isRecord(client.app) ? client.app : undefined;
  const logger = app?.log;

  if (typeof logger !== "function") {
    return;
  }

  try {
    logger(
      error === undefined ? { level, message } : { level, message, error: stringifyError(error) },
    );
  } catch {
    // Ignore logging errors.
  }
}

function stringifyError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
