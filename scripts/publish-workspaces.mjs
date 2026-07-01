import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const root = new URL("..", import.meta.url).pathname;

export const publishablePackages = [
  { shortName: "core", name: "@lazy-opencode/core", directory: "packages/core" },
  { shortName: "agents", name: "@lazy-opencode/agents", directory: "packages/agents" },
  { shortName: "loop", name: "@lazy-opencode/loop", directory: "packages/loop" },
];

export function parsePublishArgs(argv) {
  const options = { mode: "dry-run", packageName: "all" };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      continue;
    }

    if (arg === "--dry-run") {
      options.mode = "dry-run";
      continue;
    }

    if (arg === "--publish") {
      options.mode = "publish";
      continue;
    }

    if (arg === "--package") {
      options.packageName = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.packageName) {
    throw new Error("--package requires a value");
  }

  return options;
}

export function selectPackages(packageName) {
  if (packageName === "all") {
    return publishablePackages;
  }

  const selected = publishablePackages.find(
    (pkg) => pkg.shortName === packageName || pkg.name === packageName,
  );

  if (!selected) {
    throw new Error(
      `Unknown package '${packageName}'. Expected one of: all, ${publishablePackages.map((pkg) => pkg.shortName).join(", ")}`,
    );
  }

  if (selected.shortName === "agents" || selected.shortName === "loop") {
    return [publishablePackages[0], selected];
  }

  return [selected];
}

export function validatePackageManifest(pkg, manifest, { mode }) {
  if (manifest.name !== pkg.name) {
    throw new Error(`${pkg.directory}/package.json has unexpected name ${manifest.name}`);
  }

  if (manifest.private !== false) {
    throw new Error(`${pkg.name} must be publishable with private: false`);
  }

  if (manifest.publishConfig?.access !== "public") {
    throw new Error(`${pkg.name} must set publishConfig.access to public`);
  }

  if (
    typeof manifest.version !== "string" ||
    !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(manifest.version)
  ) {
    throw new Error(`${pkg.name} has invalid semver version '${manifest.version}'`);
  }

  if (mode === "publish" && manifest.version === "0.0.0") {
    throw new Error(
      `${pkg.name} is still version 0.0.0; choose a real release version before publishing`,
    );
  }
}

async function npmVersionExists(name, version) {
  try {
    await execFileAsync("npm", ["view", `${name}@${version}`, "version"], { cwd: root });
    return true;
  } catch {
    return false;
  }
}

export async function publishWorkspaces(options) {
  if (options.mode === "publish" && process.env.GITHUB_ACTIONS !== "true") {
    throw new Error("Refusing to publish outside GitHub Actions. Use --dry-run locally.");
  }

  if (options.mode === "publish" && process.env.GITHUB_REF !== "refs/heads/main") {
    throw new Error(
      "Refusing to publish from a non-main ref. Real npm publish requires refs/heads/main.",
    );
  }

  const selectedPackages = selectPackages(options.packageName);
  const published = [];
  const skipped = [];

  for (const pkg of selectedPackages) {
    const manifest = JSON.parse(await readFile(join(root, pkg.directory, "package.json"), "utf8"));
    validatePackageManifest(pkg, manifest, { mode: options.mode });

    if (await npmVersionExists(pkg.name, manifest.version)) {
      skipped.push({ name: pkg.name, version: manifest.version, reason: "already-published" });
      continue;
    }

    const publishArgs = ["--filter", pkg.name, "publish", "--access", "public", "--no-git-checks"];

    if (options.mode === "dry-run") {
      publishArgs.push("--dry-run");
    } else if (process.env.GITHUB_ACTIONS === "true") {
      publishArgs.push("--provenance");
    }

    await execFileAsync("pnpm", publishArgs, { cwd: root, env: process.env });
    published.push({ name: pkg.name, version: manifest.version, mode: options.mode });
  }

  const summary = { mode: options.mode, published, skipped };
  await writeFile(
    join(root, "release-summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
    "utf8",
  );

  return summary;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const summary = await publishWorkspaces(parsePublishArgs(process.argv.slice(2)));
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
