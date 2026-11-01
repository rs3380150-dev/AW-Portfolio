const trackKey = (track) => String(track?.slug || track?.id || "").trim().toLowerCase();

export const mergeTracks = (verifiedTracks = [], cmsTracks = []) => {
  const merged = [];
  const indexes = new Map();

  [...verifiedTracks, ...cmsTracks].forEach((track) => {
    const key = trackKey(track);
    if (!key) return;
    const existingIndex = indexes.get(key);
    if (existingIndex === undefined) {
      indexes.set(key, merged.length);
      merged.push({ ...track });
      return;
    }
    merged[existingIndex] = { ...merged[existingIndex], ...track };
  });

  const firstFeatured = merged.findIndex((track) => track.featuredOnHome);
  if (firstFeatured >= 0) {
    return merged.map((track, index) => ({
      ...track,
      featuredOnHome: index === firstFeatured,
    }));
  }

  return merged;
};
