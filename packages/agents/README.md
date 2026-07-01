# @lazy-opencode/agents

Producer-first agent catalog plugin for opencode.

## Behavior

- registers `producer` as the default primary agent
- disables the built-in `build`, `plan`, `explore`, and `general` agents
- registers the rest of the catalog as `subagent` idols
- registers `/idols-debut` as a Producer-run command that pings debut-enabled lazy-opencode idols
- keeps Producer responsible for understanding the user's goal, dispatching the right idols, and integrating the final response
- stores each idol's English, Japanese, and Chinese names in the catalog

Agent keys are lowercase for consistency with opencode agent files, command usage, and future compatibility. The opencode JSON schema allows arbitrary agent object keys, but this package treats lowercase names as part of the public interface.

## Catalog

- `producer` — 制作人 / プロデューサー — primary orchestrator and final answer integrator
- `kotori` — Kotori Otonashi / 音無小鳥 / 音无小鸟 — docs, archive, references, handoff, project memory, and migration notes
- `haruka` — Haruka Amami / 天海春香 / 天海春香 — ordinary low-risk single-step tasks
- `chihaya` — Chihaya Kisaragi / 如月千早 / 如月千早 — correctness, fact-checking, test strategy, edge cases, and performance evidence
- `miki` — Miki Hoshii / 星井美希 / 星井美希 — visual aesthetics, UI polish, layout, color, presentation, and charm
- `yukiho` — Yukiho Hagiwara / 萩原雪歩 / 萩原雪步 — risk, safety, permissions, secrets, deployment risk, and irreversible operations
- `yayoi` — Yayoi Takatsuki / 高槻やよい / 高槻弥生 — MVP, cost, scope, dependency control, and anti-overengineering
- `makoto` — Makoto Kikuchi / 菊地真 / 菊地真 — quick execution, bounded fixes, tests, checks, and validation
- `iori` — Iori Minase / 水瀬伊織 / 水濑伊织 — strict review, quality gate, maintainability, and final critique
- `hibiki` — Hibiki Ganaha / 我那覇響 / 我那霸响 — codebase and environment reconnaissance
- `azusa` — Azusa Miura / 三浦あずさ / 三浦梓 — gentle synthesis, UX empathy, clarification, and user-facing explanation
- `ami` — Ami Futami / 双海亜美 / 双海亚美 — prototype, experiment, and disposable proof-of-concept work
- `mami` — Mami Futami / 双海真美 / 双海真美 — alternatives, variants, options, and style comparisons
- `ritsuko` — Ritsuko Akizuki / 秋月律子 / 秋月律子 — planning, priorities, task decomposition, release flow, and CI/CD checklists
- `takane` — Takane Shijou / 四条貴音 / 四条贵音 — architecture, system boundaries, long-term strategy, and tradeoffs

## Commands

- `/idols-debut` — ask the 13 debut-enabled lazy-opencode idols to report once, then have Producer summarize expected idols, reported idols, missing/failing idols, and a concise readiness table. `kotori` is intentionally excluded from debut pings.

## Example

```ts
import agentsPlugin from "@lazy-opencode/agents";

export default {
  plugins: [agentsPlugin()],
};
```
