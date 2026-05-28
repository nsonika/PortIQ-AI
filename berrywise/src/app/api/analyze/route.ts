import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  try {
    const { holdings } = await req.json();

    if (!holdings || !Array.isArray(holdings) || holdings.length === 0) {
      return NextResponse.json(
        { error: "Invalid holdings data provided" },
        { status: 400 }
      );
    }

    // Calculate core statistics for prompt / analysis
    const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
    const sectorWeights: Record<string, number> = {};
    holdings.forEach((h) => {
      const weight = (h.totalValue / totalValue) * 100;
      sectorWeights[h.sector] = (sectorWeights[h.sector] || 0) + weight;
    });

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      // SMART FALLBACK DEMO MODE
      // If no API key is set, calculate realistic insights based on the uploaded data
      console.log("No GROQ_API_KEY found, running in smart mock fallback mode.");
      
      const holdingCount = holdings.length;
      let diversificationScore = 40;
      if (holdingCount >= 5 && holdingCount <= 9) diversificationScore = 75;
      else if (holdingCount >= 10) diversificationScore = 92;

      // Check concentration
      const maxHoldingWeight = Math.max(...holdings.map((h) => (h.totalValue / totalValue) * 100));
      const maxSectorWeight = Math.max(...Object.values(sectorWeights));
      const concentratedSectors = Object.entries(sectorWeights)
        .filter(([, w]) => w > 30)
        .map(([s]) => s);
      const topHoldings = [...holdings].sort((a, b) => b.totalValue - a.totalValue);

      let sectorExposureRating: "Excellent" | "Good" | "Fair" | "Poor" = "Excellent";
      if (maxSectorWeight > 50) sectorExposureRating = "Poor";
      else if (maxSectorWeight > 35) sectorExposureRating = "Fair";
      else if (maxSectorWeight > 20) sectorExposureRating = "Good";

      const riskWarnings: string[] = [];
      const rebalancingSuggestions: string[] = [];

      // Warnings logic
      if (holdingCount < 5) {
        riskWarnings.push("Underdiversified Portfolio: With fewer than 5 holdings, you are highly exposed to single-stock volatility.");
        rebalancingSuggestions.push("Consider expanding to 8-12 distinct listings across different sectors to reduce idiosyncratic risk.");
      }
      if (maxHoldingWeight > 25) {
        riskWarnings.push(`High Single Stock Exposure: ${topHoldings[0].stock} constitutes ${maxHoldingWeight.toFixed(1)}% of your portfolio.`);
        rebalancingSuggestions.push(`Trim position in ${topHoldings[0].stock} down to under 15% and redistribute funds to other sectors.`);
      }
      if (concentratedSectors.length > 0) {
        concentratedSectors.forEach((s) => {
          riskWarnings.push(`Sector Overexposure: ${s} makes up ${sectorWeights[s].toFixed(1)}% of your portfolio.`);
          rebalancingSuggestions.push(`Rebalance by reducing holdings in ${s} and scaling into underrepresented sectors.`);
        });
      }

      // Add a general positive warning / suggestion if portfolio is healthy
      if (riskWarnings.length === 0) {
        riskWarnings.push("No immediate concentration alarms detected. Portfolio risk profile is balanced.");
        rebalancingSuggestions.push("Maintain current dollar-cost averaging (DCA) strategy and review holdings quarterly.");
      }

      // Add default rebalancing suggestions if empty
      if (rebalancingSuggestions.length === 0) {
        rebalancingSuggestions.push("Review underperforming assets and consider tax-loss harvesting.");
      }

      const summary = `Your portfolio consists of ${holdingCount} holdings valued at $${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} across ${Object.keys(sectorWeights).length} sectors. The asset distribution indicates a ${sectorExposureRating.toLowerCase()} sector allocation, with ${holdingCount < 5 ? "significant" : "controlled"} concentration. Recommended adjustments target optimizing asset weights and managing single-stock risks.`;

      // Simulate a small delay for realistic loading spinner
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return NextResponse.json({
        diversificationScore,
        diversificationText: holdingCount < 5 
          ? "Highly concentrated portfolio. A few stocks dominate the overall performance." 
          : "Healthy distribution of assets across multiple distinct holdings.",
        sectorExposureRating,
        sectorExposureText: maxSectorWeight > 35 
          ? `High exposure to the ${Object.entries(sectorWeights).find(([, w]) => w === maxSectorWeight)?.[0] || 'dominant'} sector.` 
          : "Balanced sector exposure, preventing catastrophic industry-specific selloffs.",
        riskWarnings,
        rebalancingSuggestions,
        summary,
        demoMode: true,
      });
    }

    // Call real Groq API
    const groq = new Groq({ apiKey });
    const formattedHoldings = holdings.map((h) => ({
      Stock: h.stock,
      Quantity: h.quantity,
      AvgPrice: h.avgPrice,
      CurrentPrice: h.currentPrice,
      Sector: h.sector,
      WeightPercent: ((h.totalValue / totalValue) * 100).toFixed(2),
    }));

    const systemPrompt = `You are a Senior Quantitative Portfolio Manager and Financial Analyst.
Analyze the user's stock portfolio and return a comprehensive risk/diversification assessment.
You MUST respond with a valid JSON object matching the following structure:
{
  "diversificationScore": 75, // 0-100 score based on holding count, weight distribution, and correlation
  "diversificationText": "Short paragraph summary of the diversification quality",
  "sectorExposureRating": "Good", // "Excellent" | "Good" | "Fair" | "Poor"
  "sectorExposureText": "Brief description of the sector exposure balance",
  "riskWarnings": ["Warning 1", "Warning 2"],
  "rebalancingSuggestions": ["Suggestion 1", "Suggestion 2"],
  "summary": "Overall execution summary (1-2 sentences)"
}
Do not write any text outside of the JSON block. Return ONLY the JSON object.`;

    const userPrompt = `Analyze this portfolio:
Total Value: $${totalValue.toFixed(2)}
Sectors and their weights: ${JSON.stringify(sectorWeights)}
Holdings: ${JSON.stringify(formattedHoldings)}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    const analysis = JSON.parse(responseText);

    return NextResponse.json({ ...analysis, demoMode: false });
  } catch (error: unknown) {
    console.error("API error in /api/analyze:", error);
    return NextResponse.json(
      { error: "Failed to analyze portfolio: " + (error as Error).message },
      { status: 500 }
    );
  }
}
