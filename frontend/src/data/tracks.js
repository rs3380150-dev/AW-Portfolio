// Static music catalogue. Audio previews use royalty-free SoundHelix demo tracks.
export const tracks = [
  {
    id: "t1",
    title: "Neon Cathedral",
    year: 2025,
    genre: "Melodic Techno",
    category: "original",
    description: "A cavernous melodic techno anthem built for the mainstage afterglow.",
    cover:
      "https://images.unsplash.com/photo-1556139930-c23fa4a4f934?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHZpbnlsJTIwcmVjb3JkJTIwYWxidW0lMjBjb3ZlciUyMGRhcmt8ZW58MHx8fHwxNzg0OTE3Mjc0fDA&ixlib=rb-4.1.0&q=85",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    links: { spotify: "https://spotify.com", soundcloud: "https://soundcloud.com", apple: "https://music.apple.com", youtube: "https://youtube.com" },
  },
  {
    id: "t2",
    title: "Midnight Voltage",
    year: 2025,
    genre: "Progressive House",
    category: "original",
    description: "Rolling basslines and shimmering arps for the peak-time hours.",
    cover:
      "https://images.unsplash.com/photo-1566410824233-a8011929225c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMHZpbnlsJTIwcmVjb3JkJTIwYWxidW0lMjBjb3ZlciUyMGRhcmt8ZW58MHx8fHwxNzg0OTE3Mjc0fDA&ixlib=rb-4.1.0&q=85",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    links: { spotify: "https://spotify.com", soundcloud: "https://soundcloud.com", apple: "https://music.apple.com", youtube: "https://youtube.com" },
  },
  {
    id: "t3",
    title: "Solar Winds (Wadhwa Remix)",
    year: 2024,
    genre: "Afro House",
    category: "remix",
    description: "An organic, percussive reinterpretation drenched in warm analog textures.",
    cover:
      "https://images.unsplash.com/photo-1709377195538-5522ed0f9e10?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwzfHxhYnN0cmFjdCUyMHZpbnlsJTIwcmVjb3JkJTIwYWxidW0lMjBjb3ZlciUyMGRhcmt8ZW58MHx8fHwxNzg0OTE3Mjc0fDA&ixlib=rb-4.1.0&q=85",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    links: { spotify: "https://spotify.com", soundcloud: "https://soundcloud.com", apple: "https://music.apple.com", youtube: "https://youtube.com" },
  },
  {
    id: "t4",
    title: "Afterlife Sequence",
    year: 2024,
    genre: "Organic Deep",
    category: "collaboration",
    description: "A hypnotic collaboration blending live strings with modular synthesis.",
    cover:
      "https://images.pexels.com/photos/3391926/pexels-photo-3391926.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    links: { spotify: "https://spotify.com", soundcloud: "https://soundcloud.com", apple: "https://music.apple.com", youtube: "https://youtube.com" },
  },
  {
    id: "t5",
    title: "Tulum Sunrise - Live Set",
    year: 2024,
    genre: "Melodic Techno",
    category: "live",
    description: "Recorded live at sunrise on the Yucatan coast. 74 minutes of pure momentum.",
    cover:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=srgb&fm=jpg&w=800&q=85",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    links: { spotify: "https://spotify.com", soundcloud: "https://soundcloud.com", apple: "https://music.apple.com", youtube: "https://youtube.com" },
  },
  {
    id: "t6",
    title: "Electric Bloom",
    year: 2023,
    genre: "Progressive House",
    category: "original",
    description: "A euphoric, festival-ready record with a hook that refuses to leave.",
    cover:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?crop=entropy&cs=srgb&fm=jpg&w=800&q=85",
    audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    links: { spotify: "https://spotify.com", soundcloud: "https://soundcloud.com", apple: "https://music.apple.com", youtube: "https://youtube.com" },
  },
];

export const musicFilters = [
  { id: "all", label: "All" },
  { id: "original", label: "Original Tracks" },
  { id: "remix", label: "Remixes" },
  { id: "collaboration", label: "Collaborations" },
  { id: "live", label: "Live Sets" },
];
