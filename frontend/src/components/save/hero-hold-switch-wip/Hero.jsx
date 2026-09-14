import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play } from "@/components/icons";
import { usePlayer } from "@/context/PlayerContext";
import { HeroHoldGallery } from "@/components/HeroHoldGallery";

const EASE = [0.22, 1, 0.36, 1];
const PRELOADER_OFFSET = 1.55;
const HERO_IMAGES = [
  "/assets/images/hero/achyut-guitar-day.png",
  "/assets/images/hero/achyut-guitar-sunset.png",
];

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
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const { togglePlay } = usePlayer();

  return (
    <section ref={ref} data-testid="hero" className="relative h-[100svh] overflow-hidden bg-black">
      <HeroHoldGallery hostRef={ref} images={HERO_IMAGES} />

      <motion.div style={{ y: textY }} className="relative z-10 flex h-full items-center justify-center px-6 text-center md:px-12">
        <div className="w-full">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: PRELOADER_OFFSET + 0.75, duration: 0.65, ease: EASE }}
            className="mb-5 font-mono text-xs uppercase tracking-[0.38em] text-white/75 md:mb-7 md:text-sm"
          >
            Music Producer · DJ · Live Performer
          </motion.p>

          <h1 className="mx-auto font-display text-[16vw] font-bold uppercase leading-[0.76] tracking-[-0.07em] text-white md:text-[10vw]">
            <MaskLine index={0}>Achyut</MaskLine>
            <MaskLine index={1}>Wadhwa</MaskLine>
          </h1>

          <motion.button
            type="button"
            onClick={togglePlay}
            data-testid="hero-listen"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: PRELOADER_OFFSET + 1.15, duration: 0.7, ease: EASE }}
            className="group mx-auto mt-9 inline-flex items-center gap-3 bg-white px-7 py-4 font-display text-sm font-bold uppercase tracking-[0.08em] text-void transition-[background-color,color,transform] duration-300 hover:scale-[1.03] hover:bg-cyan md:mt-11"
          >
            <Play className="h-4 w-4" />
            Listen Now
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: PRELOADER_OFFSET + 1.35, duration: 0.6 }}
        className="pointer-events-none absolute inset-x-0 bottom-7 z-10 flex justify-center"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.45em] text-white/55">Scroll down</span>
          <span className="relative h-8 w-px overflow-hidden bg-white/20">
            <motion.span
              className="absolute left-0 top-0 h-3 w-px bg-white"
              animate={{ y: [-12, 32] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </div>
      </motion.div>

    </section>
  );
};
