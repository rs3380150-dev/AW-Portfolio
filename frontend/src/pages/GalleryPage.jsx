import React, { useMemo, useState } from "react";
import { GalleryItem, Lightbox } from "@/components/Gallery";
import { SectionHeading } from "@/components/SectionHeading";
import { gallery, galleryCategories } from "@/data/gallery";

export const GalleryPage = () => {
  const [active, setActive] = useState("all");
  const [openIndex, setOpenIndex] = useState(null);
  const filtered = useMemo(
    () => (active === "all" ? gallery : gallery.filter((item) => item.category === active)),
    [active],
  );

  const close = () => setOpenIndex(null);
  const prev = () => setOpenIndex((index) => (index <= 0 ? filtered.length - 1 : index - 1));
  const next = () => setOpenIndex((index) => (index >= filtered.length - 1 ? 0 : index + 1));

  return (
    <div className="page-shell" data-testid="gallery-page">
      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1500px]">
          <SectionHeading
            index="01"
            eyebrow="Gallery"
            title="Fragments from the loud parts."
            subtitle="A modular visual archive from live shows, studio sessions, promo shoots, and crowds."
          />

          <div className="mt-12 flex flex-wrap gap-3">
            {galleryCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  setActive(category.id);
                  setOpenIndex(null);
                }}
                data-testid={`gallery-filter-${category.id}`}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  active === category.id
                    ? "border-cyan bg-cyan text-void"
                    : "border-white/10 text-white/60 hover:border-cyan/50 hover:text-cyan"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="mt-10 columns-1 gap-6 sm:columns-2 lg:columns-3">
            {filtered.map((item, index) => (
              <GalleryItem key={item.id} item={item} index={index} onOpen={() => setOpenIndex(index)} />
            ))}
          </div>
        </div>
      </section>

      <Lightbox items={filtered} index={openIndex} onClose={close} onPrev={prev} onNext={next} />
    </div>
  );
};
