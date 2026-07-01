import { describe, expect, it } from "vitest";

import { LAZY_AGENT_CATALOG } from "./catalog.js";
import { LAZY_COMMAND_CATALOG } from "./commands.js";
import { applyLazyAgentCatalog } from "./config.js";
import { BUILTIN_AGENTS_TO_DISABLE, PRODUCER_AGENT_NAME } from "./constants.js";

describe("applyLazyAgentCatalog", () => {
  it("ignores non-object config values", () => {
    expect(() => applyLazyAgentCatalog(null)).not.toThrow();
    expect(() => applyLazyAgentCatalog("config")).not.toThrow();
    expect(() => applyLazyAgentCatalog([])).not.toThrow();
  });

  it("sets Producer as default, disables built-ins, and registers lazy agents", () => {
    const config: Record<string, unknown> = {};

    applyLazyAgentCatalog(config);

    expect(config.default_agent).toBe(PRODUCER_AGENT_NAME);
    expect(config.agent).toBeTypeOf("object");

    const agentConfig = config.agent as Record<string, Record<string, unknown>>;

    for (const builtinAgentName of BUILTIN_AGENTS_TO_DISABLE) {
      expect(agentConfig[builtinAgentName]?.disable).toBe(true);
    }

    for (const agent of LAZY_AGENT_CATALOG) {
      expect(agentConfig[agent.name]).toMatchObject({
        description: agent.description,
        mode: agent.mode,
        prompt: agent.prompt,
        options: {
          lazy_opencode: {
            englishName: agent.englishName,
            japaneseName: agent.japaneseName,
            chineseName: agent.chineseName,
          },
        },
      });
    }
  });

  it("registers lazy commands while preserving unrelated command fields", () => {
    const config: Record<string, unknown> = {
      command: {
        "idols-debut": {
          custom: "keep",
        },
        existing: {
          description: "existing command",
        },
      },
    };

    applyLazyAgentCatalog(config);

    const commandConfig = config.command as Record<string, Record<string, unknown>>;

    expect(commandConfig.existing).toEqual({ description: "existing command" });

    for (const command of LAZY_COMMAND_CATALOG) {
      expect(commandConfig[command.name]).toMatchObject({
        custom: command.name === "idols-debut" ? "keep" : undefined,
        description: command.description,
        template: command.template,
        agent: command.agent,
      });
    }
  });

  it("preserves existing agent config and options when adding lazy metadata", () => {
    const config: Record<string, unknown> = {
      agent: {
        ritsuko: {
          custom: "keep",
          options: {
            existing: true,
          },
        },
      },
    };

    applyLazyAgentCatalog(config);

    const agentConfig = config.agent as Record<string, Record<string, unknown>>;

    expect(agentConfig.ritsuko).toMatchObject({
      custom: "keep",
      options: {
        existing: true,
        lazy_opencode: {
          englishName: "Ritsuko Akizuki",
        },
      },
    });
  });
});
