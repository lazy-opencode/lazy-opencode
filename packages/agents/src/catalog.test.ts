import { describe, expect, it } from "vitest";

import { LAZY_AGENT_CATALOG } from "./catalog.js";
import { PRODUCER_AGENT_NAME } from "./constants.js";

describe("LAZY_AGENT_CATALOG", () => {
  it("has unique agent names", () => {
    const names = LAZY_AGENT_CATALOG.map((agent) => agent.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it("has Producer as the only primary agent", () => {
    const primaryAgents = LAZY_AGENT_CATALOG.filter((agent) => agent.mode === "primary");

    expect(primaryAgents).toHaveLength(1);
    expect(primaryAgents[0]?.name).toBe(PRODUCER_AGENT_NAME);
  });

  it("defines complete metadata and prompts for every agent", () => {
    for (const agent of LAZY_AGENT_CATALOG) {
      expect(agent.description.trim()).not.toBe("");
      expect(agent.prompt.trim()).not.toBe("");
      expect(agent.englishName.trim()).not.toBe("");
      expect(agent.japaneseName.trim()).not.toBe("");
      expect(agent.chineseName.trim()).not.toBe("");
    }
  });
});
