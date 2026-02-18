const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;
const rateLimitState = new Map();

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 20;

function cleanOldRateLimitBuckets(currentTime) {
  for (const [ip, bucket] of rateLimitState.entries()) {
    if (currentTime - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitState.delete(ip);
    }
  }
}

function assertRateLimit(ip) {
  const currentTime = Date.now();
  if (Math.random() < 0.03) {
    cleanOldRateLimitBuckets(currentTime);
  }
  const key = ip || "unknown";
  const bucket = rateLimitState.get(key);
  if (!bucket || currentTime - bucket.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitState.set(key, { windowStart: currentTime, count: 1 });
    return true;
  }
  bucket.count += 1;
  rateLimitState.set(key, bucket);
  return bucket.count <= RATE_LIMIT_MAX_REQUESTS;
}

function withSecurityHeaders(response, cache = "no-store") {
  const headers = new Headers(response.headers);
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self';"
  );
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  headers.set("Cross-Origin-Opener-Policy", "same-origin");
  headers.set("Cross-Origin-Resource-Policy", "same-origin");
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  headers.set("Cache-Control", cache);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function json(data, init = {}) {
  const response = new Response(JSON.stringify(data), {
    status: init.status || 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    },
  });
  return withSecurityHeaders(response, init.cache || "no-store");
}

function badRequest(message) {
  return json({ error: message }, { status: 400 });
}

function rateLimited() {
  return json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
}

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.floor(parsed));
}

function normalizeInput(input, maxLen = 80) {
  const value = (input || "").trim();
  if (!value) return "";
  return value.slice(0, maxLen);
}

function allowedSort(sort) {
  switch (sort) {
    case "name_desc":
      return "name DESC";
    case "newest":
      return "id DESC";
    default:
      return "name ASC";
  }
}

async function handleToolsList(request, env) {
  const url = new URL(request.url);
  const q = normalizeInput(url.searchParams.get("q"), 100);
  const category = normalizeInput(url.searchParams.get("category"), 60);
  const page = parsePositiveInt(url.searchParams.get("page"), 1);
  const pageSize = Math.min(parsePositiveInt(url.searchParams.get("pageSize"), DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
  const sort = allowedSort(normalizeInput(url.searchParams.get("sort"), 20));

  if (q && !/^[\w\s\-+.#@/:]{1,100}$/i.test(q)) {
    return badRequest("Invalid search query.");
  }
  if (category && !/^[\w\s\-&/]{1,60}$/i.test(category)) {
    return badRequest("Invalid category.");
  }

  const whereClauses = [];
  const binds = [];
  if (q) {
    whereClauses.push("(LOWER(name) LIKE LOWER(?) OR LOWER(tags) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))");
    const query = `%${q}%`;
    binds.push(query, query, query);
  }
  if (category) {
    whereClauses.push("category = ?");
    binds.push(category);
  }
  const whereSQL = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
  const offset = (page - 1) * pageSize;

  const listSQL = `
    SELECT slug, name, category, tags, description, website_url, domain, quality_status
    FROM tools
    ${whereSQL}
    ORDER BY ${sort}
    LIMIT ? OFFSET ?
  `;
  const countSQL = `SELECT COUNT(*) AS total FROM tools ${whereSQL}`;

  const [listResult, countResult] = await Promise.all([
    env.DB.prepare(listSQL).bind(...binds, pageSize, offset).all(),
    env.DB.prepare(countSQL).bind(...binds).first(),
  ]);
  const total = Number(countResult?.total || 0);

  return json(
    {
      items: listResult.results || [],
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    { cache: "public, max-age=30, s-maxage=120" }
  );
}

async function handleToolBySlug(slug, env) {
  if (!/^[a-z0-9-]{1,110}$/.test(slug)) {
    return badRequest("Invalid slug.");
  }
  const row = await env.DB.prepare(
    "SELECT slug, name, category, tags, description, website_url, domain, quality_status FROM tools WHERE slug = ? LIMIT 1"
  )
    .bind(slug)
    .first();
  if (!row) {
    return json({ error: "Tool not found." }, { status: 404 });
  }
  return json({ item: row }, { cache: "public, max-age=60, s-maxage=300" });
}

async function handleCategories(env) {
  const rows = await env.DB.prepare(
    "SELECT category, COUNT(*) AS count FROM tools GROUP BY category ORDER BY count DESC, category ASC LIMIT 300"
  ).all();
  return json({ items: rows.results || [] }, { cache: "public, max-age=300, s-maxage=900" });
}

export async function onRequest(context) {
  const { request, env } = context;
  const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!assertRateLimit(clientIp)) {
    return rateLimited();
  }

  const url = new URL(request.url);
  const path = url.pathname;
  try {
    if (path === "/api/health" && request.method === "GET") {
      return json({ ok: true, timestamp: new Date().toISOString() }, { cache: "no-store" });
    }
    if (path === "/api/categories" && request.method === "GET") {
      return handleCategories(env);
    }
    if (path === "/api/tools" && request.method === "GET") {
      return handleToolsList(request, env);
    }
    if (path.startsWith("/api/tools/") && request.method === "GET") {
      const slug = path.replace("/api/tools/", "").trim();
      return handleToolBySlug(slug, env);
    }
    return json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    return json({ error: "Unexpected server error." }, { status: 500 });
  }
}
