function formatDate(isoLike) {
  if (!isoLike) return "";
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const origin = "https://findaidir.com";

  const rows = await env.DB.prepare("SELECT slug, updated_at FROM tools ORDER BY id DESC LIMIT 50000").all();
  const items = (rows.results || []).filter((row) => /^[a-z0-9-]{1,110}$/.test(String(row.slug || "")));

  const urls = [
    `<url><loc>${origin}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    ...items.map((row) => {
      const lastmod = formatDate(row.updated_at);
      return `<url><loc>${origin}/tool/${encodeURIComponent(row.slug)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<changefreq>weekly</changefreq><priority>0.7</priority></url>`;
    }),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  return new Response(xml, {
    status: 200,
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
