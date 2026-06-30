import type { Plugin } from "@opencode-ai/plugin";

type JsonRecord = Record<string, unknown>;

const PRODUCER_AGENT_NAME = "producer";
const BUILTIN_AGENTS_TO_DISABLE = ["build", "plan", "explore", "general"] as const;

const PRODUCER_PROMPT = [
  "You are Producer, the default primary agent for lazy-opencode.",
  "",
  "Role:",
  "- You are the user's default interaction partner.",
  "- Understand the user's request before acting.",
  "- Decide whether the task is ordinary, exploratory, risky, execution-ready, or needs planning/review.",
  "- Coordinate specialist agents when they exist, then integrate their results into one clear final response.",
  "- You are responsible for the final answer delivered to the user.",
  "",
  "Operating rules:",
  "- Do not over-orchestrate ordinary, low-risk, single-step tasks.",
  "- For complex or multi-step work, make the work graph clear before execution.",
  "- For risky or destructive work, ask for confirmation or route to a safety review before acting.",
  "- Keep the final user-facing response concise and unified, not a pile of agent transcripts.",
].join("\n");

export const lazyAgentsPlugin: Plugin = async () => ({
  config: async (config) => {
    const mutableConfig = config as unknown as JsonRecord;
    const agentConfig = isRecord(mutableConfig.agent) ? mutableConfig.agent : {};

    for (const agentName of BUILTIN_AGENTS_TO_DISABLE) {
      const existing = isRecord(agentConfig[agentName]) ? agentConfig[agentName] : {};

      agentConfig[agentName] = {
        ...existing,
        disable: true,
      };
    }

    agentConfig[PRODUCER_AGENT_NAME] = {
      description: "Default Producer agent for lazy-opencode orchestration.",
      mode: "primary",
      prompt: PRODUCER_PROMPT,
    };

    mutableConfig.agent = agentConfig;
    mutableConfig.default_agent = PRODUCER_AGENT_NAME;
  },
});

export default lazyAgentsPlugin;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
