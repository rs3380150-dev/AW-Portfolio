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
];

const cloudinaryManifest = JSON.parse(
  readFileSync(resolve(projectRoot, "src/data/cloudinary-media.json"), "utf8"),
);

test("Cloudinary-backed media references exist in the upload manifest", () => {
  const references = referenceFiles.flatMap((file) => {
    const source = readFileSync(resolve(projectRoot, file), "utf8");
    return [...source.matchAll(/["'](\/assets\/[^"']+)["']/g)].map((match) => ({
      file,
      publicPath: match[1],
    }));
  });

  const remoteMedia = references.filter(({ publicPath }) =>
    /^\/assets\/(images|videos)\//.test(publicPath) &&
    publicPath !== "/assets/images/ui/grain-texture.svg",
  );

  assert.equal(cloudinaryManifest.assetCount, 37);
  assert.ok(remoteMedia.length >= 35, "Expected image and hero-video Cloudinary references");

  for (const reference of remoteMedia) {
    assert.ok(
      cloudinaryManifest.assets[reference.publicPath],
      `Missing Cloudinary manifest entry for ${reference.publicPath} referenced by ${reference.file}`,
    );
  }
});

test("media intentionally kept local still exists", () => {
  const references = referenceFiles.flatMap((file) => {
    const source = readFileSync(resolve(projectRoot, file), "utf8");
    return [...source.matchAll(/["'](\/assets\/(?:audio|images\/ui)\/[^"']+)["']/g)].map(
      (match) => ({ file, publicPath: match[1] }),
    );
  });

  assert.ok(references.length >= 7, "Expected local demo audio and UI texture references");

  for (const reference of references) {
    const diskPath = resolve(projectRoot, "public", reference.publicPath.slice(1));
    assert.ok(
      existsSync(diskPath) && readFileSync(diskPath).length > 0,
      `Missing or empty asset ${reference.publicPath} referenced by ${reference.file}`,
    );
  }
});
