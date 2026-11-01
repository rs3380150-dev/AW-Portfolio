import assert from "node:assert/strict";
import test from "node:test";
import { mergeTracks } from "../src/content/mergeTracks.mjs";

test("merges verified releases with CMS tracks and keeps the verified release first", () => {
  const tracks = mergeTracks(
    [{ id: "kinesis", slug: "kinesis", title: "Kinesis", featuredOnHome: true }],
    [{ id: "obscura", slug: "obscura", title: "Obscura", featuredOnHome: true }],
  );

  assert.deepEqual(tracks.map((track) => track.slug), ["kinesis", "obscura"]);
  assert.equal(tracks[0].featuredOnHome, true);
  assert.equal(tracks[1].featuredOnHome, false);
});

test("lets a CMS version override the verified release without duplicating it", () => {
  const tracks = mergeTracks(
    [{ id: "kinesis", slug: "kinesis", title: "Kinesis", genre: "Deep House" }],
    [{ id: "cms-kinesis", slug: "kinesis", title: "Kinesis (Updated)", genre: "House" }],
  );

  assert.equal(tracks.length, 1);
  assert.equal(tracks[0].title, "Kinesis (Updated)");
  assert.equal(tracks[0].genre, "House");
});
