import { createRequire } from "node:module";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const frontendRoot = path.join(projectRoot, "frontend");
const assetsRoot = path.join(frontendRoot, "public", "assets");
const envPath = path.join(frontendRoot, ".env");
const outputPath = path.join(frontendRoot, "src", "data", "cloudinary-media.json");

const requireFromFrontend = createRequire(path.join(frontendRoot, "package.json"));
const { v2: cloudinary } = requireFromFrontend("cloudinary");

const uploadDirectories = [
  "images/events",
  "images/gallery",
  "images/music-covers",
  "images/site",
  "images/testimonials",
  "images/video-thumbnails",
  "videos/hero",
];

const parseEnv = (source) => {
  const values = {};

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[match[1]] = value;
  }

  return values;
};

const listFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(fullPath)));
    if (entry.isFile()) files.push(fullPath);
  }

  return files;
};

const toPosixPath = (value) => value.split(path.sep).join("/");

const getUploadDetails = (absolutePath) => {
  const relativePath = toPosixPath(path.relative(assetsRoot, absolutePath));
  const extension = path.extname(relativePath).slice(1).toLowerCase();
  const withoutExtension = relativePath.slice(0, -path.extname(relativePath).length);
  const resourceType = relativePath.startsWith("videos/") ? "video" : "image";
  const videoSuffix = resourceType === "video" ? `-${extension}` : "";

  return {
    absolutePath,
    localPath: `/assets/${relativePath}`,
    publicId: `nova-pulse/${withoutExtension}${videoSuffix}`,
    resourceType,
  };
};

const env = parseEnv(await readFile(envPath, "utf8"));
const requiredKeys = [
  "CLOUDINARY_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const missingKeys = requiredKeys.filter((key) => !env[key]);

if (missingKeys.length) {
  throw new Error(`Missing Cloudinary variables: ${missingKeys.join(", ")}`);
}

cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const files = (
  await Promise.all(
    uploadDirectories.map((directory) => listFiles(path.join(assetsRoot, directory))),
  )
)
  .flat()
  .map(getUploadDetails)
  .sort((a, b) => a.localPath.localeCompare(b.localPath));

const assets = {};

for (const [index, file] of files.entries()) {
  process.stdout.write(`[${index + 1}/${files.length}] ${file.localPath} ... `);

  const result = await cloudinary.uploader.upload(file.absolutePath, {
    resource_type: file.resourceType,
    public_id: file.publicId,
    overwrite: true,
    invalidate: true,
    unique_filename: false,
    use_filename: false,
    tags: ["nova-pulse", "website-media"],
  });

  assets[file.localPath] = {
    resourceType: result.resource_type,
    publicId: result.public_id,
    format: result.format,
    version: result.version,
    bytes: result.bytes,
  };

  process.stdout.write("uploaded\n");
}

const manifest = {
  cloudName: env.CLOUDINARY_NAME,
  generatedAt: new Date().toISOString(),
  assetCount: Object.keys(assets).length,
  assets,
};

await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`Cloudinary manifest written with ${manifest.assetCount} assets.`);

