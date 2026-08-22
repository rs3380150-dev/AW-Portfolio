import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, Ticket, ArrowUpRight } from "@/components/icons";
import { useSpotlightProps } from "@/components/Spotlight";
import { formatEventDate } from "@/utils/formatEventDate.mjs";

const statusStyle = {
  upcoming: "text-cyan border-cyan/40 bg-cyan/10",
  "sold-out": "text-magenta border-magenta/40 bg-magenta/10",
  completed: "text-white/50 border-white/15 bg-white/5",
};
const statusLabel = { upcoming: "Upcoming", "sold-out": "Sold Out", completed: "Completed" };

export const EventCard = ({ event, index = 0 }) => {
  const d = formatEventDate(event.date);
  const soldOrDone = event.status === "sold-out" || event.status === "completed";
  const spotlightProps = useSpotlightProps();

  return (
    <motion.article
      {...spotlightProps}
      data-testid={`event-card-${event.id}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: (index % 3) * 0.08 }}
      className="spotlight-card group relative grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-6 items-center glass rounded-md p-5 sm:p-6 hover:border-cyan/35 hover:shadow-[0_0_30px_rgba(7,92,138,0.12)] transition-[border-color,box-shadow] duration-500"
    >
      <div data-spotlight-block className="relative overflow-hidden rounded sm:w-[120px] h-40 sm:h-28">
        <img src={event.poster} alt={event.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-2xl font-bold text-white leading-none">{d.day}</span>
            <div className="font-mono text-xs text-white/50 leading-tight">
              <div>{d.mon}</div><div>{d.year}</div>
            </div>
            <span className={`ml-2 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusStyle[event.status]}`}>
              {statusLabel[event.status]}
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-semibold tracking-tight">{event.name}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/55">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-cyan" />{event.venue}, {event.city}, {event.country}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-cyan" />{event.time}</span>
          </div>
        </div>

        <a
          href={soldOrDone ? undefined : event.ticket}
          target={soldOrDone ? undefined : "_blank"}
          rel="noreferrer"
          aria-disabled={soldOrDone}
          data-testid={`event-ticket-${event.id}`}
          onClick={(e) => soldOrDone && e.preventDefault()}
          className={`shrink-0 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-[transform,box-shadow,background-color] duration-300 ${
            soldOrDone
              ? "border border-white/10 text-white/40 cursor-not-allowed"
              : "action-accent bg-magenta hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(31,95,128,0.38)]"
          }`}
        >
          {soldOrDone ? (statusLabel[event.status]) : (<><Ticket className="h-4 w-4" /> Tickets <ArrowUpRight className="h-4 w-4" /></>)}
        </a>
      </div>
    </motion.article>
  );
};
