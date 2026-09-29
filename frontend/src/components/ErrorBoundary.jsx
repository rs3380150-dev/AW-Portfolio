import React from "react";

export class ErrorBoundary extends React.Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, details) {
    console.error("Website render error", error, details);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="grid min-h-screen place-items-center bg-void px-6 text-center text-white"><div><p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">Temporary issue</p><h1 className="mt-4 text-3xl font-semibold">This page could not be displayed.</h1><p className="mt-3 text-white/55">Your content is safe. Refresh the page to try again.</p><button className="mt-7 rounded-full bg-cyan px-6 py-3 font-semibold text-void" onClick={() => window.location.reload()}>Refresh page</button></div></main>;
  }
}
