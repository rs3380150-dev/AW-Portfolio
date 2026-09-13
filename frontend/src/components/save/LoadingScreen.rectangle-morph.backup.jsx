import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const REVEAL_EASE = [0.22, 1, 0.36, 1];
const CURTAIN_EASE = [0.76, 0, 0.24, 1];
const NAME = "ACHYUT WADHWA";

const MorphingLetter = ({ letter, index, reduceMotion }) => {
  const delay = reduceMotion ? 0 : 0.1 + index * 0.055;
  const filterId = `loading-letter-morph-${index}`;

  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      initial={{ opacity: 0, scaleX: 0.12, scaleY: 1.3, marginRight: "0.02em" }}
      animate={{
        opacity: 1,
        scaleX: reduceMotion ? 1 : [0.12, 0.76, 0.76, 1],
        scaleY: reduceMotion ? 1 : [1.3, 1.3, 1.3, 1],
        marginRight: reduceMotion ? 0 : ["0.02em", "0.02em", "0.02em", 0],
      }}
      transition={{
        opacity: { duration: reduceMotion ? 0.01 : 0.16, delay },
        scaleX: { duration: reduceMotion ? 0.01 : 1.15, times: [0, 0.14, 0.6, 1], delay, ease: REVEAL_EASE },
        scaleY: { duration: reduceMotion ? 0.01 : 1.15, times: [0, 0.14, 0.6, 1], delay, ease: REVEAL_EASE },
        marginRight: { duration: reduceMotion ? 0.01 : 1.15, times: [0, 0.14, 0.6, 1], delay, ease: REVEAL_EASE },
      }}
      className="h-[0.92em] w-[0.72em] origin-center overflow-visible"
    >
      <filter id={filterId} x="0" y="0" width="100" height="100" filterUnits="userSpaceOnUse">
        <feMorphology
          in="SourceGraphic"
          operator="dilate"
          radius={reduceMotion ? 0 : 74}
        >
          {!reduceMotion && (
            <animate
              attributeName="radius"
              values="74;74;0"
              keyTimes="0;0.32;1"
              dur="1.15s"
              begin={`${delay}s`}
              fill="freeze"
            />
          )}
        </feMorphology>
      </filter>
      <motion.rect
        x="0"
        y="5"
        width="100"
        height="90"
        fill="#f2f0ea"
        initial={{ opacity: 0 }}
        animate={{ opacity: reduceMotion ? 0 : [0, 1, 1, 0] }}
        transition={{
          duration: reduceMotion ? 0.01 : 1.15,
          times: [0, 0.13, 0.54, 1],
          delay,
          ease: REVEAL_EASE,
        }}
      />
      <text
        x="50"
        y="82"
        textAnchor="middle"
        textLength="84"
        lengthAdjust="spacingAndGlyphs"
        filter={`url(#${filterId})`}
        fill="#f2f0ea"
        className="font-display font-black"
        style={{ fontSize: 88 }}
      >
        {letter}
      </text>
    </motion.svg>
  );
};

export const LoadingScreen = () => {
  const [done, setDone] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), reduceMotion ? 550 : 2900);
    return () => clearTimeout(timer);
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          data-testid="loading-screen"
          aria-label="Loading Achyut Wadhwa"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: reduceMotion ? 0.25 : 0.85, ease: CURTAIN_EASE }}
          className="fixed inset-0 z-[110] grid place-items-center overflow-hidden bg-void"
        >
          <h1
            aria-label={NAME}
            className="flex items-center justify-center gap-[0.045em] text-[clamp(2.9rem,9vw,10rem)] leading-none"
          >
            {NAME.split(" ").map((word, wordIndex) => (
              <span key={word} className={`flex items-center gap-[0.045em] ${wordIndex ? "ml-[0.16em]" : ""}`}>
                {Array.from(word).map((letter, letterIndex) => {
                  const index = NAME.indexOf(word) + letterIndex;
                  return <MorphingLetter key={`${letter}-${index}`} letter={letter} index={index} reduceMotion={reduceMotion} />;
                })}
              </span>
            ))}
          </h1>

          <motion.div
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.75, delay: reduceMotion ? 0 : 1.95, ease: REVEAL_EASE }}
            className="absolute bottom-9 left-[7vw] right-[7vw] h-px origin-left bg-[#f2f0ea] md:bottom-12"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
