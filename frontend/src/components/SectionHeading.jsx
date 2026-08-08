import React from "react";
import { motion } from "framer-motion";

// Reusable section heading with eyebrow, mono index and large display title.
export const SectionHeading = ({ eyebrow, index, title, subtitle, align = "left", className = "" }) => (
  <div className={`section-heading ${align === "center" ? "text-center mx-auto max-w-2xl" : "max-w-3xl"} ${className}`}>
    {(eyebrow || index) && (
      <div className={`mb-6 flex items-center gap-4 ${align === "center" ? "justify-center" : ""}`}>
        {index && <span className="font-mono text-[11px] text-white/40">{index}</span>}
        <span className="section-heading-line h-px w-12 bg-gradient-to-r from-cyan/80 to-cyan/10" />
        <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-cyan">{eyebrow}</span>
      </div>
    )}
    <motion.h2
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="font-display text-4xl font-bold uppercase leading-[0.92] tracking-tight sm:text-5xl lg:text-6xl"
    >
      {title}
    </motion.h2>
    {subtitle && (
      <p className="mt-5 max-w-2xl text-[15px] font-light leading-[1.8] text-white/60 md:text-[17px]">
        {subtitle}
      </p>
    )}
  </div>
);
