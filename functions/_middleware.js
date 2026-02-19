export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  if (url.hostname === "www.findaidir.com") {
    url.hostname = "findaidir.com";
    return Response.redirect(url.toString(), 301);
  }

  const response = await next();
  const headers = new Headers(response.headers);
  const contentType = headers.get("content-type") || "";
  const isHtml = contentType.includes("text/html");

  if (!headers.has("Content-Security-Policy") && isHtml) {
    headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self';"
    );
  }
  if (!headers.has("X-Content-Type-Options")) headers.set("X-Content-Type-Options", "nosniff");
  if (!headers.has("X-Frame-Options")) headers.set("X-Frame-Options", "DENY");
  if (!headers.has("Referrer-Policy")) headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (!headers.has("Permissions-Policy")) {
    headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  }
  if (!headers.has("Cross-Origin-Opener-Policy")) headers.set("Cross-Origin-Opener-Policy", "same-origin");
  if (!headers.has("Cross-Origin-Resource-Policy")) headers.set("Cross-Origin-Resource-Policy", "same-origin");
  if (!headers.has("Strict-Transport-Security")) {
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
