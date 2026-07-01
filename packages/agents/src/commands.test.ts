import { describe, expect, it } from "vitest";

import { LAZY_AGENT_CATALOG } from "./catalog.js";
import {
  IDOLS_DEBUT_AGENT_NAMES,
  IDOLS_DEBUT_COMMAND_TEMPLATE,
  LAZY_COMMAND_CATALOG,
} from "./commands.js";
import {
  DEBUT_EXCLUDED_AGENT_NAMES,
  IDOLS_DEBUT_COMMAND_NAME,
  PRODUCER_AGENT_NAME,
} from "./constants.js";

describe("idols-debut command", () => {
  it("registers the command for Producer", () => {
    expect(LAZY_COMMAND_CATALOG).toContainEqual({
      name: IDOLS_DEBUT_COMMAND_NAME,
      description: expect.any(String),
      template: IDOLS_DEBUT_COMMAND_TEMPLATE,
      agent: PRODUCER_AGENT_NAME,
    });
  });

  it("lists debut-enabled subagents only", () => {
    const expectedNames = LAZY_AGENT_CATALOG.filter(
      (agent) =>
        agent.mode === "subagent" && !DEBUT_EXCLUDED_AGENT_NAMES.includes(agent.name as never),
    ).map((agent) => agent.name);

    expect(IDOLS_DEBUT_AGENT_NAMES).toEqual(expectedNames);
    expect(IDOLS_DEBUT_AGENT_NAMES).not.toContain(PRODUCER_AGENT_NAME);

    for (const excludedAgentName of DEBUT_EXCLUDED_AGENT_NAMES) {
      expect(IDOLS_DEBUT_AGENT_NAMES).not.toContain(excludedAgentName);
    }
  });

  it("keeps the core debut protocol in the template", () => {
    expect(IDOLS_DEBUT_COMMAND_TEMPLATE).toContain("Run a lazy-opencode idols debut check.");
    expect(IDOLS_DEBUT_COMMAND_TEMPLATE).toContain("Idols to ping:");
    expect(IDOLS_DEBUT_COMMAND_TEMPLATE).toContain("Excluded idols:");
    expect(IDOLS_DEBUT_COMMAND_TEMPLATE).toContain("$ARGUMENTS");

    for (const agentName of IDOLS_DEBUT_AGENT_NAMES) {
      expect(IDOLS_DEBUT_COMMAND_TEMPLATE).toContain(`- ${agentName}`);
    }
  });
});
