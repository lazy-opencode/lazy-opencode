# lazy-opencode

pnpm monorepo for the `@lazy-opencode` plugin suite.

## Packages

- `@lazy-opencode/core` — shared package placeholder
- `@lazy-opencode/loop` — command-only lazy loop plugin
- `@lazy-opencode/agents` — Producer-first agent catalog plugin

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

- `/lazy-loop <prompt>` starts a session-local loop
- `/lazy-loop-cancel` stops the active loop for that session
- `/lazy-loop-status` reports state
- loop state is stored per session in `.lazy-opencode/loop/sessions/<session-id>.json`
- multiple sessions can run lazy loops at the same time without overwriting each other
- prompts are stored as written, including multiline prompts when opencode passes multiline command arguments
- loop continuation messages include the original user prompt for context
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

`@lazy-opencode/agents` registers Producer as the default primary agent, disables opencode's built-in primary agents, and exposes the rest of the 765PRO-inspired catalog as specialist idol subagents.

Agent catalog: `producer`, `kotori`, `haruka`, `chihaya`, `miki`, `yukiho`, `yayoi`, `makoto`, `iori`, `hibiki`, `azusa`, `ami`, `mami`, `ritsuko`, and `takane`.

It also registers `/idols-debut`, a Producer-run command that asks the 13 debut-enabled lazy-opencode idols to report once and summarizes the readiness results. `kotori` is intentionally excluded from debut pings. Agent names are lowercase as part of this package's public interface, and each catalog entry stores English, Japanese, and Chinese names.

### Package layout

```text
packages/
  core/    core package placeholder
  loop/    command-only lazy loop plugin
  agents/  Producer-first agent catalog plugin
```

Each package is an independent ESM TypeScript package with its own `package.json`, `tsconfig.json`, and build config.
