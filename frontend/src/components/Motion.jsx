import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const randomBarPatterns = [
  { a: 0.42, b: 0.88, c: 0.54, d: 0.96, e: 0.48, duration: "1.42s", delay: "-0.18s" },
  { a: 0.74, b: 0.36, c: 0.92, d: 0.5, e: 0.82, duration: "1.08s", delay: "-0.54s" },
  { a: 0.34, b: 0.72, c: 0.44, d: 0.9, e: 0.58, duration: "1.32s", delay: "-0.36s" },
  { a: 0.9, b: 0.46, c: 0.78, d: 0.38, e: 0.98, duration: "1.18s", delay: "-0.72s" },
  { a: 0.5, b: 0.94, c: 0.62, d: 0.42, e: 0.84, duration: "1.56s", delay: "-0.28s" },
  { a: 0.82, b: 0.52, c: 0.36, d: 0.88, e: 0.64, duration: "1.24s", delay: "-0.46s" },
];

export const Equalizer = ({ bars = 5, active = true, className = "", color = "#0B78AC", variant = "beat" }) => {
  return (
    <div className={`flex items-end gap-[3px] h-5 ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => {
        const pattern = randomBarPatterns[i % randomBarPatterns.length];
        const randomStyle = {
          "--eq-a": pattern.a,
          "--eq-b": pattern.b,
          "--eq-c": pattern.c,
          "--eq-d": pattern.d,
          "--eq-e": pattern.e,
          animation: active ? `eq-random ${pattern.duration} ease-in-out ${pattern.delay} infinite` : "none",
          transform: active ? undefined : "scaleY(0.32)",
        };

        return (
          <span
            key={i}
            className="w-[3px] rounded-full origin-bottom"
            style={{
              height: "100%",
              background: color,
              ...(variant === "random"
                ? randomStyle
                : {
                    animation: active ? `eq 0.9s ease-in-out ${i * 0.12}s infinite` : "none",
                    transform: active ? undefined : "scaleY(0.25)",
                  }),
            }}
          />
        );
      })}
    </div>
  );
};

export const ScrollReveal = ({ children, delay = 0, y = 50, className = "", ...props }) => (
  <motion.div
    {...props}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export const Marquee = ({
  text,
  className = "",
  stroke = false,
  duration = "marquee-slow",
  videoSrc = "",
  videoWebm = "",
  poster = "",
}) => {
  const items = Array.from({ length: 4 });
  const animationClass = duration === "marquee" ? "animate-marquee" : "animate-marquee-slow";
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hasVideo = Boolean(videoSrc || videoWebm);
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);

  useEffect(() => {
    if (!hasVideo) return undefined;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const saveData = navigator.connection?.saveData;
    if (reduceMotion || saveData) return undefined;

    const node = containerRef.current;
    if (!node || !("IntersectionObserver" in window)) {
      setShouldRenderVideo(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldRenderVideo(true);
        observer.disconnect();
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasVideo]);

  useEffect(() => {
    if (!shouldRenderVideo) return undefined;

    const node = containerRef.current;
    const video = videoRef.current;
    if (!node || !video || !("IntersectionObserver" in window)) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldRenderVideo]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none ${hasVideo ? "video-text-marquee" : ""} ${className}`}
    >
      {hasVideo ? (
        shouldRenderVideo ? (
          <video
            ref={videoRef}
            className="video-text-marquee-media"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={poster || undefined}
            aria-hidden="true"
          >
            {videoWebm ? <source src={videoWebm} type="video/webm" /> : null}
            {videoSrc ? <source src={videoSrc} type="video/mp4" /> : null}
          </video>
        ) : poster ? (
          <img className="video-text-marquee-media" src={poster} alt="" aria-hidden="true" loading="lazy" />
        ) : null
      ) : null}

      <div className={hasVideo ? "video-text-marquee-mask" : ""}>
        <div className={`flex whitespace-nowrap ${animationClass}`}>
        {items.map((_, i) => (
          <span
            key={i}
            className={`px-8 font-display font-semibold uppercase text-6xl md:text-8xl lg:text-9xl leading-none ${
              hasVideo ? "video-text-marquee-copy" : stroke ? "text-stroke" : "text-white/90"
            }`}
          >
            {text} <span className={hasVideo ? "video-text-marquee-symbol px-4" : "text-cyan px-4"}>*</span>
          </span>
        ))}
        </div>
      </div>
    </div>
  );
};
