import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

const HAS_SEGMENTER = typeof Intl !== "undefined" && "Segmenter" in Intl;
const START_Y = 18;
const WIPE_SPEED = 360;
const REVEAL_SPEED = 360;
const BLOB_STRETCH = 1.75;
const BLOB_EASE = [0.215, 0.61, 0.355, 1];

const splitChars = (text) => {
  if (HAS_SEGMENTER) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), ({ segment }) => segment);
  }
  return Array.from(text);
};

const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const travelDuration = (distance, speed, min, max) => {
  if (!Number.isFinite(distance) || distance <= 0) return min;
  return Math.min(max, Math.max(min, distance / speed));
};

export const BlobTextReveal = ({
  texts,
  prefix = "",
  className = "",
  color = "rgb(var(--color-accent-primary-soft))",
  prefixColor = "rgb(var(--color-content) / 0.88)",
  wipeColor = "rgb(var(--color-content))",
  revealColor = "rgb(var(--color-accent-primary-soft))",
  blobSize = 11,
  blobPosition = -2,
  blur = 18,
  hold = 1.25,
}) => {
  const safeTexts = useMemo(() => (texts || []).filter(Boolean), [texts]);
  const [wordIndex, setWordIndex] = useState(0);
  const wrapperRef = useRef(null);
  const charsRef = useRef([]);
  const wordIndexRef = useRef(0);
  const suppressAutoParkRef = useRef(false);
  const blobLeft = useMotionValue(0);
  const blobWidth = useMotionValue(blobSize);
  const blobMarginLeft = useTransform(blobWidth, (w) => -w / 2);
  const blobColor = useMotionValue(revealColor);
  const [blobReady, setBlobReady] = useState(false);
  const currentWord = safeTexts[wordIndex] || safeTexts[0] || "";
  const characters = useMemo(() => splitChars(currentWord), [currentWord]);
  const blobMarginBottom = Math.round(blobSize * 0.55) + blobPosition;

  useLayoutEffect(() => {
    charsRef.current.length = characters.length;
  }, [characters.length]);

  const getNodes = useCallback(() => charsRef.current.filter(Boolean), []);

  const measureLayout = useCallback(() => {
    const wrapper = wrapperRef.current;
    const nodes = getNodes();
    if (!wrapper || nodes.length === 0 || wrapper.offsetWidth < 1) return null;

    const half = blobSize / 2;
    const clearGap = Math.max(6, Math.round(blobSize * 0.45));
    const parkInset = half + clearGap;
    const chars = nodes.map((node) => ({
      left: node.offsetLeft,
      right: node.offsetLeft + node.offsetWidth,
      center: node.offsetLeft + node.offsetWidth / 2,
    }));

    if (chars.some((char) => char.right <= char.left)) return null;
    const first = chars[0];
    const last = chars[chars.length - 1];
    const maxX = wrapper.offsetWidth + blobSize + clearGap;
    const clamp = (value) => Math.min(maxX, Math.max(-blobSize * 0.25, value));

    return {
      chars,
      nodes,
      homeX: clamp(last.right + parkInset),
      leftX: clamp(Math.max(half, first.left - parkInset)),
    };
  }, [blobSize, getNodes]);

  const measureRef = useRef(measureLayout);
  measureRef.current = measureLayout;

  const waitForLayout = useCallback(async () => {
    for (let attempt = 0; attempt < 40; attempt += 1) {
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
      const layout = measureRef.current();
      if (layout) return layout;
    }
    return null;
  }, []);

  useLayoutEffect(() => {
    if (suppressAutoParkRef.current) {
      setBlobReady(true);
      return;
    }
    const layout = measureLayout();
    if (!layout) return;
    blobLeft.set(layout.homeX);
    setBlobReady(true);
  }, [blobLeft, currentWord, measureLayout]);

  useEffect(() => {
    if (safeTexts.length === 0) return undefined;

    let cancelled = false;
    let activeAnim;
    let deformAnim;
    let colorAnim;
    let holdTimer;

    const wait = (ms) => new Promise((resolve) => {
      holdTimer = setTimeout(resolve, ms);
    });

    const setVisible = (nodes) => {
      nodes.forEach((node) => {
        node.style.opacity = "1";
        node.style.filter = "blur(0px)";
        node.style.transform = "translateY(0px)";
      });
    };

    const setHidden = (nodes) => {
      nodes.forEach((node) => {
        node.style.opacity = "0";
        node.style.filter = `blur(${blur}px)`;
        node.style.transform = `translateY(${START_Y}px)`;
      });
    };

    const setBlobColor = (next, instant = false) => {
      colorAnim?.stop();
      if (instant) {
        blobColor.set(next);
        return;
      }
      colorAnim = animate(blobColor, next, { duration: 0.28, ease: BLOB_EASE });
    };

    const deformBlob = (mode) => new Promise((resolve) => {
      deformAnim?.stop();
      deformAnim = animate(blobWidth, mode === "wipe" ? blobSize * BLOB_STRETCH : blobSize, {
        duration: 0.15,
        ease: BLOB_EASE,
        onComplete: resolve,
      });
    });

    const hideWithBlob = (nodes, chars, x) => {
      const leadEdge = x - blobWidth.get() / 2;
      nodes.forEach((node, index) => {
        if (leadEdge <= chars[index]?.right) {
          node.style.opacity = "0";
          node.style.filter = `blur(${blur}px)`;
          node.style.transform = `translateY(${START_Y}px)`;
        }
      });
    };

    const revealChar = (node) => {
      animate(node, { opacity: [0, 1], y: [START_Y, 0], filter: [`blur(${blur}px)`, "blur(0px)"] }, {
        duration: 0.36,
        ease: BLOB_EASE,
      });
    };

    const revealWithBlob = (layout) => new Promise((resolve) => {
      setHidden(layout.nodes);
      blobWidth.set(blobSize * BLOB_STRETCH);
      setBlobColor(revealColor);
      const revealed = new Set();
      const revealStartX = Math.min(layout.leftX, layout.chars[0].left - (blobSize * BLOB_STRETCH) / 2 - 10);
      const revealDistance = Math.abs(layout.homeX - revealStartX);
      const revealDuration = travelDuration(revealDistance, WIPE_SPEED, 0.75, 1.15);
      let shrinkStarted = false;

      blobLeft.set(revealStartX);
      activeAnim = animate(blobLeft, layout.homeX, {
        duration: revealDuration,
        ease: "linear",
        onUpdate: (x) => {
          const leadEdge = x + blobWidth.get() / 2;
          layout.nodes.forEach((node, index) => {
            if (!revealed.has(index) && leadEdge >= layout.chars[index]?.left) {
              revealed.add(index);
              node.style.opacity = "1";
              node.style.filter = "blur(0px)";
              node.style.transform = "translateY(0px)";
            }
          });

          if (!shrinkStarted && revealDistance > 0) {
            const progress = Math.abs(x - revealStartX) / revealDistance;
            if (progress >= 0.82) {
              shrinkStarted = true;
              void deformBlob("rest");
              setBlobColor(revealColor);
            }
          }
        },
        onComplete: () => {
          setVisible(layout.nodes);
          resolve();
        },
      });
    });
    const run = async () => {
      const firstLayout = await waitForLayout();
      if (!firstLayout || cancelled) return;

      blobWidth.set(blobSize);
      setBlobColor(revealColor, true);
      blobLeft.set(firstLayout.homeX);
      setVisible(firstLayout.nodes);
      setBlobReady(true);
      suppressAutoParkRef.current = true;

      if (prefersReducedMotion()) return;

      while (!cancelled) {
        let layout = await waitForLayout();
        if (!layout || cancelled) break;
        setBlobColor(revealColor);
        blobLeft.set(layout.homeX);
        await deformBlob("rest");
        setVisible(layout.nodes);
        await wait(hold * 1000);
        if (cancelled) break;

        layout = await waitForLayout();
        if (!layout || cancelled) break;
        setBlobColor(wipeColor);
        void deformBlob("wipe");
        const wipeDistance = Math.abs(layout.homeX - layout.leftX);
        const wipeDuration = travelDuration(wipeDistance, WIPE_SPEED, 0.75, 1.15);
        let shrinkStarted = false;

        await new Promise((resolve) => {
          activeAnim = animate(blobLeft, layout.leftX, {
            duration: wipeDuration,
            ease: "linear",
            onUpdate: (x) => {
              hideWithBlob(layout.nodes, layout.chars, x);
              if (!shrinkStarted && wipeDistance > 0 && Math.abs(layout.homeX - x) / wipeDistance >= 0.82) {
                shrinkStarted = true;
                void deformBlob("rest");
                setBlobColor(revealColor);
              }
            },
            onComplete: resolve,
          });
        });

        if (cancelled) break;
        const nextIndex = (wordIndexRef.current + 1) % safeTexts.length;
        wordIndexRef.current = nextIndex;
        setWordIndex(nextIndex);

        await new Promise((resolve) => window.requestAnimationFrame(resolve));
        const revealLayout = await waitForLayout();
        if (!revealLayout || cancelled) break;
        await revealWithBlob(revealLayout);
        blobLeft.set(revealLayout.homeX);
      }
    };

    run();

    return () => {
      cancelled = true;
      suppressAutoParkRef.current = false;
      clearTimeout(holdTimer);
      activeAnim?.stop();
      deformAnim?.stop();
      colorAnim?.stop();
      blobWidth.set(blobSize);
    };
  }, [safeTexts, hold, blur, blobLeft, blobWidth, blobColor, blobSize, revealColor, waitForLayout, wipeColor]);

  if (safeTexts.length === 0) return null;

  return (
    <div className={`blob-text-reveal ${className}`} aria-label={`${prefix ? `${prefix} ` : ""}${safeTexts.join(", ")}`}>
      {prefix ? <span className="blob-text-reveal-prefix" style={{ color: prefixColor }}>{prefix}</span> : null}
      <span ref={wrapperRef} className="blob-text-reveal-word" style={{ color, paddingRight: 0 }}>
        <span aria-hidden="true" className="blob-text-reveal-chars">
          {characters.map((char, index) => (
            <span
              key={`${currentWord}-${index}`}
              ref={(node) => {
                charsRef.current[index] = node;
              }}
              className="blob-text-reveal-char"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </span>
        <span className="sr-only">{currentWord}</span>
        <motion.span
          aria-hidden="true"
          className="blob-text-reveal-blob"
          style={{
            x: blobLeft,
            width: blobWidth,
            height: blobSize,
            marginLeft: blobMarginLeft,
            marginBottom: blobMarginBottom,
            backgroundColor: blobColor,
            opacity: blobReady ? 1 : 0,
          }}
        />
      </span>
    </div>
  );
};