import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "@/components/icons";

export const NotFound = () => (
  <div className="page-shell grid min-h-screen place-items-center px-6" data-testid="not-found-page">
    <div className="max-w-2xl text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">404</p>
      <h1 className="mt-5 font-display text-6xl font-bold uppercase leading-none tracking-tight md:text-8xl">
        Signal Lost
      </h1>
      <p className="mx-auto mt-6 max-w-md text-white/60">
        This route fell out of the mix. Head back to the main stage.
      </p>
      <Link
        to="/"
        data-testid="not-found-home"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-cyan px-6 py-3 font-semibold text-void hover:scale-[1.03] transition-transform duration-300"
      >
        <ArrowLeft className="h-5 w-5" />
        Back Home
      </Link>
    </div>
  </div>
);
