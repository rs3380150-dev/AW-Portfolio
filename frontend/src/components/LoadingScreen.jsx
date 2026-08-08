import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Equalizer } from "@/components/Motion";

export const LoadingScreen = () => {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          data-testid="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          className="fixed inset-0 z-[100] grid place-items-center bg-void"
        >
          <div className="flex flex-col items-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display text-4xl md:text-6xl font-bold uppercase tracking-tight"
            >
              ACHYUT<span className="text-cyan"> WADHWA</span>
            </motion.div>
            <Equalizer bars={9} variant="random" className="h-8" />
            <div className="h-px w-40 bg-white/10 overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
                className="h-full w-full bg-cyan"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
