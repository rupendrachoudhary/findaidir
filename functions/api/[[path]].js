const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;
const WRITE_LIMIT_WINDOW_MS = 600_000;
const WRITE_LIMIT_MAX_REQUESTS = 12;
const rateLimitState = new Map();

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 20;
const MAX_BODY_BYTES = 16_000;

function cleanOldRateLimitBuckets(currentTime) {
  for (const [key, bucket] of rateLimitState.entries()) {
    if (currentTime - bucket.windowStart > bucket.windowMs) {
      rateLimitState.delete(key);
    }
  }
}

function assertRateLimit(ip, type = "read") {
  const currentTime = Date.now();
  if (Math.random() < 0.03) {
    cleanOldRateLimitBuckets(currentTime);
  }

  const key = `${type}:${ip || "unknown"}`;
  const limitConfig =
    type === "write"
      ? { windowMs: WRITE_LIMIT_WINDOW_MS, maxRequests: WRITE_LIMIT_MAX_REQUESTS }
      : { windowMs: RATE_LIMIT_WINDOW_MS, maxRequests: RATE_LIMIT_MAX_REQUESTS };

  const bucket = rateLimitState.get(key);
  if (!bucket || currentTime - bucket.windowStart > limitConfig.windowMs) {
    rateLimitState.set(key, { windowStart: currentTime, count: 1, windowMs: limitConfig.windowMs });
    return true;
  }

  bucket.count += 1;
  rateLimitState.set(key, bucket);
  return bucket.count <= limitConfig.maxRequests;
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

function forbidden() {
  return json({ error: "Forbidden" }, { status: 403 });
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
  const value = String(input || "").trim();
  if (!value) return "";
  return value.slice(0, maxLen);
}

function normalizeMultilineInput(input, maxLen = 2000) {
  const value = String(input || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!value) return "";
  return value.slice(0, maxLen);
}

function normalizeEmail(input) {
  const value = normalizeInput(input, 160).toLowerCase();
  if (!value) return "";
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(value)) {
    return "";
  }
  return value;
}

function normalizeUrl(input, maxLen = 240) {
  const raw = String(input || "").trim();
  if (!raw) return "";
  try {
    const normalized = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    const parsed = new URL(normalized);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return "";
    }
    return parsed.toString().slice(0, maxLen);
  } catch (_) {
    return "";
  }
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase().slice(0, 120);
  } catch (_) {
    return "";
  }
}

function assertAllowedOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === "https://findaidir.com" || origin === "https://www.findaidir.com";
}

async function parseJsonBody(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error("invalid_content_type");
  }

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > MAX_BODY_BYTES) {
    throw new Error("payload_too_large");
  }

  const raw = await request.text();
  if (!raw || raw.length > MAX_BODY_BYTES) {
    throw new Error("payload_too_large");
  }

  try {
    return JSON.parse(raw);
  } catch (_) {
    throw new Error("invalid_json");
  }
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

  const whereClauses = ["quality_status NOT LIKE 'invalid%'"];
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
    "SELECT slug, name, category, tags, description, website_url, domain, quality_status FROM tools WHERE slug = ? AND quality_status NOT LIKE 'invalid%' LIMIT 1"
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
    "SELECT category, COUNT(*) AS count FROM tools WHERE quality_status NOT LIKE 'invalid%' GROUP BY category ORDER BY count DESC, category ASC LIMIT 300"
  ).all();
  return json({ items: rows.results || [] }, { cache: "public, max-age=300, s-maxage=900" });
}

async function handleToolSubmission(request, env, clientIp) {
  if (!assertAllowedOrigin(request)) {
    return forbidden();
  }
  if (!assertRateLimit(clientIp, "write")) {
    return rateLimited();
  }

  let payload;
  try {
    payload = await parseJsonBody(request);
  } catch (error) {
    if (error.message === "payload_too_large") return badRequest("Payload too large.");
    if (error.message === "invalid_content_type") return badRequest("Invalid content type.");
    return badRequest("Invalid request body.");
  }

  const honeypot = normalizeInput(payload.website, 140);
  if (honeypot) {
    return json({ ok: true, accepted: true });
  }

  const toolName = normalizeInput(payload.tool_name, 120);
  const websiteUrl = normalizeUrl(payload.website_url, 240);
  const category = normalizeInput(payload.category, 80);
  const tags = normalizeInput(payload.tags, 220);
  const description = normalizeMultilineInput(payload.description, 2000);
  const submitterName = normalizeInput(payload.submitter_name, 120);
  const submitterEmail = normalizeEmail(payload.submitter_email);

  if (!toolName || toolName.length < 2) {
    return badRequest("Tool name is required.");
  }
  if (!websiteUrl) {
    return badRequest("A valid website URL is required.");
  }
  if (!category || !/^[\w\s\-&/+.]{1,80}$/i.test(category)) {
    return badRequest("Category is invalid.");
  }
  if (!description || description.length < 30) {
    return badRequest("Description should be at least 30 characters.");
  }
  if (!submitterName || submitterName.length < 2) {
    return badRequest("Submitter name is required.");
  }
  if (!submitterEmail) {
    return badRequest("A valid email is required.");
  }

  const domain = extractDomain(websiteUrl);
  if (!domain) {
    return badRequest("Website domain could not be parsed.");
  }

  const userAgent = normalizeInput(request.headers.get("user-agent"), 300);
  const duplicate = await env.DB.prepare(
    `SELECT id FROM tool_submissions
     WHERE submitter_email = ? AND website_url = ? AND created_at >= datetime('now', '-1 day')
     LIMIT 1`
  )
    .bind(submitterEmail, websiteUrl)
    .first();

  if (!duplicate) {
    await env.DB.prepare(
      `INSERT INTO tool_submissions
      (tool_name, website_url, domain, category, tags, description, submitter_name, submitter_email, source_ip, user_agent, review_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    )
      .bind(
        toolName,
        websiteUrl,
        domain,
        category,
        tags || "",
        description,
        submitterName,
        submitterEmail,
        normalizeInput(clientIp, 64),
        userAgent
      )
      .run();
  }

  return json({ ok: true, accepted: true }, { status: 201 });
}

async function handleContactSubmission(request, env, clientIp) {
  if (!assertAllowedOrigin(request)) {
    return forbidden();
  }
  if (!assertRateLimit(clientIp, "write")) {
    return rateLimited();
  }

  let payload;
  try {
    payload = await parseJsonBody(request);
  } catch (error) {
    if (error.message === "payload_too_large") return badRequest("Payload too large.");
    if (error.message === "invalid_content_type") return badRequest("Invalid content type.");
    return badRequest("Invalid request body.");
  }

  const honeypot = normalizeInput(payload.website, 140);
  if (honeypot) {
    return json({ ok: true, accepted: true });
  }

  const name = normalizeInput(payload.name, 120);
  const email = normalizeEmail(payload.email);
  const subject = normalizeInput(payload.subject, 140);
  const message = normalizeMultilineInput(payload.message, 2000);

  if (!name || name.length < 2) {
    return badRequest("Name is required.");
  }
  if (!email) {
    return badRequest("A valid email is required.");
  }
  if (!subject || subject.length < 3) {
    return badRequest("Subject is required.");
  }
  if (!message || message.length < 20) {
    return badRequest("Message should be at least 20 characters.");
  }

  const userAgent = normalizeInput(request.headers.get("user-agent"), 300);
  await env.DB.prepare(
    `INSERT INTO contact_messages
    (name, email, subject, message, source_ip, user_agent)
    VALUES (?, ?, ?, ?, ?, ?)`
  )
    .bind(name, email, subject, message, normalizeInput(clientIp, 64), userAgent)
    .run();

  return json({ ok: true, accepted: true }, { status: 201 });
}

export async function onRequest(context) {
  const { request, env } = context;
  const clientIp = request.headers.get("CF-Connecting-IP") || "unknown";

  if (request.method === "GET" && !assertRateLimit(clientIp, "read")) {
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
    if (path === "/api/tool-submissions" && request.method === "POST") {
      return handleToolSubmission(request, env, clientIp);
    }
    if (path === "/api/contact-submissions" && request.method === "POST") {
      return handleContactSubmission(request, env, clientIp);
    }
    return json({ error: "Not found" }, { status: 404 });
  } catch (_) {
    return json({ error: "Unexpected server error." }, { status: 500 });
  }
}
