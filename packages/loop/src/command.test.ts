import { describe, expect, it } from "vitest";

import { getLazyLoopCommand, setOutputText } from "./command.js";
import {
  COMMAND_CANCEL,
  COMMAND_CANCEL_TEMPLATE,
  COMMAND_START,
  COMMAND_START_TEMPLATE,
  COMMAND_STATUS,
  COMMAND_STATUS_TEMPLATE,
} from "./constants.js";

describe("getLazyLoopCommand", () => {
  it.each([
    ["/lazy-loop", COMMAND_START],
    ["lazy-loop", COMMAND_START],
    [COMMAND_START_TEMPLATE, COMMAND_START],
    ["/lazy-loop-cancel", COMMAND_CANCEL],
    ["lazy-loop-cancel", COMMAND_CANCEL],
    [COMMAND_CANCEL_TEMPLATE, COMMAND_CANCEL],
    ["/lazy-loop-status", COMMAND_STATUS],
    ["lazy-loop-status", COMMAND_STATUS],
    [COMMAND_STATUS_TEMPLATE, COMMAND_STATUS],
  ])("maps %s to %s", (input, expected) => {
    expect(getLazyLoopCommand(input)).toBe(expected);
  });

  it("returns undefined for unrelated commands", () => {
    expect(getLazyLoopCommand("/other")).toBeUndefined();
  });
});

describe("setOutputText", () => {
  it("mutates parts in place with a single text part", () => {
    const parts = [
      { type: "text", text: "old" },
      { type: "image", url: "x" },
    ];
    const output = { parts };

    setOutputText(output, "new text");

    expect(output.parts).toBe(parts);
    expect(output.parts).toEqual([{ type: "text", text: "new text" }]);
  });
});
