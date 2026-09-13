import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "@/components/icons";
import { tracks } from "@/data/tracks";

const demoReleases = [
  { title: "SONG 1", artist: "Achyut Wadhwa" },
  { title: "SONG 2", artist: "Achyut Wadhwa" },
  { title: "SONG 3", artist: "Achyut Wadhwa" },
  { title: "SONG 4", artist: "Achyut Wadhwa" },
  { title: "SONG 5", artist: "Achyut Wadhwa" },
].map((release, index) => ({
  ...release,
  cover: tracks[index % tracks.length].cover,
  slug: tracks[index % tracks.length].slug,
}));

const GlyphMark = ({ glyph }) => (
  <svg viewBox="0 0 100 100" role="presentation" focusable="false">
    {glyph === "A" ? (
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M4 94 39 6h22l35 88H72l-7-20H35l-7 20H4Zm38-40h16L50 30l-8 24Z"
      />
    ) : (
      <path fill="currentColor" d="M3 8h23l14 55 10-34 10 34L74 8h23L72 94H53l-3-13-3 13H28L3 8Z" />
    )}
  </svg>
);

const ScrollGlyph = ({ glyph, from, to, label }) => {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const scale = useTransform(
    scrollYProgress,
    reduceMotion ? [0, 1] : [0, 0.2, 0.82, 1],
    reduceMotion ? [1, 1] : [1, 1, 74, 112],
  );
  const fillOpacity = useTransform(scrollYProgress, [0, 0.76, 0.91, 1], [0, 0, 1, 1]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.13, 0.3], [0.42, 0.42, 0]);

  return (
    <section ref={sectionRef} className="scroll-glyph-stage" style={{ "--glyph-from": from, "--glyph-to": to }} aria-label={label}>
      <div className="scroll-glyph-sticky">
        <motion.span className="scroll-glyph" style={{ scale }} aria-hidden="true">
          <GlyphMark glyph={glyph} />
        </motion.span>
        <motion.div className="scroll-glyph-fill" style={{ opacity: fillOpacity }} aria-hidden="true" />
        <motion.span className="scroll-glyph-hint" style={{ opacity: hintOpacity }}>Scroll to reveal</motion.span>
      </div>
    </section>
  );
};

const ReleaseCard = ({ release, index }) => (
  <article className="editorial-release-card">
    <div className="editorial-release-art">
      <img src={release.cover} alt="" />
      <Link to={`/music/${release.slug}`} className="editorial-more-info">MORE INFO <ArrowRight className="h-3.5 w-3.5" /></Link>
      <button type="button" aria-label={`Play ${release.title}`} className="editorial-play"><span aria-hidden="true">▶</span></button>
      <span className="editorial-release-number">{String(index + 1).padStart(2, "0")}</span>
    </div>
    <h3>{release.title}</h3>
    <p>{release.artist}</p>
  </article>
);

export const ScrollEditorialExperience = () => (
  <div className="scroll-editorial-experience" data-testid="scroll-editorial-experience">
    <ScrollGlyph glyph="A" from="#050505" to="#f1f0ec" label="Reveal latest releases" />

    <section className="editorial-releases">
      <header className="editorial-releases-header">
        <span className="editorial-kicker">LATEST RELEASES</span>
        <h2>LATEST<br />RELEASES</h2>
        <p>Learn more about the music, or check the latest releases of Achyut Wadhwa right here!</p>
        <Link to="/music" className="editorial-outline-link">VIEW ALL RELEASES <ArrowRight className="h-4 w-4" /></Link>
      </header>

      <div className="editorial-release-rail">
        {demoReleases.map((release, index) => <ReleaseCard key={release.title} release={release} index={index} />)}
      </div>

      <div className="editorial-mobile-link">
        <Link to="/music" className="editorial-outline-link">VIEW ALL RELEASES <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </section>

    <section className="editorial-feature">
      <div className="editorial-feature-copy">
        <span className="editorial-feature-index">ACHYUT WADHWA MUSIC</span>
        <h2>FIND YOUR<br />SOUND<br />HERE</h2>
        <p>Explore my latest creations and musical experiments.</p>
        <button type="button" className="editorial-solid-link">PLAY VIDEO</button>
      </div>
      <div className="editorial-feature-media">
        <img src={tracks[4].cover} alt="Demo video feature artwork" />
        <span className="editorial-feature-play" aria-hidden="true">▶</span>
      </div>
    </section>

    <ScrollGlyph glyph="W" from="#f1f0ec" to="#050505" label="Reveal the next chapter" />
  </div>
);
