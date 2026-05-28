# Jetro Usage

This project used Jetro as an AI-native research and planning workspace while building PortIQ AI / Berrywise, a portfolio intelligence web application.

Jetro was most useful for product framing, workflow design, and implementation planning before and during the Next.js build.

## What Jetro Helped With

- Clarifying the core fintech use case: portfolio upload, allocation review, risk scoring, and AI-assisted commentary.
- Shaping the CSV ingestion flow and required fields.
- Planning the dashboard structure, including KPI cards, sector allocation, holding-level performance, and concentration risk.
- Defining the AI insights workflow for diversification scoring, sector exposure, risk warnings, and rebalancing suggestions.
- Planning API boundaries for `/api/analyze` and `/api/chat`.
- Thinking through fallback behavior so the product still works without a live AI API key.

## Resulting Application

The resulting app is in [`berrywise/`](berrywise/). It is a Next.js application with:

- A CSV upload landing experience.
- Built-in demo portfolios.
- A portfolio analytics dashboard.
- AI insights powered by Groq when `GROQ_API_KEY` is configured.
- Deterministic demo-mode analysis and chat when no API key is available.

## Canvas Notes

The Jetro canvas workflow was explored during development. For this project, the primary deliverable became a standalone Next.js app rather than a canvas-native dashboard. The canvas still helped with product thinking and planning, but the interactive user experience now lives in the web app.

For future iterations, Jetro would be a strong fit for:

- A live portfolio monitoring canvas.
- Multi-panel C2 dashboards with separate uploader, risk panel, AI assistant, and chart frames.
- Research notes connected to portfolio snapshots.
- Living Document Format reports for sharing portfolio reviews.

## Security And Local Files

Some Jetro and MCP files contain private values such as JWT tokens, local paths, workspace metadata, or generated data. These should not be committed.

Keep the following out of Git:

- `.cursor/mcp.json`
- `.mcp.json`
- `.jetro/`


## Usage Limits

During the original session, model usage was exhausted after roughly half an hour. That affected the amount of interactive exploration possible in Jetro, but the core application flow and documentation were completed in the local project.
