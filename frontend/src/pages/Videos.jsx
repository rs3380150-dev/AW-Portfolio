import React, { useMemo, useState } from "react";
import { VideoCard } from "@/components/VideoCard";
import { SectionHeading } from "@/components/SectionHeading";
import { videoCategories, videos } from "@/data/videos";

export const Videos = () => {
  const [active, setActive] = useState("all");
  const filtered = useMemo(
    () => (active === "all" ? videos : videos.filter((video) => video.category === active)),
    [active],
  );

  return (
    <div className="page-shell" data-testid="videos-page">
      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1500px]">
          <SectionHeading
            index="01"
            eyebrow="Video"
            title="Motion from the booth and beyond."
            subtitle="Official videos, live edits, set recordings, studio breakdowns, and tour diary moments."
          />

          <div className="mt-12 flex flex-wrap gap-3">
            {videoCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActive(category.id)}
                data-testid={`video-filter-${category.id}`}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  active === category.id
                    ? "border-cyan bg-cyan text-void"
                    : "border-white/10 text-white/60 hover:border-cyan/50 hover:text-cyan"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
