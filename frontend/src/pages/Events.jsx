import React, { useMemo, useState } from "react";
import { CalendarDays } from "@/components/icons";
import { EventCard } from "@/components/EventCard";
import { SectionHeading } from "@/components/SectionHeading";
import { ScrollReveal } from "@/components/Motion";
import { events } from "@/data/events";
import { site } from "@/data/site";

const filters = [
  { id: "all", label: "All Dates" },
  { id: "upcoming", label: "Upcoming" },
  { id: "festival", label: "Festivals" },
  { id: "club", label: "Club Nights" },
  { id: "completed", label: "Archive" },
];

export const Events = () => {
  const [active, setActive] = useState("all");
  const filtered = useMemo(() => {
    const list = active === "all"
      ? events
      : events.filter((event) => event.status === active || event.type === active);

    return [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [active]);

  return (
    <div className="page-shell" data-testid="events-page">
      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <SectionHeading
              index="01"
              eyebrow="Tour"
              title="A calendar made for movement."
              subtitle="Browse DJ sets, live performance formats, club nights, festivals, and selected private appearances."
            />
            <ScrollReveal className="glass rounded-md p-6">
              <CalendarDays className="h-8 w-8 text-cyan" />
              <p className="mt-4 text-sm font-mono uppercase tracking-[0.2em] text-white/45">Availability</p>
              <p className="mt-2 text-lg font-semibold">{site.availability}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                For holds, festival slots, live formats, production collaborations, and bespoke event concepts, reach out through the booking page.
              </p>
            </ScrollReveal>
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActive(filter.id)}
                data-testid={`event-filter-${filter.id}`}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  active === filter.id
                    ? "border-cyan bg-cyan text-void"
                    : "border-white/10 text-white/60 hover:border-cyan/50 hover:text-cyan"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-5">
            {filtered.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
