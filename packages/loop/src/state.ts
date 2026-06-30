import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { STATE_DIRECTORY, STATE_SESSION_DIRECTORY } from "./constants.js";
import type { LoopState } from "./types.js";
import { isRecord } from "./utils.js";

export async function readLoopState(
  projectDirectory: string,
  sessionID: string,
): Promise<LoopState | null> {
  try {
    const raw = await readFile(getStatePath(projectDirectory, sessionID), "utf8");
    const state = JSON.parse(raw) as unknown;

    return isLoopState(state) ? state : null;
  } catch {
    return null;
  }
}

export async function writeLoopState(projectDirectory: string, state: LoopState): Promise<void> {
  await mkdir(resolve(projectDirectory, STATE_DIRECTORY, STATE_SESSION_DIRECTORY), {
    recursive: true,
  });
  await writeFile(
    getStatePath(projectDirectory, state.sessionID),
    `${JSON.stringify(state, null, 2)}\n`,
    "utf8",
  );
}

export async function deleteLoopState(projectDirectory: string, sessionID: string): Promise<void> {
  await rm(getStatePath(projectDirectory, sessionID), { force: true });
}

export function getStatePath(projectDirectory: string, sessionID: string): string {
  return resolve(
    projectDirectory,
    STATE_DIRECTORY,
    STATE_SESSION_DIRECTORY,
    `${encodeURIComponent(sessionID)}.json`,
  );
}

export function isLoopState(value: unknown): value is LoopState {
  return (
    isRecord(value) &&
    value.version === 1 &&
    typeof value.active === "boolean" &&
    typeof value.sessionID === "string" &&
    typeof value.directory === "string" &&
    typeof value.prompt === "string" &&
    typeof value.iteration === "number" &&
    typeof value.completionTag === "string" &&
    typeof value.stopTag === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}
