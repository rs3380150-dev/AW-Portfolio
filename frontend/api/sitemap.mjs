const siteUrl = (process.env.VITE_SITE_URL || "https://achyutwadhwa.in").replace(/\/$/, "");

const staticRoutes = [
  ["/", "1.0"],
  ["/about", "0.9"],
  ["/music", "0.9"],
  ["/events", "0.85"],
  ["/gallery", "0.75"],
  ["/videos", "0.85"],
  ["/services", "0.85"],
  ["/press", "0.8"],
  ["/contact", "0.9"],
];

const escapeXml = (value) => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&apos;");

const validDate = (value) => {
  if (!value) return null;
  const plainDate = String(value).match(/^(\d{4}-\d{2}-\d{2})(?:$|T)/)?.[1];
  if (plainDate) return plainDate;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export const buildSitemapXml = ({ tracks = [], publishedAt, generatedAt = new Date() } = {}) => {
  const fallbackDate = validDate(publishedAt) || generatedAt.toISOString().slice(0, 10);
  const seenSlugs = new Set();
  const trackRoutes = tracks.flatMap((track) => {
    const slug = typeof track?.slug === "string" ? track.slug.trim() : "";
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || seenSlugs.has(slug)) return [];
    seenSlugs.add(slug);
    return [[`/music/${slug}`, "0.7", validDate(track.releaseDate) || fallbackDate]];
  });
  const routes = [
    ...staticRoutes.map(([path, priority]) => [path, priority, fallbackDate]),
    ...trackRoutes,
  ];
  const entries = routes.map(([path, priority, lastmod]) => [
    "  <url>",
    `    <loc>${escapeXml(`${siteUrl}${path}`)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n")).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
};

export default async function handler(_request, response) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim();
  let tracks = [];
  let publishedAt;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const result = await fetch(
        `${supabaseUrl}/rest/v1/content_sections?section_key=eq.tracks&select=content,published_at`,
        {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
          signal: AbortSignal.timeout(7000),
        },
      );
      if (result.ok) {
        const rows = await result.json();
        tracks = Array.isArray(rows?.[0]?.content) ? rows[0].content : [];
        publishedAt = rows?.[0]?.published_at;
      }
    } catch {
      // A valid static-route sitemap is safer than returning an error to crawlers.
    }
  }

  response.setHeader("Content-Type", "application/xml; charset=utf-8");
  response.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
  response.status(200).send(buildSitemapXml({ tracks, publishedAt }));
}
