import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail, MapPin, MessageCircle, Phone, Send } from "@/components/icons";
import { site } from "@/data/site";
import { SocialIcons } from "@/components/SocialIcons";
import { toast } from "sonner";

const quickLinks = [
  { to: "/about", label: "About" },
  { to: "/music", label: "Music" },
  { to: "/events", label: "Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
];

const footerIconClass = "mt-0.5 h-4 w-4 shrink-0 text-cyan";
const primaryPhone = site.phoneNumbers[0];
const footerWhatsappHref = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
  "Hi Achyut Wadhwa, I want to discuss a booking or collaboration.",
)}`;

export const Footer = () => {
  const [email, setEmail] = useState("");
  const subscribe = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address");
      return;
    }
    toast.success("Subscribed - welcome to the inner circle");
    setEmail("");
  };

  return (
    <footer data-testid="footer" className="relative overflow-hidden border-t border-white/10 bg-navy">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/70 to-transparent" />
      <div className="mx-auto grid max-w-[1500px] gap-12 px-6 py-20 md:grid-cols-2 md:px-10 lg:grid-cols-[1.15fr_0.7fr_1fr_1.15fr]">
        <div>
          <div className="font-display text-3xl font-bold uppercase leading-none tracking-tight">
            ACHYUT<span className="text-cyan"> WADHWA</span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-[1.75] text-white/55">{site.intro}</p>
          <SocialIcons className="mt-6" size="h-9 w-9" />
        </div>

        <div>
          <h4 className="mb-5 font-mono text-[11px] uppercase tracking-[0.28em] text-cyan">Explore</h4>
          <ul className="space-y-3.5">
            {quickLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} data-testid={`footer-link-${l.label.toLowerCase()}`} className="inline-flex text-sm font-medium text-white/68 transition-colors duration-300 hover:text-cyan">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-5 font-mono text-[11px] uppercase tracking-[0.28em] text-cyan">Booking</h4>
          <ul className="space-y-3.5 text-sm text-white/68">
            <li className="flex items-start gap-3">
              <Mail className={footerIconClass} />
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-cyan">{site.email}</a>
            </li>
            <li className="flex items-start gap-3">
              <Phone className={footerIconClass} />
              <a href={primaryPhone.href} className="transition-colors hover:text-cyan">{primaryPhone.value}</a>
            </li>
            <li className="flex items-start gap-3">
              <MessageCircle className={footerIconClass} />
              <a href={footerWhatsappHref} target="_blank" rel="noreferrer" className="transition-colors hover:text-cyan">WhatsApp</a>
            </li>
            <li className="flex items-start gap-3">
              <Instagram className={footerIconClass} />
              <a href={site.social.instagram} target="_blank" rel="noreferrer" className="transition-colors hover:text-cyan">{site.instagramHandle}</a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className={footerIconClass} />
              <span>{site.location}</span>
            </li>
            <li className="max-w-xs pt-2 text-xs leading-relaxed text-white/45">{site.availability}</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-5 font-mono text-[11px] uppercase tracking-[0.28em] text-cyan">Newsletter</h4>
          <p className="mb-5 max-w-xs text-sm leading-[1.7] text-white/55">Tour dates & unreleased edits, direct to your inbox.</p>
          <form onSubmit={subscribe} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              aria-label="Email address"
              data-testid="newsletter-input"
              className="min-w-0 flex-1 border-0 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none"
            />
            <button
              type="submit"
              data-testid="newsletter-submit"
              aria-label="Subscribe"
              className="action-accent grid h-10 w-10 shrink-0 place-items-center rounded-full bg-magenta transition-[background-color,transform] duration-300 hover:scale-[1.04] hover:bg-cyan"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-white/40 md:px-10 sm:flex-row">
          <p>(c) {new Date().getFullYear()} Achyut Wadhwa. All rights reserved.</p>
          <p className="font-mono uppercase tracking-[0.18em]">Feel the Beat. Live the Moment.</p>
        </div>
      </div>
    </footer>
  );
};
