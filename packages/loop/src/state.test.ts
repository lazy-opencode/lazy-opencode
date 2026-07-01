import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  deleteLoopState,
  getStatePath,
  isLoopState,
  readLoopState,
  writeLoopState,
} from "./state.js";
import {
  createLoopState,
  createTempProjectDirectory,
  removeTempProjectDirectory,
} from "./test-utils.js";

let projectDirectory: string;

beforeEach(async () => {
  projectDirectory = await createTempProjectDirectory();
});

afterEach(async () => {
  await removeTempProjectDirectory(projectDirectory);
});

describe("loop state file storage", () => {
  it("writes and reads state by encoded session id", async () => {
    const state = createLoopState({ directory: projectDirectory });

    await writeLoopState(projectDirectory, state);

    expect(getStatePath(projectDirectory, state.sessionID)).toContain(
      `${encodeURIComponent(state.sessionID)}.json`,
    );
    await expect(readLoopState(projectDirectory, state.sessionID)).resolves.toEqual(state);
  });

  it("returns null for missing, invalid JSON, or invalid schema", async () => {
    await expect(readLoopState(projectDirectory, "missing")).resolves.toBeNull();

    const invalidJsonPath = getStatePath(projectDirectory, "invalid-json");
    await mkdir(dirname(invalidJsonPath), { recursive: true });
    await writeFile(invalidJsonPath, "{", "utf8");
    await expect(readLoopState(projectDirectory, "invalid-json")).resolves.toBeNull();

    const invalidStatePath = getStatePath(projectDirectory, "invalid-state");
    await writeFile(invalidStatePath, JSON.stringify({ version: 1 }), "utf8");
    await expect(readLoopState(projectDirectory, "invalid-state")).resolves.toBeNull();
  });

  it("deletes state", async () => {
    const state = createLoopState({ directory: projectDirectory });

    await writeLoopState(projectDirectory, state);
    await deleteLoopState(projectDirectory, state.sessionID);

    await expect(readLoopState(projectDirectory, state.sessionID)).resolves.toBeNull();
  });
});

describe("isLoopState", () => {
  it("accepts valid state and rejects invalid shapes", () => {
    expect(isLoopState(createLoopState())).toBe(true);
    expect(isLoopState({ ...createLoopState(), version: 2 })).toBe(false);
    expect(isLoopState({ ...createLoopState(), iteration: "1" })).toBe(false);
    expect(isLoopState(null)).toBe(false);
  });
});
