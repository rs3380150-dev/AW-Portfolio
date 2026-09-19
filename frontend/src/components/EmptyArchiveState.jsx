import React from "react";

export const EmptyArchiveState = ({ eyebrow, title, description, testId }) => (
  <div
    className="col-span-full flex min-h-[280px] w-full items-center justify-center border border-white/10 bg-white/[0.015] px-6 py-16 text-center"
    data-testid={testId}
  >
    <div className="max-w-xl">
      <div className="mx-auto mb-7 flex items-center justify-center gap-3" aria-hidden="true">
        <span className="h-px w-10 bg-white/15" />
        <span className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_20px_rgba(242,240,234,0.28)]" />
        <span className="h-px w-10 bg-white/15" />
      </div>
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-cyan/80">{eyebrow}</p>
      <h3 className="mt-4 font-display text-3xl font-black uppercase leading-none text-white md:text-5xl">{title}</h3>
      <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/50 md:text-base">{description}</p>
    </div>
  </div>
);
