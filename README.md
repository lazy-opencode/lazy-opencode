# lazy-opencode

pnpm monorepo for the `@lazy-opencode` plugin suite.

## Packages

- `@lazy-opencode/core` — shared package placeholder
- `@lazy-opencode/loop` — command-only lazy loop plugin
- `@lazy-opencode/agents` — minimal plugin entrypoint

## Install

```bash
pnpm install
```

## Build and typecheck

```bash
pnpm build
pnpm typecheck
```

## Loop plugin

`@lazy-opencode/loop` implements the first version of the lazy loop workflow with command-only behavior:

- `/lazy-loop <task>` starts a session-local loop
- `/lazy-loop-cancel` stops the active loop for that session
- `/lazy-loop-status` reports state
- loop state is stored in `.lazy-opencode/loop/state.json`
- the completion tag defaults to `<lazy-opencode>DONE</lazy-opencode>`
- the stop tag defaults to `<lazy-opencode>STOP</lazy-opencode>`
- there is no built-in max iteration limit; stop with `/lazy-loop-cancel` or the stop tag

Example:

```ts
import loopPlugin from "@lazy-opencode/loop";

export default {
  plugins: [loopPlugin()],
};
```

`@lazy-opencode/agents` remains a minimal plugin entrypoint.

### Package layout

```text
packages/
  core/    core package placeholder
  loop/    command-only lazy loop plugin
  agents/  minimal plugin package
```

Each package is an independent ESM TypeScript package with its own `package.json`, `tsconfig.json`, and build config.
