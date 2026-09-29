const isBlank = (value) => typeof value !== "string" || !value.trim();
const isWebUrl = (value, { allowRelative = false } = {}) => {
  if (isBlank(value)) return false;
  if (allowRelative && value.startsWith("/")) return true;
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

const requiredBySection = {
  manifesto: ["n", "title", "body"],
  tracks: ["id", "slug", "title", "releaseDate", "genre", "category", "description", "cover", "audio"],
  events: ["id", "name", "venue", "city", "country", "date", "time", "status", "type", "poster"],
  gallery: ["id", "category", "src", "alt"],
  videos: ["id", "title", "category", "duration", "thumbnail"],
  services: ["id", "icon", "title", "description"],
  testimonials: ["id", "name", "role", "quote", "avatar"],
  achievements: ["id", "year", "title", "org"],
  skills: ["name", "level"],
  timeline: ["year", "title", "body"],
};

const mediaFields = {
  tracks: ["cover", "audio", "heroImage"],
  events: ["poster"],
  gallery: ["src"],
  videos: ["thumbnail", "videoUrl"],
  testimonials: ["avatar"],
};

const add = (errors, path, message) => errors.push({ path, message });

export const validateSection = (sectionKey, content) => {
  const errors = [];
  if (["influences", "mediaFeatures", "brandLogos"].includes(sectionKey)) {
    if (!Array.isArray(content)) return [{ path: sectionKey, message: "This section must be a list." }];
    const seen = new Set();
    content.forEach((item, index) => {
      if (isBlank(item)) add(errors, `${index}`, "Value cannot be empty.");
      const normalized = String(item || "").trim().toLowerCase();
      if (normalized && seen.has(normalized)) add(errors, `${index}`, "Duplicate value.");
      seen.add(normalized);
    });
    return errors;
  }

  if (sectionKey === "site") {
    if (!content || typeof content !== "object" || Array.isArray(content)) return [{ path: "site", message: "Site settings are invalid." }];
    ["name", "siteUrl", "email", "role"].forEach((field) => {
      if (isBlank(content[field])) add(errors, field, "Required field.");
    });
    if (content.siteUrl && !isWebUrl(content.siteUrl)) add(errors, "siteUrl", "Enter a complete http(s) website URL.");
    if (content.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.email)) add(errors, "email", "Enter a valid email address.");
    return errors;
  }

  if (!Array.isArray(content)) return [{ path: sectionKey, message: "This section must be a list." }];
  const required = requiredBySection[sectionKey] || [];
  const ids = new Set();
  const slugs = new Set();

  content.forEach((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      add(errors, `${index}`, "Entry is invalid.");
      return;
    }
    required.forEach((field) => {
      if (item[field] === undefined || item[field] === null || item[field] === "") add(errors, `${index}.${field}`, "Required field.");
    });
    if (item.id) {
      if (ids.has(item.id)) add(errors, `${index}.id`, "ID must be unique.");
      ids.add(item.id);
    }
    if (sectionKey === "tracks") {
      if (item.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) add(errors, `${index}.slug`, "Use lowercase letters, numbers and hyphens only.");
      if (item.slug && slugs.has(item.slug)) add(errors, `${index}.slug`, "Slug must be unique.");
      if (item.slug) slugs.add(item.slug);
      if (item.releaseDate && Number.isNaN(Date.parse(item.releaseDate))) add(errors, `${index}.releaseDate`, "Enter a valid release date.");
      if (item.links && typeof item.links === "object") Object.entries(item.links).forEach(([name, url]) => {
        if (url && !isWebUrl(url)) add(errors, `${index}.links.${name}`, "Enter a complete http(s) URL.");
      });
    }
    if (sectionKey === "events") {
      if (item.date) {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(item.date);
        const parsed = match ? new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))) : null;
        if (!match || parsed.getUTCFullYear() !== Number(match[1]) || parsed.getUTCMonth() !== Number(match[2]) - 1 || parsed.getUTCDate() !== Number(match[3])) add(errors, `${index}.date`, "Use a valid calendar date.");
      }
      if (item.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time)) add(errors, `${index}.time`, "Use a valid 24-hour time.");
      if (item.status && !["upcoming", "sold-out", "completed", "cancelled"].includes(item.status)) add(errors, `${index}.status`, "Choose a supported event status.");
      if (item.ticket && !isWebUrl(item.ticket)) add(errors, `${index}.ticket`, "Enter a complete http(s) ticket URL.");
    }
    if (sectionKey === "videos" && !item.youtubeId && !item.videoUrl) add(errors, `${index}.videoUrl`, "Add either a YouTube ID or direct video URL.");
    if (sectionKey === "skills" && (!Number.isFinite(item.level) || item.level < 0 || item.level > 100)) add(errors, `${index}.level`, "Skill level must be between 0 and 100.");
    (mediaFields[sectionKey] || []).forEach((field) => {
      if (item[field] && !isWebUrl(item[field], { allowRelative: true })) add(errors, `${index}.${field}`, "Enter a complete http(s) URL or a /relative path.");
    });
  });
  return errors;
};

export const describeValidationPath = (path) => String(path)
  .replace(/^(\d+)\./, (_match, index) => `Entry ${Number(index) + 1} · `)
  .replace(/\.([^.]+)$/, " · $1")
  .replace(/([A-Z])/g, " $1")
  .replace(/^./, (character) => character.toUpperCase());
