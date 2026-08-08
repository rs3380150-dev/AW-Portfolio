import React from "react";
import { SectionHeading } from "@/components/SectionHeading";
import { ServiceCard, TestimonialCard } from "@/components/ServiceCard";
import { Marquee } from "@/components/Motion";
import { services } from "@/data/services";
import { testimonials } from "@/data/press";

export const Services = () => (
  <div className="page-shell" data-testid="services-page">
    <section className="px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1500px]">
        <SectionHeading
          index="01"
          eyebrow="Services"
          title="Sound for rooms, records, stages, and collaborations."
          subtitle="From DJ performance to live formats, multi-instrumental arrangement, and production, every format is tailored around energy, timing, and intent."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>

    <Marquee text="DJ SETS - LIVE PERFORMANCE - PRODUCTION - COLLABORATIONS -" stroke className="py-8" />

    <section className="connect-section border-y border-white/10 bg-navy px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1500px]">
        <SectionHeading
          index="02"
          eyebrow="Clients"
          title="Trusted when the room matters."
          subtitle="Promoters, artists, private clients, and brands can book Achyut Wadhwa for sets, live concepts, and studio-led collaborations."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} t={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  </div>
);
