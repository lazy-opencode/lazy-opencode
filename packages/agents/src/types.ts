export type JsonRecord = Record<string, unknown>;

export type AgentMode = "primary" | "subagent";

export interface LazyAgentDefinition {
  readonly name: string;
  readonly englishName: string;
  readonly japaneseName: string;
  readonly chineseName: string;
  readonly description: string;
  readonly prompt: string;
  readonly mode: AgentMode;
}

export interface LazyCommandDefinition {
  readonly name: string;
  readonly description: string;
  readonly template: string;
  readonly agent?: string;
}
