import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const referenceFiles = [
  "index.html",
  "src/index.css",
  "src/data/events.js",
  "src/data/gallery.js",
  "src/data/press.js",
  "src/data/seo.js",
  "src/data/site.js",
  "src/data/tracks.js",
  "src/data/videos.js",
  "src/components/Hero.jsx",
];

const cloudinaryManifest = JSON.parse(
  readFileSync(resolve(projectRoot, "src/data/cloudinary-media.json"), "utf8"),
);

const readPngSize = (file) => {
  const bytes = readFileSync(resolve(projectRoot, "public", file));
  assert.equal(bytes.toString("ascii", 1, 4), "PNG", `${file} must be a PNG`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
};

test("Cloudinary-backed media references exist in the upload manifest", () => {
  const references = referenceFiles.flatMap((file) => {
    const source = readFileSync(resolve(projectRoot, file), "utf8");
    return [...source.matchAll(/["'](\/assets\/[^"']+)["']/g)].map((match) => ({
      file,
      publicPath: match[1],
    }));
  });

  const remoteMedia = references.filter(({ publicPath }) =>
    /^\/assets\/(images|videos)\//.test(publicPath),
  );

  assert.equal(cloudinaryManifest.assetCount, 41);
  for (const reference of remoteMedia) {
    assert.ok(
      cloudinaryManifest.assets[reference.publicPath],
      `Missing Cloudinary manifest entry for ${reference.publicPath} referenced by ${reference.file}`,
    );
  }
});

test("referenced local audio previews exist", () => {
  const references = referenceFiles.flatMap((file) => {
    const source = readFileSync(resolve(projectRoot, file), "utf8");
    return [...source.matchAll(/["'](\/assets\/audio\/[^"']+)["']/g)].map(
      (match) => ({ file, publicPath: match[1] }),
    );
  });

  for (const reference of references) {
    const diskPath = resolve(projectRoot, "public", reference.publicPath.slice(1));
    assert.ok(
      existsSync(diskPath) && readFileSync(diskPath).length > 0,
      `Missing or empty asset ${reference.publicPath} referenced by ${reference.file}`,
    );
  }
});

test("favicon assets use valid square dimensions", () => {
  const expectedSizes = {
    "favicon-48x48.png": 48,
    "favicon-96x96.png": 96,
    "favicon-192x192.png": 192,
    "favicon-512x512.png": 512,
    "favicon.png": 512,
    "apple-touch-icon.png": 180,
  };

  for (const [file, size] of Object.entries(expectedSizes)) {
    assert.deepEqual(readPngSize(file), { width: size, height: size });
  }

  const icoPath = resolve(projectRoot, "public/favicon.ico");
  assert.ok(existsSync(icoPath) && readFileSync(icoPath).length > 0, "Missing favicon.ico");
});
