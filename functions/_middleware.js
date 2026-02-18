export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  if (url.hostname === "www.findaidir.com") {
    url.hostname = "findaidir.com";
    return Response.redirect(url.toString(), 301);
  }

  const response = await next();
  return response;
}
