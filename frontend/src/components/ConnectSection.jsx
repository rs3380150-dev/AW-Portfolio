import React from "react";
import { ArrowUpRight } from "@/components/icons";
import { ScrollReveal } from "@/components/Motion";
import { site } from "@/data/site";

const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const ConnectSection = ({ className = "" }) => (
  <section className={`connect-section border-y border-white/10 bg-navy px-6 py-24 md:px-10 ${className}`} data-testid="connect-section">
    <div className="mx-auto max-w-[1500px] text-center">
      <ScrollReveal y={24}>
        <p className="font-mono text-[11px] uppercase tracking-[0.38em] text-cyan">Connect</p>
        <h2 className="mx-auto mt-5 max-w-4xl font-display text-4xl font-bold uppercase leading-[0.92] tracking-tight text-white md:text-6xl">
          Find Achyut <span className="text-stroke-cyan">Everywhere</span>
        </h2>
        <div className="mx-auto mt-7 h-px w-28 bg-gradient-to-r from-transparent via-cyan to-transparent" />
      </ScrollReveal>

      <ScrollReveal delay={0.08} y={20} className="mx-auto mt-11 flex max-w-5xl flex-wrap justify-center gap-3">
        {site.connectLinks.map((link) => {
          const isMail = link.href.startsWith("mailto:");

          return (
            <a
              key={link.label}
              href={link.href}
              target={isMail ? undefined : "_blank"}
              rel={isMail ? undefined : "noreferrer"}
              data-testid={`connect-${slug(link.label)}`}
              className="group inline-flex min-w-[132px] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/72 shadow-[0_14px_36px_rgba(0,0,0,0.12)] transition-[border-color,color,box-shadow,transform,background-color] duration-300 hover:-translate-y-0.5 hover:border-cyan/50 hover:bg-white/[0.055] hover:text-cyan hover:shadow-[0_0_24px_rgba(7,92,138,0.16)]"
            >
              {link.label}
              <span className="grid h-5 w-5 place-items-center rounded-full border border-white/10 bg-white/[0.04] transition-colors duration-300 group-hover:border-cyan/40">
                <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </a>
          );
        })}
      </ScrollReveal>
    </div>
  </section>
);
