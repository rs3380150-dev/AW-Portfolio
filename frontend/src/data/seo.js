import { site } from "@/data/site";
import { tracks } from "@/data/tracks";
import { cloudinaryMedia } from "@/utils/cloudinaryMedia";

export const siteUrl = (import.meta.env.VITE_SITE_URL || site.siteUrl || "https://achyutwadhwa.in").replace(/\/$/, "");
export const defaultSeoImage = cloudinaryMedia("/assets/images/site/social-share-og.png");

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
  const track = tracks.find((item) => cleanPath === `/music/${item.slug}`);
  const indexable = Boolean(track || seoRoutes[cleanPath]);
  const meta = (track && {
    title: `${track.title} | Achyut Wadhwa`,
    description: `${track.description} Listen to ${track.title} by Achyut Wadhwa.`,
    priority: "0.7",
    image: track.cover,
    type: "music.song",
  }) || seoRoutes[cleanPath] || {
    title: "Achyut Wadhwa",
    description: site.intro,
    priority: "0.5",
  };

  return {
    ...meta,
    path: cleanPath,
    indexable,
    image: meta.image || defaultSeoImage,
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
  const websiteId = `${siteUrl}/#website`;
  const track = tracks.find((item) => meta.path === `/music/${item.slug}`);
  const graph = [
    {
      "@type": "WebSite",
      "@id": websiteId,
      name: site.name,
      url: siteUrl,
      inLanguage: "en-IN",
      publisher: { "@id": artistId },
    },
    {
      "@type": meta.path === "/about" ? "ProfilePage" : "WebPage",
      "@id": `${meta.url}#webpage`,
      url: meta.url,
      name: meta.title,
      description: meta.description,
      isPartOf: { "@id": websiteId },
      ...(meta.path === "/about"
        ? { mainEntity: { "@id": artistId } }
        : { about: { "@id": artistId } }),
      inLanguage: "en-IN",
    },
    {
      "@type": "Person",
      "@id": artistId,
      name: site.name,
      alternateName: site.shortName,
      jobTitle: site.role,
      description: site.intro,
      email: site.email,
      telephone: site.phone,
      image: toAbsoluteUrl(site.aboutImage),
      url: siteUrl,
      homeLocation: { "@type": "Country", name: "India" },
      knowsAbout: ["Music production", "DJing", "Live performance", ...site.genres],
      sameAs: realSameAs,
    },
  ];

  if (meta.path !== "/") {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: track ? "Music" : meta.title.split(" | ")[0], item: track ? toAbsoluteUrl("/music") : meta.url },
        ...(track ? [{ "@type": "ListItem", position: 3, name: track.title, item: meta.url }] : []),
      ],
    });
  }

  if (track) {
    graph.push({
      "@type": "MusicRecording",
      "@id": `${meta.url}#recording`,
      name: track.title,
      url: meta.url,
      image: toAbsoluteUrl(track.cover),
      datePublished: new Date(track.releaseDate).toISOString().slice(0, 10),
      genre: track.genre,
      byArtist: { "@id": artistId },
      description: track.description,
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
};
