import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "@/components/icons";

export const ScrollToTop = () => {
  const [show, setShow] = useState(false);

  const scrollToTop = () => {
    if (window.__novaLenis) {
      window.__novaLenis.scrollTo(0, { duration: 0.9 });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          data-testid="scroll-to-top"
          aria-label="Scroll to top"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          onClick={scrollToTop}
          className="fixed bottom-28 right-6 z-40 h-12 w-12 grid place-items-center rounded-full glass text-white hover:text-cyan hover:border-cyan/50 transition-colors"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
