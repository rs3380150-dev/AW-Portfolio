import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "@/components/icons";
import { Hero } from "@/components/Hero";
import { ConnectSection } from "@/components/ConnectSection";
import { SectionHeading } from "@/components/SectionHeading";
import { TrackCard } from "@/components/TrackCard";
import { EventCard } from "@/components/EventCard";
import { ServiceCard } from "@/components/ServiceCard";
import { StatCounter } from "@/components/StatCounter";
import { Marquee, ScrollReveal } from "@/components/Motion";
import { useSpotlightProps } from "@/components/Spotlight";
import { site, manifesto } from "@/data/site";
import { tracks } from "@/data/tracks";
import { events } from "@/data/events";
import { gallery } from "@/data/gallery";
import { services } from "@/data/services";

const SectionLink = ({ to, children, testId }) => (
  <Link
    to={to}
    data-testid={testId}
    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/75 hover:border-cyan hover:text-cyan transition-colors duration-300"
  >
    {children}
    <ArrowRight className="h-4 w-4" />
  </Link>
);

const ManifestoCard = ({ item, index }) => {
  const spotlightProps = useSpotlightProps();

  return (
    <ScrollReveal
      {...spotlightProps}
      delay={index * 0.04}
      className="spotlight-card grid gap-4 overflow-hidden rounded-md border border-white/10 bg-white/[0.03] p-6 md:grid-cols-[80px_1fr]"
    >
      <span className="font-mono text-sm text-cyan">{item.n}</span>
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">{item.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-white/55">{item.body}</p>
      </div>
    </ScrollReveal>
  );
};

export const Home = () => {
  const upcoming = events.filter((event) => event.status !== "completed").slice(0, 3);

  return (
    <>
      <Hero />

      <section className="border-y border-white/10 bg-navy/70">
        <div className="mx-auto grid max-w-[1500px] grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4 md:px-10">
          {site.stats.map((stat, index) => (
            <StatCounter key={stat.label} {...stat} index={index} />
          ))}
        </div>
      </section>

      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <SectionHeading
            index="01"
            eyebrow="Manifesto"
            title="Rhythm, atmosphere, and movement."
            subtitle="Every set is treated like a narrative: pressure, silence, texture, release, and a final scene people remember."
          />
          <div className="grid gap-4">
            {manifesto.map((item, index) => (
              <ManifestoCard key={item.n} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <Marquee
        text="ACHYUT WADHWA - DJ SETS - LIVE PERFORMANCE - MULTI-INSTRUMENTAL SOUND -"
        stroke
        className="py-8"
        videoSrc={site.heroVideo}
        videoWebm={site.heroVideoWebm}
        poster={site.heroPoster}
      />

      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              index="02"
              eyebrow="Music"
              title="Recent heat for late rooms."
              subtitle="Originals, remixes, and live recordings from the mainstage edge."
            />
            <SectionLink to="/music" testId="home-view-music">All Music</SectionLink>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {tracks.slice(0, 3).map((track, index) => (
              <TrackCard key={track.id} track={track} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-tinted px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              index="03"
              eyebrow="Tour"
              title="Next frequencies."
              subtitle="Festival stages, club residencies, and private rooms across the map."
            />
            <SectionLink to="/events" testId="home-view-events">All Events</SectionLink>
          </div>
          <div className="grid gap-5">
            {upcoming.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              index="04"
              eyebrow="Gallery"
              title="Light, sweat, signal."
              subtitle="A visual archive from booths, rooftops, studios, and packed floors."
            />
            <SectionLink to="/gallery" testId="home-view-gallery">Open Gallery</SectionLink>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {gallery.slice(0, 6).map((item, index) => (
              <Link
                key={item.id}
                to="/gallery"
                data-testid={`home-gallery-${item.id}`}
                className={`group relative min-h-[260px] overflow-hidden rounded-md ${
                  index === 0 || index === 5 ? "lg:col-span-2" : "lg:col-span-1"
                }`}
              >
                <img src={item.src} alt={item.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="home-gallery-overlay absolute inset-0 bg-gradient-to-t from-void/85 via-transparent to-transparent" />
                <span className="home-gallery-caption absolute bottom-4 left-4 text-sm font-medium text-white/80">{item.alt}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-navy px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              index="05"
              eyebrow="Services"
              title="From club peak time to live sonic worlds."
              subtitle="DJ sets, live performance, multi-instrumental arrangement, and production work built around the room, record, and brief."
            />
            <SectionLink to="/services" testId="home-view-services">All Services</SectionLink>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {services.slice(0, 4).map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="home-final-cta relative overflow-hidden px-6 py-24 md:px-10 md:py-32">
        <div className="home-final-cta-media absolute inset-0 -z-10">
          <img src={site.artistImages[1]} alt="Achyut Wadhwa on stage" className="home-final-cta-image gsap-parallax-media h-full w-full object-cover opacity-35" />
          <div className="home-final-cta-overlay absolute inset-0 bg-gradient-to-r from-void via-void/85 to-void/55" />
        </div>
        <div className="home-final-cta-content mx-auto max-w-[1500px]">
          <ScrollReveal className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">Bookings Open</p>
            <h2 className="mt-5 font-display text-5xl font-bold uppercase leading-[0.9] tracking-tight md:text-7xl">
              Bring the narrative to your next room.
            </h2>
            <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-white/65">
              Clubs, festivals, private events, artists, and brands can request DJ sets, live performance formats, production work, or collaborations.
            </p>
            <Link
              to="/contact"
              data-testid="home-final-booking"
              className="action-accent mt-8 inline-flex items-center gap-2 rounded-full bg-magenta px-7 py-4 font-semibold hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(31,95,128,0.42)] transition-[transform,box-shadow] duration-300"
            >
              Start a Booking
              <ArrowRight className="h-5 w-5" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <ConnectSection />
    </>
  );
};
