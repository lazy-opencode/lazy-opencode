import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = new URL("..", import.meta.url).pathname;
const packages = ["core", "agents", "loop"];

test("packed packages install into a temporary ESM TypeScript consumer", async () => {
  const tempDirectory = await mkdtemp(join(tmpdir(), "lazy-opencode-pack-consumer-"));

  try {
    const tarballs = [];

    for (const packageDirectoryName of packages) {
      const { stdout } = await execFileAsync(
        "pnpm",
        [
          "--filter",
          `@lazy-opencode/${packageDirectoryName}`,
          "pack",
          "--pack-destination",
          tempDirectory,
        ],
        {
          cwd: root,
        },
      );
      const tarball = stdout.trim().split(/\r?\n/).at(-1);
      assert.ok(tarball, `pnpm pack should print a tarball for ${packageDirectoryName}`);
      tarballs.push(isAbsolute(tarball) ? tarball : join(tempDirectory, tarball));
    }

    const [coreTarball, ...dependentTarballs] = tarballs;
    assert.ok(coreTarball);

    await writeFile(
      join(tempDirectory, "package.json"),
      JSON.stringify({ private: true, type: "module" }, null, 2),
      "utf8",
    );
    await writeFile(
      join(tempDirectory, "pnpm-workspace.yaml"),
      ["packages: []", "overrides:", `  \"@lazy-opencode/core\": \"file:${coreTarball}\"`, ""].join(
        "\n",
      ),
      "utf8",
    );
    await writeFile(
      join(tempDirectory, "consumer.mjs"),
      [
        "import { lazyOpencodeCore } from '@lazy-opencode/core';",
        "import agentsPlugin, { lazyAgentsPlugin } from '@lazy-opencode/agents';",
        "import loopPlugin from '@lazy-opencode/loop';",
        "if (lazyOpencodeCore.name !== '@lazy-opencode/core') throw new Error('bad core export');",
        "if (typeof agentsPlugin !== 'function') throw new Error('bad agents default export');",
        "if (typeof lazyAgentsPlugin !== 'function') throw new Error('bad agents named export');",
        "if (typeof loopPlugin !== 'function') throw new Error('bad loop default export');",
      ].join("\n"),
      "utf8",
    );
    await writeFile(
      join(tempDirectory, "consumer.ts"),
      [
        "import agentsPlugin from '@lazy-opencode/agents';",
        "import { lazyOpencodeCore } from '@lazy-opencode/core';",
        "import loopPlugin from '@lazy-opencode/loop';",
        "const coreName: '@lazy-opencode/core' = lazyOpencodeCore.name;",
        "void coreName;",
        "void agentsPlugin;",
        "void loopPlugin;",
      ].join("\n"),
      "utf8",
    );
    await writeFile(
      join(tempDirectory, "tsconfig.json"),
      JSON.stringify(
        {
          extends: join(root, "tsconfig.base.json"),
          compilerOptions: { noEmit: true },
          include: ["consumer.ts"],
        },
        null,
        2,
      ),
      "utf8",
    );

    await execFileAsync(
      "pnpm",
      [
        "add",
        "--ignore-scripts",
        coreTarball,
        "@opencode-ai/plugin@latest",
        "@types/node@26.0.1",
        "typescript@7.0.1-rc",
      ],
      {
        cwd: tempDirectory,
      },
    );
    await execFileAsync("pnpm", ["add", "--ignore-scripts", ...dependentTarballs], {
      cwd: tempDirectory,
    });
    await execFileAsync("node", ["consumer.mjs"], { cwd: tempDirectory });
    await execFileAsync("pnpm", ["exec", "tsc", "-p", "tsconfig.json"], { cwd: tempDirectory });
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
});
