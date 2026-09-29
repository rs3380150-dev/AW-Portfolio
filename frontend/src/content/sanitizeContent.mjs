const demoTestimonialNames = new Set(["lena vogt", "marco bellini", "aisha rahman", "david osei"]);
const demoAchievementTitles = new Set([
  "dj awards - best melodic act",
  "100m+ streams - 'neon cathedral'",
  "mainstage - tomorrowland",
  "resident artist",
  "producer of the year (nominee)",
  "global brand campaign score",
]);
const demoPartners = new Set(["awakenings", "tomorrowland", "ultra", "boiler room", "anjunadeep", "drumcode", "defected", "afterlife"]);
const placeholderHosts = new Set(["spotify.com", "www.spotify.com", "soundcloud.com", "www.soundcloud.com", "music.apple.com", "youtube.com", "www.youtube.com", "example.com", "www.example.com"]);

const isPlaceholderUrl = (value) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return placeholderHosts.has(url.hostname.toLowerCase()) && ["", "/", "/tickets"].includes(url.pathname.replace(/\/$/, "") || "/");
  } catch {
    return false;
  }
};

const sanitizeLinks = (links) => Object.fromEntries(Object.entries(links || {}).filter(([, href]) => href && !isPlaceholderUrl(href)));

export const sanitizeContent = (content) => ({
  ...content,
  site: content.site ? {
    ...content.site,
    streaming: sanitizeLinks(content.site.streaming),
    connectLinks: (content.site.connectLinks || []).filter((link) => link?.href && !isPlaceholderUrl(link.href)),
  } : content.site,
  tracks: (content.tracks || []).map((track) => ({ ...track, links: sanitizeLinks(track.links) })),
  events: (content.events || []).map((event) => ({ ...event, ticket: isPlaceholderUrl(event.ticket) ? "" : event.ticket })),
  testimonials: (content.testimonials || []).filter((item) => !demoTestimonialNames.has(String(item?.name || "").trim().toLowerCase())),
  achievements: (content.achievements || []).filter((item) => !demoAchievementTitles.has(String(item?.title || "").trim().toLowerCase())),
  brandLogos: (content.brandLogos || []).filter((name) => !demoPartners.has(String(name || "").trim().toLowerCase())),
});

export { isPlaceholderUrl };
