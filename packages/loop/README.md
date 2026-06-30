# @lazy-opencode/loop

Command-only lazy loop plugin for opencode.

## Commands

- `/lazy-loop <task>` starts the loop for the current session.
- `/lazy-loop-cancel` cancels the active loop for the current session.
- `/lazy-loop-status` reports the current loop state.

## Behavior

- no tools, skills, CLI, or command files are registered
- slash commands are surfaced through the config hook for convenience
- command handling is performed by `command.execute.before`
- session progress is stored at `.lazy-opencode/loop/state.json` under the project cwd
- default completion tag: `<lazy-opencode>DONE</lazy-opencode>`
- default stop tag: `<lazy-opencode>STOP</lazy-opencode>`
- no built-in max iteration limit; stop with `/lazy-loop-cancel` or the stop tag
- session idleness drives the continuation loop through `session.idle`
- deleted sessions are cleaned up via `session.deleted`

The assistant can stop the loop without marking the task complete by ending a response with the stop tag. This is for blocked states, unsafe continuation, or cases that need user input.

## Example

```ts
import loopPlugin from "@lazy-opencode/loop";

export default {
  plugins: [loopPlugin()],
};
```
