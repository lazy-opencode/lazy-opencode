import type { JsonRecord } from "./types.js";
import { isRecord, stringifyError } from "./utils.js";

export async function fetchSessionMessages(
  client: JsonRecord,
  sessionID: string,
  directory: string,
): Promise<unknown[]> {
  const session = isRecord(client.session) ? client.session : undefined;
  const messages = session?.messages;

  if (typeof messages !== "function") {
    return [];
  }

  const response = (await messages.call(session, {
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

export async function promptSession(
  client: JsonRecord,
  sessionID: string,
  prompt: string,
): Promise<void> {
  const session = isRecord(client.session) ? client.session : undefined;
  const promptMethod = session?.prompt;

  if (typeof promptMethod !== "function") {
    throw new Error("client.session.prompt is not available");
  }

  await promptMethod.call(session, {
    path: { id: sessionID },
    body: {
      parts: [{ type: "text", text: prompt }],
    },
  });
}

export function log(
  client: JsonRecord,
  level: "info" | "error",
  message: string,
  error?: unknown,
): void {
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
