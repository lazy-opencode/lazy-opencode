# lazy-opencode

Initial pnpm monorepo for an experimental opencode plugin suite published under the npm scope `@lazy-opencode`.

This repository intentionally contains only tooling and minimal package entrypoints right now. Feature behavior will be discussed and added incrementally.

## Packages

- `@lazy-opencode/core` — core package placeholder
- `@lazy-opencode/loop` — minimal opencode plugin entrypoint returning no hooks
- `@lazy-opencode/agents` — minimal opencode plugin entrypoint returning no hooks

## Install

```bash
pnpm install
```

## Build and typecheck

```bash
pnpm build
pnpm typecheck
```

## Current plugin entrypoints

`@lazy-opencode/loop` and `@lazy-opencode/agents` currently export valid minimal plugin functions:

```ts
import loopPlugin from "@lazy-opencode/loop";
import agentsPlugin from "@lazy-opencode/agents";

export default [loopPlugin, agentsPlugin];
```

They do not register tools, commands, agents, state, or hooks yet.

### Package layout

```text
packages/
  core/    core package placeholder
  loop/    minimal plugin package
  agents/  minimal plugin package
```

Each package is an independent ESM TypeScript package with its own `package.json`, `tsconfig.json`, and build config.
