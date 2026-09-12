import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { gallery } from "@/data/gallery";
import { site } from "@/data/site";
import { prefetchRoute } from "@/routes/pageLoaders";

const EASE = [0.22, 1, 0.36, 1];
const EASE_OUT = [0, 0, 0.58, 1];
const EASE_IN = [0.42, 0, 1, 1];

const primaryLinks = [
  { to: "/", label: "Home", description: "Latest signal", image: site.aboutImage },
  { to: "/music", label: "Music", description: "Tracks & live sets", image: gallery[5].src },
  { to: "/events", label: "Events", description: "Upcoming shows", image: gallery[0].src },
  { to: "/about", label: "About", description: "The artist", image: gallery[4].src },
  { to: "/contact", label: "Contact", description: "Bookings & collabs", image: gallery[11].src },
];

const secondaryLinks = [
  { to: "/gallery", label: "Gallery" },
  { to: "/videos", label: "Videos" },
  { to: "/services", label: "Services" },
  { to: "/press", label: "Press" },
];

const roman = ["I", "II", "III", "IV", "V"];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const location = useLocation();

  const activeIndex = useMemo(() => {
    const index = primaryLinks.findIndex(({ to }) => to === location.pathname);
    return index < 0 ? 0 : index;
  }, [location.pathname]);
  const visualIndex = hoveredIndex ?? activeIndex;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setHoveredIndex(null);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (window.__novaLenis) open ? window.__novaLenis.stop() : window.__novaLenis.start();
    return () => {
      document.body.style.overflow = "";
      if (window.__novaLenis) window.__novaLenis.start();
    };
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    setHoveredIndex(null);
  };

  return (
    <>
      <motion.header
        data-testid="navbar"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5, ease: EASE }}
        className={`fixed inset-x-0 top-0 z-[70] transition-[background-color,border-color] duration-500 ${
          scrolled && !open ? "border-b border-white/10 bg-void/75 backdrop-blur-md" : "border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex h-[82px] max-w-[1600px] items-center justify-between px-6 md:h-[96px] md:px-12">
          <motion.div
            animate={{ opacity: open ? 0 : 1 }}
            transition={open ? { duration: 0.4 } : { duration: 0.4, delay: 1 }}
          >
            <Link
              to="/"
              data-testid="logo"
              tabIndex={open ? -1 : 0}
              className={`flex flex-col uppercase leading-none text-white ${open ? "pointer-events-none" : ""}`}
            >
              <span className="font-display text-base font-bold tracking-[0.28em] sm:text-lg">Achyut</span>
              <span className="mt-1 font-mono text-[8px] font-semibold tracking-[0.52em] text-white/55">Wadhwa</span>
            </Link>
          </motion.div>

          <button
            type="button"
            data-testid="mobile-menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className={`nav-toggle-button flex items-center text-white ${open ? "is-open" : ""}`}
          >
            <span className="nav-toggle-icon" aria-hidden="true">
              <span />
              <span />
            </span>
            <span className="nav-toggle-label hidden font-display text-2xl font-bold uppercase md:block">
              Menu
            </span>
          </button>
        </nav>
      </motion.header>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.aside
            key="cinematic-menu"
            data-testid="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.6, delay: 1 } }}
            className="fixed inset-0 z-[60] overflow-y-auto bg-black text-white"
          >
            <div className="mx-auto flex min-h-full max-w-[1600px] flex-col px-6 pb-7 pt-24 md:px-12 md:pb-8 md:pt-24">
              <div className="menu-side-title hidden md:inline-flex">
                <motion.span
                  aria-hidden="true"
                  initial={{ width: 0 }}
                  animate={{ width: 435, transition: { duration: 0.4, delay: 0.2, ease: EASE_OUT } }}
                  exit={{ width: 0, transition: { duration: 0.4, delay: 0.5, ease: EASE_OUT } }}
                  className="menu-side-line"
                />
                <span>Menu</span>
              </div>

              <div className="grid flex-1 items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-14 lg:gap-20">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.4, delay: 0.2, ease: EASE_OUT } }}
                  exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.7, ease: EASE_IN } }}
                  className="relative hidden h-[min(54vh,520px)] w-full max-w-[520px] justify-self-center overflow-hidden bg-white/5 md:block"
                >
                  <AnimatePresence mode="sync" initial={false}>
                    <motion.img
                      key={primaryLinks[visualIndex].image}
                      src={primaryLinks[visualIndex].image}
                      alt=""
                      aria-hidden="true"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="absolute inset-0 h-full w-full object-cover grayscale contrast-110"
                    />
                  </AnimatePresence>
                  <div className="pointer-events-none absolute inset-0 border border-white/10" />
                </motion.div>

                <div className="w-full">
                  <ol className="group/list w-full" onMouseLeave={() => setHoveredIndex(null)}>
                    {primaryLinks.map((link, index) => {
                      const selected = hoveredIndex === index;
                      const dimmed = hoveredIndex !== null && !selected;
                      const isActive = location.pathname === link.to;

                      return (
                        <li key={link.to} className="relative overflow-hidden">
                          <motion.div
                            initial={{ x: -500, opacity: 0 }}
                            animate={{
                              x: 0,
                              opacity: 1,
                              transition: { duration: 0.5, delay: 0.4 + index * 0.1, ease: EASE_OUT },
                            }}
                            exit={{
                              x: -500,
                              opacity: 0,
                              transition: { duration: 0.5, delay: (primaryLinks.length - 1 - index) * 0.1, ease: EASE_IN },
                            }}
                          >
                            <NavLink
                              to={link.to}
                              data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                              onClick={closeMenu}
                              onMouseEnter={() => {
                                setHoveredIndex(index);
                                prefetchRoute(link.to);
                              }}
                              onFocus={() => {
                                setHoveredIndex(index);
                                prefetchRoute(link.to);
                              }}
                              className={`grid grid-cols-[34px_1fr] items-baseline gap-3 py-4 transition-colors duration-200 sm:grid-cols-[42px_auto_1fr] sm:gap-5 lg:py-5 ${
                                dimmed ? "text-white/25" : "text-white"
                              }`}
                            >
                              <span className="font-mono text-xs text-white/55">{roman[index]}</span>
                              <span className="font-display text-[clamp(2rem,7.8vw,4.5rem)] font-bold uppercase leading-[0.84] tracking-[-0.045em]">
                                {link.label}
                              </span>
                              <span className="hidden justify-self-end font-sans text-sm text-current/70 sm:block">{link.description}</span>
                            </NavLink>
                          </motion.div>
                          <motion.span
                            aria-hidden="true"
                            initial={{ x: -520 }}
                            animate={{ x: 0, transition: { duration: 0.4, delay: 0.4 + index * 0.1, ease: EASE_OUT } }}
                            exit={{
                              x: -520,
                              transition: { duration: 0.4, delay: (primaryLinks.length - 1 - index) * 0.1, ease: EASE_OUT },
                            }}
                            className="absolute inset-x-0 bottom-0 h-px bg-white/20"
                          />
                          <motion.span
                            aria-hidden="true"
                            animate={{ scaleX: selected || isActive ? 1 : 0 }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="absolute inset-x-0 bottom-0 h-px origin-left bg-white"
                          />
                        </li>
                      );
                    })}
                  </ol>

                </div>
              </div>

              <div className="mt-10 flex flex-col gap-6 border-t border-white/15 pt-10 sm:flex-row sm:items-center sm:justify-between md:mb-8">
                <div className="flex flex-wrap gap-x-10 gap-y-3">
                  {secondaryLinks.map((link, index) => (
                    <motion.span
                      key={link.to}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.2, delay: 1.2 + index * 0.1, ease: EASE_OUT } }}
                      exit={{ opacity: 0, y: 15, transition: { duration: 0.2, delay: index * 0.1, ease: EASE_IN } }}
                    >
                      <Link
                        to={link.to}
                        onClick={closeMenu}
                        onMouseEnter={() => prefetchRoute(link.to)}
                        onFocus={() => prefetchRoute(link.to)}
                        className="font-mono text-[19px] font-bold uppercase tracking-[0.42em] text-white/80 transition-colors duration-200 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </motion.span>
                  ))}
                </div>
                <motion.span
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.2, delay: 1.6, ease: EASE_OUT } }}
                  exit={{ opacity: 0, y: 15, transition: { duration: 0.2, delay: 0.4, ease: EASE_IN } }}
                >
                  <a
                    href={site.social.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/55 transition-colors duration-200 hover:text-white"
                  >
                    Instagram ↗
                  </a>
                </motion.span>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
};
