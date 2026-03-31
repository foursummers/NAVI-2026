import { getUserAvailableLendingRewards, summaryLendingRewards } from '@naviprotocol/lending';

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
    const rewards = await getUserAvailableLendingRewards(address, { env: 'prod' });
    const summary = summaryLendingRewards(rewards);
    return res.status(200).json({ rewards, summary });
  } catch (e) {
    console.error('Unclaimed rewards error:', e);
    return res.status(502).json({ error: e.message });
  }
}
