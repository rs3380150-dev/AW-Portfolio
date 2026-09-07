import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const REVEAL_EASE = [0.22, 1, 0.36, 1];
const CURTAIN_EASE = [0.76, 0, 0.24, 1];

export const LoadingScreen = () => {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1700);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          data-testid="loading-screen"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: CURTAIN_EASE }}
          className="fixed inset-0 z-[110] flex flex-col items-center justify-center bg-void"
        >
          <div className="overflow-hidden">
            <motion.div
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.7, ease: REVEAL_EASE }}
              className="font-display text-2xl font-bold uppercase tracking-[0.3em] text-white md:text-4xl"
            >
              ACHYUT WADHWA
            </motion.div>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-4 font-mono text-[9px] uppercase tracking-[0.5em] text-white/55"
          >
            Music / Performance / Sound
          </motion.p>
          <div className="mt-10 h-px w-48 overflow-hidden bg-white/15 md:w-64">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
              className="h-full bg-cyan"
              style={{ transformOrigin: "left" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
