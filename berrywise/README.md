# Berrywise Portfolio IQ

Berrywise is an AI-native portfolio intelligence app built with Next.js. Upload a portfolio CSV or use a demo portfolio to review allocation, performance, concentration risk, and AI-generated portfolio insights.

## Features

- CSV upload for stock portfolios.
- Demo balanced and concentrated portfolios.
- KPI dashboard for value, cost basis, P&L, holdings count, top asset, risk profile, and health score.
- Sector allocation and holding value charts.
- Searchable and sortable holdings table.
- AI diversification analysis and rebalancing suggestions.
- Portfolio-aware AI chat.
- Demo fallback mode when no Groq API key is configured.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Recharts
- Framer Motion
- Lucide React
- Groq SDK

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Setup

The app works without an API key by using deterministic demo-mode analysis. To enable live Groq responses, create `.env.local`:

```bash
cp .env.local.example .env.local
```

Add your key:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

Restart the dev server after editing environment variables.

## CSV Format

Required columns:

```csv
Stock,Quantity,AvgPrice,Sector
AAPL,50,175.50,Technology
MSFT,30,385.20,Technology
JPM,45,155.00,Financials
```

The parser accepts common variants such as `Ticker`, `Symbol`, `Qty`, `Shares`, `Average Price`, and `Industry`.

You can test the app with [`public/portfolio_sample.csv`](public/portfolio_sample.csv), which includes Indian equity sample holdings:

```csv
Stock,Quantity,AvgPrice,CurrentPrice,Sector
TCS,10,3400,3650,IT
Infosys,15,1450,1580,IT
HDFC Bank,20,1520,1680,Banking
```

`CurrentPrice` is optional in the current app. Berrywise presently simulates current prices from `AvgPrice`, so this extra column is kept as example data for future live-pricing support.

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Important Notes

- Uploaded holdings are saved in browser `localStorage`.
- Current prices are simulated from each holding's average price in this version.
- AI analysis is informational only and does not constitute financial, investment, tax, or legal advice.
- Keep `.env.local` and other local secrets out of Git.
