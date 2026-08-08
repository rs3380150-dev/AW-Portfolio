import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

// Animated count-up used for stat blocks.
export const StatCounter = ({ value = 0, suffix = "", label, index = 0, displayValue }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);
  const shouldAnimate = displayValue === undefined && typeof value === "number";
  const isFloat = shouldAnimate && !Number.isInteger(value);

  useEffect(() => {
    if (!inView || !shouldAnimate) return;
    let raf;
    const start = performance.now();
    const dur = 1600;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(isFloat ? +(value * eased).toFixed(1) : Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, isFloat, shouldAnimate]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      data-testid={`stat-${index}`}
      className="text-center sm:text-left"
    >
      <div className="font-display text-5xl md:text-6xl font-bold tracking-tight">
        {displayValue ?? display}<span className="text-cyan">{suffix}</span>
      </div>
      <div className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-white/45">{label}</div>
    </motion.div>
  );
};
