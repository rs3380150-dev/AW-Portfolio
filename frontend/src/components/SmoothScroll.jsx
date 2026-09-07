import { useEffect } from "react";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const reduceMotionQuery = "(prefers-reduced-motion: reduce)";

export const SmoothScroll = () => {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia?.(reduceMotionQuery).matches;
    const touchDevice = window.matchMedia?.("(hover: none), (pointer: coarse)").matches || navigator.maxTouchPoints > 0;
    const lowPowerDevice =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      (navigator.deviceMemory && navigator.deviceMemory <= 4);

    if (reduceMotion || touchDevice || lowPowerDevice) {
      window.__novaLenis = null;
      const syncHiddenState = () => root.classList.toggle("is-tab-hidden", document.hidden);
      syncHiddenState();
      document.addEventListener("visibilitychange", syncHiddenState);

      return () => {
        document.removeEventListener("visibilitychange", syncHiddenState);
        root.classList.remove("is-tab-hidden");
      };
    }

    const lenis = new Lenis({
      lerp: 0.09,
      touchMultiplier: 1,
      smoothWheel: true,
      autoRaf: false,
    });

    window.__novaLenis = lenis;

    let frame = 0;
    let scrollFrame = 0;
    let refreshFrame = 0;
    let running = false;

    const scheduleScrollTriggerUpdate = () => {
      if (scrollFrame || document.hidden) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        ScrollTrigger.update();
      });
    };

    const raf = (time) => {
      if (!running) return;
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    const start = () => {
      if (running || document.hidden) return;
      running = true;
      lenis.start?.();
      frame = requestAnimationFrame(raf);
    };

    const stop = () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lenis.stop?.();
    };

    const syncVisibility = () => {
      root.classList.toggle("is-tab-hidden", document.hidden);

      if (document.hidden) {
        stop();
        return;
      }

      start();
      if (refreshFrame) cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    lenis.on("scroll", scheduleScrollTriggerUpdate);
    document.addEventListener("visibilitychange", syncVisibility);
    syncVisibility();

    return () => {
      stop();
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      if (refreshFrame) cancelAnimationFrame(refreshFrame);
      document.removeEventListener("visibilitychange", syncVisibility);
      root.classList.remove("is-tab-hidden");
      lenis.off("scroll", scheduleScrollTriggerUpdate);
      lenis.destroy();
      window.__novaLenis = null;
    };
  }, []);

  return null;
};
