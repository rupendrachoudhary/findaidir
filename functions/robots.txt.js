export function onRequestGet() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Sitemap: https://findaidir.com/sitemap.xml",
    "",
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
