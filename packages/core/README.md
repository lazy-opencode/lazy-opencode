# @lazy-opencode/core

Shared utilities for lazy opencode plugin suites.

## Includes

- typed plugin helper utilities
- command registration helpers
- project-local state path helpers
- markdown + YAML-frontmatter serialization/parsing
- session prompt/message client wrappers
- basic agent definition data structures

## Example

```ts
import {
  definePlugin,
  registerCommands,
  resolveProjectLocalStatePath,
  serializeMarkdownFrontmatter,
} from "@lazy-opencode/core";
```
