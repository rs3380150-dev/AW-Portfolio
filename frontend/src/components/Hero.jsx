import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play, ArrowRight } from "@/components/icons";
import { site } from "@/data/site";
import { Equalizer } from "@/components/Motion";
import { usePlayer } from "@/context/PlayerContext";

const reveal = {
  hidden: { y: "110%" },
  visible: (i) => ({ y: "0%", transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 + i * 0.12 } }),
};

const MaskLine = ({ children, i }) => (
  <span className="block overflow-hidden">
    <motion.span variants={reveal} custom={i} initial="hidden" animate="visible" className="block">
      {children}
    </motion.span>
  </span>
);

export const Hero = () => {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const { togglePlay } = usePlayer();
  const heroPoster = site.heroPoster || site.heroImage;

  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const saveData = navigator.connection?.saveData;
    setShouldRenderVideo(!reduceMotion && !saveData);
  }, []);

  useEffect(() => {
    if (!shouldRenderVideo) return undefined;

    const syncVideo = () => {
      const video = videoRef.current;
      if (!video) return;

      if (document.hidden) {
        video.pause();
        return;
      }

      video.play().catch(() => {});
    };

    syncVideo();
    document.addEventListener("visibilitychange", syncVideo);
    return () => document.removeEventListener("visibilitychange", syncVideo);
  }, [shouldRenderVideo]);

  return (
    <section ref={ref} data-testid="hero" className="relative min-h-screen flex items-start overflow-hidden grain">
      <motion.div style={{ y }} className="pointer-events-none absolute inset-0 z-0">
        {shouldRenderVideo ? (
          <video
            ref={videoRef}
            className="h-[120%] w-full object-cover object-[68%_center] brightness-[1.22] contrast-[1.08] saturate-[1.1]"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={heroPoster}
            aria-hidden="true"
            onError={() => setShouldRenderVideo(false)}
          >
            {site.heroVideoWebm ? <source src={site.heroVideoWebm} type="video/webm" /> : null}
            <source src={site.heroVideo} type="video/mp4" />
          </video>
        ) : (
          <img
            src={heroPoster}
            alt=""
            aria-hidden="true"
            fetchpriority="high"
            className="h-[120%] w-full object-cover object-[68%_center] brightness-[1.22] contrast-[1.08] saturate-[1.1]"
          />
        )}
        <div className="hero-depth-overlay absolute inset-0 bg-gradient-to-b from-void/55 via-void/58 to-void" />
        <div className="hero-side-overlay absolute inset-0 bg-gradient-to-r from-void/76 via-void/18 to-void/42" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 w-full mx-auto max-w-[1500px] px-6 md:px-10 pb-28 pt-36 md:pb-36 md:pt-44">
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="hero-role-pill mb-8 inline-flex max-w-full flex-wrap items-center gap-4 rounded-full border border-white/10 bg-void/25 px-4 py-2.5 shadow-[0_16px_48px_rgba(0,0,0,0.18)] backdrop-blur-md sm:flex-nowrap"
        >
          <Equalizer bars={6} variant="random" className="h-5" />
          <span className="min-w-0 font-mono text-[11px] uppercase tracking-[0.28em] text-cyan">{site.role} - {site.location}</span>
        </motion.div>

        <h1 className="font-display font-bold uppercase leading-[0.82] tracking-tighter text-[16vw] sm:text-[13vw] lg:text-[11rem]">
          <MaskLine i={0}>Achyut</MaskLine>
          <MaskLine i={1}><span className="text-stroke-cyan">Wadhwa</span></MaskLine>
        </h1>

        <div className="mt-8 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="overflow-hidden">
            <motion.p
              initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
              className="max-w-md text-lg text-white/70 font-light leading-relaxed"
            >
              {site.tagline} - {site.intro}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.7 }}
            className="flex flex-wrap items-center gap-3 sm:gap-4"
          >
            <button
              onClick={togglePlay}
              data-testid="hero-listen"
              className="action-accent inline-flex min-h-[54px] items-center gap-2 rounded-full border border-white/20 bg-magenta px-7 py-4 font-semibold transition-[transform,box-shadow] duration-300 hover:scale-[1.03] hover:shadow-[0_0_32px_rgba(31,95,128,0.42)]"
            >
              <Play className="h-5 w-5" /> Listen Now
            </button>
            <Link
              to="/contact"
              data-testid="hero-book"
              className="inline-flex min-h-[54px] items-center gap-2 rounded-full border border-white/18 bg-white/[0.04] px-7 py-4 font-semibold text-white shadow-[0_18px_42px_rgba(0,0,0,0.14)] backdrop-blur-md transition-[border-color,color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-cyan/60 hover:bg-white/[0.07] hover:text-cyan"
            >
              Book for an Event <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <motion.span animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8 }} className="h-8 w-px bg-white/30" />
      </div>
    </section>
  );
};
