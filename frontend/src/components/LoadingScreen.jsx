import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const REVEAL_EASE = [0.22, 1, 0.36, 1];
const CURTAIN_EASE = [0.76, 0, 0.24, 1];
const NAME = "ACHYUT WADHWA";
const LOADER_SESSION_KEY = "achyut-wadhwa-loader-seen";

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
  const [shouldShow] = useState(() => {
    try {
      const hasSeenLoader = window.sessionStorage.getItem(LOADER_SESSION_KEY);
      window.sessionStorage.setItem(LOADER_SESSION_KEY, "true");

      return window.location.pathname === "/" && !hasSeenLoader;
    } catch {
      return window.location.pathname === "/";
    }
  });
  const [done, setDone] = useState(false);
  const [phase, setPhase] = useState("letters");
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!shouldShow) return undefined;

    if (reduceMotion) {
      const timer = setTimeout(() => setDone(true), 650);
      return () => clearTimeout(timer);
    }

    const lineTimer = setTimeout(() => setPhase("line"), 2140);
    const liftTimer = setTimeout(() => setPhase("lift"), 2820);
    const doneTimer = setTimeout(() => setDone(true), 3660);

    return () => {
      clearTimeout(lineTimer);
      clearTimeout(liftTimer);
      clearTimeout(doneTimer);
    };
  }, [reduceMotion, shouldShow]);

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          data-testid="loading-screen"
          aria-label="Loading Achyut Wadhwa"
          initial={{ y: "0%", opacity: 1 }}
          animate={phase === "lift" ? { y: "-100%", opacity: [1, 1, 0] } : { y: "0%", opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={phase === "lift"
            ? {
                y: { duration: 0.78, ease: CURTAIN_EASE },
                opacity: { duration: 0.78, times: [0, 0.82, 1], ease: CURTAIN_EASE },
              }
            : { duration: reduceMotion ? 0.15 : 0.18, ease: CURTAIN_EASE }}
          className="fixed inset-0 z-[110] grid place-items-center overflow-hidden bg-void"
        >
          <div className="absolute inset-0 grid place-items-center">
            <h1
              aria-label={NAME}
              className="relative z-10 flex w-fit items-center justify-center gap-[0.045em] text-[clamp(2.9rem,9vw,10rem)] leading-none"
            >
              {NAME.split(" ").map((word, wordIndex) => (
                <span key={word} className={`flex items-center gap-[0.045em] ${wordIndex ? "ml-[0.16em]" : ""}`}>
                  {Array.from(word).map((letter, letterIndex) => {
                    const index = NAME.indexOf(word) + letterIndex;

                    return (
                      <motion.span
                        key={`${letter}-${index}`}
                        initial={false}
                        animate={{ opacity: 1, scaleX: 1, scaleY: 1, filter: "blur(0px)" }}
                        transition={{ duration: 0.01 }}
                        style={{ transformOrigin: "center center" }}
                        className="inline-flex shrink-0"
                      >
                        <MorphingLetter letter={letter} index={index} reduceMotion={reduceMotion} />
                      </motion.span>
                    );
                  })}
                </span>
              ))}
              <motion.span
              aria-hidden="true"
              initial={{ x: "-50%", scaleX: 0, opacity: 0 }}
              animate={phase === "letters"
                ? { x: "-50%", scaleX: 0, opacity: 0 }
                : { x: "-50%", scaleX: 1, opacity: 1 }}
                transition={{
                  scaleX: { duration: reduceMotion ? 0.01 : 0.58, ease: REVEAL_EASE },
                  opacity: { duration: reduceMotion ? 0.01 : 0.12 },
                }}
              className="absolute bottom-[-clamp(2rem,2.8vw,3rem)] left-1/2 h-px w-3/4 origin-left bg-[#f2f0ea]"
              />
            </h1>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
