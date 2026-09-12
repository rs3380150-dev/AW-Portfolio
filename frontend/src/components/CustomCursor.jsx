import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const CustomCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);
  const [label, setLabel] = useState("");
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 550, damping: 45, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 550, damping: 45, mass: 0.5 });

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;

    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const onMove = (event) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };

    const onOver = (event) => {
      const target = event.target.closest?.("[data-cursor], a, button, input, select, textarea, label");
      if (!target) {
        setActive(false);
        setLabel("");
        return;
      }

      setActive(true);
      setLabel(target.getAttribute("data-cursor") || "");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, [x, y]);

  if (!enabled) return null;

  const diameter = active ? (label ? 82 : 36) : 18;

  return (
    <motion.div
      aria-hidden="true"
      data-testid="custom-cursor"
      className="custom-cursor-surface pointer-events-none fixed left-0 top-0 z-[120] flex items-center justify-center overflow-hidden"
      animate={{ width: diameter, height: diameter }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      style={{
        x: springX,
        y: springY,
        translate: "-50% -50%",
        borderRadius: "50%",
        willChange: "transform, width, height",
      }}
    >
      {label && active ? (
        <span className="font-sans text-[9px] font-semibold uppercase tracking-[0.25em] text-black">
          {label}
        </span>
      ) : null}
    </motion.div>
  );
};
