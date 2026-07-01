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
    englishName: "Producer",
    japaneseName: "プロデューサー",
    chineseName: "制作人",
    description:
      "Primary Producer for understanding the user's goal, idol orchestration, and final response integration.",
    mode: "primary",
    prompt: PRODUCER_PROMPT,
  },
  {
    name: "kotori",
    englishName: "Kotori Otonashi",
    japaneseName: "音無小鳥",
    chineseName: "音无小鸟",
    description:
      "Documentation, archive, references, handoff, project memory, and migration notes idol.",
    mode: "subagent",
    prompt: KOTORI_PROMPT,
  },
  {
    name: "haruka",
    englishName: "Haruka Amami",
    japaneseName: "天海春香",
    chineseName: "天海春香",
    description: "Cheerful ordinary-task idol for reliable low-risk single-step work.",
    mode: "subagent",
    prompt: HARUKA_PROMPT,
  },
  {
    name: "chihaya",
    englishName: "Chihaya Kisaragi",
    japaneseName: "如月千早",
    chineseName: "如月千早",
    description:
      "Precision verification idol for facts, logic, tests, edge cases, and performance evidence.",
    mode: "subagent",
    prompt: CHIHAYA_PROMPT,
  },
  {
    name: "miki",
    englishName: "Miki Hoshii",
    japaneseName: "星井美希",
    chineseName: "星井美希",
    description:
      "Visual aesthetics and design-polish idol for UI, layout, color, presentation, and charm.",
    mode: "subagent",
    prompt: MIKI_PROMPT,
  },
  {
    name: "yukiho",
    englishName: "Yukiho Hagiwara",
    japaneseName: "萩原雪歩",
    chineseName: "萩原雪步",
    description:
      "Gentle conservative risk and safety idol for destructive, sensitive, or irreversible work.",
    mode: "subagent",
    prompt: YUKIHO_PROMPT,
  },
  {
    name: "yayoi",
    englishName: "Yayoi Takatsuki",
    japaneseName: "高槻やよい",
    chineseName: "高槻弥生",
    description:
      "Energetic frugal MVP idol for scope, cost, dependency control, and anti-overengineering.",
    mode: "subagent",
    prompt: YAYOI_PROMPT,
  },
  {
    name: "makoto",
    englishName: "Makoto Kikuchi",
    japaneseName: "菊地真",
    chineseName: "菊地真",
    description:
      "Direct fast-action idol for bounded fixes, quick execution, checks, tests, and validation.",
    mode: "subagent",
    prompt: MAKOTO_PROMPT,
  },
  {
    name: "iori",
    englishName: "Iori Minase",
    japaneseName: "水瀬伊織",
    chineseName: "水濑伊织",
    description:
      "Sharp-tongued review and quality-gate idol for maintainability, polish critique, and readiness.",
    mode: "subagent",
    prompt: IORI_PROMPT,
  },
  {
    name: "hibiki",
    englishName: "Hibiki Ganaha",
    japaneseName: "我那覇響",
    chineseName: "我那霸响",
    description: "Energetic scout idol for internal codebase and environment reconnaissance.",
    mode: "subagent",
    prompt: HIBIKI_PROMPT,
  },
  {
    name: "azusa",
    englishName: "Azusa Miura",
    japaneseName: "三浦あずさ",
    chineseName: "三浦梓",
    description:
      "Gentle synthesis and UX-empathy idol for clarification, user-facing explanation, and calm guidance.",
    mode: "subagent",
    prompt: AZUSA_PROMPT,
  },
  {
    name: "ami",
    englishName: "Ami Futami",
    japaneseName: "双海亜美",
    chineseName: "双海亚美",
    description:
      "Playful prototype and experiment idol for lightweight disposable proofs of concept.",
    mode: "subagent",
    prompt: AMI_PROMPT,
  },
  {
    name: "mami",
    englishName: "Mami Futami",
    japaneseName: "双海真美",
    chineseName: "双海真美",
    description:
      "Playful variation idol for alternatives, options, style comparisons, and multiple approaches.",
    mode: "subagent",
    prompt: MAMI_PROMPT,
  },
  {
    name: "ritsuko",
    englishName: "Ritsuko Akizuki",
    japaneseName: "秋月律子",
    chineseName: "秋月律子",
    description:
      "Organized planner and project-management idol for task graphs, priorities, acceptance criteria, release flow, and CI/CD checklists.",
    mode: "subagent",
    prompt: RITSUKO_PROMPT,
  },
  {
    name: "takane",
    englishName: "Takane Shijou",
    japaneseName: "四条貴音",
    chineseName: "四条贵音",
    description:
      "Elegant architecture and strategy idol for system boundaries, long-term direction, and difficult tradeoffs.",
    mode: "subagent",
    prompt: TAKANE_PROMPT,
  },
] as const;
