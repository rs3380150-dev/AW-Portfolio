import React, { useEffect, useMemo, useState } from "react";
import { Instagram, Mail, MapPin, MessageCircle, Phone, Send } from "@/components/icons";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ConnectSection } from "@/components/ConnectSection";
import { SectionHeading } from "@/components/SectionHeading";
import { SocialIcons } from "@/components/SocialIcons";
import { ScrollReveal } from "@/components/Motion";
import { services } from "@/data/services";
import { site } from "@/data/site";

const initialForm = {
  name: "",
  email: "",
  eventType: "",
  city: "",
  date: "",
  budget: "",
  message: "",
  website: "",
};

const web3FormsAccessKey = import.meta.env.web3form_access_key || import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "";

const valueOrFallback = (value) => value || "Not provided";

const buildMessage = (form) =>
  [
    "Achyut Wadhwa booking request",
    "",
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    `Service: ${form.eventType}`,
    `City: ${valueOrFallback(form.city)}`,
    `Date: ${valueOrFallback(form.date)}`,
    `Budget: ${valueOrFallback(form.budget)}`,
    "",
    "Brief:",
    form.message,
  ].join("\n");

const buildFallbackLinks = (form) => {
  const subject = `Achyut Wadhwa booking request - ${form.eventType || "Collab"}`;
  const message = buildMessage(form);
  const phone = site.whatsapp.replace(/\D/g, "");

  return {
    email: `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`,
    whatsapp: `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
  };
};

const whatsappHref = `https://wa.me/${site.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
  "Hi Achyut Wadhwa, I want to discuss a booking or collaboration.",
)}`;

export const Contact = () => {
  const [params] = useSearchParams();
  const requestedService = params.get("service") || "";
  const defaults = useMemo(() => ({ ...initialForm, eventType: requestedService }), [requestedService]);
  const [form, setForm] = useState(defaults);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fallbackLinks, setFallbackLinks] = useState(null);

  useEffect(() => {
    setForm((current) => ({ ...current, eventType: requestedService }));
  }, [requestedService]);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.eventType || !form.message) {
      toast.error("Please fill the required booking details.");
      return;
    }

    if (form.website) return;

    setIsSubmitting(true);
    setFallbackLinks(null);

    try {
      if (!web3FormsAccessKey) {
        throw new Error("Missing Web3Forms access key");
      }

      const response = await fetch(site.web3FormsEndpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_key: web3FormsAccessKey,
          subject: `Achyut Wadhwa booking request - ${form.eventType}`,
          from_name: form.name,
          name: form.name,
          email: form.email,
          service: form.eventType,
          city: valueOrFallback(form.city),
          date: valueOrFallback(form.date),
          budget: valueOrFallback(form.budget),
          message: form.message,
          botcheck: form.website,
          source: "Achyut Wadhwa website contact form",
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        throw new Error("Form submission failed");
      }

      toast.success("Booking request sent. Management will follow up.");
      setForm(defaults);
      setFallbackLinks(null);
    } catch (error) {
      setFallbackLinks(buildFallbackLinks(form));
      toast.error("Form service unavailable. WhatsApp/email fallback is ready.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell" data-testid="contact-page">
      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading
              index="01"
              eyebrow="Bookings & Collabs"
              title="Tell us about the room, record, or idea."
              subtitle="Share the format, location, date, and creative needs. Achyut Wadhwa is open for DJ sets, live performances, production work, and collaborations."
            />

            <div className="mt-10 grid gap-4">
              <ScrollReveal className="flex gap-4 border-t border-white/10 pt-5">
                <Mail className="mt-1 h-5 w-5 text-cyan" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">Email / Collabs</p>
                  <a href={`mailto:${site.email}`} className="mt-1 block text-white/75 hover:text-cyan transition-colors">{site.email}</a>
                </div>
              </ScrollReveal>
              <ScrollReveal className="flex gap-4 border-t border-white/10 pt-5">
                <Phone className="mt-1 h-5 w-5 text-cyan" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">Phone</p>
                  <div className="mt-1 space-y-1">
                    {site.phoneNumbers.map((phone) => (
                      <a key={phone.value} href={phone.href} className="block text-white/75 hover:text-cyan transition-colors">
                        {phone.value}
                      </a>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
              <ScrollReveal className="flex gap-4 border-t border-white/10 pt-5">
                <MessageCircle className="mt-1 h-5 w-5 text-cyan" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">WhatsApp</p>
                  <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-1 block text-white/75 hover:text-cyan transition-colors">
                    Message on WhatsApp
                  </a>
                </div>
              </ScrollReveal>
              <ScrollReveal className="flex gap-4 border-t border-white/10 pt-5">
                <Instagram className="mt-1 h-5 w-5 text-cyan" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">Instagram</p>
                  <a href={site.social.instagram} target="_blank" rel="noreferrer" className="mt-1 block text-white/75 hover:text-cyan transition-colors">
                    {site.instagramHandle}
                  </a>
                </div>
              </ScrollReveal>
              <ScrollReveal className="flex gap-4 border-t border-white/10 pt-5">
                <MapPin className="mt-1 h-5 w-5 text-cyan" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">Base</p>
                  <p className="mt-1 text-white/75">{site.location}</p>
                </div>
              </ScrollReveal>
            </div>

            <SocialIcons className="mt-10" />
          </div>

          <form onSubmit={submit} className="glass rounded-md p-6 md:p-8" data-testid="booking-form">
            <label className="hidden" aria-hidden="true">
              Website
              <input value={form.website} onChange={update("website")} tabIndex={-1} autoComplete="off" />
            </label>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-white/55">Name *</span>
                <input value={form.name} onChange={update("name")} data-testid="booking-name" className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/30 focus:border-cyan/50" placeholder="Your name" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-white/55">Email *</span>
                <input type="email" value={form.email} onChange={update("email")} data-testid="booking-email" className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/30 focus:border-cyan/50" placeholder="you@email.com" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-white/55">Service *</span>
                <select value={form.eventType} onChange={update("eventType")} data-testid="booking-service" className="w-full rounded-md border border-white/10 bg-navy px-4 py-3 text-white outline-none transition-colors duration-300 focus:border-cyan/50">
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.title}>{service.title}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-white/55">City</span>
                <input value={form.city} onChange={update("city")} data-testid="booking-city" className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/30 focus:border-cyan/50" placeholder="City / venue..." />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-white/55">Date</span>
                <input type="date" value={form.date} onChange={update("date")} data-testid="booking-date" className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors duration-300 focus:border-cyan/50" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-white/55">Budget Range</span>
                <input value={form.budget} onChange={update("budget")} data-testid="booking-budget" className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/30 focus:border-cyan/50" placeholder="Optional" />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm text-white/55">Brief *</span>
              <textarea value={form.message} onChange={update("message")} data-testid="booking-message" rows={7} className="w-full resize-none rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-colors duration-300 placeholder:text-white/30 focus:border-cyan/50" placeholder="Audience, venue, schedule, production, collaboration idea, and anything the set or record needs to do." />
            </label>

            <button
              type="submit"
              data-testid="booking-submit"
              disabled={isSubmitting}
              className="action-accent mt-6 inline-flex items-center gap-2 rounded-full bg-magenta px-7 py-4 font-semibold transition-[transform,box-shadow,opacity] duration-300 hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(31,95,128,0.42)] disabled:pointer-events-none disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send Request"}
              <Send className="h-5 w-5" />
            </button>

            {fallbackLinks && (
              <div className="mt-5 border-t border-white/10 pt-5" data-testid="booking-fallback">
                <p className="text-sm leading-relaxed text-white/55">
                  Form service is not available right now. Send the same request directly through WhatsApp or email.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={fallbackLinks.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-cyan/35 px-5 py-3 text-sm font-semibold text-cyan transition-colors duration-300 hover:border-cyan hover:bg-cyan/10"
                  >
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <a
                    href={fallbackLinks.email}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 transition-colors duration-300 hover:border-cyan/45 hover:text-cyan"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>

      <ConnectSection />
    </div>
  );
};
