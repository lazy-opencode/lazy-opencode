# @lazy-opencode/agents

Initial Producer agent plugin for opencode.

## Behavior

- registers `producer` as the default primary agent
- disables the built-in `build`, `plan`, `explore`, and `general` agents
- keeps Producer responsible for user interaction, orchestration decisions, and final response integration

## Example

```ts
import agentsPlugin from "@lazy-opencode/agents";

export default {
  plugins: [agentsPlugin()],
};
```
