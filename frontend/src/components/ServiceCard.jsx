import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  AudioWaveform,
  Building2,
  Disc3,
  GraduationCap,
  Handshake,
  Heart,
  Music,
  PartyPopper,
  Repeat2,
  SlidersVertical,
} from "@/components/icons";
import { useSpotlightProps } from "@/components/Spotlight";

const icons = {
  AudioWaveform,
  Building2,
  Disc3,
  GraduationCap,
  Handshake,
  Heart,
  Music,
  PartyPopper,
  Repeat2,
  SlidersVertical,
};

export const ServiceCard = ({ service, index = 0 }) => {
  const Icon = icons[service.icon] || Music;
  const spotlightProps = useSpotlightProps();

  return (
    <motion.article
      {...spotlightProps}
      data-testid={`service-card-${service.id}`}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.07 }}
      className="spotlight-card group relative flex flex-col bg-tinted rounded-md p-8 border border-white/5 hover:border-cyan/30 transition-colors duration-300 overflow-hidden"
    >
      <div className="spotlight-decor absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <span className="h-14 w-14 grid place-items-center rounded-md bg-white/5 text-cyan mb-6 group-hover:bg-cyan group-hover:text-void transition-colors duration-300">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="text-xl font-semibold tracking-tight">{service.title}</h3>
      <p className="mt-3 text-sm text-white/55 leading-relaxed flex-1">{service.description}</p>
      <Link
        to={`/contact?service=${encodeURIComponent(service.title)}`}
        data-testid={`service-enquire-${service.id}`}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white group-hover:text-cyan transition-colors duration-300"
      >
        Enquire Now <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </Link>
    </motion.article>
  );
};

export const TestimonialCard = ({ t, index = 0, className = "", reveal = true, testIdSuffix = "" }) => {
  const spotlightProps = useSpotlightProps();
  const revealProps = reveal
    ? {
        initial: { opacity: 0, y: 32 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-10%" },
        transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: (index % 2) * 0.1 },
      }
    : {
        initial: false,
        animate: { opacity: 1, y: 0 },
      };

  return (
    <motion.figure
      {...spotlightProps}
      {...revealProps}
      data-testid={`testimonial-${t.id}${testIdSuffix}`}
      className={`spotlight-card glass rounded-md p-8 flex flex-col overflow-hidden ${className}`}
    >
      <div className="text-5xl font-display text-cyan/50 leading-none mb-2">"</div>
      <blockquote className="text-white/80 leading-relaxed flex-1">{t.quote}</blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <img src={t.avatar} alt={t.name} loading="lazy" className="h-11 w-11 rounded-full object-cover border border-white/10" />
        <div>
          <div className="text-sm font-semibold">{t.name}</div>
          <div className="text-xs text-white/45">{t.role}</div>
        </div>
      </figcaption>
    </motion.figure>
  );
};
