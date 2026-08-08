import { site } from "@/data/site";

export const siteUrl = (import.meta.env.VITE_SITE_URL || site.siteUrl || "https://novapulse.in").replace(/\/$/, "");
export const defaultSeoImage = "/images/achyut-wadhwa-og.png";

export const seoRoutes = {
  "/": {
    title: "Achyut Wadhwa | Music Producer, DJ & Performer",
    description:
      "Official site of Achyut Wadhwa - music producer, DJ, performer, and multi-instrumentalist from India, available worldwide for bookings and collaborations.",
    priority: "1.0",
  },
  "/about": {
    title: "About Achyut Wadhwa | Artist Bio",
    description:
      "Read the artist profile of Achyut Wadhwa - a music producer, DJ, performer, and multi-instrumentalist shaping rhythm-led electronic experiences.",
    priority: "0.9",
  },
  "/music": {
    title: "Music | Achyut Wadhwa Originals, Remixes & Live Sets",
    description:
      "Explore Achyut Wadhwa music, including original productions, remixes, collaborations, and live-set previews.",
    priority: "0.9",
  },
  "/events": {
    title: "Events & Bookings | Achyut Wadhwa Live and DJ Sets",
    description:
      "View Achyut Wadhwa events, DJ appearances, live performance formats, and booking availability for clubs, festivals, private rooms, and brand moments.",
    priority: "0.85",
  },
  "/gallery": {
    title: "Gallery | Achyut Wadhwa Photos and Visual Archive",
    description:
      "Browse the Achyut Wadhwa visual archive featuring artist portraits, performance moments, studio textures, and electronic music atmosphere.",
    priority: "0.75",
  },
  "/videos": {
    title: "Videos | Achyut Wadhwa Music Videos, Live Sets and Studio Clips",
    description:
      "Watch Achyut Wadhwa videos, including music visuals, live performance clips, DJ-set footage, studio breakdowns, and behind-the-scenes moments.",
    priority: "0.85",
  },
  "/services": {
    title: "Services | DJ Sets, Production, Live Performance and Collabs",
    description:
      "Book Achyut Wadhwa for DJ sets, live performances, music production, multi-instrumental arrangements, private events, and creative collaborations.",
    priority: "0.85",
  },
  "/press": {
    title: "Press Kit | Achyut Wadhwa Artist Assets and Booking Info",
    description:
      "Download the Achyut Wadhwa press kit and access artist bio, contact details, booking formats, and press-ready information.",
    priority: "0.8",
  },
  "/contact": {
    title: "Contact Achyut Wadhwa | Bookings and Collaborations",
    description:
      "Contact Achyut Wadhwa for bookings, DJ sets, live performances, music production, brand projects, and collaboration requests.",
    priority: "0.9",
  },
};

export const sitemapRoutes = Object.entries(seoRoutes).map(([path, meta]) => ({
  path,
  priority: meta.priority,
}));

export const toAbsoluteUrl = (path = "/") => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
};

export const getSeoMeta = (pathname = "/") => {
  const cleanPath = pathname.replace(/\/$/, "") || "/";
  const meta = seoRoutes[cleanPath] || {
    title: "Achyut Wadhwa",
    description: site.intro,
    priority: "0.5",
  };

  return {
    ...meta,
    path: cleanPath,
    image: defaultSeoImage,
    url: toAbsoluteUrl(cleanPath),
  };
};

const realSameAs = [
  site.social.instagram,
  site.social.youtube,
  site.social.soundcloud,
  site.social.spotify,
  site.social.tiktok,
  site.social.x,
].filter(Boolean);

export const buildStructuredData = (pathname = "/") => {
  const meta = getSeoMeta(pathname);
  const artistId = `${siteUrl}/#artist`;
  const musicProjectId = `${siteUrl}/#music-project`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: site.name,
        url: siteUrl,
        inLanguage: "en",
        publisher: { "@id": musicProjectId },
      },
      {
        "@type": "WebPage",
        "@id": `${meta.url}#webpage`,
        url: meta.url,
        name: meta.title,
        description: meta.description,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": musicProjectId },
        inLanguage: "en",
      },
      {
        "@type": "Person",
        "@id": artistId,
        name: site.name,
        jobTitle: site.role,
        email: site.email,
        telephone: site.phone,
        image: toAbsoluteUrl(site.aboutImage),
        url: siteUrl,
        sameAs: realSameAs,
      },
      {
        "@type": "MusicGroup",
        "@id": musicProjectId,
        name: site.name,
        description: site.intro,
        genre: site.genres,
        image: toAbsoluteUrl(site.aboutImage),
        url: siteUrl,
        member: { "@id": artistId },
        sameAs: realSameAs,
      },
    ],
  };
};
