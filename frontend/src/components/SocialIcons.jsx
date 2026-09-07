import React from "react";
import { Instagram, Facebook, Youtube, Music2, Twitter } from "@/components/icons";
import { site } from "@/data/site";

const TikTok = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" {...props}>
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.4v13.67a2.5 2.5 0 1 1-2.5-2.5c.26 0 .5.04.74.11V10.8a5.9 5.9 0 0 0-.74-.05 5.94 5.94 0 1 0 5.94 5.94V8.98a7.6 7.6 0 0 0 4.42 1.42V7a4.28 4.28 0 0 1-3.4-1.18Z" />
  </svg>
);

const items = [
  { key: "instagram", Icon: Instagram, label: "Instagram" },
  { key: "youtube", Icon: Youtube, label: "YouTube" },
  { key: "soundcloud", Icon: Music2, label: "SoundCloud" },
  { key: "spotify", Icon: Music2, label: "Spotify" },
  { key: "facebook", Icon: Facebook, label: "Facebook" },
  { key: "tiktok", Icon: TikTok, label: "TikTok" },
  { key: "x", Icon: Twitter, label: "X" },
];

export const SocialIcons = ({ className = "", size = "h-10 w-10" }) => (
  <div className={`flex flex-wrap items-center gap-3 ${className}`}>
    {items.filter(({ key }) => site.social[key]).map(({ key, Icon, label }) => (
      <a
        key={key}
        href={site.social[key]}
        target="_blank"
        rel="noreferrer"
        aria-label={label}
        data-testid={`social-${key}`}
        className={`${size} grid place-items-center rounded-full border border-white/10 text-white/70 hover:text-cyan hover:border-cyan/50 transition-[color,border-color] duration-300`}
      >
        <Icon className="h-[18px] w-[18px]" />
      </a>
    ))}
  </div>
);
