function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(text, maxLen = 170) {
  const value = String(text || "").trim();
  if (value.length <= maxLen) return value;
  return `${value.slice(0, maxLen - 1)}...`;
}

function normalizeExternalUrl(input) {
  const raw = String(input || "").trim();
  if (!raw) return "";
  try {
    const value = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    const parsed = new URL(value);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch (_) {
    return "";
  }
  return "";
}

function escapeJsString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function logoSources(domain, websiteUrl) {
  const raw = String(domain || "").trim() || String(websiteUrl || "").trim();
  if (!raw) return { primary: "", fallback: "" };
  let host = raw;
  try {
    host = new URL(raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`).hostname;
  } catch (_) {
    host = raw;
  }
  const safeHost = host.replace(/^www\./i, "");
  return {
    primary: `https://logo.clearbit.com/${encodeURIComponent(safeHost)}`,
    fallback: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(safeHost)}&sz=128`,
  };
}

function renderLogoMarkup(name, domain, websiteUrl, wrapperClass, fallbackClass) {
  const sources = logoSources(domain, websiteUrl);
  const fallbackChar = escapeHtml(String(name || "?").slice(0, 1).toUpperCase());
  if (!sources.primary) {
    return `<span class="${escapeHtml(wrapperClass)}"><span class="${escapeHtml(fallbackClass)}" style="display:flex">${fallbackChar}</span></span>`;
  }

  const onErrorHandler = `if(!this.dataset.fallback){this.dataset.fallback='1';this.src='${escapeJsString(sources.fallback)}';}else{this.remove();this.nextElementSibling.style.display='flex';}`;
  return `<span class="${escapeHtml(wrapperClass)}">
    <img src="${escapeHtml(sources.primary)}" alt="${escapeHtml(name)} logo" loading="lazy" decoding="async" onerror="${escapeHtml(onErrorHandler)}" />
    <span class="${escapeHtml(fallbackClass)}">${fallbackChar}</span>
  </span>`;
}

function responseWithHeaders(html, status, cacheControl) {
  return new Response(html, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": cacheControl,
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "referrer-policy": "strict-origin-when-cross-origin",
      "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
      "cross-origin-opener-policy": "same-origin",
      "cross-origin-resource-policy": "same-origin",
      "strict-transport-security": "max-age=63072000; includeSubDomains; preload",
    },
  });
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
    <meta name="theme-color" content="#0f6f5c" />
    <style>
      :root{--ink:#0c1624;--line:rgba(12,22,36,.15);--muted:#465666;--accent:#0f6f5c}
      body{font-family:"IBM Plex Sans",system-ui,-apple-system,Segoe UI,sans-serif;background:linear-gradient(140deg,#d8e4ca 0%,#f4f6ef 42%,#dce7ec 100%);color:var(--ink);margin:0}
      .wrap{max-width:1060px;margin:0 auto;padding:1rem}
      .top{display:flex;justify-content:space-between;gap:.8rem;align-items:center;margin-bottom:.8rem}
      .brand{display:inline-flex;align-items:center;gap:.45rem;font-weight:700;font-size:1.08rem;color:#0c1624;text-decoration:none}
      .brand-logo{width:28px;height:28px;border-radius:7px;box-shadow:0 3px 8px rgba(12,22,36,.15)}
      .nav{display:flex;gap:.5rem;flex-wrap:wrap}
      .nav a{text-decoration:none;color:#0c1624;border:1px solid var(--line);border-radius:999px;padding:.32rem .64rem;font-size:.82rem;background:rgba(255,255,255,.68)}
      .panel{background:rgba(255,255,255,.9);border:1px solid var(--line);border-radius:16px;padding:1rem;box-shadow:0 14px 30px rgba(9,20,34,.1)}
      .tool-head{display:grid;grid-template-columns:58px 1fr;gap:.7rem;align-items:center}
      .logo{width:58px;height:58px;border-radius:14px;border:1px solid var(--line);background:#fff;overflow:hidden;display:flex;align-items:center;justify-content:center}
      .logo img{width:100%;height:100%;object-fit:cover}
      .logo-fallback,.similar-fallback{display:none;align-items:center;justify-content:center;width:100%;height:100%;font-weight:700;color:#35516a}
      h1{font-family:"Space Grotesk","Avenir Next",sans-serif;margin:0;font-size:clamp(1.6rem,4vw,2.3rem);line-height:1.1}
      .subtitle{margin:.5rem 0 0;color:#33485c;line-height:1.45}
      .pills{display:flex;flex-wrap:wrap;gap:.46rem;margin:.7rem 0 0}
      .pill{display:inline-block;background:rgba(15,111,92,.12);color:#0c5a4b;padding:.24rem .52rem;border-radius:999px;font-size:.75rem}
      .actions{display:flex;gap:.56rem;flex-wrap:wrap;margin-top:.88rem}
      .btn{text-decoration:none;display:inline-flex;align-items:center;justify-content:center;border-radius:10px;padding:.5rem .78rem;font-weight:600;font-size:.9rem;border:1px solid transparent}
      .btn-primary{background:linear-gradient(120deg,#0d5a4b 0%,#176f8e 100%);color:#fff}
      .btn-ghost{background:transparent;color:#0c1624;border-color:var(--line)}
      .facts{margin-top:.86rem;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.55rem}
      .fact{border:1px solid var(--line);border-radius:12px;padding:.62rem;background:rgba(255,255,255,.8)}
      .fact strong{display:block;font-size:.74rem;text-transform:uppercase;letter-spacing:.04em;color:#3a5469}
      .fact span{display:block;margin-top:.28rem;font-size:.92rem;color:#1b3246;word-break:break-word}
      .section-title{font-family:"Space Grotesk","Avenir Next",sans-serif;margin:1rem 0 .66rem;font-size:1.22rem}
      .similar-grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem}
      .similar-card{background:rgba(255,255,255,.9);border:1px solid var(--line);border-radius:14px;padding:.76rem}
      .similar-head{display:grid;grid-template-columns:36px 1fr;gap:.52rem;align-items:center}
      .similar-logo{width:36px;height:36px;border-radius:10px;border:1px solid var(--line);overflow:hidden;background:#fff}
      .similar-logo img{width:100%;height:100%;object-fit:cover}
      .similar-card h3{margin:0;font-size:.98rem;font-family:"Space Grotesk","Avenir Next",sans-serif}
      .similar-card p{margin:.44rem 0 0;color:#33485c;font-size:.88rem;line-height:1.4}
      .similar-links{display:flex;gap:.6rem;margin-top:.58rem}
      .similar-links a{text-decoration:none;color:#0b4f43;font-weight:600;font-size:.85rem}
      @media (max-width:960px){.similar-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.facts{grid-template-columns:1fr 1fr}}
      @media (max-width:660px){.top{flex-direction:column;align-items:flex-start}.tool-head{grid-template-columns:48px 1fr}.logo{width:48px;height:48px}.similar-grid{grid-template-columns:1fr}.facts{grid-template-columns:1fr}}
    </style>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <main class="wrap">
      ${body}
    </main>
  </body>
</html>`;
}

function renderSimilarCards(items) {
  if (!items.length) {
    return `<p>No similar tools found yet. <a href="https://findaidir.com/">Browse all tools</a>.</p>`;
  }

  const cards = items
    .map((item) => {
      const normalizedUrl = normalizeExternalUrl(item.website_url);
      return `<li class="similar-card">
        <div class="similar-head">
          ${renderLogoMarkup(item.name, item.domain, item.website_url, "similar-logo", "similar-fallback")}
          <h3><a href="https://findaidir.com/tool/${encodeURIComponent(item.slug)}">${escapeHtml(item.name)}</a></h3>
        </div>
        <p>${escapeHtml(truncate(item.description, 130))}</p>
        <div class="similar-links">
          <a href="https://findaidir.com/tool/${encodeURIComponent(item.slug)}">View details</a>
          ${normalizedUrl ? `<a href="${escapeHtml(normalizedUrl)}" target="_blank" rel="noopener noreferrer nofollow">Visit site</a>` : ""}
        </div>
      </li>`;
    })
    .join("");

  return `<ul class="similar-grid">${cards}</ul>`;
}

export async function onRequestGet(context) {
  const { env, params } = context;
  const slug = String(params.slug || "").trim();
  if (!/^[a-z0-9-]{1,110}$/.test(slug)) {
    return new Response("Not found", { status: 404 });
  }

  const row = await env.DB.prepare(
    "SELECT slug, name, category, tags, description, website_url, domain, quality_status FROM tools WHERE slug = ? AND quality_status NOT LIKE 'invalid%' LIMIT 1"
  )
    .bind(slug)
    .first();

  const canonical = `https://findaidir.com/tool/${slug}`;

  if (!row) {
    const html = layout({
      title: "Tool Not Found | FindAIDir",
      description: "This tool entry does not exist.",
      canonical,
      body: `<div class="top"><a class="brand" href="https://findaidir.com/"><img class="brand-logo" src="https://findaidir.com/logo-findaidir.svg" alt="" width="28" height="28" /><span>FindAIDir</span></a></div><section class="panel"><h1>Tool not found</h1><p class="subtitle">The requested listing is unavailable. You can continue exploring the directory from the homepage.</p><div class="actions"><a class="btn btn-primary" href="https://findaidir.com/">Back to directory</a></div></section>`,
      noindex: true,
    });
    return responseWithHeaders(html, 404, "public, max-age=300");
  }

  const tags = String(row.tags || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const primaryTag = tags[0] || row.category;

  const similarResult = await env.DB.prepare(
    `SELECT slug, name, category, tags, description, website_url, domain
     FROM tools
     WHERE slug <> ?
       AND quality_status NOT LIKE 'invalid%'
       AND (category = ? OR tags LIKE ?)
     ORDER BY CASE WHEN category = ? THEN 0 ELSE 1 END, id DESC
     LIMIT 9`
  )
    .bind(slug, row.category, `%${primaryTag}%`, row.category)
    .all();

  let similarTools = similarResult.results || [];
  if (similarTools.length < 6) {
    const seen = new Set(similarTools.map((item) => item.slug));
    seen.add(slug);
    const fallbackResult = await env.DB.prepare(
      "SELECT slug, name, category, tags, description, website_url, domain FROM tools WHERE slug <> ? AND quality_status NOT LIKE 'invalid%' ORDER BY id DESC LIMIT 18"
    )
      .bind(slug)
      .all();
    for (const candidate of fallbackResult.results || []) {
      if (!seen.has(candidate.slug)) {
        similarTools.push(candidate);
        seen.add(candidate.slug);
      }
      if (similarTools.length >= 9) break;
    }
  }
  similarTools = similarTools.slice(0, 9);

  const normalizedUrl = normalizeExternalUrl(row.website_url);
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
    <div class="top">
      <a class="brand" href="https://findaidir.com/">
        <img class="brand-logo" src="https://findaidir.com/logo-findaidir.svg" alt="" width="28" height="28" />
        <span>FindAIDir</span>
      </a>
      <nav class="nav" aria-label="Primary navigation">
        <a href="https://findaidir.com/">Browse tools</a>
        <a href="https://findaidir.com/submit-tool">List your tool</a>
        <a href="https://findaidir.com/contact">Contact</a>
      </nav>
    </div>
    <article class="panel">
      <div class="tool-head">
        ${renderLogoMarkup(row.name, row.domain, row.website_url, "logo", "logo-fallback")}
        <div>
          <h1>${escapeHtml(row.name)}</h1>
          <p class="subtitle">${escapeHtml(row.description || "No description available.")}</p>
        </div>
      </div>

      <div class="pills">
        <span class="pill">${escapeHtml(row.category)}</span>
        <span class="pill">${escapeHtml(row.domain)}</span>
        ${row.quality_status ? `<span class="pill">${escapeHtml(row.quality_status)}</span>` : ""}
      </div>

      <div class="actions">
        ${normalizedUrl ? `<a class="btn btn-primary" href="${escapeHtml(normalizedUrl)}" target="_blank" rel="noopener noreferrer nofollow">Visit official website</a>` : ""}
        <a class="btn btn-ghost" href="https://findaidir.com/">Back to directory</a>
      </div>

      <div class="facts">
        <div class="fact"><strong>Category</strong><span>${escapeHtml(row.category)}</span></div>
        <div class="fact"><strong>Domain</strong><span>${escapeHtml(row.domain)}</span></div>
        <div class="fact"><strong>Tags</strong><span>${escapeHtml(tags.join(", ") || row.category)}</span></div>
      </div>

      <script type="application/ld+json">${JSON.stringify(schema)}</script>
    </article>

    <section>
      <h2 class="section-title">Similar tools you may like</h2>
      ${renderSimilarCards(similarTools)}
    </section>
  `;

  const html = layout({ title, description, canonical, body });
  return responseWithHeaders(html, 200, "public, max-age=3600");
}
