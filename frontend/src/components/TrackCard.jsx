import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause } from "@/components/icons";
import { usePlayer } from "@/context/PlayerContext";

const platforms = [
  { key: "spotify",    label: "Spotify" },
  { key: "soundcloud", label: "SoundCloud" },
  { key: "apple",      label: "Apple" },
  { key: "youtube",    label: "YouTube" },
];

export const TrackCard = ({ track, index = 0 }) => {
  const { current, isPlaying, playTrack } = usePlayer();
  const isActive = current?.id === track.id && isPlaying;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      data-testid={`track-card-${track.id}`}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.09 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col rounded-2xl"
      style={{
        background: "linear-gradient(160deg, #0f0f0f 0%, #111 55%, #0c0c0c 100%)",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "rgba(255,255,255,0.08)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: hovered
          ? "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.12)"
          : "0 8px 32px rgba(0,0,0,0.5)",
        transition: "box-shadow 0.5s ease",
      }}
    >

      {/* ── Cover image block ── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "4 / 3.15" }}>
        <motion.img
          src={track.cover}
          alt={track.title}
          loading="lazy"
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full w-full object-cover"
        />

        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(11,11,11,0.88) 0%, rgba(11,11,11,0.2) 55%, rgba(11,11,11,0.0) 100%)",
          }}
        />

        {/* Hover reveal: cyan left border flash */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="left-bar"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 inset-y-0 w-[3px] origin-bottom bg-cyan"
            />
          )}
        </AnimatePresence>

        {/* Genre pill — top left */}
        <span
          className="absolute left-4 top-4 z-10 font-mono text-[9px] uppercase tracking-[0.3em]"
          style={{
            color: "rgb(var(--color-accent-primary))",
            background: "rgba(0,0,0,0.62)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(var(--color-accent-primary), 0.22)",
            padding: "4px 11px",
          }}
        >
          {track.genre}
        </span>

        {/* Play button — bottom right */}
        <div className="absolute bottom-4 right-4 z-10">
          <motion.button
            onClick={() => playTrack(track.id)}
            data-testid={`play-track-${track.id}`}
            aria-label={isActive ? `Pause ${track.title}` : `Play ${track.title}`}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            className="relative grid h-12 w-12 place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-void"
            style={{
              background: isActive
                ? "rgb(var(--color-accent-secondary))"
                : "rgba(242,240,234,0.96)",
              boxShadow: isActive
                ? "0 0 28px rgba(var(--color-accent-secondary), 0.5)"
                : "0 4px 20px rgba(0,0,0,0.55)",
              borderRadius: 0,
            }}
          >
            {isActive
              ? <Pause className="h-5 w-5 text-white" />
              : <Play  className="h-5 w-5 text-void ml-0.5" />}
          </motion.button>

          {/* Active pulsing ring */}
          {isActive && (
            <motion.span
              className="pointer-events-none absolute inset-0"
              style={{ border: "1px solid rgb(var(--color-accent-secondary))" }}
              animate={{ scale: [1, 1.75], opacity: [0.55, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </div>
      </div>

      {/* ── Info block ── */}
      <div className="relative flex flex-1 flex-col px-6 py-3.5">

        {/* Cyan micro-line separator */}
        <motion.div
          className="mb-4 h-px w-8 bg-cyan"
          animate={{ width: hovered ? 40 : 32 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />

        {/* Title + year row */}
        <div className="flex items-baseline justify-between gap-4">
          <h3
            className="flex-1 truncate font-display text-[1.15rem] font-bold uppercase leading-tight tracking-[0.04em]"
            style={{ color: "rgba(242,240,234,0.95)" }}
          >
            {track.title}
          </h3>
          <span
            className="shrink-0 font-mono text-[10px] tracking-[0.18em]"
            style={{ color: "rgba(242,240,234,0.28)" }}
          >
            {track.year}
          </span>
        </div>

        {/* Divider */}
        <div
          className="my-3 h-px w-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />

        {/* Platform links */}
        <div className="flex flex-wrap gap-2">
          {platforms.map((p) => (
            <a
              key={p.key}
              href={track.links[p.key]}
              target="_blank"
              rel="noreferrer"
              data-testid={`track-${track.id}-${p.key}`}
              className="group/link font-mono text-[9px] uppercase tracking-[0.22em] transition-all duration-300"
              style={{
                color: "rgba(242,240,234,0.35)",
                border: "1px solid rgba(255,255,255,0.09)",
                padding: "4px 11px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "rgb(var(--color-accent-primary))";
                e.currentTarget.style.borderColor = "rgba(var(--color-accent-primary), 0.4)";
                e.currentTarget.style.background = "rgba(var(--color-accent-primary), 0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(242,240,234,0.35)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              {p.label}
            </a>
          ))}
        </div>
      </div>

      {/* Bottom accent — magenta dot at right on active */}
      {isActive && (
        <motion.div
          layoutId="active-track-dot"
          className="absolute bottom-0 right-0 h-[3px] bg-magenta"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </motion.article>
  );
};
