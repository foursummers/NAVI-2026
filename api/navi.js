const MCP_URL = 'https://open-api.naviprotocol.io/api/mcp';
const OPEN_API = 'https://open-api.naviprotocol.io/api';
const MCP_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json, text/event-stream'
};

async function fetchOpenApi(path, timeoutMs = 12000) {
  const url = `${OPEN_API}${path.startsWith('/') ? '' : '/'}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, { headers: { 'Accept': 'application/json' }, signal: controller.signal });
    clearTimeout(timer);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function mcpCall(method, args, timeoutMs = 15000) {
  const body = JSON.stringify({
    jsonrpc: '2.0', id: 1,
    method: 'tools/call',
    params: { name: method, arguments: args || {} }
  });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(MCP_URL, { method: 'POST', headers: MCP_HEADERS, body, signal: controller.signal });
    clearTimeout(timer);
    if (!r.ok) throw new Error(`MCP ${r.status}`);
    const j = await r.json();
    if (j.error) throw new Error(j.error.message);
    const text = j.result?.content?.[0]?.text;
    return text ? JSON.parse(text) : null;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

export default async function handler(req, res) {
  const { path } = req.query;
  if (!path) return res.status(400).json({ error: 'Missing path parameter' });

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  if (req.method === 'OPTIONS') return res.status(200).end();

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const data = await fetchOpenApi(path);
      return res.status(200).json(data);
    } catch (e) {
      console.warn(`NAVI Open API attempt ${attempt + 1} failed:`, e.message);
      if (attempt === 0) {
        await new Promise(ok => setTimeout(ok, 1000));
        continue;
      }
    }
  }

  try {
    if (path === '/navi/pools') {
      const data = await mcpCall('navi_get_pools', {});
      if (data) return res.status(200).json({ data, code: 0 });
    }
    return res.status(502).json({ error: 'NAVI API unavailable after retries' });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
