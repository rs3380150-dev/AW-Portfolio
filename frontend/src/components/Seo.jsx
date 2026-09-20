import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { buildStructuredData, getSeoMeta, toAbsoluteUrl } from "@/data/seo";

const ensureMeta = (attribute, key) => {
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  return element;
};

const setMeta = (attribute, key, content) => {
  if (!content) return;
  ensureMeta(attribute, key).setAttribute("content", content);
};

const setCanonical = (href) => {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
};

export const Seo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = getSeoMeta(pathname);
    const imageUrl = toAbsoluteUrl(meta.image);

    document.title = meta.title;
    setCanonical(meta.url);

    setMeta("name", "description", meta.description);
    const robots = meta.indexable
      ? "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
      : "noindex,nofollow";
    setMeta("name", "robots", robots);
    setMeta("name", "googlebot", robots);
    setMeta("name", "author", "Achyut Wadhwa");
    setMeta("name", "theme-color", "#050505");

    setMeta("property", "og:site_name", "Achyut Wadhwa");
    setMeta("property", "og:type", meta.type || "website");
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", meta.url);
    setMeta("property", "og:image", imageUrl);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:image:alt", "Achyut Wadhwa");

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", meta.title);
    setMeta("name", "twitter:description", meta.description);
    setMeta("name", "twitter:image", imageUrl);
    setMeta("name", "twitter:image:alt", "Achyut Wadhwa");

    let script = document.getElementById("achyut-wadhwa-jsonld");
    if (!script) {
      script = document.createElement("script");
      script.id = "achyut-wadhwa-jsonld";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(buildStructuredData(pathname));
  }, [pathname]);

  return null;
};
