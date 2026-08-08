import React from "react";
import { Download } from "@/components/icons";
import { SectionHeading } from "@/components/SectionHeading";
import { TestimonialCard } from "@/components/ServiceCard";
import { ScrollReveal } from "@/components/Motion";
import { useSpotlightProps } from "@/components/Spotlight";
import { achievements, brandLogos, mediaFeatures, testimonials } from "@/data/press";
import { site } from "@/data/site";

const AchievementCard = ({ achievement, index }) => {
  const spotlightProps = useSpotlightProps();

  return (
    <ScrollReveal
      {...spotlightProps}
      delay={index * 0.04}
      className="spotlight-card rounded-md border border-white/10 bg-white/[0.03] p-6"
    >
      <p className="font-mono text-sm text-cyan">{achievement.year}</p>
      <h3 className="mt-4 text-2xl font-semibold tracking-tight">{achievement.title}</h3>
      <p className="mt-2 text-sm text-white/50">{achievement.org}</p>
    </ScrollReveal>
  );
};

const PresenceTile = ({ name }) => {
  const spotlightProps = useSpotlightProps();

  return (
    <div
      {...spotlightProps}
      className="spotlight-card grid h-24 place-items-center rounded-md border border-white/10 bg-white/[0.03] px-4 text-center font-mono text-xs uppercase tracking-[0.2em] text-white/55"
    >
      <span>{name}</span>
    </div>
  );
};

const PartnerTile = ({ name }) => {
  const spotlightProps = useSpotlightProps();

  return (
    <div
      {...spotlightProps}
      className="spotlight-card grid h-24 place-items-center rounded-md border border-white/10 bg-white/[0.03] px-4 text-center text-sm font-semibold text-white/60"
    >
      <span>{name}</span>
    </div>
  );
};

const PressKitCard = () => {
  const spotlightProps = useSpotlightProps();

  return (
    <ScrollReveal {...spotlightProps} className="spotlight-card glass rounded-md p-6">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">Press Kit</p>
      <p className="mt-3 text-sm leading-relaxed text-white/60">
        Download artist photos, biography, tech rider notes, approved billing lines, and collaboration context.
      </p>
      <a
        href={site.pressKitUrl}
        data-spotlight-block
        data-testid="press-kit-download"
        className="action-accent mt-6 inline-flex items-center gap-2 rounded-full bg-magenta px-5 py-2.5 text-sm font-semibold hover:scale-[1.03] transition-transform duration-300"
      >
        <Download className="h-4 w-4" /> Download Kit
      </a>
    </ScrollReveal>
  );
};

const TestimonialCarousel = () => {
  return (
    <div className="testimonial-carousel mt-12 overflow-hidden focus:outline-none" tabIndex={0} aria-label="Booker reviews carousel">
      <div className="testimonial-carousel-track flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 gap-6 pr-6" aria-hidden={copy === 1}>
            {testimonials.map((testimonial, index) => (
              <div key={`${testimonial.id}-${copy}`} className="w-[min(82vw,360px)] shrink-0 md:w-[420px]">
                <TestimonialCard
                  t={testimonial}
                  index={index}
                  testIdSuffix={copy === 1 ? "-duplicate" : ""}
                  reveal={copy === 0}
                  className="h-full min-h-[300px]"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Press = () => (
  <div className="page-shell" data-testid="press-page">
    <section className="px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <SectionHeading
          index="01"
          eyebrow="Press"
          title="Artist details, media, and booking context."
          subtitle="A compact press room for promoters, journalists, artists, and brand partners."
        />
        <PressKitCard />
      </div>
    </section>

    <section className="bg-tinted px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1500px]">
        <SectionHeading
          index="02"
          eyebrow="Achievements"
          title="Receipts from the circuit."
          subtitle="Selected context across releases, performance formats, collaborations, and brand work."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {achievements.map((achievement, index) => (
            <AchievementCard key={achievement.id} achievement={achievement} index={index} />
          ))}
        </div>
      </div>
    </section>

    <section className="px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading index="03" eyebrow="Presence" title="Platforms & presence." />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {mediaFeatures.map((name) => (
              <PresenceTile key={name} name={name} />
            ))}
          </div>
        </div>
        <div>
          <SectionHeading index="04" eyebrow="Stages" title="Signals carried by partners." />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {brandLogos.map((name) => (
              <PartnerTile key={name} name={name} />
            ))}
          </div>
        </div>
      </div>
    </section>

    <section className="connect-section border-y border-white/10 bg-navy px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1500px]">
        <SectionHeading
          index="05"
          eyebrow="Quotes"
          title="What bookers say after the lights come up."
        />
        <TestimonialCarousel />
      </div>
    </section>
  </div>
);
