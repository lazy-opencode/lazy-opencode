import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const root = new URL("..", import.meta.url).pathname;
const packages = ["core", "agents", "loop"];

for (const packageDirectoryName of packages) {
  test(`${packageDirectoryName} build output exists and is importable`, async () => {
    const packageDirectory = join(root, "packages", packageDirectoryName);
    const packageJson = JSON.parse(await readFile(join(packageDirectory, "package.json"), "utf8"));

    for (const manifestPath of [
      packageJson.main,
      packageJson.types,
      packageJson.exports["."].import,
      packageJson.exports["."].types,
    ]) {
      assert.equal(typeof manifestPath, "string");
      await access(join(packageDirectory, manifestPath));
    }

    const imported = await import(join(packageDirectory, packageJson.exports["."].import));
    assert.ok(
      Object.keys(imported).length > 0,
      `${packageJson.name} should export at least one value`,
    );
  });
}
