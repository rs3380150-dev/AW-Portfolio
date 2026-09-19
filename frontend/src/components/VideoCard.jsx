import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Clock } from "@/components/icons";
import { useSpotlightProps } from "@/components/Spotlight";

export const VideoCard = ({ video, index = 0 }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const spotlightProps = useSpotlightProps();
  const thumb = video.thumbnail;

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = modalRef.current?.querySelectorAll(
        'button:not([disabled]), iframe, video[controls], [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <motion.article
        {...spotlightProps}
        data-testid={`video-card-${video.id}`}
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.08 }}
        className="spotlight-card group glass rounded-md overflow-hidden hover:border-white/20 transition-colors duration-300"
      >
        <button ref={triggerRef} onClick={() => setOpen(true)} data-spotlight-block data-testid={`play-video-${video.id}`} aria-label={`Play ${video.title}`} className="relative block w-full aspect-video overflow-hidden">
          <img src={thumb} alt={video.title} loading="lazy" className="duration-gallery-hover h-full w-full object-cover transition-transform ease-out group-hover:scale-105" />
          <div className="video-image-overlay absolute inset-0 bg-void/30 group-hover:bg-void/10 transition-colors duration-300" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="action-accent h-16 w-16 grid place-items-center rounded-full bg-magenta group-hover:scale-110 transition-transform duration-300">
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
            ref={modalRef}
            data-testid={`video-modal-${video.id}`}
            role="dialog"
            aria-modal="true"
            aria-label={`${video.title} video player`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-void/95 backdrop-blur-xl grid place-items-center p-4"
            onClick={(event) => event.target === event.currentTarget && setOpen(false)}
          >
            <button ref={closeButtonRef} aria-label={`Close ${video.title} video`} onClick={() => setOpen(false)} className="absolute top-6 right-6 h-12 w-12 grid place-items-center rounded-full glass text-white hover:text-cyan transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan">
              <X className="h-6 w-6" />
            </button>
            <div className="w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
              {video.videoUrl ? (
                <video
                  className="w-full h-full rounded-md bg-black object-contain"
                  src={video.videoUrl}
                  poster={video.thumbnail}
                  title={video.title}
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <iframe
                  className="w-full h-full rounded-md"
                  src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
