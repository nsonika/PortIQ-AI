# PortIQ AI / Berrywise

AI-native portfolio intelligence workspace for uploading a stock portfolio, visualizing allocation and performance, and generating risk and rebalancing insights.

The main application lives in [`berrywise/`](berrywise/) and is built with Next.js, React, Tailwind CSS, Recharts, Framer Motion, Lucide icons, and Groq for optional AI analysis.

## Features

- CSV portfolio upload with validation for stock, quantity, average price, and sector.
- Demo portfolios for quick exploration without a file.
- Portfolio dashboard with total value, cost basis, profit/loss, holdings count, top asset, concentration risk, and health score.
- Sector allocation and holding value visualizations.
- Searchable and sortable holdings table.
- AI analysis route for diversification scoring, sector exposure, risk warnings, and rebalancing suggestions.
- AI chat route for portfolio-specific questions.
- Local demo fallback when `GROQ_API_KEY` is not configured.

## Project Structure

```text
.
├── README.md
├── JETRO_USAGE.md
├── berrywise/
│   ├── src/app/                 # Next.js App Router pages and API routes
│   ├── src/components/          # Landing, dashboard, AI insights, and chat UI
│   ├── src/types/portfolio.ts   # Shared portfolio data types
│   ├── package.json
│   └── .env.local.example
├── projects/                    # Jetro project canvas metadata
└── data/                        # Local data, ignored for secrets/privacy when needed
```

## Requirements

- Node.js 18.18 or newer
- npm
- Optional: a Groq API key for live AI responses

## Getting Started

```bash
cd berrywise
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Environment Variables

AI features work in two modes:

- Without a key: the app uses deterministic demo logic for analysis and chat.
- With a key: the app calls Groq from the server-side API routes.

To enable Groq:

```bash
cd berrywise
cp .env.local.example .env.local
```

Then edit `.env.local`:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

Restart the development server after changing environment variables.

## CSV Format

Upload a CSV with these required columns:

```csv
Stock,Quantity,AvgPrice,Sector
AAPL,50,175.50,Technology
MSFT,30,385.20,Technology
JPM,45,155.00,Financials
```

The parser also accepts common header variants such as `Ticker`, `Symbol`, `Qty`, `Shares`, `Average Price`, and `Industry`.

A ready-to-use example is available at [`berrywise/public/portfolio_sample.csv`](berrywise/public/portfolio_sample.csv). It includes Indian equity sample holdings and an optional `CurrentPrice` column:

```csv
Stock,Quantity,AvgPrice,CurrentPrice,Sector
TCS,10,3400,3650,IT
Infosys,15,1450,1580,IT
HDFC Bank,20,1520,1680,Banking
```

The current app calculates simulated current prices from `AvgPrice`, so `CurrentPrice` is included only as helpful sample data for future market-data work.

## Useful Scripts

Run these from `berrywise/`:

```bash
npm run dev      # Start local development server
npm run build    # Build production bundle
npm run start    # Start production server after build
npm run lint     # Run ESLint
```

## Notes

- Portfolio data is stored in browser `localStorage` so the same browser can restore the last loaded portfolio.
- Current prices are simulated from the uploaded average price in the current implementation. This keeps the app usable without a market-data provider.
- AI output is for educational and product-demo purposes only and is not financial, investment, tax, or legal advice.
- Keep `.env.local`, `.mcp.json`, `.cursor/mcp.json`, `.jetro/`, and other local/private files out of version control.
