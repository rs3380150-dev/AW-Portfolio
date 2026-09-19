import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Check,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileImage,
  History,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { defaultContent } from "@/content/defaultContent";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { sectionDefinitionMap, sectionDefinitions } from "@/admin/contentSchemas";
import "@/admin/admin.css";

const clone = (value) => JSON.parse(JSON.stringify(value));
const uid = () => crypto.randomUUID();

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
  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${menuOpen ? "is-open" : ""}`}>
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
        <header className="admin-mobile-header"><button onClick={() => setMenuOpen((v) => !v)}>{menuOpen ? <X /> : <Menu />}</button><strong>AW Studio Console</strong><a href="/" target="_blank" rel="noreferrer"><ExternalLink size={18} /></a></header>
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

const JsonField = ({ label, value, onChange }) => {
  const [text, setText] = useState(JSON.stringify(value, null, 2));
  useEffect(() => setText(JSON.stringify(value, null, 2)), [value]);
  const update = (next) => { setText(next); try { onChange(JSON.parse(next)); } catch { /* keep editing */ } };
  return <label className="admin-field admin-field--wide"><span>{label}<small>JSON</small></span><textarea rows={Math.min(14, Math.max(5, text.split("\n").length))} value={text} onChange={(e) => update(e.target.value)} spellCheck="false" /></label>;
};

const ValueField = ({ name, value, onChange }) => {
  const label = name.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
  if (Array.isArray(value) || (value && typeof value === "object")) return <JsonField label={label} value={value} onChange={onChange} />;
  if (typeof value === "boolean") return <label className="admin-toggle"><span><strong>{label}</strong><small>Enable or disable this option</small></span><input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /></label>;
  if (typeof value === "number") return <label className="admin-field"><span>{label}</span><input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>;
  const isLong = /description|story|intro|bio|body|quote/i.test(name);
  return <label className={`admin-field ${isLong ? "admin-field--wide" : ""}`}><span>{label}</span>{isLong ? <textarea rows="4" value={value ?? ""} onChange={(e) => onChange(e.target.value)} /> : <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />}</label>;
};

const ContentEditor = ({ published, drafts, onSaveDraft, onPublish }) => {
  const { sectionKey = "tracks" } = useParams();
  const navigate = useNavigate();
  const definition = sectionDefinitionMap[sectionKey] || sectionDefinitions[0];
  const source = drafts[definition.key] ?? published[definition.key] ?? clone(defaultContent[definition.key]);
  const [working, setWorking] = useState(() => clone(source));
  const [selected, setSelected] = useState(0);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => { setWorking(clone(drafts[definition.key] ?? published[definition.key] ?? defaultContent[definition.key])); setSelected(0); setQuery(""); }, [definition.key, drafts, published]);
  const dirty = JSON.stringify(working) !== JSON.stringify(source);
  const draftDiffers = JSON.stringify(drafts[definition.key]) !== JSON.stringify(published[definition.key]);

  const save = async () => { setSaving(true); await onSaveDraft(definition.key, working); setSaving(false); };
  const publish = async () => { if (dirty) await onSaveDraft(definition.key, working); setSaving(true); await onPublish(definition.key); setSaving(false); };
  const addItem = () => { const current = Array.isArray(working) ? working : []; let template = current[0] ? Object.fromEntries(Object.entries(current[0]).map(([key, value]) => [key, key === "id" ? uid() : Array.isArray(value) ? [] : typeof value === "object" && value ? {} : typeof value === "number" ? 0 : typeof value === "boolean" ? false : ""])) : definition.primitive ? "New item" : { id: uid(), title: "New item" }; if (definition.key === "videos" && !definition.primitive) template = { ...template, videoUrl: "" }; setWorking([...current, template]); setSelected(current.length); };
  const removeItem = (index) => { if (!window.confirm("Delete this item from the draft? It will not affect the live site until you publish.")) return; setWorking(working.filter((_, itemIndex) => itemIndex !== index)); setSelected(Math.max(0, index - 1)); };
  const moveItem = (index, delta) => { const nextIndex = index + delta; if (nextIndex < 0 || nextIndex >= working.length) return; const next = [...working]; [next[index], next[nextIndex]] = [next[nextIndex], next[index]]; setWorking(next); setSelected(nextIndex); };
  const updateItem = (index, nextValue) => setWorking(working.map((item, itemIndex) => itemIndex === index ? nextValue : item));
  const updateField = (index, key, nextValue) => {
    if (definition.key === "tracks" && key === "featuredOnHome" && nextValue) {
      setWorking(working.map((item, itemIndex) => ({ ...item, featuredOnHome: itemIndex === index })));
      return;
    }
    updateItem(index, { ...working[index], [key]: nextValue });
  };
  const visibleItems = Array.isArray(working) ? working.map((item, index) => ({ item, index })).filter(({ item }) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase())) : [];

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

  return <div className="admin-page admin-content-page">
    <PageHeader eyebrow="Content studio" title={definition.label} description={definition.description} actions={<><span className={`admin-status ${draftDiffers || dirty ? "is-draft" : "is-live"}`}>{draftDiffers || dirty ? "Unpublished changes" : "Live"}</span><button className="admin-button" onClick={save} disabled={!dirty || saving}>{saving ? <Loader2 className="admin-spin" size={17} /> : <Save size={17} />} Save draft</button><button className="admin-button admin-button--primary" onClick={publish} disabled={saving || (!draftDiffers && !dirty)}><Check size={17} /> Publish</button></>} />
    <div className="admin-section-tabs">{sectionDefinitions.map((section) => <button key={section.key} className={section.key === definition.key ? "is-active" : ""} onClick={() => navigate(`/admin/content/${section.key}`)}>{section.label}</button>)}</div>
    {definition.kind === "object" ? <section className="admin-panel admin-object-editor"><div className="admin-form-grid">{Object.entries(working).map(([key, value]) => <ValueField key={key} name={key} value={value} onChange={(next) => setWorking({ ...working, [key]: next })} />)}</div></section> : <div className="admin-editor-layout"><section className="admin-panel admin-entry-list"><div className="admin-entry-list__tools"><label><Search size={16} /><input placeholder="Search entries" value={query} onChange={(e) => setQuery(e.target.value)} /></label><button className="admin-icon-button" onClick={addItem} title="Add item"><Plus size={18} /></button></div><div>{visibleItems.map(({ item, index }) => <button key={item?.id || `${definition.key}-${index}`} className={selected === index ? "is-active" : ""} onClick={() => setSelected(index)}><span><strong>{definition.primitive ? String(item) : item?.[definition.titleField] || item?.title || `Item ${index + 1}`}</strong><small>{definition.primitive ? `Item ${index + 1}` : item?.category || item?.year || item?.city || `Entry ${index + 1}`}</small></span><ChevronRight size={16} /></button>)}</div><button className="admin-add-row" onClick={addItem}><Plus size={17} /> Add {definition.label.replace(/s$/, "")}</button></section><section className="admin-panel admin-entry-editor">{working[selected] !== undefined ? <><div className="admin-entry-editor__head"><div><span>Entry {selected + 1} of {working.length}</span><h2>{definition.primitive ? String(working[selected]) : working[selected]?.[definition.titleField] || working[selected]?.title || "Untitled"}</h2></div><div><button className="admin-icon-button" onClick={() => moveItem(selected, -1)} disabled={selected === 0}><ArrowUp size={17} /></button><button className="admin-icon-button" onClick={() => moveItem(selected, 1)} disabled={selected === working.length - 1}><ArrowDown size={17} /></button><button className="admin-icon-button is-danger" onClick={() => removeItem(selected)}><Trash2 size={17} /></button></div></div>{definition.primitive ? <ValueField name="Value" value={working[selected]} onChange={(value) => updateItem(selected, value)} /> : <div className="admin-form-grid">{Object.entries(editableFields(working[selected])).map(([key, value]) => <ValueField key={key} name={key} value={value} onChange={(next) => updateField(selected, key, next)} />)}</div>}</> : <div className="admin-empty"><Settings2 size={32} /><h3>No entries yet</h3><p>Add the first item to this section.</p><button className="admin-button admin-button--primary" onClick={addItem}><Plus size={17} /> Add item</button></div>}</section></div>}
  </div>;
};

const MediaLibrary = ({ media, refreshMedia }) => {
  const inputRef = useRef(null); const [uploading, setUploading] = useState(false); const [query, setQuery] = useState("");
  const upload = async (event) => { const files = [...event.target.files]; if (!files.length) return; setUploading(true); for (const file of files) { const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-"); const path = `${new Date().toISOString().slice(0, 10)}/${uid()}-${safeName}`; const normalizedMime = /\.mpeg$/i.test(file.name) && file.type === "video/mpeg" ? "audio/mpeg" : file.type; const uploadBody = normalizedMime === file.type ? file : new Blob([file], { type: normalizedMime }); const { error } = await supabase.storage.from("media").upload(path, uploadBody, { cacheControl: "31536000", contentType: normalizedMime, upsert: false }); if (error) { toast.error(`${file.name}: ${error.message}`); continue; } const { data } = supabase.storage.from("media").getPublicUrl(path); await supabase.from("media_assets").insert({ name: file.name, storage_path: path, public_url: data.publicUrl, mime_type: normalizedMime, size_bytes: file.size, created_by: (await supabase.auth.getUser()).data.user.id }); } setUploading(false); event.target.value = ""; await refreshMedia(); toast.success("Media upload complete"); };
  const remove = async (asset) => { if (!window.confirm(`Permanently delete ${asset.name}? This cannot be undone.`)) return; const { error } = await supabase.storage.from("media").remove([asset.storage_path]); if (!error) await supabase.from("media_assets").delete().eq("id", asset.id); if (error) toast.error(error.message); else { toast.success("Media deleted"); refreshMedia(); } };
  const filtered = media.filter((asset) => asset.name.toLowerCase().includes(query.toLowerCase()));
  return <div className="admin-page"><PageHeader eyebrow="Asset management" title="Media library" description="Upload optimized portfolio images, video and audio. New assets are served through Supabase CDN." actions={<><input ref={inputRef} type="file" multiple accept="image/*,video/mp4,video/webm,audio/*" hidden onChange={upload} /><button className="admin-button admin-button--primary" onClick={() => inputRef.current?.click()} disabled={uploading}>{uploading ? <Loader2 className="admin-spin" size={17} /> : <UploadCloud size={17} />} Upload media</button></>} /><div className="admin-toolbar"><label><Search size={17} /><input placeholder="Search media" value={query} onChange={(e) => setQuery(e.target.value)} /></label><span>{filtered.length} assets</span></div>{filtered.length ? <div className="admin-media-grid">{filtered.map((asset) => <article key={asset.id}>{asset.mime_type?.startsWith("image/") ? <img src={asset.public_url} alt={asset.alt_text || asset.name} /> : asset.mime_type?.startsWith("video/") ? <video src={asset.public_url} muted /> : <div className="admin-media-placeholder"><FileImage size={36} /></div>}<div><strong title={asset.name}>{asset.name}</strong><small>{asset.mime_type || "Media"} · {Math.round((asset.size_bytes || 0) / 1024)} KB</small><div><button onClick={() => navigator.clipboard.writeText(asset.public_url).then(() => toast.success("URL copied"))}>Copy URL</button><button className="is-danger" onClick={() => remove(asset)}>Delete</button></div></div></article>)}</div> : <div className="admin-empty admin-panel"><FileImage size={36} /><h3>No media uploaded yet</h3><p>Existing Cloudinary assets remain active. Upload new assets here when ready.</p></div>}</div>;
};

const Messages = ({ messages, refreshMessages }) => {
  const updateStatus = async (id, status) => { const { error } = await supabase.from("contact_submissions").update({ status }).eq("id", id); if (error) toast.error(error.message); else refreshMessages(); };
  const remove = async (id) => { if (!window.confirm("Permanently delete this message?")) return; const { error } = await supabase.from("contact_submissions").delete().eq("id", id); if (error) toast.error(error.message); else refreshMessages(); };
  return <div className="admin-page"><PageHeader eyebrow="Lead inbox" title="Messages" description="Booking, collaboration and contact submissions." actions={<button className="admin-button" onClick={refreshMessages}><RefreshCw size={17} /> Refresh</button>} />{messages.length ? <div className="admin-message-list">{messages.map((message) => <article className={`admin-panel ${message.status === "unread" ? "is-unread" : ""}`} key={message.id}><div className="admin-message-head"><div><span>{message.service || "General enquiry"}</span><h2>{message.name}</h2><a href={`mailto:${message.email}`}>{message.email}</a></div><time>{new Date(message.created_at).toLocaleString()}</time></div><p>{message.message}</p><div className="admin-message-actions"><select value={message.status} onChange={(e) => updateStatus(message.id, e.target.value)}><option value="unread">Unread</option><option value="read">Read</option><option value="replied">Replied</option><option value="archived">Archived</option></select><a className="admin-button" href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.service || "Your enquiry")}`}>Reply</a><button className="admin-icon-button is-danger" onClick={() => remove(message.id)}><Trash2 size={17} /></button></div></article>)}</div> : <div className="admin-empty admin-panel"><Inbox size={36} /><h3>Inbox is clear</h3><p>New website enquiries will appear here.</p></div>}</div>;
};

const VersionHistory = ({ versions }) => <div className="admin-page"><PageHeader eyebrow="Publishing safety" title="Version history" description="Every published section is preserved for audit and recovery." />{versions.length ? <div className="admin-history-list">{versions.map((version) => <article className="admin-panel" key={version.id}><Clock3 size={18} /><div><strong>{sectionDefinitionMap[version.section_key]?.label || version.section_key}</strong><small>Revision {version.revision} · {new Date(version.created_at).toLocaleString()}</small></div><code>{Array.isArray(version.content) ? `${version.content.length} entries` : "Settings snapshot"}</code></article>)}</div> : <div className="admin-empty admin-panel"><History size={36} /><h3>No publishing history yet</h3><p>Your first publish will create the first version snapshot.</p></div>}</div>;

export const AdminApp = ({ route }) => {
  const [session, setSession] = useState(null); const [checking, setChecking] = useState(true); const [authorized, setAuthorized] = useState(false);
  const [published, setPublished] = useState({}); const [drafts, setDrafts] = useState({}); const [media, setMedia] = useState([]); const [messages, setMessages] = useState([]); const [versions, setVersions] = useState([]);
  const initializationStarted = useRef(false);

  const loadAll = useCallback(async () => { if (!supabase) return; const [publishedResult, draftsResult, mediaResult, messagesResult, versionsResult] = await Promise.all([supabase.from("content_sections").select("section_key,content"), supabase.from("content_drafts").select("section_key,content"), supabase.from("media_assets").select("*").order("created_at", { ascending: false }), supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }), supabase.from("content_versions").select("*").order("created_at", { ascending: false }).limit(100)]); setPublished(Object.fromEntries((publishedResult.data || []).map((row) => [row.section_key, row.content]))); setDrafts(Object.fromEntries((draftsResult.data || []).map((row) => [row.section_key, row.content]))); setMedia(mediaResult.data || []); setMessages(messagesResult.data || []); setVersions(versionsResult.data || []); }, []);

  useEffect(() => { if (!supabase) { setChecking(false); return; } supabase.auth.getSession().then(({ data }) => setSession(data.session)); const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession)); return () => listener.subscription.unsubscribe(); }, []);
  useEffect(() => { const verify = async () => { if (!session) { setAuthorized(false); setChecking(false); return; } setChecking(true); const { data, error } = await supabase.rpc("is_admin"); setAuthorized(!error && data === true); if (!error && data === true) await loadAll(); setChecking(false); }; verify(); }, [session, loadAll]);

  const initializeDefaults = useCallback(async () => { if (Object.keys(published).length || initializationStarted.current) return; initializationStarted.current = true; const userId = session.user.id; const rows = Object.entries(defaultContent).map(([section_key, content]) => ({ section_key, content, updated_by: userId })); const { error } = await supabase.from("content_drafts").upsert(rows); if (error) { initializationStarted.current = false; return toast.error(error.message); } for (const { section_key } of rows) { const { error: publishError } = await supabase.rpc("publish_section", { p_section_key: section_key }); if (publishError) { initializationStarted.current = false; return toast.error(publishError.message); } } await loadAll(); toast.success("Website content initialized"); }, [published, session, loadAll]);
  useEffect(() => { if (authorized && !checking) initializeDefaults(); }, [authorized, checking, initializeDefaults]);

  if (!isSupabaseConfigured) return <div className="admin-auth"><div className="admin-auth__card"><h1>Connection required.</h1><p>Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the environment.</p></div></div>;
  if (checking) return <div className="admin-auth"><Loader2 className="admin-spin" size={30} /><p>Verifying secure session…</p></div>;
  if (!session) return <AdminLogin onSignedIn={setSession} />;
  if (!authorized) return <AccessDenied user={session.user} onLogout={() => supabase.auth.signOut()} />;

  const saveDraft = async (sectionKey, content) => { const { error } = await supabase.from("content_drafts").upsert({ section_key: sectionKey, content, updated_at: new Date().toISOString(), updated_by: session.user.id }); if (error) toast.error(error.message); else { setDrafts((current) => ({ ...current, [sectionKey]: clone(content) })); toast.success("Draft saved"); } };
  const publish = async (sectionKey) => { const { error } = await supabase.rpc("publish_section", { p_section_key: sectionKey }); if (error) toast.error(error.message); else { await loadAll(); toast.success("Published to live website"); } };
  const contentProps = { published, drafts, onSaveDraft: saveDraft, onPublish: publish };
  let page = <Dashboard published={published} drafts={drafts} messages={messages} media={media} />;
  if (route === "content") page = <ContentEditor {...contentProps} />;
  if (route === "media") page = <MediaLibrary media={media} refreshMedia={loadAll} />;
  if (route === "messages") page = <Messages messages={messages} refreshMessages={loadAll} />;
  if (route === "history") page = <VersionHistory versions={versions} />;
  return <AdminShell session={session} onLogout={() => supabase.auth.signOut()}>{page}</AdminShell>;
};
