import { readFile, readdir, rmdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const expectedCount = 37;
if (!process.argv.includes(`--confirm-uploaded=${expectedCount}`)) {
  throw new Error(
    `Cleanup requires --confirm-uploaded=${expectedCount} after Cloudinary verification.`,
  );
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const publicRoot = path.join(projectRoot, "frontend", "public");
const assetsRoot = path.join(publicRoot, "assets");
const manifestPath = path.join(
  projectRoot,
  "frontend",
  "src",
  "data",
  "cloudinary-media.json",
);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const entries = Object.keys(manifest.assets);

if (entries.length !== expectedCount || manifest.assetCount !== expectedCount) {
  throw new Error(
    `Expected ${expectedCount} manifest assets, found ${entries.length}. Cleanup cancelled.`,
  );
}

const targets = entries.map((publicPath) => {
  if (!/^\/assets\/(images|videos)\//.test(publicPath)) {
    throw new Error(`Refusing non-image/video target: ${publicPath}`);
  }

  const absolutePath = path.resolve(publicRoot, publicPath.slice(1));
  const relativeToAssets = path.relative(assetsRoot, absolutePath);
  if (
    !relativeToAssets ||
    relativeToAssets.startsWith("..") ||
    path.isAbsolute(relativeToAssets)
  ) {
    throw new Error(`Refusing target outside public assets: ${absolutePath}`);
  }

  return absolutePath;
});

for (const target of targets) {
  const targetStat = await stat(target);
  if (!targetStat.isFile()) throw new Error(`Expected a file: ${target}`);
}

for (const target of targets) await unlink(target);

const candidateDirectories = [
  "images/events",
  "images/gallery",
  "images/music-covers",
  "images/site",
  "images/testimonials",
  "images/video-thumbnails",
  "videos/hero",
  "videos",
].map((directory) => path.join(assetsRoot, directory));

for (const directory of candidateDirectories) {
  try {
    if ((await readdir(directory)).length === 0) await rmdir(directory);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

console.log(`Removed ${targets.length} verified Cloudinary-backed local files.`);

