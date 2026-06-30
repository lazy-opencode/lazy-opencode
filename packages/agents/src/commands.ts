import { LAZY_AGENT_CATALOG } from "./catalog.js";
import { DEBUT_COMMAND_NAME, PRODUCER_AGENT_NAME } from "./constants.js";
import type { LazyCommandDefinition } from "./types.js";

const subagentNames = LAZY_AGENT_CATALOG.filter((agent) => agent.mode === "subagent").map(
  (agent) => agent.name,
);

export const DEBUT_COMMAND_TEMPLATE = [
  "Run a lazy-opencode agent debut check.",
  "",
  "Goal:",
  "- Ask every lazy-opencode subagent to report once, similar to a ping.",
  "- Each subagent should respond with its name, role, readiness, and one short concern if any.",
  "- Then Producer must summarize the results in one table and call out any missing or failed reports.",
  "",
  "Subagents to ping:",
  ...subagentNames.map((agentName) => `- ${agentName}`),
  "",
  "Instructions for Producer:",
  "- Dispatch all pings concurrently when possible.",
  "- Keep each ping small; this is a health check, not a full task.",
  "- Do not include raw transcripts unless a report fails or contains a concern.",
  "- Final answer should include: total expected, total reported, failures/missing, and a concise status table.",
  "",
  "Optional user note:",
  "$ARGUMENTS",
].join("\n");

export const LAZY_COMMAND_CATALOG: readonly LazyCommandDefinition[] = [
  {
    name: DEBUT_COMMAND_NAME,
    description: "Ping every lazy-opencode subagent and have Producer summarize readiness.",
    template: DEBUT_COMMAND_TEMPLATE,
    agent: PRODUCER_AGENT_NAME,
  },
] as const;
