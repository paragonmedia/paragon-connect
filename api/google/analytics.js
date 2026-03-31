export default async function handler(req, res) {
  const accessToken = req.query.token;

  const response = await fetch(
    "https://analyticsdata.googleapis.com/v1beta/properties",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  const data = await response.json();

  res.json(data);
}
