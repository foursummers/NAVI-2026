# Navi Prime — DeFi Position Dashboard

Real-time, URL-driven monitoring dashboard for [NAVI Protocol](https://naviprotocol.io/) positions on the **SUI blockchain**.

## Features

- **100% On-Chain Real-Time Data** — all values fetched live from SUI RPC and NAVI Open API; zero estimations
- **URL-Driven State** — wallet addresses & names passed via URL params for instant sharing
- **4-Tab Interface**:
  - **Yield Analysis** — Net P&L, Health Factor, KPI cards, Net Yield Summary
  - **Positions** — Supply/Borrow positions, Volo vSUI holdings, wallet balances, liquidation risk
  - **Unclaimed** — Claimable reward tracking
  - **Monthly Rewards** — Historical claimed rewards chart & breakdown
- **Shareable Reports** — copy a link and anyone can view the dashboard (no login required)
- **Wallet Management** — add/remove wallets via a code-protected panel
- **Responsive** — works on desktop and mobile

## Quick Start

Open `index.html` in a browser (or serve with any static server):

```bash
npx serve .
```

Then navigate to:

```
http://localhost:3000?wallets=0xYOUR_ADDRESS&names=MyWallet
```

### URL Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `wallets` | Comma-separated SUI addresses | `0xabc…,0xdef…` |
| `names`   | Comma-separated wallet aliases (underscores → spaces) | `Galaxy,B7_Volo` |

### Multiple Wallets

```
?wallets=0xabc…,0xdef…&names=Wallet_A,Wallet_B
```

## Data Sources

| Data | Source | Method |
|------|--------|--------|
| Pool APRs, Prices | NAVI Open API | `GET /navi/pools` |
| Wallet Balances | SUI RPC | `suix_getAllBalances` |
| Supply/Borrow Positions | SUI RPC | `sui_getObject` + `suix_getDynamicFieldObject` on NAVI Storage |
| Claimed Rewards | NAVI Open API | `GET /navi/user/rewards` |
| vSUI Holdings | SUI RPC | wallet balance of CERT token |

## Architecture

Single self-contained HTML file with inline CSS and JavaScript — no build step, no dependencies beyond Chart.js (loaded from CDN).

```
index.html
├── <style>        — full CSS (responsive, dark/light tokens)
├── <body>         — semantic HTML structure (header, sidebar, 4 tab panels, footer)
└── <script>
    ├── Router     — URL param parsing & shareable link generation
    ├── suiRpc()   — SUI JSON-RPC client
    ├── naviGet()  — NAVI REST API client
    ├── fetchPools / fetchBalances / fetchUserPositions / fetchClaimedRewards
    ├── agg()      — cross-wallet aggregation
    └── render*()  — tab-specific rendering functions
```

## Wallet Management

Click **Manage Wallets** in the sidebar, enter the verification code, then add or remove addresses. Changes update the URL in real-time.

## Tech Stack

- Vanilla JavaScript (ES6+)
- CSS Custom Properties
- Chart.js 4.x (CDN)
- SUI JSON-RPC 2.0
- NAVI Open API

## License

MIT
