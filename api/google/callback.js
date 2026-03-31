export default async function handler(req, res) {
  const { code } = req.query;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: "https://paragon-connect.vercel.app/api/google/callback",
      grant_type: "authorization_code"
    })
  });

  const data = await response.json();

  // 👇 IMPORTANTE
  const accessToken = data.access_token;

  console.log("ACCESS TOKEN:", accessToken);

  // 👉 temporal (luego lo guardamos en DB)
  res.send(`
    Google conectado ✅ <br/><br/>
    Token:<br/>
    ${accessToken}
  `);
}
