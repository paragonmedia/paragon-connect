export default async function handler(req, res) {
  const { shop, code } = req.query;

  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code
    })
  });

  const data = await response.json();
  const accessToken = data.access_token;

  console.log("SHOP:", shop);
  console.log("TOKEN:", accessToken);

  res.send("App instalada correctamente");
}
