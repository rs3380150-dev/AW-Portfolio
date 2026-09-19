import { skills, timeline, influences } from "@/data/about";
import { events } from "@/data/events";
import { gallery } from "@/data/gallery";
import { achievements, brandLogos, mediaFeatures, testimonials } from "@/data/press";
import { services } from "@/data/services";
import { manifesto, site } from "@/data/site";
import { tracks } from "@/data/tracks";
import { videos } from "@/data/videos";

export const defaultContent = {
  site,
  manifesto,
  tracks,
  events,
  gallery,
  videos,
  services,
  testimonials,
  achievements,
  skills,
  timeline,
  influences,
  mediaFeatures,
  brandLogos,
};

export const contentSectionKeys = Object.keys(defaultContent);

