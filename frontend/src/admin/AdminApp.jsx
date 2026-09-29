import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  AudioWaveform,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Building2,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Eye,
  ExternalLink,
  FileImage,
  Disc3,
  GraduationCap,
  Handshake,
  Heart,
  History,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Music,
  PartyPopper,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  SlidersVertical,
  Trash2,
  Repeat2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { defaultContent } from "@/content/defaultContent";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { sectionDefinitionMap, sectionDefinitions } from "@/admin/contentSchemas";
import { createSectionItem } from "@/admin/contentTemplates.mjs";
import { describeValidationPath, validateSection } from "@/admin/contentValidation.mjs";
import { formatCategoryLabel, normalizeCategory } from "@/utils/contentCategories.mjs";
import "@/admin/admin.css";

const clone = (value) => JSON.parse(JSON.stringify(value));
const uid = () => crypto.randomUUID();
const imageFieldPattern = /(?:image|poster|thumbnail|cover|avatar|artwork|photo|^src$)/i;
const mediaFieldPattern = /(?:image|poster|thumbnail|cover|avatar|artwork|photo|^src$|audio|video)/i;
const toDateInputValue = (value) => {
  if (!value) return "";
  const iso = String(value).match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (iso) return iso;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const ImageLightbox = ({ src, alt, onClose }) => {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") event.preventDefault();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  return createPortal(
    <div className="admin-image-lightbox" role="dialog" aria-modal="true" aria-label={`Image preview: ${alt}`} onClick={onClose}>
      <button type="button" className="admin-image-lightbox__close" onClick={onClose} aria-label="Close image preview" autoFocus><X size={22} /></button>
      <img src={src} alt={alt} onClick={(event) => event.stopPropagation()} />
    </div>,
    document.body,
  );
};

const ImagePreview = ({ src, alt }) => {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);
  if (!src) return null;

  return (
    <>
      <button
        type="button"
        className={`admin-image-preview ${failed ? "has-error" : ""}`}
        onClick={() => !failed && setOpen(true)}
        disabled={failed}
        aria-label={`View ${alt} larger`}
      >
        {failed ? (
          <span><FileImage size={22} /> Preview unavailable</span>
        ) : (
          <img src={src} alt={alt} onError={() => setFailed(true)} />
        )}
        {!failed && <span className="admin-image-preview__hint">Click to enlarge</span>}
      </button>
      {open && <ImageLightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
};

const MediaPicker = ({ assets, fieldName, onSelect, onClose }) => {
  const [query, setQuery] = useState("");
  const panelRef = useRef(null);
  const wantsAudio = /audio/i.test(fieldName);
  const wantsVideo = /video/i.test(fieldName);
  const compatible = assets.filter((asset) => {
    const typeMatches = wantsAudio ? asset.mime_type?.startsWith("audio/") : wantsVideo ? asset.mime_type?.startsWith("video/") : asset.mime_type?.startsWith("image/");
    return typeMatches && asset.name.toLowerCase().includes(query.toLowerCase());
  });
  useEffect(() => {
    const previous = document.activeElement;
    const closeOnEscape = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", closeOnEscape);
    panelRef.current?.querySelector("input")?.focus();
    return () => { document.removeEventListener("keydown", closeOnEscape); previous?.focus?.(); };
  }, [onClose]);
  return createPortal(<div className="admin-media-picker" role="dialog" aria-modal="true" aria-label="Choose media" onClick={onClose}><div ref={panelRef} className="admin-media-picker__panel" onClick={(event) => event.stopPropagation()}><div className="admin-media-picker__head"><div><span>Media library</span><h2>Choose {wantsAudio ? "audio" : wantsVideo ? "video" : "an image"}</h2></div><button className="admin-icon-button" aria-label="Close media picker" onClick={onClose}><X size={18} /></button></div><label className="admin-media-picker__search"><Search size={16} /><input aria-label="Search media library" placeholder="Search uploaded files" value={query} onChange={(event) => setQuery(event.target.value)} /></label>{compatible.length ? <div className="admin-media-picker__grid">{compatible.map((asset) => <button key={asset.id} onClick={() => { onSelect(asset.public_url); onClose(); }}>{asset.mime_type?.startsWith("image/") ? <img src={asset.public_url} alt={asset.alt_text || asset.name} /> : <span><FileImage size={30} /></span>}<strong>{asset.name}</strong><small>{asset.alt_text || asset.mime_type}</small></button>)}</div> : <div className="admin-empty"><FileImage size={32} /><h3>No matching files</h3><p>Upload a compatible file in the Media library first.</p></div>}</div></div>, document.body);
};

const sidebarItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/content/tracks", label: "Content", icon: Settings2 },
  { to: "/admin/media", label: "Media library", icon: FileImage },
  { to: "/admin/messages", label: "Messages", icon: Inbox },
  { to: "/admin/history", label: "Version history", icon: History },
];

const AdminLogin = ({ onSignedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    onSignedIn(data.session);
  };

  return (
    <div className="admin-auth">
      <div className="admin-auth__brand"><span>AW</span> Studio Console</div>
      <form className="admin-auth__card" onSubmit={submit}>
        <div className="admin-auth__eyebrow"><ShieldCheck size={16} /> Protected workspace</div>
        <h1>Welcome back.</h1>
        <p>Sign in to manage the Achyut Wadhwa portfolio.</p>
        <label>Email<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button className="admin-button admin-button--primary" disabled={busy}>
          {busy ? <Loader2 className="admin-spin" size={18} /> : <ShieldCheck size={18} />} Sign in
        </button>
        <Link to="/" className="admin-auth__back"><ArrowLeft size={16} /> Return to website</Link>
      </form>
    </div>
  );
};

const AccessDenied = ({ user, onLogout }) => (
  <div className="admin-auth">
    <div className="admin-auth__card">
      <div className="admin-auth__eyebrow"><ShieldCheck size={16} /> Account verified</div>
      <h1>Admin access pending.</h1>
      <p>This account is authenticated but has not been added to the admin allowlist.</p>
      <code className="admin-code">{user?.id}</code>
      <button className="admin-button" onClick={onLogout}><LogOut size={17} /> Sign out</button>
    </div>
  </div>
);

const AdminShell = ({ children, session, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = window.location.pathname;
  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (event) => { if (event.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen]);
  return (
    <div className="admin-shell">
      {menuOpen && <button className="admin-sidebar-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <aside className={`admin-sidebar ${menuOpen ? "is-open" : ""}`} aria-label="Admin navigation">
        <div className="admin-sidebar__brand"><span>AW</span><div>Studio Console<small>Content management</small></div></div>
        <nav>
          {sidebarItems.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return <Link key={to} to={to} className={active ? "is-active" : ""} onClick={() => setMenuOpen(false)}><Icon size={18} />{label}<ChevronRight size={15} /></Link>;
          })}
        </nav>
        <div className="admin-sidebar__bottom">
          <a href="/" target="_blank" rel="noreferrer"><ExternalLink size={17} /> View live site</a>
          <button onClick={onLogout}><LogOut size={17} /> Sign out</button>
          <small>{session.user.email}</small>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-mobile-header"><button aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>{menuOpen ? <X /> : <Menu />}</button><strong>AW Studio Console</strong><a aria-label="View live website" href="/" target="_blank" rel="noreferrer"><ExternalLink size={18} /></a></header>
        {children}
      </div>
    </div>
  );
};

const PageHeader = ({ eyebrow, title, description, actions }) => (
  <div className="admin-page-header">
    <div><span>{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>
    {actions && <div className="admin-page-header__actions">{actions}</div>}
  </div>
);

const Dashboard = ({ published, drafts, messages, media }) => {
  const navigate = useNavigate();
  const stats = [
    ["Published sections", Object.keys(published).length, Activity],
    ["Music releases", published.tracks?.length || 0, BarChart3],
    ["Media assets", media.length, FileImage],
    ["Unread messages", messages.filter((item) => item.status === "unread").length, Inbox],
  ];
  return (
    <div className="admin-page">
      <PageHeader eyebrow="Command centre" title="Good to see you." description="Manage every editable part of the portfolio without touching the public design." actions={<a className="admin-button" href="/" target="_blank" rel="noreferrer">Live website <ExternalLink size={17} /></a>} />
      <div className="admin-stat-grid">{stats.map(([label, value, Icon]) => <article key={label}><Icon size={20} /><strong>{value}</strong><span>{label}</span></article>)}</div>
      <div className="admin-dashboard-grid">
        <section className="admin-panel"><div className="admin-panel__head"><div><h2>Content health</h2><p>Draft and published status by section.</p></div></div><div className="admin-health-list">{sectionDefinitions.map((section) => { const changed = JSON.stringify(drafts[section.key]) !== JSON.stringify(published[section.key]); return <button key={section.key} onClick={() => navigate(`/admin/content/${section.key}`)}><span><strong>{section.label}</strong><small>{Array.isArray(published[section.key]) ? `${published[section.key].length} entries` : "Global settings"}</small></span><em className={changed ? "is-draft" : "is-live"}>{changed ? "Draft changes" : "Published"}</em><ChevronRight size={17} /></button>; })}</div></section>
        <section className="admin-panel"><div className="admin-panel__head"><div><h2>Quick actions</h2><p>Common publishing tasks.</p></div></div><div className="admin-quick-actions"><button onClick={() => navigate("/admin/content/tracks")}><Plus size={20} /><span><strong>Add a release</strong><small>Create music catalogue content</small></span></button><button onClick={() => navigate("/admin/content/events")}><Plus size={20} /><span><strong>Add an event</strong><small>Publish a show or festival</small></span></button><button onClick={() => navigate("/admin/media")}><UploadCloud size={20} /><span><strong>Upload media</strong><small>Images, video and audio</small></span></button><button onClick={() => navigate("/admin/messages")}><Inbox size={20} /><span><strong>Review inbox</strong><small>Booking and collaboration leads</small></span></button></div></section>
      </div>
    </div>
  );
};

const JsonField = ({ name, label, value, onChange, onValidityChange }) => {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  const [error, setError] = useState("");
  useEffect(() => { setText(JSON.stringify(value, null, 2)); setError(""); onValidityChange?.(""); }, [value]);
  const update = (next) => {
    setText(next);
    try {
      onChange(JSON.parse(next));
      setError("");
      onValidityChange?.("");
    } catch (parseError) {
      const message = `Invalid JSON: ${parseError.message}`;
      setError(message);
      onValidityChange?.(message);
    }
  };
  const imageValues = imageFieldPattern.test(name) && Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item)
    : [];
  return <div className={`admin-field admin-field--wide ${error ? "has-error" : ""}`}><span>{label}<small>JSON</small></span><textarea aria-label={label} aria-invalid={Boolean(error)} rows={Math.min(14, Math.max(5, text.split("\n").length))} value={text} onChange={(e) => update(e.target.value)} spellCheck="false" />{error && <small className="admin-field__error" role="alert">{error}</small>}{imageValues.length > 0 && <div className="admin-image-preview-list">{imageValues.map((src, index) => <ImagePreview key={`${src}-${index}`} src={src} alt={`${label} ${index + 1}`} />)}</div>}</div>;
};

const CategoryField = ({ value, options, onChange }) => {
  const [adding, setAdding] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const normalizedValue = normalizeCategory(value || "");
  const choices = [...new Set([...(options || []), normalizedValue].filter(Boolean))].sort();

  const addCategory = () => {
    const next = normalizeCategory(newCategory);
    if (!next) return;
    onChange(next);
    setNewCategory("");
    setAdding(false);
  };

  return (
    <div className="admin-field admin-category-field">
      <span>Category</span>
      <select
        aria-label="Category"
        value={normalizedValue}
        onChange={(event) => {
          if (event.target.value === "__add_new__") {
            setAdding(true);
            return;
          }
          onChange(event.target.value);
          setAdding(false);
        }}
      >
        {!normalizedValue && <option value="">Select a category</option>}
        {choices.map((category) => <option key={category} value={category}>{formatCategoryLabel(category)}</option>)}
        <option value="__add_new__">+ Add new category</option>
      </select>
      {adding && (
        <div className="admin-category-field__new">
          <input
            aria-label="New category name"
            placeholder="New category name"
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCategory();
              }
              if (event.key === "Escape") {
                setAdding(false);
                setNewCategory("");
              }
            }}
            autoFocus
          />
          <button type="button" className="admin-button admin-button--primary" onClick={addCategory} disabled={!normalizeCategory(newCategory)}>Add</button>
          <button type="button" className="admin-button" onClick={() => { setAdding(false); setNewCategory(""); }}>Cancel</button>
        </div>
      )}
      <small>Choose an existing category or add a new one for this content section.</small>
    </div>
  );
};

const StreamingLinksField = ({ value = {}, onChange }) => {
  const services = [
    ["spotify", "Spotify"],
    ["soundcloud", "SoundCloud"],
    ["apple", "Apple Music"],
    ["youtube", "YouTube"],
  ];
  return <fieldset className="admin-streaming-links"><legend>Streaming links</legend><p>Add the complete release URL for each platform. Leave unavailable platforms blank.</p><div>{services.map(([key, label]) => <label className="admin-field" key={key}><span>{label}</span><input type="url" placeholder={`https://${key === "apple" ? "music.apple.com" : `${key}.com`}/...`} value={value?.[key] || ""} onChange={(event) => onChange({ ...value, [key]: event.target.value })} /></label>)}</div></fieldset>;
};

const serviceIconChoices = { Music, Disc3, AudioWaveform, SlidersVertical, Repeat2, Handshake, Building2, GraduationCap, PartyPopper, Heart };
const ServiceIconField = ({ value, onChange }) => <fieldset className="admin-icon-picker"><legend>Service icon</legend><div>{Object.entries(serviceIconChoices).map(([name, Icon]) => <button type="button" key={name} className={value === name ? "is-active" : ""} onClick={() => onChange(name)} aria-pressed={value === name}><Icon size={20} /><span>{name.replace(/([A-Z])/g, " $1").trim()}</span></button>)}</div></fieldset>;

const fieldGuidance = {
  featuredOnHome: {
    label: "Feature this release on the homepage",
    help: "Shows this release in the homepage featured-music section. Only one release can be featured at a time.",
    on: "Featured",
    off: "Not featured",
    preview: "home-feature",
  },
  heroImage: {
    label: "Release page hero image",
    help: "Large background image at the top of this release's detail page. If empty, the cover artwork is used.",
  },
  artistName: {
    label: "Artist name on release page",
    help: "Name displayed below the release title in the top hero section.",
  },
  releaseLabel: {
    label: "Release badge text",
    help: "Short text displayed above the release title, for example “New release”.",
  },
  showReleaseLabel: {
    label: "Show release badge and date",
    help: "Displays the release badge text and release date above the title in the page hero.",
    preview: "hero-badge",
  },
  showArtist: {
    label: "Show artist name in the hero",
    help: "Displays the artist name directly below the large release title at the top of the page.",
    preview: "hero-artist",
  },
  showReleaseNote: {
    label: "Show the release note section",
    help: "Displays the main story section containing the description, story, closing paragraph and credits.",
    preview: "release-note",
  },
  showReleaseLead: {
    label: "Show short description in release note",
    help: "Displays the Description field as the larger opening paragraph of the release note.",
    preview: "release-lead",
  },
  showReleaseStory: {
    label: "Show full story in release note",
    help: "Displays the Story field as the main body copy inside the release note section.",
    preview: "release-story",
  },
  releaseNoteOutro: {
    label: "Release note closing paragraph",
    help: "Final paragraph shown after the release story.",
  },
  showReleaseNoteOutro: {
    label: "Show release note closing paragraph",
    help: "Displays the closing paragraph underneath the release story.",
    preview: "release-outro",
  },
  showCredits: {
    label: "Show production credits",
    help: "Displays written/produced by, release year and music format inside the release note.",
    preview: "release-credits",
  },
  writtenBy: {
    label: "Written and produced by",
    help: "Credit name displayed in the production credits block.",
  },
  showListenPanel: {
    label: "Show the “Listen on” panel",
    help: "Displays cover artwork and Spotify, SoundCloud, Apple Music or YouTube links beside the release note.",
    preview: "listen-panel",
  },
  showImmersiveSection: {
    label: "Show immersive sound section",
    help: "Displays the large visual and play button section below the release note.",
    preview: "immersive-section",
  },
  immersiveEyebrow: {
    label: "Immersive section small heading",
    help: "Small uppercase label shown above the immersive section title.",
  },
  immersiveTitle: {
    label: "Immersive section title",
    help: "Large heading used in the immersive sound section.",
  },
  immersiveDescription: {
    label: "Immersive section description",
    help: "Supporting paragraph shown under the immersive section title.",
  },
  showStreamSection: {
    label: "Show bottom streaming links",
    help: "Displays the final “Stream this release on” bar at the bottom of the release page.",
    preview: "stream-section",
  },
};

const previewCaptions = {
  "home-feature": "Featured music block on the homepage",
  "hero-badge": "Badge and release date above the main title",
  "hero-artist": "Artist name below the main title",
  "release-note": "Complete release note column",
  "release-lead": "Large opening description in the release note",
  "release-story": "Main story paragraph in the release note",
  "release-outro": "Closing paragraph in the release note",
  "release-credits": "Credits grid at the bottom of the release note",
  "listen-panel": "Streaming-services panel beside the release note",
  "immersive-section": "Large immersive visual section",
  "stream-section": "Streaming-links bar at the bottom of the page",
};

const FieldLocationPreview = ({ preview, label }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  if (!preview) return null;
  const isHomepage = preview === "home-feature";

  return (
    <span ref={rootRef} className={`admin-location-preview ${open ? "is-open" : ""}`}>
      <button type="button" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
        <Eye size={13} /> Preview location
      </button>
      <span className="admin-location-preview__popover" role="tooltip">
        <span className="admin-location-preview__top"><strong>Where this appears</strong><small>Highlighted in lime</small></span>
        {isHomepage ? (
          <span className="admin-location-preview__canvas admin-location-preview__home">
            <span className="admin-location-preview__nav">AW <i /> MUSIC &nbsp; EVENTS &nbsp; GALLERY</span>
            <span className="admin-location-preview__home-hero">ACHYUT<br />WADHWA</span>
            <span className="admin-location-preview__featured"><small>FEATURED RELEASE</small><b>OBSCURA</b><i>LISTEN NOW →</i></span>
          </span>
        ) : (
          <span className="admin-location-preview__canvas" data-preview={preview}>
            <span className="admin-location-preview__hero">
              <span data-zone="hero-badge">NEW RELEASE · OCT 17</span>
              <b>OBSCURA</b>
              <i data-zone="hero-artist">— ACHYUT WADHWA</i>
            </span>
            <span className="admin-location-preview__body">
              <span className="admin-location-preview__note" data-zone="release-note">
                <i>01 / RELEASE NOTE</i>
                <b>OBSCURA</b>
                <span data-zone="release-lead">A slow-burning electronic release shaped for late nights.</span>
                <span data-zone="release-story">The record moves through texture, rhythm and open space.</span>
                <span data-zone="release-outro">Built to leave an afterimage after the final note.</span>
                <span data-zone="release-credits">WRITTEN BY &nbsp; • &nbsp; 2026 &nbsp; • &nbsp; ELECTRONIC</span>
              </span>
              <span className="admin-location-preview__listen" data-zone="listen-panel"><i>ARTWORK</i><b>LISTEN ON</b><small>SPOTIFY<br />APPLE MUSIC<br />YOUTUBE</small></span>
            </span>
            <span className="admin-location-preview__immersive" data-zone="immersive-section"><i>VISUAL + PLAY</i><b>IMMERSIVE SOUND</b></span>
            <span className="admin-location-preview__stream" data-zone="stream-section">STREAM “OBSCURA” ON &nbsp; SPOTIFY · APPLE MUSIC · YOUTUBE</span>
          </span>
        )}
        <span className="admin-location-preview__caption"><strong>{previewCaptions[preview]}</strong><small>This is the exact website area controlled by “{label}”.</small></span>
      </span>
    </span>
  );
};

const ValueField = ({ name, value, onChange, categoryOptions = [], media = [], onFieldError }) => {
  const [pickingMedia, setPickingMedia] = useState(false);
  const guidance = fieldGuidance[name] || {};
  const label = guidance.label || name.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
  const help = guidance.help;
  if (name === "links" && value && typeof value === "object") return <StreamingLinksField value={value} onChange={onChange} />;
  if (Array.isArray(value) || (value && typeof value === "object")) return <JsonField name={name} label={label} value={value} onChange={onChange} onValidityChange={onFieldError} />;
  if (name === "category") return <CategoryField value={value} options={categoryOptions} onChange={onChange} />;
  if (name === "status") return <label className="admin-field"><span>{label}</span><select value={value || "upcoming"} onChange={(event) => onChange(event.target.value)}><option value="upcoming">Upcoming</option><option value="sold-out">Sold out</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label>;
  if (name === "type") return <label className="admin-field"><span>{label}</span><select value={value || "club"} onChange={(event) => onChange(event.target.value)}><option value="club">Club</option><option value="festival">Festival</option><option value="private">Private event</option><option value="corporate">Corporate</option><option value="college">College</option><option value="other">Other</option></select></label>;
  if (name === "icon") return <ServiceIconField value={value || "Music"} onChange={onChange} />;
  if (name === "useBlackAndWhiteHero") return <label className="admin-toggle"><span><strong>Use black-and-white hero images</strong><small>On uses the black-and-white set. Off uses the colour set.</small></span><input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /></label>;
  if (typeof value === "boolean") return <div className={`admin-toggle ${guidance.preview ? "has-location-preview" : ""}`}><span><span className="admin-toggle__title"><strong>{label}</strong><FieldLocationPreview preview={guidance.preview} label={label} /></span><small>{help || "Controls whether this content is visible on the website."}</small></span><label className="admin-toggle__control"><em>{value ? guidance.on || "Shown" : guidance.off || "Hidden"}</em><input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /><span className="sr-only">{label}</span></label></div>;
  if (typeof value === "number") return <label className="admin-field"><span>{label}</span><input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>;
  const isLong = /description|story|intro|bio|body|quote/i.test(name);
  const isImage = imageFieldPattern.test(name);
  if (mediaFieldPattern.test(name) && typeof value === "string") return <div className={`admin-field ${isImage ? "admin-field--image" : ""}`}><span>{label}</span>{help && <small className="admin-field__help">{help}</small>}<div className="admin-media-field"><input aria-label={label} value={value ?? ""} onChange={(e) => onChange(e.target.value)} /><button type="button" className="admin-button" onClick={() => setPickingMedia(true)}><FileImage size={15} /> Browse</button></div>{isImage && <ImagePreview src={value} alt={`${label} preview`} />}{pickingMedia && <MediaPicker assets={media} fieldName={name} onSelect={onChange} onClose={() => setPickingMedia(false)} />}</div>;
  const inputType = name === "date" ? "date" : name === "time" ? "time" : name === "releaseDate" ? "date" : /(?:url|ticket)$/i.test(name) ? "url" : "text";
  const inputValue = inputType === "date" ? toDateInputValue(value) : value ?? "";
  return <label className={`admin-field ${isLong ? "admin-field--wide" : ""}`}><span>{label}</span>{help && <small className="admin-field__help">{help}</small>}{isLong ? <textarea rows="4" value={value ?? ""} onChange={(e) => onChange(e.target.value)} /> : <input type={inputType} value={inputValue} onChange={(e) => onChange(e.target.value)} />}</label>;
};

const ContentEditor = ({ published, drafts, media, onSaveDraft, onPublish }) => {
  const { sectionKey = "tracks" } = useParams();
  const navigate = useNavigate();
  const definition = sectionDefinitionMap[sectionKey] || sectionDefinitions[0];
  const source = drafts[definition.key] ?? published[definition.key] ?? clone(defaultContent[definition.key]);
  const [working, setWorking] = useState(() => clone(source));
  const [selected, setSelected] = useState(0);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => { setWorking(clone(drafts[definition.key] ?? published[definition.key] ?? defaultContent[definition.key])); setSelected(0); setQuery(""); setFieldErrors({}); }, [definition.key, drafts, published]);
  const dirty = JSON.stringify(working) !== JSON.stringify(source);
  const draftDiffers = JSON.stringify(drafts[definition.key]) !== JSON.stringify(published[definition.key]);
  const validationErrors = useMemo(() => validateSection(definition.key, working), [definition.key, working]);
  const jsonErrors = Object.entries(fieldErrors).filter(([, message]) => message).map(([path, message]) => ({ path, message }));
  const allErrors = [...validationErrors, ...jsonErrors];
  const reportFieldError = (path) => (message) => setFieldErrors((current) => ({ ...current, [path]: message }));

  useEffect(() => {
    const warnUnsaved = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnUnsaved);
    return () => window.removeEventListener("beforeunload", warnUnsaved);
  }, [dirty]);

  const save = async () => { setSaving(true); try { return await onSaveDraft(definition.key, working); } finally { setSaving(false); } };
  const publish = async () => {
    if (allErrors.length) return toast.error("Fix the validation issues before publishing.");
    setSaving(true);
    try {
      if (dirty && !(await onSaveDraft(definition.key, working))) return;
      await onPublish(definition.key);
    } finally {
      setSaving(false);
    }
  };
  const previewDraft = async () => {
    const previewWindow = window.open("about:blank", "_blank");
    if (!previewWindow) return toast.error("Allow pop-ups to open the draft preview.");
    previewWindow.opener = null;
    if (dirty && !(await save())) { previewWindow.close(); return; }
    const path = definition.key === "tracks" && working[selected]?.slug ? `/music/${working[selected].slug}` : definition.key === "site" || definition.key === "manifesto" ? "/" : definition.key === "gallery" ? "/gallery" : definition.key === "achievements" || definition.key === "testimonials" || definition.key === "mediaFeatures" || definition.key === "brandLogos" ? "/press" : definition.key === "skills" || definition.key === "timeline" || definition.key === "influences" ? "/about" : `/${definition.key}`;
    previewWindow.location.href = `${path}?preview=draft`;
  };
  const addItem = () => { const current = Array.isArray(working) ? working : []; setWorking([...current, createSectionItem(definition.key, definition.primitive)]); setSelected(current.length); };
  const duplicateItem = (index) => { const copy = clone(working[index]); if (copy && typeof copy === "object") { if ("id" in copy) copy.id = uid(); if ("slug" in copy) copy.slug = `${copy.slug || "item"}-copy`; } const next = [...working]; next.splice(index + 1, 0, copy); setWorking(next); setSelected(index + 1); };
  const removeItem = (index) => { if (!window.confirm("Delete this item from the draft? It will not affect the live site until you publish.")) return; setWorking(working.filter((_, itemIndex) => itemIndex !== index)); setSelected(Math.max(0, index - 1)); };
  const moveItem = (index, delta) => { const nextIndex = index + delta; if (nextIndex < 0 || nextIndex >= working.length) return; const next = [...working]; [next[index], next[nextIndex]] = [next[nextIndex], next[index]]; setWorking(next); setSelected(nextIndex); };
  const reorderItem = (from, to) => { if (from === null || from === to) return; const next = [...working]; const [moved] = next.splice(from, 1); next.splice(to, 0, moved); setWorking(next); setSelected(to); setDraggedIndex(null); };
  const updateItem = (index, nextValue) => setWorking(working.map((item, itemIndex) => itemIndex === index ? nextValue : item));
  const updateField = (index, key, nextValue) => {
    if (definition.key === "tracks" && key === "featuredOnHome" && nextValue) {
      setWorking(working.map((item, itemIndex) => ({ ...item, featuredOnHome: itemIndex === index })));
      return;
    }
    updateItem(index, { ...working[index], [key]: nextValue });
  };
  const visibleItems = Array.isArray(working) ? working.map((item, index) => ({ item, index })).filter(({ item }) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())) : [];
  const categoryOptions = Array.isArray(working)
    ? [...new Set(working.map((item) => normalizeCategory(item?.category || "")).filter(Boolean))]
    : [];
  const entryNames = {
    manifesto: "card",
    tracks: "release",
    events: "event",
    gallery: "image",
    videos: "video",
    services: "service",
    testimonials: "testimonial",
    achievements: "achievement",
    skills: "skill",
    timeline: "milestone",
    influences: "influence",
    mediaFeatures: "platform",
    brandLogos: "partner",
  };
  const entryName = entryNames[definition.key] || "item";
  const entryCount = Array.isArray(working) ? working.length : 0;
  const objectFields = definition.key === "site"
    ? { ...working, useBlackAndWhiteHero: working.useBlackAndWhiteHero ?? true }
    : working;

  const editableFields = (item) => {
    if (definition.key === "tracks" && item && typeof item === "object") return {
      ...item,
      featuredOnHome: item.featuredOnHome ?? false,
      heroImage: item.heroImage ?? "",
      artistName: item.artistName ?? "Achyut Wadhwa",
      releaseLabel: item.releaseLabel ?? "New release",
      showReleaseLabel: item.showReleaseLabel ?? true,
      showArtist: item.showArtist ?? true,
      showReleaseNote: item.showReleaseNote ?? true,
      showReleaseLead: item.showReleaseLead ?? true,
      showReleaseStory: item.showReleaseStory ?? true,
      releaseNoteOutro: item.releaseNoteOutro ?? "Made for the spaces between the club, the studio, and the road, the record carries the same intent in every format: movement first, detail second, and a lasting atmosphere after the sound fades.",
      showReleaseNoteOutro: item.showReleaseNoteOutro ?? true,
      showCredits: item.showCredits ?? true,
      writtenBy: item.writtenBy ?? "Achyut Wadhwa",
      showListenPanel: item.showListenPanel ?? true,
      showImmersiveSection: item.showImmersiveSection ?? true,
      immersiveEyebrow: item.immersiveEyebrow ?? "02 / IMMERSIVE SOUND",
      immersiveTitle: item.immersiveTitle ?? "Listen to the world behind the record.",
      immersiveDescription: item.immersiveDescription ?? `A visual fragment for ${item.title || "this release"}, shaped around its pace, colour, and afterimage.`,
      showStreamSection: item.showStreamSection ?? true,
    };
    return item;
  };

  const renderEntryFields = (item) => {
    const entries = Object.entries(editableFields(item));
    const renderField = ([key, value]) => <ValueField key={key} name={key} value={value} media={media} categoryOptions={categoryOptions} onFieldError={reportFieldError(`${selected}.${key}`)} onChange={(next) => updateField(selected, key, next)} />;
    if (definition.key !== "tracks") return <div className="admin-form-grid">{entries.map(renderField)}</div>;
    const artworkKeys = new Set(["cover", "audio", "heroImage"]);
    const streamingKeys = new Set(["links"]);
    const layoutKeys = new Set(entries.map(([key]) => key).filter((key) => /^(featuredOnHome|artistName|releaseLabel|show|releaseNoteOutro|writtenBy|immersive)/.test(key)));
    const groups = [
      ["Basic details", entries.filter(([key]) => !artworkKeys.has(key) && !streamingKeys.has(key) && !layoutKeys.has(key))],
      ["Artwork & audio", entries.filter(([key]) => artworkKeys.has(key))],
      ["Streaming links", entries.filter(([key]) => streamingKeys.has(key))],
      ["Release page layout", entries.filter(([key]) => layoutKeys.has(key))],
    ];
    return <div className="admin-track-groups">{groups.filter(([, fields]) => fields.length).map(([title, fields]) => <fieldset key={title}><legend>{title}</legend><div className="admin-form-grid">{fields.map(renderField)}</div></fieldset>)}</div>;
  };

  return <div className="admin-page admin-content-page">
    <PageHeader
      eyebrow="Content studio"
      title={definition.label}
      description={definition.description}
      actions={<>
        <span className={`admin-status ${draftDiffers || dirty ? "is-draft" : "is-live"}`}>{draftDiffers || dirty ? "Unpublished changes" : "Everything is live"}</span>
        <button className="admin-button" onClick={previewDraft} disabled={saving}><Eye size={17} /> Preview draft</button>
        <button className="admin-button" onClick={save} disabled={!dirty || saving}>{saving ? <Loader2 className="admin-spin" size={17} /> : <Save size={17} />} Save draft</button>
        <button className="admin-button admin-button--primary" onClick={publish} disabled={saving || allErrors.length > 0 || (!draftDiffers && !dirty)} title={allErrors.length ? "Fix validation issues before publishing" : "Publish changes to the live website"}><Check size={17} /> Publish changes</button>
      </>}
    />

    {allErrors.length > 0 && <section className="admin-validation-panel" role="alert"><AlertTriangle size={20} /><div><strong>{allErrors.length} issue{allErrors.length === 1 ? "" : "s"} must be fixed before publishing</strong><ul>{allErrors.slice(0, 8).map((error, index) => <li key={`${error.path}-${index}`}><b>{describeValidationPath(error.path)}</b>: {error.message}</li>)}</ul>{allErrors.length > 8 && <small>Plus {allErrors.length - 8} more issues.</small>}</div></section>}

    <section className="admin-content-switcher" aria-label="Choose content section">
      <div>
        <span>Editing section</span>
        <strong>{definition.label}</strong>
        <small>Choose which part of the website you want to manage.</small>
      </div>
      <label>
        <span className="sr-only">Content section</span>
        <select value={definition.key} onChange={(event) => { if (dirty && !window.confirm("You have unsaved changes. Leave this section and discard them?")) return; navigate(`/admin/content/${event.target.value}`); }}>
          {sectionDefinitions.map((section) => <option key={section.key} value={section.key}>{section.label}</option>)}
        </select>
      </label>
    </section>

    {definition.kind === "object" ? (
      <section className="admin-panel admin-object-editor">
        <div className="admin-editor-intro"><strong>Global website settings</strong><span>Edit the fields below, then save a draft or publish when you are ready.</span></div>
        <div className="admin-form-grid">{Object.entries(objectFields).map(([key, value]) => <ValueField key={key} name={key} value={value} media={media} onFieldError={reportFieldError(key)} onChange={(next) => setWorking({ ...working, [key]: next })} />)}</div>
      </section>
    ) : (
      <div className="admin-editor-layout">
        <section className="admin-panel admin-entry-list">
          <div className="admin-entry-list__header">
            <div><span>{definition.label} library</span><small>{entryCount} {entryCount === 1 ? entryName : `${entryName}s`}</small></div>
            <button className="admin-button admin-button--primary" onClick={addItem}><Plus size={17} /> Add new {entryName}</button>
          </div>
          <div className="admin-entry-list__tools">
            <label><Search size={16} /><input aria-label={`Search ${definition.label}`} placeholder={`Search ${definition.label.toLowerCase()}...`} value={query} onChange={(e) => setQuery(e.target.value)} /></label>
          </div>
          <div className="admin-entry-list__items">
            {visibleItems.map(({ item, index }) => <button key={item?.id || `${definition.key}-${index}`} draggable={!query} className={`${selected === index ? "is-active" : ""} ${draggedIndex === index ? "is-dragging" : ""}`} onDragStart={() => setDraggedIndex(index)} onDragEnd={() => setDraggedIndex(null)} onDragOver={(event) => { if (!query) event.preventDefault(); }} onDrop={() => reorderItem(draggedIndex, index)} onClick={() => setSelected(index)} title={query ? "Clear search to reorder" : "Drag to reorder"}><span><strong>{definition.primitive ? String(item) : item?.[definition.titleField] || item?.title || `Untitled ${entryName}`}</strong><small>{definition.primitive ? `${entryName} ${index + 1}` : item?.category || item?.year || item?.city || `${entryName} ${index + 1}`}</small></span><ChevronRight size={16} /></button>)}
            {query && visibleItems.length === 0 && <div className="admin-entry-list__empty"><Search size={20} /><span>No matching {entryName}s</span><button type="button" onClick={() => setQuery("")}>Clear search</button></div>}
          </div>
        </section>

        <section className="admin-panel admin-entry-editor">
          {working[selected] !== undefined ? <>
            <div className="admin-entry-editor__head">
              <div><span>Editing {entryName} {selected + 1} of {working.length}</span><h2>{definition.primitive ? String(working[selected]) : working[selected]?.[definition.titleField] || working[selected]?.title || `Untitled ${entryName}`}</h2><p>Update the details below. Your changes stay private until you publish them.</p></div>
              <div className="admin-entry-editor__actions">
                <button className="admin-icon-button" title="Move up" aria-label={`Move ${entryName} up`} onClick={() => moveItem(selected, -1)} disabled={selected === 0}><ArrowUp size={17} /></button>
                <button className="admin-icon-button" title="Move down" aria-label={`Move ${entryName} down`} onClick={() => moveItem(selected, 1)} disabled={selected === working.length - 1}><ArrowDown size={17} /></button>
                <button className="admin-icon-button" title={`Duplicate ${entryName}`} aria-label={`Duplicate ${entryName}`} onClick={() => duplicateItem(selected)}><Copy size={17} /></button>
                <button className="admin-icon-button is-danger" title={`Delete ${entryName}`} aria-label={`Delete ${entryName}`} onClick={() => removeItem(selected)}><Trash2 size={17} /></button>
              </div>
            </div>
            {definition.primitive ? <ValueField name="Value" value={working[selected]} media={media} onChange={(value) => updateItem(selected, value)} /> : renderEntryFields(working[selected])}
          </> : <div className="admin-empty"><Settings2 size={32} /><h3>No {entryName}s yet</h3><p>Add your first {entryName} to start editing this section.</p><button className="admin-button admin-button--primary" onClick={addItem}><Plus size={17} /> Add new {entryName}</button></div>}
        </section>
      </div>
    )}
  </div>;
};

const MediaLibrary = ({ media, refreshMedia, published, drafts }) => {
  const inputRef = useRef(null); const [uploading, setUploading] = useState(false); const [uploadProgress, setUploadProgress] = useState(""); const [query, setQuery] = useState("");
  const upload = async (event) => {
    const files = [...event.target.files]; if (!files.length) return;
    setUploading(true);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) { setUploading(false); return toast.error("Your session could not be verified. Please sign in again."); }
    let uploaded = 0;
    for (const [index, file] of files.entries()) {
      setUploadProgress(`${index + 1} / ${files.length}`);
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-"); const path = `${new Date().toISOString().slice(0, 10)}/${uid()}-${safeName}`; const normalizedMime = /\.mpeg$/i.test(file.name) && file.type === "video/mpeg" ? "audio/mpeg" : file.type; const uploadBody = normalizedMime === file.type ? file : new Blob([file], { type: normalizedMime });
      const { error } = await supabase.storage.from("media").upload(path, uploadBody, { cacheControl: "31536000", contentType: normalizedMime, upsert: false });
      if (error) { toast.error(`${file.name}: ${error.message}`); continue; }
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      const { error: metadataError } = await supabase.from("media_assets").insert({ name: file.name, storage_path: path, public_url: data.publicUrl, mime_type: normalizedMime, size_bytes: file.size, alt_text: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), created_by: userData.user.id });
      if (metadataError) { await supabase.storage.from("media").remove([path]); toast.error(`${file.name}: ${metadataError.message}`); continue; }
      uploaded += 1;
    }
    setUploading(false); setUploadProgress(""); event.target.value = ""; await refreshMedia();
    if (uploaded) toast.success(`${uploaded} media file${uploaded === 1 ? "" : "s"} uploaded`);
  };
  const updateAlt = async (asset, altText) => { const { error } = await supabase.from("media_assets").update({ alt_text: altText.trim() }).eq("id", asset.id); if (error) toast.error(error.message); else { await refreshMedia(); toast.success("Alt text updated"); } };
  const remove = async (asset) => {
    const contentSnapshot = JSON.stringify({ published, drafts });
    if (contentSnapshot.includes(asset.public_url) || contentSnapshot.includes(asset.storage_path)) return toast.error("This file is used in website content. Replace it there before deleting it.");
    if (!window.confirm(`Permanently delete ${asset.name}? This cannot be undone.`)) return;
    const { error } = await supabase.storage.from("media").remove([asset.storage_path]);
    if (error) return toast.error(error.message);
    const { error: metadataError } = await supabase.from("media_assets").delete().eq("id", asset.id);
    if (metadataError) return toast.error(`File removed, but library cleanup failed: ${metadataError.message}`);
    toast.success("Media deleted"); refreshMedia();
  };
  const filtered = media.filter((asset) => asset.name.toLowerCase().includes(query.toLowerCase()));
  return <div className="admin-page"><PageHeader eyebrow="Asset management" title="Media library" description="Upload optimized portfolio images, video and audio. New assets are served through Supabase CDN." actions={<><input ref={inputRef} type="file" multiple accept="image/*,video/mp4,video/webm,audio/*" hidden onChange={upload} /><button className="admin-button admin-button--primary" onClick={() => inputRef.current?.click()} disabled={uploading}>{uploading ? <Loader2 className="admin-spin" size={17} /> : <UploadCloud size={17} />} Upload media</button></>} /><div className="admin-toolbar"><label><Search size={17} /><input placeholder="Search media" value={query} onChange={(e) => setQuery(e.target.value)} /></label><span>{filtered.length} assets</span></div>{filtered.length ? <div className="admin-media-grid">{filtered.map((asset) => <article key={asset.id}>{asset.mime_type?.startsWith("image/") ? <ImagePreview src={asset.public_url} alt={asset.alt_text || asset.name} /> : asset.mime_type?.startsWith("video/") ? <video src={asset.public_url} muted controls /> : <div className="admin-media-placeholder"><FileImage size={36} /></div>}<div><strong title={asset.name}>{asset.name}</strong><small>{asset.mime_type || "Media"} · {Math.round((asset.size_bytes || 0) / 1024)} KB</small>{asset.mime_type?.startsWith("image/") && <label className="admin-media-alt"><span>Alt text</span><input defaultValue={asset.alt_text || ""} onBlur={(event) => { if (event.target.value.trim() !== (asset.alt_text || "")) updateAlt(asset, event.target.value); }} /></label>}<div><button onClick={() => navigator.clipboard.writeText(asset.public_url).then(() => toast.success("URL copied"))}>Copy URL</button><button className="is-danger" onClick={() => remove(asset)}>Delete</button></div></div></article>)}</div> : <div className="admin-empty admin-panel"><FileImage size={36} /><h3>No media uploaded yet</h3><p>Existing Cloudinary assets remain active. Upload new assets here when ready.</p></div>}</div>;
};

const Messages = ({ messages, refreshMessages }) => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const updateStatus = async (id, status) => { const { error } = await supabase.from("contact_submissions").update({ status }).eq("id", id); if (error) toast.error(error.message); else refreshMessages(); };
  const remove = async (id) => { if (!window.confirm("Permanently delete this message?")) return; const { error } = await supabase.from("contact_submissions").delete().eq("id", id); if (error) toast.error(error.message); else refreshMessages(); };
  const filtered = messages.filter((message) => (statusFilter === "all" || message.status === statusFilter) && JSON.stringify(message).toLowerCase().includes(query.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((Math.min(page, totalPages) - 1) * pageSize, Math.min(page, totalPages) * pageSize);
  return <div className="admin-page"><PageHeader eyebrow="Lead inbox" title="Messages" description="Booking, collaboration and contact submissions." actions={<button className="admin-button" onClick={refreshMessages}><RefreshCw size={17} /> Refresh</button>} /><div className="admin-toolbar admin-message-toolbar"><label><Search size={17} /><input placeholder="Search name, email or message" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} /></label><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}><option value="all">All statuses</option><option value="unread">Unread</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option></select><span>{filtered.length} messages</span></div>{visible.length ? <><div className="admin-message-list">{visible.map((message) => <article className={`admin-panel ${message.status === "unread" ? "is-unread" : ""}`} key={message.id}><div className="admin-message-head"><div><span>{message.service || "General enquiry"}</span><h2>{message.name}</h2><a href={`mailto:${message.email}`}>{message.email}</a></div><time>{new Date(message.created_at).toLocaleString()}</time></div><p>{message.message}</p><div className="admin-message-actions"><select value={message.status} onChange={(e) => updateStatus(message.id, e.target.value)}><option value="unread">Unread</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option></select><a className="admin-button" href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.service || "Your enquiry")}`}>Reply</a><button className="admin-icon-button is-danger" aria-label={`Delete message from ${message.name}`} onClick={() => remove(message.id)}><Trash2 size={17} /></button></div></article>)}</div>{totalPages > 1 && <nav className="admin-pagination" aria-label="Message pages"><button className="admin-button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {Math.min(page, totalPages)} of {totalPages}</span><button className="admin-button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Next</button></nav>}</> : <div className="admin-empty admin-panel"><Inbox size={36} /><h3>No matching messages</h3><p>Try another search or status filter.</p></div>}</div>;
};

const VersionHistory = ({ versions, onRestore }) => {
  const [preview, setPreview] = useState(null);
  return <div className="admin-page"><PageHeader eyebrow="Publishing safety" title="Version history" description="Preview any saved revision or restore it safely as a draft. Restoring never changes the live site until you publish." />{versions.length ? <div className="admin-history-list">{versions.map((version) => <article className="admin-panel" key={version.id}><Clock3 size={18} /><div><strong>{sectionDefinitionMap[version.section_key]?.label || version.section_key}</strong><small>Revision {version.revision} · {new Date(version.created_at).toLocaleString()}</small></div><code>{Array.isArray(version.content) ? `${version.content.length} entries` : "Settings snapshot"}</code><button className="admin-button" onClick={() => setPreview(version)}><Eye size={16} /> Preview</button><button className="admin-button" onClick={() => onRestore(version)}><History size={16} /> Restore draft</button></article>)}</div> : <div className="admin-empty admin-panel"><History size={36} /><h3>No publishing history yet</h3><p>Your first publish will create the first version snapshot.</p></div>}{preview && createPortal(<div className="admin-history-modal" role="dialog" aria-modal="true" aria-label="Revision preview" onClick={() => setPreview(null)}><div className="admin-history-modal__card" onClick={(event) => event.stopPropagation()}><div><span>Revision {preview.revision}</span><h2>{sectionDefinitionMap[preview.section_key]?.label || preview.section_key}</h2><button className="admin-icon-button" aria-label="Close preview" onClick={() => setPreview(null)}><X size={18} /></button></div><pre>{JSON.stringify(preview.content, null, 2)}</pre><button className="admin-button admin-button--primary" onClick={() => { onRestore(preview); setPreview(null); }}><History size={16} /> Restore as draft</button></div></div>, document.body)}</div>;
};

export const AdminApp = ({ route }) => {
  const [session, setSession] = useState(null); const [checking, setChecking] = useState(true); const [authorized, setAuthorized] = useState(false);
  const [published, setPublished] = useState({}); const [drafts, setDrafts] = useState({}); const [media, setMedia] = useState([]); const [messages, setMessages] = useState([]); const [versions, setVersions] = useState([]);
  const [loadError, setLoadError] = useState("");

  const loadAll = useCallback(async () => {
    if (!supabase) return false;
    const results = await Promise.all([
      supabase.from("content_sections").select("section_key,content"),
      supabase.from("content_drafts").select("section_key,content"),
      supabase.from("media_assets").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("content_versions").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    const failed = results.find((result) => result.error);
    if (failed) {
      setLoadError(failed.error.message || "Admin data could not be loaded.");
      return false;
    }
    const [publishedResult, draftsResult, mediaResult, messagesResult, versionsResult] = results;
    setPublished(Object.fromEntries(publishedResult.data.map((row) => [row.section_key, row.content])));
    setDrafts(Object.fromEntries(draftsResult.data.map((row) => [row.section_key, row.content])));
    setMedia(mediaResult.data);
    setMessages(messagesResult.data);
    setVersions(versionsResult.data);
    setLoadError("");
    return true;
  }, []);

  useEffect(() => { if (!supabase) { setChecking(false); return; } supabase.auth.getSession().then(({ data }) => setSession(data.session)); const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession)); return () => listener.subscription.unsubscribe(); }, []);
  useEffect(() => { const verify = async () => { if (!session) { setAuthorized(false); setChecking(false); return; } setChecking(true); const { data, error } = await supabase.rpc("is_admin"); setAuthorized(!error && data === true); if (!error && data === true) await loadAll(); setChecking(false); }; verify(); }, [session, loadAll]);

  if (!isSupabaseConfigured) return <div className="admin-auth"><div className="admin-auth__card"><h1>Connection required.</h1><p>Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the environment.</p></div></div>;
  if (checking) return <div className="admin-auth"><Loader2 className="admin-spin" size={30} /><p>Verifying secure session…</p></div>;
  if (!session) return <AdminLogin onSignedIn={setSession} />;
  if (!authorized) return <AccessDenied user={session.user} onLogout={() => supabase.auth.signOut()} />;
  if (loadError) return <AdminShell session={session} onLogout={() => supabase.auth.signOut()}><div className="admin-page"><div className="admin-load-error admin-panel" role="alert"><AlertTriangle size={28} /><h1>Admin data could not be loaded safely.</h1><p>{loadError}</p><p>No content was changed. Check the connection, then try again.</p><button className="admin-button admin-button--primary" onClick={loadAll}><RefreshCw size={17} /> Retry</button></div></div></AdminShell>;

  const saveDraft = async (sectionKey, content) => { const { error } = await supabase.from("content_drafts").upsert({ section_key: sectionKey, content, updated_at: new Date().toISOString(), updated_by: session.user.id }); if (error) { toast.error(error.message); return false; } setDrafts((current) => ({ ...current, [sectionKey]: clone(content) })); toast.success("Draft saved"); return true; };
  const publish = async (sectionKey) => { const { error } = await supabase.rpc("publish_section", { p_section_key: sectionKey }); if (error) { toast.error(error.message); return false; } if (!(await loadAll())) return false; toast.success("Published to live website"); return true; };
  const restoreVersion = async (version) => {
    if (!window.confirm(`Restore revision ${version.revision} of ${sectionDefinitionMap[version.section_key]?.label || version.section_key} as a draft? The live site will not change.`)) return false;
    const restored = await saveDraft(version.section_key, version.content);
    if (restored) toast.success("Revision restored as an unpublished draft");
    return restored;
  };
  const contentProps = { published, drafts, media, onSaveDraft: saveDraft, onPublish: publish };
  let page = <Dashboard published={published} drafts={drafts} messages={messages} media={media} />;
  if (route === "content") page = <ContentEditor {...contentProps} />;
  if (route === "media") page = <MediaLibrary media={media} refreshMedia={loadAll} published={published} drafts={drafts} />;
  if (route === "messages") page = <Messages messages={messages} refreshMessages={loadAll} />;
  if (route === "history") page = <VersionHistory versions={versions} onRestore={restoreVersion} />;
  return <AdminShell session={session} onLogout={() => supabase.auth.signOut()}>{page}</AdminShell>;
};
