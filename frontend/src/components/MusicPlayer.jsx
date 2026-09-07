import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, X } from "@/components/icons";
import { usePlayer } from "@/context/PlayerContext";
import { Equalizer } from "@/components/Motion";

const fmt = (s) => {
  if (!s || Number.isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

export const MusicPlayer = () => {
  const { current, isPlaying, progress, duration, volume, active, togglePlay, next, prev, seek, setVolume } = usePlayer();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isPlaying) setDismissed(false);
  }, [isPlaying]);

  if (!active || !current || dismissed) return null;
  const pct = duration ? Math.min(100, (progress / duration) * 100) : 0;

  const dismiss = () => {
    if (isPlaying) togglePlay();
    setDismissed(true);
  };

  return (
    <motion.div
      data-testid="music-player"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-tinted/90 backdrop-blur-[28px]"
    >
      <div
        className="absolute -top-px left-0 h-[2px] bg-gradient-to-r from-cyan/30 via-cyan to-cyan/30"
        style={{ width: `${pct}%` }}
      />
      <div className="mx-auto flex h-[78px] max-w-[1500px] items-center gap-4 px-4 pr-12 md:h-20 md:px-10 md:pr-14">
        <div className="hidden h-12 w-12 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/[0.03] p-1 sm:block">
          <img src={current.cover} alt={current.title} className="h-full w-full rounded-sm object-cover" loading="lazy" />
        </div>
        <div className="min-w-0 w-32 sm:w-48">
          <div className="truncate text-sm font-semibold tracking-tight md:text-[15px]">{current.title}</div>
          <div className="mt-0.5 truncate font-mono text-[11px] uppercase tracking-[0.08em] text-white/45">{current.genre}</div>
        </div>

        <div className="flex items-center gap-2 md:gap-2.5">
          <button data-testid="player-prev" aria-label="Previous track" onClick={prev} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/65 transition-[border-color,color,background-color] duration-300 hover:border-cyan/40 hover:bg-white/[0.06] hover:text-white">
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            data-testid="player-toggle"
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={togglePlay}
            className="action-accent grid h-12 w-12 place-items-center rounded-full bg-magenta transition-transform duration-300 hover:scale-[1.04]"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>
          <button data-testid="player-next" aria-label="Next track" onClick={next} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-white/65 transition-[border-color,color,background-color] duration-300 hover:border-cyan/40 hover:bg-white/[0.06] hover:text-white">
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="text-[11px] font-mono text-white/45 w-9 text-right hidden sm:block">{fmt(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 1}
            value={duration ? progress : 0}
            onChange={(e) => seek(Number(e.target.value))}
            data-testid="player-seek"
            aria-label="Seek"
            className="player-range h-1 flex-1 cursor-pointer accent-cyan"
          />
          <span className="text-[11px] font-mono text-white/45 w-9 hidden sm:block">{fmt(duration)}</span>
        </div>

        <div className="hidden w-36 items-center gap-3 md:flex">
          <Volume2 className="h-4 w-4 text-white/60" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            data-testid="player-volume"
            aria-label="Volume"
            className="player-range h-1 w-full cursor-pointer accent-cyan"
          />
        </div>

        <div className="hidden pl-2 lg:block">
          <Equalizer bars={5} active={isPlaying && volume > 0} variant="random" />
        </div>
      </div>
      <button
        type="button"
        data-testid="player-dismiss"
        aria-label="Hide music player"
        onClick={dismiss}
        className="absolute right-4 top-3 grid h-7 w-7 translate-y-1 place-items-center rounded-full border border-white/10 bg-void/70 text-white/55 opacity-0 shadow-[0_10px_28px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-[opacity,transform,border-color,color,background-color] duration-300 hover:border-cyan/45 hover:bg-cyan/10 hover:text-cyan focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan/45 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 md:right-5"
      >
        <X className="h-3 w-3" />
      </button>
    </motion.div>
  );
};
