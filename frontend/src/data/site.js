import { cloudinaryMedia } from "@/utils/cloudinaryMedia";

// Global site and brand configuration.
export const site = {
  name: "Achyut Wadhwa",
  shortName: "Achyut",
  siteUrl: "https://novapulse.in",
  fullName: "Achyut Wadhwa",
  tagline: "Feel the Beat. Live the Moment.",
  role: "Music Producer / DJ / Performer / Multi-Instrumentalist",
  intro:
    "Achyut Wadhwa crafts high-fidelity electronic music, blending rhythm, atmosphere, live performance, and multi-instrumental texture into movement-led experiences.",
  bioParagraphs: [
    "Achyut Wadhwa is a music producer, DJ, live performer, and multi-instrumentalist working at the intersection of rhythm and atmosphere.",
    "Drawing from the storied legacy of the electronic scene, his sound moves through genre-fluid body music, driving grooves, and psychedelic energy. The result is a sophisticated but physical sound built for rooms that want depth as much as impact.",
    "Whether behind the decks, on stage, or in the studio, Achyut prioritizes the narrative of the set: tension, release, texture, and momentum. Every performance is shaped as a journey that elevates the spirit of the reveler while pushing modern electronic music through a high-fidelity, high-energy lens.",
  ],
  roles: ["Music Producer", "DJ", "Performer", "Multi-Instrumentalist"],
  location: "India - Worldwide",
  email: "wadhwaachyut@gmail.com",
  managementEmail: "wadhwaachyut@gmail.com",
  phone: "+91 70098 20546",
  phoneNumbers: [
    { label: "Primary", value: "+91 70098 20546", href: "tel:+917009820546" },
    { label: "Alternate", value: "+91 98789 06586", href: "tel:+919878906586" },
  ],
  whatsapp: "+917009820546",
  instagramHandle: "@achyutwadhwa",
  availability: "Open for collaborations, live performances, DJ sets, and production projects.",
  pressKitUrl: "/press-kit.pdf",
  web3FormsEndpoint: "https://api.web3forms.com/submit",
  social: {
    instagram: "https://instagram.com/achyutwadhwa",
    facebook: "",
    tiktok: "",
    x: "",
    youtube: "",
    soundcloud: "",
    spotify: "",
  },
  streaming: {
    spotify: "https://spotify.com",
    appleMusic: "https://music.apple.com",
    soundcloud: "https://soundcloud.com",
    youtube: "https://youtube.com",
  },
  connectLinks: [
    { label: "Spotify", href: "https://spotify.com" },
    { label: "SoundCloud", href: "https://soundcloud.com" },
    { label: "Apple Music", href: "https://music.apple.com" },
    { label: "YouTube", href: "https://youtube.com" },
    { label: "Instagram", href: "https://instagram.com/achyutwadhwa" },
    { label: "Collabs", href: "mailto:wadhwaachyut@gmail.com" },
  ],
  stats: [
    { label: "Core Disciplines", value: 4, suffix: "" },
    { label: "Artist", displayValue: "Achyut" },
    { label: "Collabs", displayValue: "Open" },
    { label: "Live + Studio", value: 2, suffix: "" },
  ],
  heroImage: cloudinaryMedia("/assets/images/site/hero-poster.jpg"),
  heroPoster: cloudinaryMedia("/assets/images/site/hero-poster.jpg"),
  heroVideo: cloudinaryMedia("/assets/videos/hero/hero-background.mp4"),
  heroVideoWebm: cloudinaryMedia("/assets/videos/hero/hero-background.webm"),
  aboutImage: cloudinaryMedia("/assets/images/site/about-portrait.jpeg"),
  // Options: "fluid" (cursor trail), "distortion" (image warp), or "classic".
  aboutPortraitEffect: "fluid",
  artistImages: [
    cloudinaryMedia("/assets/images/gallery/05-promo-portrait-neon.jpg"),
    cloudinaryMedia("/assets/images/gallery/01-festival-mainstage-lights.jpg"),
  ],
  genres: ["Melodic Techno", "Progressive House", "Afro House", "Organic Deep"],
};

export const manifesto = [
  {
    n: "01",
    title: "The Rhythm",
    body: "Every set begins with movement: grooves that lock the room in, then evolve with pressure, silence, and release.",
  },
  {
    n: "02",
    title: "The Atmosphere",
    body: "Multi-instrumental textures, analog detail, and psychedelic energy give each production a world beyond the drop.",
  },
  {
    n: "03",
    title: "The Narrative",
    body: "Behind the decks or in the studio, the journey matters as much as the destination: tension, story, spirit, impact.",
  },
];
