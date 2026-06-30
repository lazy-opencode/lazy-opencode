import { appendFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import type { PluginOptions } from "@opencode-ai/plugin";

import { STATE_DIRECTORY } from "./constants.js";
import type { JsonRecord, LoopPluginOptions } from "./types.js";

export function getLoopPluginOptions(options: PluginOptions | undefined): LoopPluginOptions {
  return {
    debug: options?.debug === true,
  };
}

export async function writeDebugLog(
  options: LoopPluginOptions,
  projectDirectory: string,
  entry: JsonRecord,
): Promise<void> {
  if (!options.debug) {
    return;
  }

  await mkdir(resolve(projectDirectory, STATE_DIRECTORY), { recursive: true });
  await appendFile(
    resolve(projectDirectory, STATE_DIRECTORY, "debug.log"),
    `${JSON.stringify({ time: new Date().toISOString(), ...entry })}\n`,
    "utf8",
  );
}
