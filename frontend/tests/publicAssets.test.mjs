import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("every local public asset reference points to an existing file", () => {
  const references = referenceFiles.flatMap((file) => {
    const source = readFileSync(resolve(projectRoot, file), "utf8");
    return [...source.matchAll(/["'](\/assets\/[^"']+)["']/g)].map((match) => ({
      file,
      publicPath: match[1],
    }));
  });

  assert.ok(references.length >= 40, "Expected the website to use the organized public asset library");

  for (const reference of references) {
    const diskPath = resolve(projectRoot, "public", reference.publicPath.slice(1));
    assert.ok(
      readFileSync(diskPath).length > 0,
      `Missing or empty asset ${reference.publicPath} referenced by ${reference.file}`,
    );
  }
});
