import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeContent } from "../src/content/sanitizeContent.mjs";

test("removes known demo claims and generic placeholder links", () => {
  const result = sanitizeContent({
    site: { streaming: { spotify: "https://spotify.com", instagram: "https://instagram.com/achyutwadhwa" }, connectLinks: [{ label: "Spotify", href: "https://spotify.com" }] },
    tracks: [{ id: "real", links: { spotify: "https://open.spotify.com/track/123", youtube: "https://youtube.com" } }],
    events: [{ id: "e1", ticket: "https://example.com/tickets" }],
    testimonials: [{ name: "Lena Vogt" }, { name: "Verified Client" }],
    achievements: [{ title: "Mainstage - Tomorrowland" }, { title: "Verified Award" }],
    brandLogos: ["Awakenings", "Verified Partner"],
  });
  assert.deepEqual(Object.keys(result.site.streaming), ["instagram"]);
  assert.deepEqual(Object.keys(result.tracks[0].links), ["spotify"]);
  assert.equal(result.events[0].ticket, "");
  assert.deepEqual(result.testimonials.map((item) => item.name), ["Verified Client"]);
  assert.deepEqual(result.achievements.map((item) => item.title), ["Verified Award"]);
  assert.deepEqual(result.brandLogos, ["Verified Partner"]);
});
