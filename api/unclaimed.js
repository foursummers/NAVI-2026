const MCP_URL = 'https://open-api.naviprotocol.io/api/mcp';
const MCP_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json, text/event-stream'
};

async function mcpCall(method, args) {
  const body = JSON.stringify({
    jsonrpc: '2.0', id: 1,
    method: 'tools/call',
    params: { name: method, arguments: args }
  });
  const r = await fetch(MCP_URL, { method: 'POST', headers: MCP_HEADERS, body });
  if (!r.ok) throw new Error(`MCP ${r.status}`);
  const j = await r.json();
  if (j.error) throw new Error(j.error.message || 'MCP error');
  const content = j.result?.content;
  if (!content?.length) return null;
  const text = content[0]?.text;
  if (!text) return null;
  return JSON.parse(text);
}

export default async function handler(req, res) {
  const { address } = req.query;
  if (!address || !address.startsWith('0x')) {
    return res.status(400).json({ error: 'Missing or invalid address parameter' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const data = await mcpCall('navi_get_available_rewards', { address });
    if (!data) return res.status(200).json({ rewards: [], summary: [] });
    const rewards = data.rewards || data || [];
    const summary = data.summary || [];
    return res.status(200).json({ rewards: Array.isArray(rewards) ? rewards : [], summary });
  } catch (e) {
    console.error('Unclaimed rewards MCP error:', e.message);
    return res.status(502).json({ error: e.message, rewards: [], summary: [] });
  }
}
