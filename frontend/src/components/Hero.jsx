import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play, ArrowRight } from "@/components/icons";
import { site } from "@/data/site";
import { usePlayer } from "@/context/PlayerContext";

const EASE = [0.22, 1, 0.36, 1];
const PRELOADER_OFFSET = 1.55;

const MaskLine = ({ children, index }) => (
  <span className="block overflow-hidden pb-[0.08em]">
    <motion.span
      initial={{ y: "110%" }}
      animate={{ y: "0%" }}
      transition={{ duration: 0.9, delay: PRELOADER_OFFSET + 0.25 + index * 0.09, ease: EASE }}
      className="block"
    >
      {children}
    </motion.span>
  </span>
);

export const Hero = () => {
  const ref = useRef(null);
  const videoRef = useRef(null);
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
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
      if (document.hidden) video.pause();
      else video.play().catch(() => {});
    };
    syncVideo();
    document.addEventListener("visibilitychange", syncVideo);
    return () => document.removeEventListener("visibilitychange", syncVideo);
  }, [shouldRenderVideo]);

  return (
    <section ref={ref} data-testid="hero" className="relative h-[100svh] overflow-hidden bg-void">
      <motion.div style={{ y: imageY }} className="pointer-events-none absolute inset-0">
        <motion.div
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.6, delay: PRELOADER_OFFSET - 0.5, ease: EASE }}
          className="h-full w-full"
        >
          {shouldRenderVideo ? (
            <video
              ref={videoRef}
              className="industrial-hero-media h-full w-full object-cover object-[68%_center]"
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
            <img src={heroPoster} alt="" aria-hidden="true" fetchPriority="high" className="industrial-hero-media h-full w-full object-cover object-[68%_center]" />
          )}
        </motion.div>
        <div className="absolute inset-0 bg-void/55" />
      </motion.div>

      <motion.div style={{ y: textY }} className="relative z-10 flex h-full flex-col justify-between px-6 pb-8 pt-24 md:px-10 md:pb-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: PRELOADER_OFFSET + 0.9, duration: 0.8 }}
          className="flex justify-between font-mono text-[9px] uppercase tracking-[0.4em] text-white/55"
        >
          <span>Artist — {new Date().getFullYear()}</span>
          <span className="hidden sm:block">Music / Performance / Sound</span>
          <span>India / Worldwide</span>
        </motion.div>

        <div>
          <h1 className="font-display text-[11vw] font-bold uppercase leading-[0.88] tracking-tighter text-white md:text-[6.5vw]">
            <MaskLine index={0}>Feel the beat.</MaskLine>
            <MaskLine index={1}>Live the moment.</MaskLine>
          </h1>

          <div className="mt-10 flex flex-col gap-8 md:mt-14 md:flex-row md:items-end md:justify-between">
            <motion.button
              type="button"
              onClick={togglePlay}
              data-testid="hero-listen"
              data-cursor="LISTEN"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: PRELOADER_OFFSET + 1.1, duration: 0.7 }}
              className="group flex w-fit items-center gap-5 text-left"
            >
              <span className="duration-premium flex h-12 w-12 items-center justify-center border border-white/30 transition-[background-color,border-color] group-hover:border-cyan group-hover:bg-cyan">
                <Play className="ml-0.5 h-4 w-4 text-white" />
              </span>
              <span>
                <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-white">Play</span>
                <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.3em] text-white/55">Achyut Wadhwa — Selected Audio</span>
              </span>
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: PRELOADER_OFFSET + 1.25, duration: 0.7 }}
              className="flex items-center gap-8"
            >
              <Link
                to="/contact"
                data-testid="hero-book"
                data-cursor="ENQUIRE"
                className="duration-premium hidden items-center border border-white/25 px-5 py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.28em] text-white transition-[background-color,border-color] hover:border-cyan hover:bg-cyan sm:inline-flex"
              >
                Book / Enquire <ArrowRight className="ml-3 h-4 w-4" />
              </Link>
              <div className="flex items-center gap-3" aria-hidden="true">
                <span className="font-mono text-[9px] uppercase tracking-[0.45em] text-white/55">Scroll to explore</span>
                <span className="relative h-10 w-px overflow-hidden bg-white/15">
                  <motion.span
                    className="absolute left-0 top-0 h-4 w-px bg-cyan"
                    animate={{ y: [-16, 40] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div aria-hidden="true" className="pointer-events-none absolute -bottom-[2vw] left-0 z-[5] overflow-hidden whitespace-nowrap">
        <motion.span
          initial={{ y: "40%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: PRELOADER_OFFSET + 0.6, duration: 1.1, ease: EASE }}
          className="text-outline block font-display text-[20vw] font-bold uppercase leading-[0.78] tracking-tighter md:text-[17vw]"
        >
          Achyut&nbsp;Wadhwa
        </motion.span>
      </div>
    </section>
  );
};
