import React from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "@/components/icons";
import { usePlayer } from "@/context/PlayerContext";
import { useSpotlightProps } from "@/components/Spotlight";

// Simple inline platform links (avoid extra icon deps): use text labels styled.
const platforms = [
  { key: "spotify", label: "Spotify" },
  { key: "soundcloud", label: "SoundCloud" },
  { key: "apple", label: "Apple" },
  { key: "youtube", label: "YouTube" },
];

export const TrackCard = ({ track, index = 0 }) => {
  const { current, isPlaying, playTrack } = usePlayer();
  const isActive = current?.id === track.id && isPlaying;
  const spotlightProps = useSpotlightProps();

  return (
    <motion.article
      {...spotlightProps}
      data-testid={`track-card-${track.id}`}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.08 }}
      className="spotlight-card group glass rounded-md overflow-hidden hover:border-white/20 transition-colors duration-300"
    >
      <div data-spotlight-block className="relative aspect-square overflow-hidden">
        <img
          src={track.cover}
          alt={track.title}
          loading="lazy"
          className="duration-gallery-hover h-full w-full object-cover transition-transform ease-out group-hover:scale-105"
        />
        <div className="track-image-overlay absolute inset-0 bg-gradient-to-t from-void via-void/20 to-transparent" />
        <button
          onClick={() => playTrack(track.id)}
          data-testid={`play-track-${track.id}`}
          aria-label={isActive ? `Pause ${track.title}` : `Play ${track.title}`}
          className="action-accent absolute bottom-4 right-4 grid h-14 w-14 place-items-center rounded-full bg-magenta opacity-100 transition-[transform,opacity] duration-300 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-void"
        >
          {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
        </button>
        <span className="absolute top-4 left-4 font-mono text-[11px] uppercase tracking-widest text-cyan bg-void/60 backdrop-blur px-2.5 py-1 rounded-full border border-white/10">
          {track.genre}
        </span>
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight truncate">{track.title}</h3>
          <span className="font-mono text-sm text-white/40">{track.year}</span>
        </div>
        <p className="mt-2 text-sm text-white/55 leading-relaxed">{track.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {platforms.map((p) => (
            <a
              key={p.key}
              href={track.links[p.key]}
              target="_blank"
              rel="noreferrer"
              data-testid={`track-${track.id}-${p.key}`}
              className="text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 text-white/60 hover:text-cyan hover:border-cyan/40 transition-colors duration-300"
            >
              {p.label}
            </a>
          ))}
        </div>
      </div>
    </motion.article>
  );
};
