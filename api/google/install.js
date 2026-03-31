export default function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = "https://paragon-connect.vercel.app/api/google/callback";
  const scope = "https://www.googleapis.com/auth/analytics.readonly";

  const tenantId = req.query.tenant_id || "";
  const appRedirectUri = req.query.redirect_uri || "";

  const statePayload = Buffer.from(
    JSON.stringify({
      tenant_id: tenantId,
      redirect_uri: appRedirectUri,
      provider: "google_analytics",
    })
  ).toString("base64");

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${encodeURIComponent(statePayload)}`;

  res.redirect(authUrl);
}
