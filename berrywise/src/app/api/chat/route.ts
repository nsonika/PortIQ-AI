import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { ChatMessage } from "@/types/portfolio";

export async function POST(req: NextRequest) {
  try {
    const { holdings, messages } = await req.json();

    if (!holdings || !Array.isArray(holdings)) {
      return NextResponse.json(
        { error: "Invalid holdings data provided" },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages history provided" },
        { status: 400 }
      );
    }

    // Compute basic statistics for prompt context
    const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
    const totalCost = holdings.reduce((sum, h) => sum + h.costBasis, 0);
    const totalPnL = totalValue - totalCost;
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
    
    const sectorWeights: Record<string, number> = {};
    holdings.forEach((h) => {
      const weight = (h.totalValue / totalValue) * 100;
      sectorWeights[h.sector] = (sectorWeights[h.sector] || 0) + weight;
    });

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      // SMART KEYWORD FALLBACK RESPONSE GENERATOR
      console.log("No GROQ_API_KEY found, running chat in smart mock mode.");
      
      const lastUserMsgObj = messages[messages.length - 1];
      const userText = (lastUserMsgObj?.content || "").toLowerCase();
      
      let reply = "";

      if (userText.includes("hello") || userText.includes("hi ") || userText.includes("hey")) {
        reply = `Hello! I am the Berrywise Portfolio AI Assistant. I have analyzed your portfolio of ${holdings.length} holdings valued at $${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}. Ask me anything about your sector exposure, risk profile, or rebalancing strategies!`;
      } else if (userText.includes("risk") || userText.includes("concentrat")) {
        const topHolding = [...holdings].sort((a, b) => b.totalValue - a.totalValue)[0];
        const topWeight = topHolding ? ((topHolding.totalValue / totalValue) * 100).toFixed(1) : "0";
        reply = `Looking at your risk profile:
1. **Single-Stock Risk**: Your largest holding is **${topHolding?.stock || "N/A"}** at **${topWeight}%** of your assets. Generally, keeping single positions under 15% is recommended to mitigate sudden company-specific events.
2. **Sector Concentration**: Your largest sector exposure is in **${Object.entries(sectorWeights).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}**.
3. **P&L Health**: Your overall portfolio return is **${totalPnL >= 0 ? "+" : ""}${totalPnLPercent.toFixed(2)}%** ($${totalPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}).
Would you like some ideas on how to diversify these risks?`;
      } else if (userText.includes("rebalanc") || userText.includes("diversif") || userText.includes("allocation")) {
        const sortedSectors = Object.entries(sectorWeights).sort((a, b) => b[1] - a[1]);
        const highestSector = sortedSectors[0]?.[0] || "N/A";
        const lowestSector = sortedSectors[sortedSectors.length - 1]?.[0] || "N/A";
        reply = `To rebalance your portfolio, you could:
1. **Reduce High Exposure**: Trim holdings in the **${highestSector}** sector, which currently represents **${sortedSectors[0]?.[1].toFixed(1)}%** of your capital.
2. **Inject into Underrepresented Areas**: Deploy new cash or trimmed gains into sectors like **${lowestSector}** (currently only **${sortedSectors[sortedSectors.length - 1]?.[1].toFixed(1)}%**).
3. **DCA Adjustments**: Alter your weekly/monthly recurring deposits to favor assets outside your top 3 holdings.`;
      } else if (userText.includes("holding") || userText.includes("stock") || userText.includes("list")) {
        const listText = holdings.map(h => `- **${h.stock}** (${h.sector}): ${h.quantity} shares @ $${h.avgPrice} (Current: $${h.currentPrice.toFixed(2)}, Value: $${h.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}). PnL: ${h.pnl >= 0 ? "+" : ""}${h.pnlPercent.toFixed(1)}%`).join("\n");
        reply = `Here is a breakdown of your current holdings:\n\n${listText}\n\nIs there a specific stock you would like me to detail further?`;
      } else if (userText.includes("pnl") || userText.includes("profit") || userText.includes("return") || userText.includes("money")) {
        const gainers = holdings.filter(h => h.pnl > 0).length;
        const losers = holdings.filter(h => h.pnl < 0).length;
        reply = `Your portfolio shows:
- **Total Portfolio Value**: $${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
- **Total Cost Basis**: $${totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
- **Net Return**: **${totalPnL >= 0 ? "+" : ""}${totalPnLPercent.toFixed(2)}%** ($${totalPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })})
- **Winning Assets**: ${gainers} positions
- **Losing Assets**: ${losers} positions

The strongest performer is **${[...holdings].sort((a, b) => b.pnlPercent - a.pnlPercent)[0]?.stock || "N/A"}** and the weakest is **${[...holdings].sort((a, b) => a.pnlPercent - b.pnlPercent)[0]?.stock || "N/A"}**.`;
      } else {
        reply = `I have received your question regarding your Berrywise portfolio. 

Your current holdings ($${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} total value across ${Object.keys(sectorWeights).length} sectors) show a net performance of ${totalPnL >= 0 ? "+" : ""}${totalPnLPercent.toFixed(2)}%. To address "${lastUserMsgObj?.content || "your query"}" specifically, standard guidelines suggest reviewing your holding sizes, checking sector weight bounds, and ensuring you are not over-correlated in tech or cyclical sectors. 

*Note: For full deep-dive intelligence, please configure your GROQ_API_KEY in .env.local to enable the advanced Llama-3.3-70B model analysis.*`;
      }

      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      return NextResponse.json({
        role: "assistant",
        content: reply,
        demoMode: true,
      });
    }

    // Call real Groq API
    const groq = new Groq({ apiKey });

    // Format holdings context for the model
    const holdingsContext = holdings.map((h) => ({
      Stock: h.stock,
      Quantity: h.quantity,
      AvgPrice: h.avgPrice,
      CurrentPrice: h.currentPrice,
      Sector: h.sector,
      Value: h.totalValue.toFixed(2),
      PnL: h.pnl.toFixed(2),
      PnLPercent: h.pnlPercent.toFixed(2),
    }));

    const systemMessage = {
      role: "system" as const,
      content: `You are Berrywise AI, a highly sophisticated virtual investment analyst and advisor.
You are chatting with a user about their stock portfolio. 
Use a professional, objective, and analytical tone.
Always keep in mind the user's actual portfolio holdings:
Total Value: $${totalValue.toFixed(2)}
Total Cost Basis: $${totalCost.toFixed(2)}
Total PnL: $${totalPnL.toFixed(2)} (${totalPnLPercent.toFixed(2)}%)
Sector Allocation: ${JSON.stringify(sectorWeights)}
Holdings: ${JSON.stringify(holdingsContext)}

Answer the user's questions clearly. Refer to their actual assets and weights where relevant. 
Always include a brief standard financial disclaimer at the end of responses proposing major trades: "Disclaimer: This is for informational purposes only and does not constitute financial advice."`,
    };

    // Format messages for groq completions API
    const apiMessages = [
      systemMessage,
      ...messages.map((m: ChatMessage) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const completion = await groq.chat.completions.create({
      messages: apiMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      max_tokens: 1024,
    });

    const replyContent = completion.choices[0]?.message?.content || "I apologize, but I was unable to generate a response at this time.";

    return NextResponse.json({
      role: "assistant",
      content: replyContent,
      demoMode: false,
    });
  } catch (error: unknown) {
    console.error("API error in /api/chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat: " + (error as Error).message },
      { status: 500 }
    );
  }
}
