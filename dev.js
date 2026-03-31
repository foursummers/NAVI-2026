import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getUserAvailableLendingRewards, summaryLendingRewards } from '@naviprotocol/lending';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript',
  '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.svg': 'image/svg+xml',
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  res.setHeader('Access-Control-Allow-Origin', '*');

  // API: unclaimed rewards
  if (url.pathname === '/api/unclaimed') {
    const addr = url.searchParams.get('address');
    if (!addr) return json(res, 400, { error: 'missing address' });
    try {
      const rewards = await getUserAvailableLendingRewards(addr, { env: 'prod' });
      const summary = summaryLendingRewards(rewards);
      return json(res, 200, { rewards, summary });
    } catch (e) {
      return json(res, 502, { error: e.message });
    }
  }

  // API: volo proxy
  if (url.pathname === '/api/volo') {
    const addr = url.searchParams.get('address');
    if (!addr) return json(res, 400, { error: 'missing address' });
    try {
      const r = await fetch(`https://vault-api.volosui.com/api/v1/users/${addr}/position`);
      const data = await r.json();
      return json(res, 200, data);
    } catch (e) {
      return json(res, 502, { error: e.message });
    }
  }

  // API: volo status proxy
  if (url.pathname === '/api/volo-status') {
    const addr = url.searchParams.get('address');
    if (!addr) return json(res, 400, { error: 'missing address' });
    try {
      const r = await fetch(`https://vault-api.volosui.com/api/v1/users/${addr}/status`);
      const data = await r.json();
      return json(res, 200, data);
    } catch (e) {
      return json(res, 502, { error: e.message });
    }
  }

  // Static files
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) { res.writeHead(404); res.end('Not found'); return; }
  const ext = path.extname(fullPath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(fullPath).pipe(res);
});

function json(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

server.listen(PORT, () => {
  console.log(`\n  🚀 Dev server running at http://localhost:${PORT}\n`);
});
