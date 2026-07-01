import { BUILTIN_AGENTS_TO_DISABLE, PRODUCER_AGENT_NAME } from "./constants.js";
import { LAZY_AGENT_CATALOG } from "./catalog.js";
import { LAZY_COMMAND_CATALOG } from "./commands.js";
import type { JsonRecord } from "./types.js";

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function applyLazyAgentCatalog(config: unknown): void {
  if (!isRecord(config)) {
    return;
  }

  const mutableConfig = config;
  const agentConfig: JsonRecord = isRecord(mutableConfig.agent) ? { ...mutableConfig.agent } : {};
  const commandConfig: JsonRecord = isRecord(mutableConfig.command)
    ? { ...mutableConfig.command }
    : {};

  for (const agentName of BUILTIN_AGENTS_TO_DISABLE) {
    const existingValue = agentConfig[agentName];
    const existing: JsonRecord = isRecord(existingValue) ? existingValue : {};

    agentConfig[agentName] = {
      ...existing,
      disable: true,
    };
  }

  for (const agent of LAZY_AGENT_CATALOG) {
    const existingValue = agentConfig[agent.name];
    const existing: JsonRecord = isRecord(existingValue) ? existingValue : {};
    const existingOptionsValue = existing.options;
    const existingOptions: JsonRecord = isRecord(existingOptionsValue) ? existingOptionsValue : {};

    agentConfig[agent.name] = {
      ...existing,
      description: agent.description,
      mode: agent.mode,
      prompt: agent.prompt,
      options: {
        ...existingOptions,
        lazy_opencode: {
          englishName: agent.englishName,
          japaneseName: agent.japaneseName,
          chineseName: agent.chineseName,
        },
      },
    };
  }

  for (const command of LAZY_COMMAND_CATALOG) {
    const existingValue = commandConfig[command.name];
    const existing: JsonRecord = isRecord(existingValue) ? existingValue : {};

    commandConfig[command.name] = {
      ...existing,
      description: command.description,
      template: command.template,
      ...(command.agent === undefined ? {} : { agent: command.agent }),
    };
  }

  mutableConfig.agent = agentConfig;
  mutableConfig.command = commandConfig;
  mutableConfig.default_agent = PRODUCER_AGENT_NAME;
}
