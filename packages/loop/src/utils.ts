import type { JsonRecord } from "./types.js";

export function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function stringifyError(error: unknown): string {
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

export function getEventSessionID(event: JsonRecord): string | undefined {
  const properties = isRecord(event.properties) ? event.properties : undefined;
  const candidates = [
    event.sessionID,
    event.sessionId,
    properties?.sessionID,
    properties?.sessionId,
    properties?.id,
    event.id,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return undefined;
}

export function getLastAssistantText(messages: unknown[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];

    if (getMessageRole(message) === "assistant") {
      return extractText(message);
    }
  }

  return messages.length > 0 ? extractText(messages[messages.length - 1]) : "";
}

export function extractText(value: unknown): string {
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
