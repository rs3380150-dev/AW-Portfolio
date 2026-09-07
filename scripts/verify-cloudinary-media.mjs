import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.resolve(
  scriptDir,
  "../frontend/src/data/cloudinary-media.json",
);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

const assets = Object.entries(manifest.assets);
const failures = [];

const transformations = [
  [/^\/assets\/images\/events\//, "f_auto,q_auto,c_fill,w_1200,h_800"],
  [/^\/assets\/images\/gallery\//, "f_auto,q_auto,c_limit,w_1400"],
  [/^\/assets\/images\/music-covers\//, "f_auto,q_auto,c_fill,w_800,h_800"],
  [/\/images\/site\/hero-poster\./, "f_auto,q_auto,c_fill,w_1920,h_1080"],
  [/\/images\/site\/social-share-og\./, "f_jpg,q_auto,c_fill,w_1200,h_630"],
  [/\/images\/site\/about-portrait\./, "f_auto,q_auto,c_limit,w_1200"],
  [/^\/assets\/images\/testimonials\//, "f_auto,q_auto,c_fill,g_face,w_160,h_160"],
  [/^\/assets\/images\/video-thumbnails\//, "f_auto,q_auto,c_fill,w_960,h_540"],
];

const verifyAsset = async ([localPath, asset]) => {
  const publicId = asset.publicId.split("/").map(encodeURIComponent).join("/");
  const transformation =
    asset.resourceType === "video"
      ? "q_auto:good"
      : transformations.find(([pattern]) => pattern.test(localPath))?.[1] ||
        "f_auto,q_auto";
  const url = `https://res.cloudinary.com/${encodeURIComponent(manifest.cloudName)}/${asset.resourceType}/upload/${transformation}/v${asset.version}/${publicId}.${asset.format}`;
  const response = await fetch(url, { method: "HEAD" });

  if (!response.ok) failures.push(`${localPath}: HTTP ${response.status}`);
};

for (let index = 0; index < assets.length; index += 6) {
  await Promise.all(assets.slice(index, index + 6).map(verifyAsset));
}

if (failures.length) {
  throw new Error(`Cloudinary verification failed:\n${failures.join("\n")}`);
}

console.log(`Verified ${assets.length} optimized Cloudinary delivery URLs.`);
