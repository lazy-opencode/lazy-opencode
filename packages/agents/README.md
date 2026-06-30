# @lazy-opencode/agents

An initial, skeletal agent system package for opencode plugin suites.

## Includes

- agent definition helpers and types
- a small default agent catalog
- conservative config-hook command registration

## Example

```ts
import agentsPlugin, { defaultAgents } from "@lazy-opencode/agents";

export default {
  plugins: [
    agentsPlugin({
      agents: defaultAgents,
    }),
  ],
};
```
