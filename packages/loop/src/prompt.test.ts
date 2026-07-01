import { describe, expect, it } from "vitest";

import {
  buildContinuationPrompt,
  buildStartPrompt,
  extractPromptFromParts,
  hasProtocolTag,
} from "./prompt.js";
import { createLoopState } from "./test-utils.js";

describe("prompt builders", () => {
  it("builds a start prompt with the user prompt and protocol tags", () => {
    const state = createLoopState({ prompt: "Ship the feature" });
    const prompt = buildStartPrompt(state);

    expect(prompt).toContain("User prompt:\nShip the feature");
    expect(prompt).toContain(state.completionTag);
    expect(prompt).toContain(state.stopTag);
    expect(prompt).toContain("put this tag on its own final line");
  });

  it("builds a continuation prompt with iteration and original prompt", () => {
    const state = createLoopState({ prompt: "Keep going", iteration: 3 });
    const prompt = buildContinuationPrompt(state);

    expect(prompt).toContain("Continue this lazy-loop prompt");
    expect(prompt).toContain("User prompt:\nKeep going");
    expect(prompt).toContain("Iteration: 3");
    expect(prompt).toContain(state.completionTag);
    expect(prompt).toContain(state.stopTag);
  });
});

describe("extractPromptFromParts", () => {
  it("extracts text after the command template User prompt marker", () => {
    expect(
      extractPromptFromParts([
        { type: "text", text: "Intro\nUser prompt:\nfirst line\nsecond line" },
      ]),
    ).toBe("first line\nsecond line");
  });

  it("preserves nested User prompt text after the first marker", () => {
    expect(
      extractPromptFromParts([
        { type: "text", text: "User prompt:\nExplain this label: User prompt:" },
      ]),
    ).toBe("Explain this label: User prompt:");
  });

  it("ignores non-text parts and returns an empty string when no marker exists", () => {
    expect(extractPromptFromParts([{ type: "tool", name: "x" }])).toBe("");
    expect(extractPromptFromParts([{ type: "text", text: "no marker" }])).toBe("");
  });
});

describe("hasProtocolTag", () => {
  it("detects protocol tags", () => {
    expect(
      hasProtocolTag(
        "done\n<lazy-opencode>DONE</lazy-opencode>",
        "<lazy-opencode>DONE</lazy-opencode>",
      ),
    ).toBe(true);
  });

  it("ignores tags that only appear in internal reminders", () => {
    expect(
      hasProtocolTag(
        "<internal_reminder><lazy-opencode>DONE</lazy-opencode></internal_reminder>",
        "<lazy-opencode>DONE</lazy-opencode>",
      ),
    ).toBe(false);
  });

  it("returns false for empty text", () => {
    expect(hasProtocolTag("", "<lazy-opencode>DONE</lazy-opencode>")).toBe(false);
  });
});
