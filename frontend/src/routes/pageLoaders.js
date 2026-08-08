export const pageLoaders = {
  "/": () => import("@/pages/Home"),
  "/about": () => import("@/pages/About"),
  "/music": () => import("@/pages/Music"),
  "/events": () => import("@/pages/Events"),
  "/gallery": () => import("@/pages/GalleryPage"),
  "/videos": () => import("@/pages/Videos"),
  "/services": () => import("@/pages/Services"),
  "/press": () => import("@/pages/Press"),
  "/contact": () => import("@/pages/Contact"),
};

const prefetchedRoutes = new Set();

export const prefetchRoute = (path) => {
  const loader = pageLoaders[path];
  if (!loader || prefetchedRoutes.has(path)) return;

  prefetchedRoutes.add(path);
  loader().catch(() => {
    prefetchedRoutes.delete(path);
  });
};

export const prefetchPriorityRoutes = () => {
  const run = () => {
    prefetchRoute("/about");
    prefetchRoute("/music");
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(run, { timeout: 1800 });
    return;
  }

  window.setTimeout(run, 800);
};
