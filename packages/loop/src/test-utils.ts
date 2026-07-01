import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { LoopState } from "./types.js";

export async function createTempProjectDirectory(): Promise<string> {
  return mkdtemp(join(tmpdir(), "lazy-opencode-loop-test-"));
}

export async function removeTempProjectDirectory(directory: string): Promise<void> {
  await rm(directory, { recursive: true, force: true });
}

export function createLoopState(overrides: Partial<LoopState> = {}): LoopState {
  const now = "2026-07-01T00:00:00.000Z";

  return {
    version: 1,
    active: true,
    sessionID: "session/with special chars",
    directory: "/project",
    prompt: "Build something useful",
    iteration: 0,
    completionTag: "<lazy-opencode>DONE</lazy-opencode>",
    stopTag: "<lazy-opencode>STOP</lazy-opencode>",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
