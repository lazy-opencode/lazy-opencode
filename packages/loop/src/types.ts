export type JsonRecord = Record<string, unknown>;

export interface LoopPluginOptions {
  debug?: boolean;
}

export interface LoopState {
  version: 1;
  active: boolean;
  sessionID: string;
  directory: string;
  prompt: string;
  iteration: number;
  completionTag: string;
  stopTag: string;
  createdAt: string;
  updatedAt: string;
  lastAutoReplyAt?: string;
  lastError?: string;
}

export interface LoopOutput {
  parts: unknown[];
}
