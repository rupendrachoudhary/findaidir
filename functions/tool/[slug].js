function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout({ title, description, canonical, body, noindex = false }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="${noindex ? "noindex,nofollow" : "index,follow,max-image-preview:large"}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f7f8f4;color:#0f1720;margin:0}
      .wrap{max-width:760px;margin:0 auto;padding:1.25rem}
      .card{background:#fff;border:1px solid #d8dde4;border-radius:14px;padding:1rem}
      .meta{display:flex;gap:.5rem;flex-wrap:wrap;margin:.6rem 0 0}
      .pill{display:inline-block;background:#e6f3ef;color:#0c5a4b;padding:.2rem .55rem;border-radius:999px;font-size:.78rem}
      a{color:#0f6f5c}
      p{line-height:1.55}
      .top{margin:0 0 .9rem}
    </style>
  </head>
  <body>
    <main class="wrap">
      ${body}
    </main>
  </body>
</html>`;
}

export async function onRequestGet(context) {
  const { env, params, request } = context;
  const slug = String(params.slug || "").trim();
  if (!/^[a-z0-9-]{1,110}$/.test(slug)) {
    return new Response("Not found", { status: 404 });
  }

  const row = await env.DB.prepare(
    "SELECT slug, name, category, tags, description, website_url, domain FROM tools WHERE slug = ? LIMIT 1"
  )
    .bind(slug)
    .first();

  const origin = new URL(request.url).origin;
  const canonical = `https://findaidir.com/tool/${slug}`;

  if (!row) {
    const html = layout({
      title: "Tool Not Found | FindAIDir",
      description: "This tool entry does not exist.",
      canonical: `${origin}/tool/${encodeURIComponent(slug)}`,
      body: `<p class="top"><a href="https://findaidir.com/">Back to directory</a></p><section class="card"><h1>Tool not found</h1><p>The requested listing is unavailable.</p></section>`,
      noindex: true,
    });
    return new Response(html, {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" },
    });
  }

  const title = `${row.name} | FindAIDir`;
  const description = row.description || `${row.name} listed on FindAIDir.`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: row.name,
    applicationCategory: row.category,
    description: row.description,
    url: row.website_url,
    provider: {
      "@type": "Organization",
      name: row.domain,
    },
  };

  const body = `
    <p class="top"><a href="https://findaidir.com/">Back to directory</a></p>
    <article class="card">
      <h1>${escapeHtml(row.name)}</h1>
      <div class="meta">
        <span class="pill">${escapeHtml(row.category)}</span>
        <span class="pill">${escapeHtml(row.domain)}</span>
      </div>
      <p>${escapeHtml(row.description)}</p>
      <p><strong>Tags:</strong> ${escapeHtml(row.tags || row.category)}</p>
      <p><a href="${escapeHtml(row.website_url)}" target="_blank" rel="noopener noreferrer nofollow">Visit official website</a></p>
      <script type="application/ld+json">${JSON.stringify(schema)}</script>
    </article>
  `;

  const html = layout({ title, description, canonical, body });
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
