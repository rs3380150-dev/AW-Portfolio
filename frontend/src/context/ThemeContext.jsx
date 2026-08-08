import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

const ThemeContext = createContext(null);

const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem("achyut-wadhwa-theme") === "light" ? "light" : "dark";
};

const applyThemeToRoot = (nextTheme) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const isLight = nextTheme === "light";

  root.classList.toggle("theme-light", isLight);
  root.classList.toggle("dark", !isLight);
  root.dataset.theme = nextTheme;
  root.style.colorScheme = isLight ? "light" : "dark";

  if (typeof window !== "undefined") {
    window.localStorage.setItem("achyut-wadhwa-theme", nextTheme);
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);
  const transitionTimer = useRef(null);

  useEffect(() => {
    applyThemeToRoot(theme);
  }, [theme]);

  useEffect(() => () => {
    if (transitionTimer.current) {
      window.clearTimeout(transitionTimer.current);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const endTransition = (delay = 520) => {
      if (transitionTimer.current) {
        window.clearTimeout(transitionTimer.current);
      }
      transitionTimer.current = window.setTimeout(() => {
        root.classList.remove("theme-transitioning");
      }, delay);
    };

    const switchTheme = () => {
      const nextTheme = theme === "light" ? "dark" : "light";
      applyThemeToRoot(nextTheme);
      setTheme(nextTheme);
    };

    root.classList.add("theme-transitioning");

    if (document.startViewTransition && !prefersReducedMotion) {
      const transition = document.startViewTransition(() => {
        flushSync(switchTheme);
      });

      transition.finished.finally(() => endTransition(0));
      return;
    }

    switchTheme();
    endTransition();
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    isLight: theme === "light",
    toggleTheme,
  }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
};
