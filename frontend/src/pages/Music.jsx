import React, { useMemo, useState } from "react";
import { Download, Headphones } from "@/components/icons";
import { ConnectSection } from "@/components/ConnectSection";
import { SectionHeading } from "@/components/SectionHeading";
import { TrackCard } from "@/components/TrackCard";
import { Marquee } from "@/components/Motion";
import { musicFilters, tracks } from "@/data/tracks";
import { site } from "@/data/site";

export const Music = () => {
  const [active, setActive] = useState("all");
  const filtered = useMemo(
    () => (active === "all" ? tracks : tracks.filter((track) => track.category === active)),
    [active],
  );

  return (
    <div className="page-shell" data-testid="music-page">
      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <SectionHeading
              index="01"
              eyebrow="Catalogue"
              title="Originals, remixes, and live pressure."
              subtitle="Preview the records, live-set energy, and multi-instrumental textures that define Achyut Wadhwa's sound."
            />
            <div className="glass rounded-md p-6">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">Streaming</p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Follow the artist channels for edits, releases, live recordings, and collaboration updates.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a data-testid="music-spotify" href={site.streaming.spotify} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-cyan px-5 py-2.5 text-sm font-semibold text-void hover:scale-[1.03] transition-transform duration-300">
                  <Headphones className="h-4 w-4" /> Stream
                </a>
                <a data-testid="music-press-kit" href={site.pressKitUrl} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/70 hover:border-cyan hover:text-cyan transition-colors duration-300">
                  <Download className="h-4 w-4" /> Press Kit
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            {musicFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActive(filter.id)}
                data-testid={`music-filter-${filter.id}`}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  active === filter.id
                    ? "border-cyan bg-cyan text-void"
                    : "border-white/10 text-white/60 hover:border-cyan/50 hover:text-cyan"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((track, index) => (
              <TrackCard key={track.id} track={track} index={index} />
            ))}
          </div>
        </div>
      </section>

      <ConnectSection />

      <Marquee text="PLAY - PAUSE - REPEAT -" className="py-16" />
    </div>
  );
};
