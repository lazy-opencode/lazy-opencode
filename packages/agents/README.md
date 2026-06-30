# @lazy-opencode/agents

Producer-first agent catalog plugin for opencode.

## Behavior

- registers `producer` as the default primary agent
- disables the built-in `build`, `plan`, `explore`, and `general` agents
- registers the rest of the catalog as `subagent` agents
- registers `/debut` as a Producer-run command that pings every lazy-opencode subagent
- keeps Producer responsible for user interaction, orchestration decisions, and final response integration

Agent keys are lowercase for consistency with opencode agent files, command usage, and future compatibility. The opencode JSON schema allows arbitrary agent object keys, but this package treats lowercase names as part of the public interface.

## Catalog

- `producer` — primary orchestrator and final answer integrator
- `kotori` — docs, README, FAQ, handoff, and archive work
- `haruka` — ordinary low-risk single-step tasks
- `chihaya` — analysis, fact-checking, and logical verification
- `miki` — fast execution and bounded fixes
- `yukiho` — risk, safety, permissions, secrets, and deployment guard
- `yayoi` — simplification, MVP focus, and scope control
- `makoto` — quick checks and short validation runs
- `iori` — review, quality gate, and final critique
- `hibiki` — codebase and environment exploration
- `azusa` — external docs, APIs, and web research
- `ami` — prototype and experiment work
- `mami` — alternative versions and style options
- `ritsuko` — planning and task decomposition
- `takane` — architecture and long-term strategy

## Commands

- `/debut` — ask every lazy-opencode subagent to report once, then have Producer summarize expected reports, received reports, missing/failing agents, and a concise readiness table.

## Example

```ts
import agentsPlugin from "@lazy-opencode/agents";

export default {
  plugins: [agentsPlugin()],
};
```
