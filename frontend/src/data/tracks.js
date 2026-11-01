import { cloudinaryMedia } from "@/utils/cloudinaryMedia";
import { verifiedTracks } from "@/data/verifiedTracks.mjs";

// Verified releases kept in source are merged with the CMS catalogue. This gives
// new releases a safe production fallback until their first CMS publish.
export const tracks = verifiedTracks.map((track) => ({
  ...track,
  cover: cloudinaryMedia(track.cover),
  heroImage: cloudinaryMedia(track.heroImage),
}));

export const musicFilters = [
  { id: "all", label: "All" },
  { id: "original", label: "Original Tracks" },
  { id: "remix", label: "Remixes" },
  { id: "collaboration", label: "Collaborations" },
  { id: "live", label: "Live Sets" },
];
