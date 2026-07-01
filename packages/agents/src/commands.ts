import { LAZY_AGENT_CATALOG } from "./catalog.js";
import {
  DEBUT_EXCLUDED_AGENT_NAMES,
  IDOLS_DEBUT_COMMAND_NAME,
  PRODUCER_AGENT_NAME,
} from "./constants.js";
import type { LazyCommandDefinition } from "./types.js";

const debutExcludedAgentNames = new Set<string>(DEBUT_EXCLUDED_AGENT_NAMES);

export const IDOLS_DEBUT_AGENT_NAMES = LAZY_AGENT_CATALOG.filter(
  (agent) => agent.mode === "subagent" && !debutExcludedAgentNames.has(agent.name),
).map((agent) => agent.name);

export const IDOLS_DEBUT_COMMAND_TEMPLATE = [
  "Run a lazy-opencode idols debut check.",
  "",
  "Goal:",
  "- Ask every listed lazy-opencode idol to report once, similar to a ping.",
  "- Do not ping excluded idols.",
  "- Each listed idol should respond with her name, role, readiness, and one short concern if any.",
  "- Then Producer must summarize the results in one table and call out any missing or failed reports.",
  "",
  "Idols to ping:",
  ...IDOLS_DEBUT_AGENT_NAMES.map((agentName) => `- ${agentName}`),
  "",
  "Excluded idols:",
  ...DEBUT_EXCLUDED_AGENT_NAMES.map((agentName) => `- ${agentName}`),
  "",
  "Instructions for Producer:",
  "- Understand that this is a readiness check, not a real work request.",
  "- Dispatch all idol pings concurrently when possible.",
  "- Keep each ping small; this is a health check, not a full task.",
  "- Do not include raw transcripts unless a report fails or contains a concern.",
  "- Final answer should include: total expected idols, total reported idols, failures/missing idols, and a concise status table.",
  "",
  "Optional user note:",
  "$ARGUMENTS",
].join("\n");

export const LAZY_COMMAND_CATALOG: readonly LazyCommandDefinition[] = [
  {
    name: IDOLS_DEBUT_COMMAND_NAME,
    description: "Ping debut-enabled lazy-opencode idols and have Producer summarize readiness.",
    template: IDOLS_DEBUT_COMMAND_TEMPLATE,
    agent: PRODUCER_AGENT_NAME,
  },
] as const;
