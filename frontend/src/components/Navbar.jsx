import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Moon, Sun, X } from "@/components/icons";
import { useTheme } from "@/context/ThemeContext";
import { prefetchRoute } from "@/routes/pageLoaders";

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
  const { isLight, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <>
      <header
        data-testid="navbar"
        className={`fixed top-0 inset-x-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ${
          scrolled || open
            ? "bg-void/70 backdrop-blur-xl border-b border-white/10"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav className="mx-auto max-w-[1500px] px-6 md:px-10 h-20 flex items-center justify-between">
          <Link to="/" data-testid="logo" className="group flex items-center gap-2">
            <span className="font-display text-xl font-bold tracking-tight uppercase sm:text-2xl">
              Achyut
            </span>
            <span className="font-display text-xl font-bold tracking-tight uppercase text-cyan transition-colors duration-300 sm:text-2xl">
              Wadhwa
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                data-testid={`nav-${l.label.toLowerCase()}`}
                onMouseEnter={() => prefetchRoute(l.to)}
                onFocus={() => prefetchRoute(l.to)}
                onTouchStart={() => prefetchRoute(l.to)}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                    isActive ? "text-white" : "text-white/55 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute left-4 right-4 -bottom-0.5 h-px bg-cyan shadow-[0_0_10px_rgba(7,92,138,0.8)]"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="theme-toggle"
              aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
              aria-pressed={isLight}
              onClick={toggleTheme}
              className="h-11 w-11 grid place-items-center rounded-full border border-white/10 bg-white/5 text-white hover:text-cyan hover:border-cyan/45 hover:shadow-[0_0_18px_rgba(7,92,138,0.25)] transition-[color,border-color,box-shadow,background-color] duration-300"
            >
              {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <Link
              to="/contact"
              data-testid="nav-book-now"
              className="action-accent hidden sm:inline-flex items-center rounded-full bg-magenta px-5 py-2.5 text-sm font-semibold hover:shadow-[0_0_24px_rgba(31,95,128,0.42)] hover:scale-[1.03] transition-[transform,box-shadow] duration-300"
            >
              Book Now
            </Link>
            <button
              data-testid="mobile-menu-toggle"
              aria-label="Toggle menu"
              onClick={() => setOpen((o) => !o)}
              className="lg:hidden h-11 w-11 grid place-items-center rounded-full border border-white/10 text-white"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-void/95 backdrop-blur-2xl lg:hidden pt-24 px-8"
          >
            <div className="flex flex-col">
              {links.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <NavLink
                    to={l.to}
                    data-testid={`mobile-nav-${l.label.toLowerCase()}`}
                    onTouchStart={() => prefetchRoute(l.to)}
                    onFocus={() => prefetchRoute(l.to)}
                    className={({ isActive }) =>
                      `block py-4 border-b border-white/10 font-display text-3xl uppercase tracking-tight ${
                        isActive ? "text-cyan" : "text-white/80"
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
              <Link
                to="/contact"
                data-testid="mobile-book-now"
                className="action-accent mt-8 inline-flex justify-center rounded-full bg-magenta px-6 py-4 font-semibold"
              >
                Book Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
