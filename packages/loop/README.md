# @lazy-opencode/loop

A conservative opencode plugin inspired by loop-style workflows.

## Highlights

- project-local state stored in `.opencode/lazy-loop.local.md`
- completion tag: `<lazy-opencode>DONE</lazy-opencode>`
- loop and cancel tools
- slash-command registration via the config hook when supported

## Example

```ts
import loopPlugin from "@lazy-opencode/loop";

export default {
  plugins: [loopPlugin()],
};
```
