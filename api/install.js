export default function handler(req, res) {
  const shop = req.query.shop;

  const apiKey = process.env.SHOPIFY_API_KEY;
  const scopes = "read_orders,read_products,read_customers,read_inventory";
  const redirectUri = "https://connect.weareparagonmedia.com/api/callback";

  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}`;

  res.redirect(installUrl);
}
