import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotionQuery = "(prefers-reduced-motion: reduce)";
const desktopMotionQuery = "(min-width: 768px) and (hover: hover) and (pointer: fine)";

export const GsapEnhancer = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if (typeof window === "undefined" || window.matchMedia(reduceMotionQuery).matches) return undefined;

    const cleanups = [];
    let refreshFrame = 0;
    const canUseParallax = window.matchMedia(desktopMotionQuery).matches;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gsap-page-root",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.65, ease: "power3.out", clearProps: "opacity,visibility,transform" },
      );

      gsap.utils.toArray(".section-heading-line").forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: line, start: "top 88%", once: true },
          },
        );
      });

      gsap.utils.toArray(".spotlight-card").forEach((card) => {
        const lift = () => gsap.to(card, { y: -3, duration: 0.42, ease: "power3.out", overwrite: "auto" });
        const settle = () => gsap.to(card, { y: 0, duration: 0.55, ease: "power3.out", overwrite: "auto" });

        card.addEventListener("pointerenter", lift);
        card.addEventListener("pointerleave", settle);
        cleanups.push(() => {
          card.removeEventListener("pointerenter", lift);
          card.removeEventListener("pointerleave", settle);
        });
      });

      if (canUseParallax) {
        gsap.utils.toArray(".gsap-parallax-media").forEach((media) => {
          gsap.fromTo(
            media,
            { scale: 1.045, yPercent: 3 },
            {
              scale: 1.045,
              yPercent: -3,
              ease: "none",
              scrollTrigger: {
                trigger: media.closest("section") || media,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.7,
              },
            },
          );
        });
      }

      refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    return () => {
      if (refreshFrame) window.cancelAnimationFrame(refreshFrame);
      cleanups.forEach((cleanup) => cleanup());
      ctx.revert();
    };
  }, [pathname]);

  return null;
};
