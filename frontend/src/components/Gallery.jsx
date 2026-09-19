import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "@/components/icons";

export const Lightbox = ({ items, index, onClose, onPrev, onNext }) => {
  const item = items[index];
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!item) return undefined;

    const previousOverflow = document.body.style.overflow;
    const lenis = window.__novaLenis;
    document.body.style.overflow = "hidden";
    lenis?.stop?.();
    closeButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      lenis?.start?.();
    };
  }, [item, onClose]);

  if (index === null || index < 0 || !item) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        data-testid="lightbox"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-void/95 backdrop-blur-xl grid place-items-center p-4"
        onClick={onClose}
      >
        <button ref={closeButtonRef} data-testid="lightbox-close" aria-label="Close" onClick={(event) => { event.stopPropagation(); onClose(); }} className="absolute top-6 right-6 z-10 h-12 w-12 grid place-items-center rounded-full glass text-white hover:text-cyan transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan">
          <X className="h-6 w-6" />
        </button>
        <button data-testid="lightbox-prev" aria-label="Previous" onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-4 md:left-10 h-12 w-12 grid place-items-center rounded-full glass text-white hover:text-cyan transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button data-testid="lightbox-next" aria-label="Next" onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-4 md:right-10 h-12 w-12 grid place-items-center rounded-full glass text-white hover:text-cyan transition-colors">
          <ChevronRight className="h-6 w-6" />
        </button>
        <motion.img
          key={item.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          src={item.src}
          alt={item.alt}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-md"
        />
        <div className="absolute bottom-8 font-mono text-xs text-white/50">{index + 1} / {items.length}</div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};

export const GalleryItem = ({ item, onOpen, index = 0 }) => (
  <motion.button
    data-testid={`gallery-item-${item.id}`}
    initial={{ clipPath: "inset(100% 0 0 0)", opacity: 0 }}
    animate={{ clipPath: "inset(0% 0 0 0)", opacity: 1 }}
    transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: (index % 4) * 0.06 }}
    onClick={onOpen}
    className="group relative mb-6 block w-full overflow-hidden break-inside-avoid"
  >
    <motion.div
      initial={{ scale: 1.18 }}
      animate={{ scale: 1 }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: (index % 4) * 0.06 }}
    >
      <img
        src={item.src}
        alt={item.alt}
        loading={index < 6 ? "eager" : "lazy"}
        decoding="async"
        className="duration-gallery-hover w-full object-cover transition-transform ease-out group-hover:scale-105"
      />
    </motion.div>
    <div className="gallery-image-overlay absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <span className="gallery-image-caption absolute bottom-4 left-4 text-sm font-medium text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-[opacity,transform] duration-500">
      {item.alt}
    </span>
  </motion.button>
);
