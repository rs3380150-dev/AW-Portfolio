const baseId = () => crypto.randomUUID();

const templates = {
  manifesto: () => ({ n: "", title: "", body: "" }),
  tracks: () => ({ id: baseId(), slug: "", title: "", year: new Date().getFullYear(), releaseDate: "", genre: "", category: "", description: "", story: "", cover: "", audio: "", links: {}, featuredOnHome: false }),
  events: () => ({ id: baseId(), name: "", venue: "", city: "", country: "", date: "", time: "", status: "upcoming", type: "club", ticket: "", poster: "" }),
  gallery: () => ({ id: baseId(), category: "", src: "", alt: "" }),
  videos: () => ({ id: baseId(), title: "", category: "", duration: "", youtubeId: "", videoUrl: "", thumbnail: "", description: "" }),
  services: () => ({ id: baseId(), icon: "Music", title: "", description: "" }),
  testimonials: () => ({ id: baseId(), name: "", role: "", quote: "", avatar: "" }),
  achievements: () => ({ id: baseId(), year: String(new Date().getFullYear()), title: "", org: "" }),
  skills: () => ({ name: "", level: 50 }),
  timeline: () => ({ year: "", title: "", body: "" }),
};

export const createSectionItem = (sectionKey, primitive = false) => primitive ? "" : (templates[sectionKey]?.() || { id: baseId(), title: "" });
