import React, { useEffect, useMemo, useState } from "react";

const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const HOLD_MS = 2100;
const CHAR_STEP_MS = 55;
const CHAR_ANIM_MS = 360;

const splitChars = (text) => Array.from(text);

export const BlobTextReveal = ({ texts, className = "" }) => {
  const safeTexts = useMemo(() => (texts || []).filter(Boolean), [texts]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("visible");

  const currentText = safeTexts[index] || "";
  const characters = useMemo(() => splitChars(currentText), [currentText]);
  const phaseDuration = Math.max(CHAR_ANIM_MS, CHAR_ANIM_MS + Math.max(0, characters.length - 1) * CHAR_STEP_MS);

  useEffect(() => {
    if (safeTexts.length <= 1 || prefersReducedMotion()) return undefined;

    let holdTimer;
    let exitTimer;
    let enterTimer;

    const runCycle = () => {
      holdTimer = window.setTimeout(() => {
        setPhase("exit");

        exitTimer = window.setTimeout(() => {
          setIndex((current) => (current + 1) % safeTexts.length);
          setPhase("enter");

          enterTimer = window.setTimeout(() => {
            setPhase("visible");
            runCycle();
          }, phaseDuration);
        }, phaseDuration);
      }, HOLD_MS);
    };

    runCycle();

    return () => {
      window.clearTimeout(holdTimer);
      window.clearTimeout(exitTimer);
      window.clearTimeout(enterTimer);
    };
  }, [safeTexts.length, phaseDuration]);

  if (safeTexts.length === 0) return null;

  return (
    <div className={`role-text-reveal ${className}`} aria-label={safeTexts.join(", ")}>
      <span className={`role-text-reveal-word is-${phase}`} key={`${currentText}-${phase}`} aria-hidden="true" style={{ "--char-count": characters.length }}>
        {characters.map((char, charIndex) => (
          <span key={`${currentText}-${charIndex}`} className="role-text-reveal-char" style={{ "--char-index": charIndex }}>
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
      <span className="sr-only">{currentText}</span>
    </div>
  );
};