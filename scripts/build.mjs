import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const rootDir = path.resolve(process.cwd());
const distDir = path.join(rootDir, "dist");
const assetsToCopy = ["index.html", "css", "js", "pict"];

async function copyAsset(assetName) {
  const sourcePath = path.join(rootDir, assetName);
  const targetPath = path.join(distDir, assetName);

  await cp(sourcePath, targetPath, {
    recursive: true,
    force: true,
    dereference: true,
  });
}

async function main() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  for (const asset of assetsToCopy) {
    await copyAsset(asset);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});