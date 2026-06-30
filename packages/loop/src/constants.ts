export const COMMAND_START = "lazy-loop";
export const COMMAND_CANCEL = "lazy-loop-cancel";
export const COMMAND_STATUS = "lazy-loop-status";

export const COMMAND_START_TEMPLATE =
  "Start the lazy loop with the user prompt below. Work on exactly one useful step in this response; the lazy-loop plugin will continue from session context when the session becomes idle.\n\nUser prompt:\n$ARGUMENTS";
export const COMMAND_CANCEL_TEMPLATE =
  "The lazy loop cancel command has been received. The plugin will update loop state.";
export const COMMAND_STATUS_TEMPLATE =
  "The lazy loop status command has been received. The plugin will report loop state.";

export const STATE_DIRECTORY = ".lazy-opencode/loop";
export const STATE_SESSION_DIRECTORY = "sessions";

export const DEFAULT_COMPLETION_TAG = "<lazy-opencode>DONE</lazy-opencode>";
export const DEFAULT_STOP_TAG = "<lazy-opencode>STOP</lazy-opencode>";
