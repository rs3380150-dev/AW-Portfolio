import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "@/components/icons";
import { prefetchRoute } from "@/routes/pageLoaders";

const EASE = [0.22, 1, 0.36, 1];

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/music", label: "Music" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/videos", label: "Videos" },
  { to: "/services", label: "Services" },
  { to: "/press", label: "Press" },
  { to: "/contact", label: "Contact" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (window.__novaLenis) open ? window.__novaLenis.stop() : window.__novaLenis.start();
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        data-testid="navbar"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.5, ease: EASE }}
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,backdrop-filter,border-color] duration-500 ${
          scrolled || open ? "border-white/10 bg-void/80 backdrop-blur-md" : "border-transparent bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-[78px] max-w-[1500px] items-center justify-between px-6 md:px-10">
          <Link to="/" data-testid="logo" data-cursor="OPEN" className="flex flex-col uppercase leading-none text-white">
            <span className="font-display text-base font-bold tracking-[0.28em] sm:text-lg">Achyut</span>
            <span className="mt-1 font-mono text-[8px] font-semibold tracking-[0.52em] text-white/55">Wadhwa</span>
          </Link>

          <div className="hidden items-center gap-7 xl:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                data-testid={`nav-${link.label.toLowerCase()}`}
                data-cursor="OPEN"
                onMouseEnter={() => prefetchRoute(link.to)}
                onFocus={() => prefetchRoute(link.to)}
                className={({ isActive }) =>
                  `relative py-3 font-mono text-[9px] font-semibold uppercase tracking-[0.32em] transition-colors duration-300 ${
                    isActive ? "text-white" : "text-white/55 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive ? <motion.span layoutId="nav-underline" className="absolute inset-x-0 bottom-1 h-px bg-cyan" /> : null}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/contact"
              data-testid="nav-book-now"
              data-cursor="ENQUIRE"
              className="duration-premium hidden min-h-[38px] items-center border border-white/25 px-5 font-mono text-[9px] font-semibold uppercase tracking-[0.28em] text-white transition-[background-color,border-color,color] hover:border-cyan hover:bg-cyan sm:inline-flex"
            >
              Book / Enquire <span aria-hidden="true" className="ml-3">↗</span>
            </Link>
            <button
              type="button"
              data-testid="mobile-menu-toggle"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
              className="grid h-11 w-11 place-items-center border border-white/20 text-white xl:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            data-testid="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-void px-8 pt-28 xl:hidden"
          >
            <div className="flex flex-col">
              {links.map((link, index) => (
                <div key={link.to} className="overflow-hidden border-b border-white/10">
                  <motion.div
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "110%" }}
                    transition={{ duration: 0.6, delay: index * 0.045, ease: EASE }}
                  >
                    <NavLink
                      to={link.to}
                      data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                      className={({ isActive }) =>
                        `block py-3 font-display text-[9vw] font-bold uppercase leading-none tracking-tighter ${
                          isActive ? "text-cyan" : "text-white"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};
