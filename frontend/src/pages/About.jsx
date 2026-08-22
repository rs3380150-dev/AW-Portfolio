import React from "react";
import { Disc3, Download } from "@/components/icons";
import { SectionHeading } from "@/components/SectionHeading";
import { ScrollReveal } from "@/components/Motion";
import { StatCounter } from "@/components/StatCounter";
import { BlobTextReveal } from "@/components/BlobTextReveal";
import { site } from "@/data/site";
import { influences, skills, timeline } from "@/data/about";


export const About = () => (
  <div className="page-shell" data-testid="about-page">
    <section className="px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <ScrollReveal className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-cyan">About the Artist</p>
          <h1 className="mt-5 font-display text-5xl font-bold uppercase leading-[0.92] tracking-tight text-white md:text-7xl">
            {site.name}
            <span className="block text-stroke-cyan">Producer / DJ</span>
          </h1>
          <BlobTextReveal
            className="mt-6"
            texts={["Producer", "Performer", "Multi-Instrumentalist"]}
          />
          <div className="mt-8 space-y-5 text-base leading-relaxed text-white/60 md:text-lg">
            {site.bioParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            {site.roles.map((role) => (
              <span key={role} className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60">
                {role}
              </span>
            ))}
          </div>
          <a
            href={site.pressKitUrl}
            className="mt-8 inline-flex items-center gap-3 rounded-md border border-cyan/35 bg-gradient-to-r from-laser/35 to-cyan/15 px-5 py-3 text-sm font-bold text-white transition hover:border-cyan hover:shadow-[0_0_28px_rgba(7,92,138,0.22)]"
            data-testid="about-press-kit"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download Press Kit (PDF)
          </a>
        </ScrollReveal>

        <ScrollReveal delay={0.08} className="relative min-h-[520px] overflow-visible md:min-h-[640px]">
          <div className="relative h-full min-h-[520px] overflow-hidden rounded-md border border-white/10 bg-white/[0.03] md:min-h-[640px]">
            <img src={site.aboutImage} alt="" aria-hidden="true" className="gsap-parallax-media absolute inset-0 h-[108%] w-full scale-110 object-cover opacity-35 blur-md" />
            <div className="about-image-overlay absolute inset-0 bg-gradient-to-t from-void via-void/35 to-transparent" />
            <img src={site.aboutImage} alt="Achyut Wadhwa portrait" className="about-portrait-image absolute inset-0 z-10 h-full w-full object-contain object-center" />
            <div className="absolute inset-0 z-20 bg-gradient-to-r from-void/25 via-transparent to-transparent" />
          </div>
          <div className="about-hero-badge absolute -top-4 left-5 z-20 rounded-md border border-white/10 bg-void/75 px-4 py-3 text-white shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl md:-left-4">
            <Disc3 className="h-5 w-5 text-cyan" aria-hidden="true" />
            <p className="mt-2 font-display text-2xl font-bold leading-none">Open</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Collabs & Live</p>
          </div>
          <div className="about-record-card absolute -bottom-8 -right-3 hidden h-32 w-32 overflow-hidden rounded-md border border-cyan/20 bg-void/80 shadow-[0_0_40px_rgba(7,92,138,0.16)] backdrop-blur-xl md:block">
            <div className="absolute inset-5 rounded-full border border-white/15 bg-[radial-gradient(circle,rgba(198,112,74,0.18)_0%,rgba(182,95,58,0.14)_23%,rgba(7,92,138,0.14)_38%,rgba(255,255,255,0.04)_39%,rgba(255,255,255,0.02)_100%)]" />
            <div className="absolute inset-[3.25rem] rounded-full bg-cyan" />
          </div>
        </ScrollReveal>
      </div>
    </section>

    <section className="border-y border-white/10 bg-navy/70">
      <div className="mx-auto grid max-w-[1500px] grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4 md:px-10">
        {site.stats.map((stat, index) => (
          <StatCounter key={stat.label} {...stat} index={index} />
        ))}
      </div>
    </section>

    <section className="px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            index="02"
            eyebrow="Craft"
            title="Performance instinct, production discipline."
            subtitle="The project moves between DJ sets, live performance, multi-instrumental thinking, and detail-heavy production work."
          />
          <div className="mt-10 space-y-6">
            {skills.map((skill) => (
              <ScrollReveal key={skill.name} className="space-y-2">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-white/80">{skill.name}</span>
                  <span className="font-mono text-cyan">{skill.level}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-cyan shadow-[0_0_18px_rgba(7,92,138,0.55)]" style={{ width: `${skill.level}%` }} />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <div>
          <SectionHeading
            index="03"
            eyebrow="Timeline"
            title="Instrument roots to electronic worlds."
            subtitle="A focused creative arc through musicality, studio detail, stage energy, and collaboration."
          />
          <div className="mt-10 space-y-4">
            {timeline.map((item, index) => (
              <ScrollReveal key={item.year} delay={index * 0.04} className="grid gap-4 border-t border-white/10 py-5 md:grid-cols-[90px_1fr]">
                <span className="font-mono text-sm text-cyan">{item.year}</span>
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{item.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section className="connect-section border-y border-white/10 bg-tinted px-6 py-20 md:px-10">
      <div className="mx-auto max-w-[1500px]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">Influences</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {influences.map((name) => (
            <span key={name} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  </div>
);
