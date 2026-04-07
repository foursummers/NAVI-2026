const MCP_URL = 'https://open-api.naviprotocol.io/api/mcp';
const MCP_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json, text/event-stream'
};

export default async function handler(req, res) {
  const { address, protocols } = req.query;
  if (!address || !address.startsWith('0x')) {
    return res.status(400).json({ error: 'Missing or invalid address parameter' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'tools/call',
      params: {
        name: 'get_positions',
        arguments: { address, protocols: protocols || 'navi,volo,wallet', format: 'json' }
      }
    });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const r = await fetch(MCP_URL, { method: 'POST', headers: MCP_HEADERS, body, signal: controller.signal });
    clearTimeout(timer);
    if (!r.ok) return res.status(r.status).json({ error: `MCP ${r.status}` });
    const j = await r.json();
    if (j.error) return res.status(502).json({ error: j.error.message });
    const text = j.result?.content?.[0]?.text;
    if (!text) return res.status(200).json([]);
    return res.status(200).json(JSON.parse(text));
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
