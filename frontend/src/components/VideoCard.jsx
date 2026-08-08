import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Clock } from "@/components/icons";
import { useSpotlightProps } from "@/components/Spotlight";

export const VideoCard = ({ video, index = 0 }) => {
  const [open, setOpen] = useState(false);
  const spotlightProps = useSpotlightProps();
  const thumb = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;

  return (
    <>
      <motion.article
        {...spotlightProps}
        data-testid={`video-card-${video.id}`}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: (index % 3) * 0.08 }}
        className="spotlight-card group glass rounded-md overflow-hidden hover:border-white/20 transition-colors duration-300"
      >
        <button onClick={() => setOpen(true)} data-spotlight-block data-testid={`play-video-${video.id}`} aria-label={`Play ${video.title}`} className="relative block w-full aspect-video overflow-hidden">
          <img src={thumb} alt={video.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="video-image-overlay absolute inset-0 bg-void/30 group-hover:bg-void/10 transition-colors duration-300" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="action-accent h-16 w-16 grid place-items-center rounded-full bg-magenta group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(31,95,128,0.38)]">
              <Play className="h-7 w-7 ml-1" />
            </span>
          </span>
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 font-mono text-xs text-white bg-void/70 px-2 py-1 rounded">
            <Clock className="h-3 w-3" /> {video.duration}
          </span>
        </button>
        <div className="p-5">
          <h3 className="text-lg font-semibold tracking-tight">{video.title}</h3>
          <p className="mt-2 text-sm text-white/55 leading-relaxed">{video.description}</p>
        </div>
      </motion.article>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid={`video-modal-${video.id}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-void/95 backdrop-blur-xl grid place-items-center p-4"
            onClick={() => setOpen(false)}
          >
            <button aria-label="Close" onClick={() => setOpen(false)} className="absolute top-6 right-6 h-12 w-12 grid place-items-center rounded-full glass text-white hover:text-cyan transition-colors">
              <X className="h-6 w-6" />
            </button>
            <div className="w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
              <iframe
                className="w-full h-full rounded-md"
                src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
