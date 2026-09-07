import { motion } from "framer-motion";
import { REVEAL_EASE } from "@/components/Motion";

// Reusable section heading with eyebrow, mono index and large display title.
export const SectionHeading = ({ eyebrow, index, title, subtitle, align = "left", className = "" }) => {
  const words = title.split(/\s+/);

  return (
    <div className={`section-heading ${align === "center" ? "mx-auto max-w-4xl text-center" : "max-w-5xl"} ${className}`}>
      {(eyebrow || index) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: REVEAL_EASE }}
          className={`mb-8 flex items-baseline gap-4 md:gap-6 ${align === "center" ? "justify-center" : ""}`}
        >
          {index && <span className="font-display text-xs font-bold tracking-[0.3em] text-cyan md:text-sm">{index}</span>}
          <span className="section-heading-line h-px w-10 bg-white/25 md:w-16" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.4em] text-white/55 md:text-xs">{eyebrow}</span>
        </motion.div>
      )}
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-8%" }}
        className="font-display text-[12vw] font-bold uppercase leading-[0.88] tracking-tighter text-white sm:text-[8vw] lg:text-[5.8vw]"
      >
        {words.map((word, wordIndex) => (
          <span key={`${word}-${wordIndex}`} className="mr-[0.18em] inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span
              className="inline-block"
              variants={{ hidden: { y: "110%" }, visible: { y: "0%" } }}
              transition={{ duration: 0.8, delay: wordIndex * 0.055, ease: REVEAL_EASE }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, delay: 0.12, ease: REVEAL_EASE }}
          className={`mt-7 max-w-2xl text-base font-light leading-[1.75] text-white/60 ${align === "center" ? "mx-auto" : ""}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};
