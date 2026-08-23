export const videoCategories = [
  { id: "all", label: "All" },
  { id: "music", label: "Music Videos" },
  { id: "live", label: "Live" },
  { id: "set", label: "DJ Sets" },
  { id: "studio", label: "Studio" },
  { id: "bts", label: "Behind the Scenes" },
];

// YouTube IDs power the remote embeds; Cloudinary serves the optimized card thumbnails.
export const videos = [
  { id: "v1", title: "Neon Cathedral - Official Video", category: "music", duration: "3:58", youtubeId: "dQw4w9WgXcQ", thumbnail: cloudinaryMedia("/assets/images/video-thumbnails/01-neon-cathedral.jpg"), description: "The official visual for the melodic techno anthem, shot across three continents." },
  { id: "v2", title: "Live at Awakenings 2025", category: "live", duration: "12:04", youtubeId: "5qap5aO4i9A", thumbnail: cloudinaryMedia("/assets/images/video-thumbnails/02-live-at-awakenings-2025.jpg"), description: "Mainstage highlights captured in 4K under the festival lasers." },
  { id: "v3", title: "Sunrise DJ Set - Tulum", category: "set", duration: "58:22", youtubeId: "jfKfPfyJRdk", thumbnail: cloudinaryMedia("/assets/images/site/hero-poster.jpg"), description: "A full sunrise set from the Yucatan coastline." },
  { id: "v4", title: "In The Studio: Building 'Electric Bloom'", category: "studio", duration: "8:41", youtubeId: "5yx6BWlEVcY", thumbnail: cloudinaryMedia("/assets/images/video-thumbnails/04-building-electric-bloom.jpg"), description: "A track breakdown from first kick to final master." },
  { id: "v5", title: "On The Road - Europe Tour Diary", category: "bts", duration: "6:15", youtubeId: "hHW1oY26kxQ", thumbnail: cloudinaryMedia("/assets/images/video-thumbnails/05-europe-tour-diary.jpg"), description: "Behind the scenes across fourteen cities in twenty-one days." },
  { id: "v6", title: "Midnight Voltage - Visualizer", category: "music", duration: "4:12", youtubeId: "9bZkp7q19f0", thumbnail: cloudinaryMedia("/assets/images/video-thumbnails/06-midnight-voltage-visualizer.jpg"), description: "An audio-reactive visualizer for the peak-time cut." },
];
import { cloudinaryMedia } from "@/utils/cloudinaryMedia";
