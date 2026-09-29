import assert from "node:assert/strict";
import test from "node:test";
import { buildSitemapXml } from "../api/sitemap.mjs";

test("sitemap includes valid published tracks and removes duplicates", () => {
  const xml = buildSitemapXml({
    publishedAt: "2026-09-30T10:00:00.000Z",
    tracks: [
      { slug: "obscura", releaseDate: "April 20, 2026" },
      { slug: "obscura", releaseDate: "2026-04-20" },
      { slug: "Invalid Slug", releaseDate: "not-a-date" },
      { slug: "", releaseDate: "2026-01-01" },
    ],
  });

  assert.match(xml, /https:\/\/achyutwadhwa\.in\/music\/obscura/);
  assert.equal((xml.match(/music\/obscura/g) || []).length, 1);
  assert.doesNotMatch(xml, /Invalid Slug/);
  assert.match(xml, /<lastmod>2026-04-20<\/lastmod>/);
});

test("sitemap remains valid when CMS data is unavailable", () => {
  const xml = buildSitemapXml({ generatedAt: new Date("2026-09-30T00:00:00.000Z") });
  assert.match(xml, /<loc>https:\/\/achyutwadhwa\.in\/<\/loc>/);
  assert.match(xml, /<loc>https:\/\/achyutwadhwa\.in\/contact<\/loc>/);
  assert.doesNotMatch(xml, /\/music\/undefined/);
});
