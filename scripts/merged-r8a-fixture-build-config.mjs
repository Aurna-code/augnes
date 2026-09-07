import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export const MERGED_R8A_COMMIT =
  "e3a35bb36457d5444e7601ba5e8ed416c9bf7c3a";
export const MERGED_R8A_TREE = "aef09f2e88096fc553755b8c7e3ddc814353e023";
export const MERGED_R8A_BUILD_ID = "augnes-r8a-e3a35bb36457";
const CONFIG_PATH = "next.config.ts";
const ORIGINAL_CONFIG = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
`;
const CONTROLLED_CONFIG = ORIGINAL_CONFIG.replace(
  '  output: "standalone",',
  `  output: "standalone",\n  generateBuildId: async () => "${MERGED_R8A_BUILD_ID}",`,
);

// Apply only after the caller verifies and extracts this exact Git commit/tree.
// Next 16.2.4's random build ID can start with "-", which the historical
// package validator rejects in a nested path. Control this build input while
// retaining that validator and the real historical package/runtime. This is
// historical source with controlled build configuration, not untouched source
// or a promise of reproducible artifact bytes.
export function applyMergedR8AFixtureBuildConfig({ sourceRoot, commit, tree }) {
  assert.equal(commit, MERGED_R8A_COMMIT);
  assert.equal(tree, MERGED_R8A_TREE);
  const configPath = path.join(sourceRoot, CONFIG_PATH);
  assert(lstatSync(configPath).isFile(), "historical config must be a regular file");
  assert.equal(readFileSync(configPath, "utf8"), ORIGINAL_CONFIG,
    "historical next.config.ts preimage changed");
  writeFileSync(configPath, CONTROLLED_CONFIG);
  return {
    source_commit: commit,
    source_tree: tree,
    configuration: "historical source with controlled build configuration",
    overlay_path: CONFIG_PATH,
    overlay_delta: `generateBuildId: async () => "${MERGED_R8A_BUILD_ID}"`,
    original_config_sha256: sha256(ORIGINAL_CONFIG),
    effective_config_sha256: sha256(CONTROLLED_CONFIG),
    next_build_id: MERGED_R8A_BUILD_ID,
  };
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
