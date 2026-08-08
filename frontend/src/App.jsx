import { lazy, Suspense, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GsapEnhancer } from "@/components/GsapEnhancer";
import { MusicPlayer } from "@/components/MusicPlayer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Seo } from "@/components/Seo";
import { SmoothScroll } from "@/components/SmoothScroll";
import { PlayerProvider } from "@/context/PlayerContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { pageLoaders, prefetchPriorityRoutes } from "@/routes/pageLoaders";

const Home = lazy(() => pageLoaders["/"]().then((module) => ({ default: module.Home })));
const About = lazy(() => pageLoaders["/about"]().then((module) => ({ default: module.About })));
const Music = lazy(() => pageLoaders["/music"]().then((module) => ({ default: module.Music })));
const Events = lazy(() => pageLoaders["/events"]().then((module) => ({ default: module.Events })));
const GalleryPage = lazy(() => pageLoaders["/gallery"]().then((module) => ({ default: module.GalleryPage })));
const Videos = lazy(() => pageLoaders["/videos"]().then((module) => ({ default: module.Videos })));
const Services = lazy(() => pageLoaders["/services"]().then((module) => ({ default: module.Services })));
const Press = lazy(() => pageLoaders["/press"]().then((module) => ({ default: module.Press })));
const Contact = lazy(() => pageLoaders["/contact"]().then((module) => ({ default: module.Contact })));
const NotFound = lazy(() => import("@/pages/NotFound").then((module) => ({ default: module.NotFound })));

const PageFallback = () => (
  <div className="grid min-h-screen place-items-center bg-void px-6 text-center">
    <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">Loading</p>
  </div>
);

const RouteReset = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.__novaLenis) {
      window.__novaLenis.scrollTo(0, { immediate: true });
      return;
    }

    window.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return null;
};

const AppChrome = () => {
  const { theme } = useTheme();

  useEffect(() => {
    prefetchPriorityRoutes();
  }, []);

  return (
    <BrowserRouter>
      <SmoothScroll />
      <RouteReset />
      <Seo />
      <GsapEnhancer />
      <LoadingScreen />
      <Navbar />
      <main className="gsap-page-root">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/music" element={<Music />} />
            <Route path="/events" element={<Events />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/services" element={<Services />} />
            <Route path="/press" element={<Press />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <MusicPlayer />
      <ScrollToTop />
      <Toaster position="top-right" theme={theme} richColors closeButton />
    </BrowserRouter>
  );
};

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <PlayerProvider>
          <AppChrome />
        </PlayerProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
