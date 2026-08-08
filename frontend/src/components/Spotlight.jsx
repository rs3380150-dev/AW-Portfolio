import { useCallback, useEffect, useRef } from "react";

export const useSpotlightProps = () => {
  const frameRef = useRef(0);
  const targetRef = useRef(null);
  const pointRef = useRef({ x: 0, y: 0 });

  useEffect(() => () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
  }, []);

  const applySpotlight = useCallback(() => {
    frameRef.current = 0;

    const target = targetRef.current;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    target.style.setProperty("--spotlight-x", `${pointRef.current.x - rect.left}px`);
    target.style.setProperty("--spotlight-y", `${pointRef.current.y - rect.top}px`);
    target.style.setProperty("--spotlight-opacity", "1");
  }, []);

  const updateSpotlight = useCallback((event) => {
    if (event.pointerType === "touch") return;

    const blocked = event.target.closest?.("[data-spotlight-block]");
    if (blocked && event.currentTarget.contains(blocked)) {
      event.currentTarget.style.setProperty("--spotlight-opacity", "0");
      return false;
    }

    targetRef.current = event.currentTarget;
    pointRef.current = { x: event.clientX, y: event.clientY };

    if (!frameRef.current) {
      frameRef.current = requestAnimationFrame(applySpotlight);
    }

    return true;
  }, [applySpotlight]);

  const showSpotlight = useCallback((event) => {
    updateSpotlight(event);
  }, [updateSpotlight]);

  const hideSpotlight = useCallback((event) => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    targetRef.current = null;
    event.currentTarget.style.setProperty("--spotlight-opacity", "0");
  }, []);

  return {
    onPointerEnter: showSpotlight,
    onPointerMove: showSpotlight,
    onPointerLeave: hideSpotlight,
  };
};
