import { resolve } from "node:path";

import type { Plugin } from "@opencode-ai/plugin";

import {
  COMMAND_CANCEL,
  COMMAND_CANCEL_TEMPLATE,
  COMMAND_START,
  COMMAND_START_TEMPLATE,
  COMMAND_STATUS,
  COMMAND_STATUS_TEMPLATE,
} from "./constants.js";
import { getLoopPluginOptions, writeDebugLog } from "./debug.js";
import { getLazyLoopCommand, setOutputText } from "./command.js";
import { cancelLoop, continueLoop, getStatus, startLoop } from "./workflow.js";
import { deleteLoopState, readLoopState } from "./state.js";
import type { JsonRecord } from "./types.js";
import { getEventSessionID, isRecord } from "./utils.js";
import { log } from "./client.js";

const lazyLoopPlugin: Plugin = async ({ client, directory }, options) => {
  const projectDirectory = resolve(directory);
  const runtimeClient = client as unknown as JsonRecord;
  const pluginOptions = getLoopPluginOptions(options);

  return {
    config: async (config) => {
      const mutableConfig = config as unknown as JsonRecord;
      const commandConfig = isRecord(mutableConfig.command) ? mutableConfig.command : {};

      commandConfig[COMMAND_START] ??= {
        description: "Start a local lazy loop for the current session.",
        template: COMMAND_START_TEMPLATE,
      };
      commandConfig[COMMAND_CANCEL] ??= {
        description: "Cancel the active lazy loop for the current session.",
        template: COMMAND_CANCEL_TEMPLATE,
      };
      commandConfig[COMMAND_STATUS] ??= {
        description: "Show the current lazy loop status.",
        template: COMMAND_STATUS_TEMPLATE,
      };

      mutableConfig.command = commandConfig;
    },

    "command.execute.before": async (input, output) => {
      await writeDebugLog(pluginOptions, projectDirectory, {
        hook: "command.execute.before",
        command: input.command,
        sessionID: input.sessionID,
        arguments: input.arguments,
        directory: projectDirectory,
      });

      const command = getLazyLoopCommand(input.command);

      if (!command) {
        return;
      }

      if (command === COMMAND_START) {
        await startLoop(projectDirectory, input.sessionID, input.arguments, output);
        log(runtimeClient, "info", `lazy-loop started for session ${input.sessionID}.`);
        return;
      }

      if (command === COMMAND_CANCEL) {
        const message = await cancelLoop(projectDirectory, input.sessionID);
        setOutputText(output, message);
        log(runtimeClient, "info", message);
        return;
      }

      setOutputText(output, await getStatus(projectDirectory, input.sessionID));
      log(runtimeClient, "info", `lazy-loop status requested for session ${input.sessionID}.`);
    },

    event: async ({ event }) => {
      const payload = event as unknown as JsonRecord;
      const type = typeof payload.type === "string" ? payload.type : undefined;

      if (type !== "session.idle" && type !== "session.deleted") {
        return;
      }

      const sessionID = getEventSessionID(payload);

      await writeDebugLog(pluginOptions, projectDirectory, {
        hook: "event",
        type,
        sessionID: sessionID ?? null,
        properties: isRecord(payload.properties) ? payload.properties : null,
        directory: projectDirectory,
      });

      if (!sessionID) {
        return;
      }

      if (type === "session.deleted") {
        const state = await readLoopState(projectDirectory, sessionID);

        if (state?.sessionID === sessionID) {
          await deleteLoopState(projectDirectory, sessionID);
          log(runtimeClient, "info", `lazy-loop cleaned up for deleted session ${sessionID}.`);
        }

        return;
      }

      await continueLoop(projectDirectory, runtimeClient, sessionID, pluginOptions);
    },
  };
};

export default lazyLoopPlugin;
