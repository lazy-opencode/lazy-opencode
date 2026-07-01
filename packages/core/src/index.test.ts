import { describe, expect, it } from "vitest";

import { lazyOpencodeCore } from "./index.js";

describe("lazyOpencodeCore", () => {
  it("exports the core package identity", () => {
    expect(lazyOpencodeCore).toEqual({ name: "@lazy-opencode/core" });
  });
});
