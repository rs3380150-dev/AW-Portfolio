import React from "react";
import { Download } from "@/components/icons";
import { AboutPortrait } from "@/components/AboutPortrait";
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
            className="mt-8 inline-flex items-center gap-3 rounded-md border border-cyan/35 bg-gradient-to-r from-laser/35 to-cyan/15 px-5 py-3 text-sm font-bold text-white transition hover:border-cyan"
            data-testid="about-press-kit"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download Press Kit (PDF)
          </a>
        </ScrollReveal>

        <ScrollReveal delay={0.08} className="relative min-h-[520px] overflow-visible md:min-h-[640px]">
          <AboutPortrait
            mode={site.aboutPortraitEffect}
            src={site.aboutImage}
            alt="Achyut Wadhwa portrait"
          />
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
            className="about-split-heading"
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
                  <div className="h-full rounded-full bg-cyan" style={{ width: `${skill.level}%` }} />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <div>
          <SectionHeading
            className="about-split-heading"
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
