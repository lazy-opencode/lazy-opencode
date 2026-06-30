import { PRODUCER_AGENT_NAME } from "./constants.js";
import {
  AMI_PROMPT,
  AZUSA_PROMPT,
  CHIHAYA_PROMPT,
  HIBIKI_PROMPT,
  HARUKA_PROMPT,
  IORI_PROMPT,
  KOTORI_PROMPT,
  MAKOTO_PROMPT,
  MAMI_PROMPT,
  MIKI_PROMPT,
  PRODUCER_PROMPT,
  RITSUKO_PROMPT,
  TAKANE_PROMPT,
  YAYOI_PROMPT,
  YUKIHO_PROMPT,
} from "./prompts.js";
import type { LazyAgentDefinition } from "./types.js";

export const LAZY_AGENT_CATALOG: readonly LazyAgentDefinition[] = [
  {
    name: PRODUCER_AGENT_NAME,
    description: "Primary Producer agent for orchestration and final response integration.",
    mode: "primary",
    prompt: PRODUCER_PROMPT,
  },
  {
    name: "kotori",
    description: "Docs and archive agent for README, handoff, FAQ, and knowledge capture.",
    mode: "subagent",
    prompt: KOTORI_PROMPT,
  },
  {
    name: "haruka",
    description: "Routine task worker for ordinary low-risk single-step work.",
    mode: "subagent",
    prompt: HARUKA_PROMPT,
  },
  {
    name: "chihaya",
    description: "Rigorous analysis and fact-check agent for evidence and correctness.",
    mode: "subagent",
    prompt: CHIHAYA_PROMPT,
  },
  {
    name: "miki",
    description: "Fast executor and fixer for clear bounded changes.",
    mode: "subagent",
    prompt: MIKI_PROMPT,
  },
  {
    name: "yukiho",
    description: "Risk and safety guard for destructive, sensitive, or irreversible work.",
    mode: "subagent",
    prompt: YUKIHO_PROMPT,
  },
  {
    name: "yayoi",
    description: "Simplification and MVP guard for scope, cost, and dependency control.",
    mode: "subagent",
    prompt: YAYOI_PROMPT,
  },
  {
    name: "makoto",
    description: "Quick check agent for short validation and small confirmation runs.",
    mode: "subagent",
    prompt: MAKOTO_PROMPT,
  },
  {
    name: "iori",
    description: "Strict review and quality gate agent for polish and maintainability.",
    mode: "subagent",
    prompt: IORI_PROMPT,
  },
  {
    name: "hibiki",
    description: "Explorer agent for internal codebase and environment reconnaissance.",
    mode: "subagent",
    prompt: HIBIKI_PROMPT,
  },
  {
    name: "azusa",
    description: "External research and librarian agent for official docs and APIs.",
    mode: "subagent",
    prompt: AZUSA_PROMPT,
  },
  {
    name: "ami",
    description: "Prototype and experiment agent for lightweight proofs of concept.",
    mode: "subagent",
    prompt: AMI_PROMPT,
  },
  {
    name: "mami",
    description: "Variation agent for alternatives, options, and style comparisons.",
    mode: "subagent",
    prompt: MAMI_PROMPT,
  },
  {
    name: "ritsuko",
    description: "Planner and project manager agent for complex multi-step work.",
    mode: "subagent",
    prompt: RITSUKO_PROMPT,
  },
  {
    name: "takane",
    description: "Architect and strategic advisor for long-term tradeoffs and boundaries.",
    mode: "subagent",
    prompt: TAKANE_PROMPT,
  },
] as const;
