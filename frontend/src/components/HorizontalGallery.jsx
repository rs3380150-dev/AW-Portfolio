import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";

const GalleryFrame = ({ item, index, wide = false }) => (
  <figure
    data-cursor="VIEW"
    className={`group relative shrink-0 overflow-hidden ${
      wide ? "h-[46vh] w-[78vw] md:h-[62vh] md:w-[42vw]" : "h-[46vh] w-[64vw] md:h-[62vh] md:w-[30vw]"
    }`}
  >
    <img
      src={item.src}
      alt={item.alt}
      loading="lazy"
      className="duration-gallery-hover industrial-image h-full w-full object-cover transition-transform ease-out group-hover:scale-105"
    />
    <div className="absolute inset-0 bg-void/20 transition-opacity duration-500 group-hover:opacity-0" />
    <figcaption className="absolute bottom-4 left-4 flex items-center gap-3">
      <span className="h-px w-6 bg-cyan" />
      <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.4em] text-white">
        {String(index + 1).padStart(2, "0")} / {item.category || "LIVE"}
      </span>
    </figcaption>
  </figure>
);

export const HorizontalGallery = ({ items }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["4%", "-68%"]);

  return (
    <section id="gallery-showcase" ref={ref} className="relative bg-navy py-28 md:h-[300vh] md:py-0" data-testid="horizontal-gallery">
      <div className="px-6 pb-12 md:hidden">
        <SectionHeading index="04" eyebrow="Gallery" title="Light, sweat, signal." />
      </div>

      <div className="hidden h-screen overflow-hidden md:sticky md:top-0 md:block">
        <div className="absolute left-10 top-28 z-10 w-[34rem]">
          <SectionHeading index="04" eyebrow="Gallery" title="Light, sweat, signal." />
        </div>
        <motion.div style={{ x }} className="flex h-full items-center gap-6 pl-[6vw] pt-28">
          <div className="flex h-[62vh] w-[30vw] shrink-0 flex-col justify-end border-l border-white/20 pb-5 pl-6">
            <p className="font-display text-[7vw] font-black uppercase leading-[0.78] tracking-tighter text-white">LIVE</p>
            <p className="mt-5 max-w-xs font-sans text-sm leading-relaxed text-white/55">
              Studio, stage and everything in between. Scroll to move through the room.
            </p>
          </div>
          {items.slice(0, 6).map((item, index) => (
            <GalleryFrame key={item.id} item={item} index={index} wide={index % 3 === 0} />
          ))}
        </motion.div>
      </div>

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 md:hidden">
        {items.slice(0, 6).map((item, index) => (
          <div key={item.id} className="snap-start">
            <GalleryFrame item={item} index={index} wide={index % 3 === 0} />
          </div>
        ))}
      </div>
    </section>
  );
};
