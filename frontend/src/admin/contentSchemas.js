export const sectionDefinitions = [
  { key: "site", label: "Site settings", description: "Brand, contact, social, hero and global website settings.", kind: "object" },
  { key: "manifesto", label: "Manifesto", description: "Home-page manifesto cards.", kind: "array", titleField: "title" },
  { key: "tracks", label: "Music", description: "Releases, audio previews and streaming links.", kind: "array", titleField: "title" },
  { key: "events", label: "Events", description: "Upcoming shows, venues, tickets and archive.", kind: "array", titleField: "name" },
  { key: "gallery", label: "Gallery", description: "Portfolio images, categories and accessibility text.", kind: "array", titleField: "alt" },
  { key: "videos", label: "Videos", description: "Videos, thumbnails and YouTube references.", kind: "array", titleField: "title" },
  { key: "services", label: "Services", description: "Booking and creative service offerings.", kind: "array", titleField: "title" },
  { key: "testimonials", label: "Testimonials", description: "Client quotes and avatars.", kind: "array", titleField: "name" },
  { key: "achievements", label: "Achievements", description: "Press highlights and career milestones.", kind: "array", titleField: "title" },
  { key: "skills", label: "Skills", description: "About-page skill meters.", kind: "array", titleField: "name" },
  { key: "timeline", label: "Timeline", description: "About-page creative journey.", kind: "array", titleField: "title" },
  { key: "influences", label: "Influences", description: "About-page influence tags.", kind: "array", primitive: true },
  { key: "mediaFeatures", label: "Platforms", description: "Press-page platform list.", kind: "array", primitive: true },
  { key: "brandLogos", label: "Partners", description: "Press-page partner and stage list.", kind: "array", primitive: true },
];

export const sectionDefinitionMap = Object.fromEntries(
  sectionDefinitions.map((definition) => [definition.key, definition]),
);

