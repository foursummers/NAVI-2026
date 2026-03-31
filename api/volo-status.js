export default async function handler(req, res) {
  const { address } = req.query;
  if (!address || !address.startsWith('0x')) {
    return res.status(400).json({ error: 'Missing or invalid address parameter' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const upstream = `https://vault-api.volosui.com/api/v1/users/${address}/status`;
    const r = await fetch(upstream, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) return res.status(r.status).json({ error: `Volo API returned ${r.status}` });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
