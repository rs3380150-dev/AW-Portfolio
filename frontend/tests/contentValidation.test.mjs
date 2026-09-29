import assert from "node:assert/strict";
import test from "node:test";
import { validateSection } from "../src/admin/contentValidation.mjs";

test("rejects duplicate track slugs and malformed URLs", () => {
  const track = { id: "t1", slug: "same", title: "One", releaseDate: "2026-04-20", genre: "Electronic", category: "original", description: "Description", cover: "/cover.jpg", audio: "/audio.mp3", links: { spotify: "spotify.com" } };
  const errors = validateSection("tracks", [track, { ...track, id: "t2", title: "Two" }]);
  assert.ok(errors.some((error) => error.path === "1.slug"));
  assert.ok(errors.some((error) => error.path === "0.links.spotify"));
});

test("accepts a valid event and rejects an impossible status", () => {
  const event = { id: "e1", name: "Show", venue: "Venue", city: "Delhi", country: "India", date: "2026-10-01", time: "21:30", status: "upcoming", type: "club", poster: "/poster.jpg", ticket: "https://example.com" };
  assert.deepEqual(validateSection("events", [event]), []);
  assert.ok(validateSection("events", [{ ...event, status: "maybe" }]).length);
});

test("does not allow blank or duplicate primitive entries", () => {
  assert.equal(validateSection("brandLogos", ["Festival", " festival ", ""]).length, 2);
});
