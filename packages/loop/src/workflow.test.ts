import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildContinuationPrompt, buildStartPrompt } from "./prompt.js";
import { readLoopState, writeLoopState } from "./state.js";
import {
  createLoopState,
  createTempProjectDirectory,
  removeTempProjectDirectory,
} from "./test-utils.js";
import { cancelLoop, continueLoop, getStatus, startLoop } from "./workflow.js";

let projectDirectory: string;

beforeEach(async () => {
  projectDirectory = await createTempProjectDirectory();
});

afterEach(async () => {
  await removeTempProjectDirectory(projectDirectory);
});

describe("startLoop", () => {
  it("writes active state and replaces command output with the first work prompt", async () => {
    const output = { parts: [{ type: "text", text: "old" }] };

    await startLoop(projectDirectory, "ses_1", "  Do work  ", output);

    const state = await readLoopState(projectDirectory, "ses_1");

    expect(state).toMatchObject({
      active: true,
      sessionID: "ses_1",
      directory: projectDirectory,
      prompt: "Do work",
      iteration: 0,
    });
    expect(output.parts).toEqual([{ type: "text", text: buildStartPrompt(state!) }]);
  });

  it("falls back to extracting the prompt from output parts", async () => {
    const output = { parts: [{ type: "text", text: "Template\nUser prompt:\nfrom parts" }] };

    await startLoop(projectDirectory, "ses_2", "", output);

    await expect(readLoopState(projectDirectory, "ses_2")).resolves.toMatchObject({
      prompt: "from parts",
    });
  });

  it("shows usage and does not write state when no prompt is available", async () => {
    const output = { parts: [] };

    await startLoop(projectDirectory, "ses_3", "", output);

    expect(output.parts).toEqual([{ type: "text", text: "Usage: /lazy-loop <prompt>" }]);
    await expect(readLoopState(projectDirectory, "ses_3")).resolves.toBeNull();
  });
});

describe("continueLoop", () => {
  it("does nothing when state is missing", async () => {
    const prompt = vi.fn();
    const client = createClient({ messages: [], prompt });

    await continueLoop(projectDirectory, client, "missing", {});

    expect(prompt).not.toHaveBeenCalled();
  });

  it("deletes state when the last assistant message contains the completion tag", async () => {
    const state = createLoopState({ sessionID: "ses_done", directory: projectDirectory });
    const prompt = vi.fn();
    const client = createClient({
      messages: [{ role: "assistant", content: `Finished\n${state.completionTag}` }],
      prompt,
    });
    await writeLoopState(projectDirectory, state);

    await continueLoop(projectDirectory, client, state.sessionID, {});

    await expect(readLoopState(projectDirectory, state.sessionID)).resolves.toBeNull();
    expect(prompt).not.toHaveBeenCalled();
  });

  it("deletes state when the last assistant message contains the stop tag", async () => {
    const state = createLoopState({ sessionID: "ses_stop", directory: projectDirectory });
    const prompt = vi.fn();
    const client = createClient({
      messages: [{ role: "assistant", content: `Blocked\n${state.stopTag}` }],
      prompt,
    });
    await writeLoopState(projectDirectory, state);

    await continueLoop(projectDirectory, client, state.sessionID, {});

    await expect(readLoopState(projectDirectory, state.sessionID)).resolves.toBeNull();
    expect(prompt).not.toHaveBeenCalled();
  });

  it("increments iteration, persists state, and prompts the session", async () => {
    const state = createLoopState({ sessionID: "ses_continue", directory: projectDirectory });
    const prompt = vi.fn();
    const client = createClient({ messages: [{ role: "assistant", content: "not done" }], prompt });
    await writeLoopState(projectDirectory, state);

    await continueLoop(projectDirectory, client, state.sessionID, {});

    const nextState = await readLoopState(projectDirectory, state.sessionID);

    expect(nextState).toMatchObject({ iteration: 1 });
    expect(nextState?.lastAutoReplyAt).toBeTypeOf("string");
    expect(prompt).toHaveBeenCalledWith({
      path: { id: state.sessionID },
      body: { parts: [{ type: "text", text: buildContinuationPrompt(nextState!) }] },
    });
  });

  it("records inspect errors without prompting", async () => {
    const state = createLoopState({ sessionID: "ses_error", directory: projectDirectory });
    const prompt = vi.fn();
    const client = createClient({
      messages: vi.fn().mockRejectedValue(new Error("inspect failed")),
      prompt,
    });
    await writeLoopState(projectDirectory, state);

    await continueLoop(projectDirectory, client, state.sessionID, {});

    await expect(readLoopState(projectDirectory, state.sessionID)).resolves.toMatchObject({
      iteration: 0,
      lastError: "inspect failed",
    });
    expect(prompt).not.toHaveBeenCalled();
  });

  it("records prompt errors after incrementing iteration", async () => {
    const state = createLoopState({ sessionID: "ses_prompt_error", directory: projectDirectory });
    const client = createClient({
      messages: [{ role: "assistant", content: "not done" }],
      prompt: vi.fn().mockRejectedValue(new Error("prompt failed")),
    });
    await writeLoopState(projectDirectory, state);

    await continueLoop(projectDirectory, client, state.sessionID, {});

    await expect(readLoopState(projectDirectory, state.sessionID)).resolves.toMatchObject({
      iteration: 1,
      lastError: "prompt failed",
    });
  });
});

describe("cancelLoop and getStatus", () => {
  it("reports inactive status when no loop exists", async () => {
    await expect(getStatus(projectDirectory, "missing")).resolves.toBe(
      "lazy-loop is inactive for session missing.",
    );
    await expect(cancelLoop(projectDirectory, "missing")).resolves.toBe(
      "lazy-loop is inactive for session missing.",
    );
  });

  it("reports active status with prompt, iteration, path, and last error", async () => {
    const state = createLoopState({
      sessionID: "ses_status",
      directory: projectDirectory,
      prompt: "Check status",
      iteration: 2,
      lastError: "previous error",
    });
    await writeLoopState(projectDirectory, state);

    const status = await getStatus(projectDirectory, state.sessionID);

    expect(status).toContain("lazy-loop is active for session ses_status.");
    expect(status).toContain("User prompt:\nCheck status");
    expect(status).toContain("Iteration: 2");
    expect(status).toContain("State:");
    expect(status).toContain("Last error: previous error");
  });

  it("cancels active state", async () => {
    const state = createLoopState({ sessionID: "ses_cancel", directory: projectDirectory });
    await writeLoopState(projectDirectory, state);

    await expect(cancelLoop(projectDirectory, state.sessionID)).resolves.toBe(
      "lazy-loop cancelled for session ses_cancel.",
    );
    await expect(readLoopState(projectDirectory, state.sessionID)).resolves.toBeNull();
  });
});

function createClient(options: {
  messages: unknown[] | (() => Promise<unknown[]>);
  prompt: (request: unknown) => unknown;
}) {
  return {
    session: {
      messages:
        typeof options.messages === "function"
          ? options.messages
          : vi.fn().mockResolvedValue(options.messages),
      prompt: options.prompt,
    },
    app: {
      log: vi.fn(),
    },
  };
}
