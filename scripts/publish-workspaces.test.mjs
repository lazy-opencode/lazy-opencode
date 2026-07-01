import { test } from "node:test";
import assert from "node:assert/strict";

import {
  parsePublishArgs,
  publishWorkspaces,
  publishablePackages,
  selectPackages,
  validatePackageManifest,
} from "./publish-workspaces.mjs";

test("publishable package list is in dependency-safe order", () => {
  assert.deepEqual(
    publishablePackages.map((pkg) => pkg.shortName),
    ["core", "agents", "loop"],
  );
});

test("parsePublishArgs supports dry-run, publish, and package selection", () => {
  assert.deepEqual(parsePublishArgs([]), { mode: "dry-run", packageName: "all" });
  assert.deepEqual(parsePublishArgs(["--publish", "--package", "loop"]), {
    mode: "publish",
    packageName: "loop",
  });
  assert.deepEqual(parsePublishArgs(["--", "--package", "agents"]), {
    mode: "dry-run",
    packageName: "agents",
  });
});

test("selectPackages supports all and individual packages", () => {
  assert.equal(selectPackages("all").length, 3);
  assert.deepEqual(
    selectPackages("core").map((pkg) => pkg.name),
    ["@lazy-opencode/core"],
  );
  assert.deepEqual(
    selectPackages("agents").map((pkg) => pkg.name),
    ["@lazy-opencode/core", "@lazy-opencode/agents"],
  );
  assert.deepEqual(
    selectPackages("loop").map((pkg) => pkg.name),
    ["@lazy-opencode/core", "@lazy-opencode/loop"],
  );
  assert.throws(() => selectPackages("missing"), /Unknown package/);
});

test("validatePackageManifest rejects unsafe publish manifests", () => {
  const pkg = publishablePackages[0];
  assert.ok(pkg);
  const manifest = {
    name: pkg.name,
    version: "0.1.0",
    private: false,
    publishConfig: { access: "public" },
  };

  assert.doesNotThrow(() => validatePackageManifest(pkg, manifest, { mode: "dry-run" }));
  assert.throws(
    () => validatePackageManifest(pkg, { ...manifest, version: "0.0.0" }, { mode: "publish" }),
    /0\.0\.0/,
  );
  assert.throws(
    () => validatePackageManifest(pkg, { ...manifest, private: true }, { mode: "dry-run" }),
    /private: false/,
  );
});

test("publishWorkspaces refuses real publish outside GitHub Actions main", async () => {
  const originalGithubActions = process.env.GITHUB_ACTIONS;
  const originalGithubRef = process.env.GITHUB_REF;

  try {
    delete process.env.GITHUB_ACTIONS;
    await assert.rejects(
      publishWorkspaces({ mode: "publish", packageName: "core" }),
      /outside GitHub Actions/,
    );

    process.env.GITHUB_ACTIONS = "true";
    process.env.GITHUB_REF = "refs/heads/feature";
    await assert.rejects(
      publishWorkspaces({ mode: "publish", packageName: "core" }),
      /non-main ref/,
    );
  } finally {
    restoreEnv("GITHUB_ACTIONS", originalGithubActions);
    restoreEnv("GITHUB_REF", originalGithubRef);
  }
});

function restoreEnv(name, value) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}
