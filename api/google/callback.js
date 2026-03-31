export default async function handler(req, res) {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).send("Missing code");
    }

    let decodedState = {};
    if (state) {
      try {
        decodedState = JSON.parse(
          Buffer.from(state, "base64").toString("utf8")
        );
      } catch (e) {
        decodedState = {};
      }
    }

    const tenantId = decodedState.tenant_id || null;
    const appRedirectUri = decodedState.redirect_uri || null;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "https://paragon-connect.vercel.app/api/google/callback",
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(400).json({
        error: "token_exchange_failed",
        details: tokenData,
      });
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token || null;
    const expiresIn = tokenData.expires_in || null;

    let externalAccountEmail = null;

    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (profileRes.ok) {
      const profile = await profileRes.json();
      externalAccountEmail = profile.email || null;
    }

    const tokenExpiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    if (!tenantId) {
      return res.status(400).send("Missing tenant_id in state");
    }

    const supabaseRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/connections?on_conflict=organization_id,type`,
      {
        method: "POST",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify({
          organization_id: tenantId,
          type: "google_analytics",
          provider: "google_analytics",
          status: "connected",
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires_at: tokenExpiresAt,
          connected_at: new Date().toISOString(),
          external_account_email: externalAccountEmail,
        }),
      }
    );

    const supabaseData = await supabaseRes.text();

    if (!supabaseRes.ok) {
      return res.status(500).send(`Supabase error: ${supabaseData}`);
    }

    if (appRedirectUri) {
      const separator = appRedirectUri.includes("?") ? "&" : "?";
      return res.redirect(
        `${appRedirectUri}${separator}provider=google_analytics&status=connected`
      );
    }

    return res.send("Google Analytics connected successfully");
  } catch (error) {
    return res.status(500).send(`Callback error: ${error.message}`);
  }
}
