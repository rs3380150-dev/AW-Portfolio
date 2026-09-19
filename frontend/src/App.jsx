import { lazy, Suspense, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GsapEnhancer } from "@/components/GsapEnhancer";
import { MusicPlayer } from "@/components/MusicPlayer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Seo } from "@/components/Seo";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/CustomCursor";
import { PlayerProvider } from "@/context/PlayerContext";
import { ContentProvider } from "@/context/ContentContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { pageLoaders, prefetchPriorityRoutes } from "@/routes/pageLoaders";

const Home = lazy(() => pageLoaders["/"]().then((module) => ({ default: module.Home })));
const About = lazy(() => pageLoaders["/about"]().then((module) => ({ default: module.About })));
const Music = lazy(() => pageLoaders["/music"]().then((module) => ({ default: module.Music })));
const MusicDetail = lazy(() => import("@/pages/MusicDetail").then((module) => ({ default: module.MusicDetail })));
const Events = lazy(() => pageLoaders["/events"]().then((module) => ({ default: module.Events })));
const GalleryPage = lazy(() => pageLoaders["/gallery"]().then((module) => ({ default: module.GalleryPage })));
const Videos = lazy(() => pageLoaders["/videos"]().then((module) => ({ default: module.Videos })));
const Services = lazy(() => pageLoaders["/services"]().then((module) => ({ default: module.Services })));
const Press = lazy(() => pageLoaders["/press"]().then((module) => ({ default: module.Press })));
const Contact = lazy(() => pageLoaders["/contact"]().then((module) => ({ default: module.Contact })));
const NotFound = lazy(() => import("@/pages/NotFound").then((module) => ({ default: module.NotFound })));
const AdminApp = lazy(() => import("@/admin/AdminApp").then((module) => ({ default: module.AdminApp })));

const PageFallback = () => (
  <div className="grid min-h-screen place-items-center bg-void px-6 text-center">
    <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">Loading</p>
  </div>
);

const RouteReset = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Immediate scroll to top
    window.scrollTo({ top: 0, left: 0 });

    if (window.__novaLenis) {
      window.__novaLenis.scrollTo(0, { immediate: true });
    }

    // Force scroll to top again after Framer Motion transition settles
    const raf = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0 });
      if (window.__novaLenis) {
        window.__novaLenis.scrollTo(0, { immediate: true });
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <Suspense fallback={<PageFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/music" element={<Music />} />
            <Route path="/music/:slug" element={<MusicDetail />} />
            <Route path="/events" element={<Events />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/services" element={<Services />} />
            <Route path="/press" element={<Press />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const AppChrome = () => {
  const { theme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    prefetchPriorityRoutes();
  }, []);

  if (location.pathname.startsWith("/admin")) {
    let route = "overview";
    if (location.pathname.startsWith("/admin/content")) route = "content";
    if (location.pathname.startsWith("/admin/media")) route = "media";
    if (location.pathname.startsWith("/admin/messages")) route = "messages";
    if (location.pathname.startsWith("/admin/history")) route = "history";

    return (
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/admin" element={<AdminApp route="overview" />} />
          <Route path="/admin/content/:sectionKey?" element={<AdminApp route="content" />} />
          <Route path="/admin/media" element={<AdminApp route="media" />} />
          <Route path="/admin/messages" element={<AdminApp route="messages" />} />
          <Route path="/admin/history" element={<AdminApp route="history" />} />
        </Routes>
        <Toaster position="top-right" theme="dark" richColors closeButton />
      </Suspense>
    );
  }

  return (
    <>
      <SmoothScroll />
      <RouteReset />
      <Seo />
      <GsapEnhancer />
      <CustomCursor />
      <LoadingScreen />
      <Navbar />
      <main className="gsap-page-root">
        <AnimatedRoutes />
      </main>
      <Footer />
      <MusicPlayer />
      <ScrollToTop />
      <Toaster position="top-right" theme={theme} richColors closeButton />
    </>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ContentProvider>
          <ThemeProvider>
            <PlayerProvider>
              <AppChrome />
            </PlayerProvider>
          </ThemeProvider>
        </ContentProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
