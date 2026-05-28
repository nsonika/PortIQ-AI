"use client";

import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import Landing from "@/components/landing";
import Dashboard from "@/components/dashboard";
import AIInsights from "@/components/ai-insights";
import AIChat from "@/components/ai-chat";
import { Holding, PortfolioStats, AIAnalysis, ChatMessage } from "@/types/portfolio";

export default function Home() {
  const [holdings, setHoldings] = useState<Holding[] | null>(null);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Load portfolio from LocalStorage on mount
  useEffect(() => {
    const savedHoldings = localStorage.getItem("berrywise_holdings");
    if (savedHoldings) {
      try {
        const parsed = JSON.parse(savedHoldings);
        if (Array.isArray(parsed) && parsed.length > 0) {
          handlePortfolioLoaded(parsed, false); // Load without overwriting LocalStorage in this handler
        }
      } catch (e) {
        console.error("Failed to restore portfolio from LocalStorage", e);
      }
    }
  }, []);

  // Compute portfolio stats when holdings change
  const handlePortfolioLoaded = (newHoldings: Holding[], save = true) => {
    setHoldings(newHoldings);
    if (save) {
      localStorage.setItem("berrywise_holdings", JSON.stringify(newHoldings));
    }

    // Reset AI insights & chat when a new portfolio is loaded
    setAnalysis(null);
    setAnalysisError(null);
    setChatMessages([]);

    const totalValue = newHoldings.reduce((sum, h) => sum + h.totalValue, 0);
    const totalCost = newHoldings.reduce((sum, h) => sum + h.costBasis, 0);
    const totalPnL = totalValue - totalCost;
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    // Largest holding
    let largest = { stock: "N/A", value: 0, percentage: 0 };
    if (newHoldings.length > 0) {
      const sorted = [...newHoldings].sort((a, b) => b.totalValue - a.totalValue);
      largest = {
        stock: sorted[0].stock,
        value: sorted[0].totalValue,
        percentage: totalValue > 0 ? (sorted[0].totalValue / totalValue) * 100 : 0,
      };
    }

    // Concentration Risk and Sector Weights
    const sectorWeights: Record<string, number> = {};
    newHoldings.forEach((h) => {
      const weight = totalValue > 0 ? (h.totalValue / totalValue) * 100 : 0;
      sectorWeights[h.sector] = (sectorWeights[h.sector] || 0) + weight;
    });

    const maxSectorWeight = Math.max(...Object.values(sectorWeights), 0);
    let concentrationRisk: "Low" | "Medium" | "High" = "Low";
    if (maxSectorWeight > 50) {
      concentrationRisk = "High";
    } else if (maxSectorWeight > 30) {
      concentrationRisk = "Medium";
    }

    // Health Score calculation
    let healthScore = 100;
    
    // Penalty for concentration risk
    if (concentrationRisk === "High") healthScore -= 30;
    else if (concentrationRisk === "Medium") healthScore -= 15;

    // Penalty for low holdings count
    if (newHoldings.length < 5) healthScore -= 20;
    else if (newHoldings.length < 8) healthScore -= 10;

    // Penalty for overall portfolio performance negative
    if (totalPnLPercent < 0) {
      const lossPenalty = Math.min(Math.abs(totalPnLPercent) * 0.5, 20); // max 20 penalty
      healthScore -= lossPenalty;
    }

    // Clamp healthScore
    healthScore = Math.max(20, Math.min(100, Math.round(healthScore)));

    setStats({
      totalValue,
      totalCost,
      totalPnL,
      totalPnLPercent,
      holdingsCount: newHoldings.length,
      largestHolding: largest,
      concentrationRisk,
      healthScore,
    });
  };

  const handleBack = () => {
    localStorage.removeItem("berrywise_holdings");
    setHoldings(null);
    setStats(null);
    setAnalysis(null);
    setAnalysisError(null);
    setChatMessages([]);
  };

  // Call /api/analyze route
  const runAIAnalysis = async () => {
    if (!holdings) return;
    setAnalysisLoading(true);
    setAnalysisError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings }),
      });

      if (!res.ok) {
        throw new Error(`Server returned error code: ${res.status}`);
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (e: unknown) {
      setAnalysisError((e as Error).message || "Failed to complete analysis.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Call /api/chat route
  const handleSendMessage = async (text: string) => {
    if (!holdings) return;
    
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatLoading(true);

    try {
      const history = [...chatMessages, userMsg];
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holdings,
          messages: history,
        }),
      });

      if (!res.ok) {
        throw new Error(`Chat API error: ${res.status}`);
      }

      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (e: unknown) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: "assistant",
        content: `Error: Failed to obtain response from Berrywise Advisor. ${(e as Error).message}`,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative text-slate-100 selection:bg-indigo-500/30 selection:text-white">
      {/* Universal header bar for the app */}
      <header className="glass-panel border-x-0 border-t-0 border-white/5 py-4.5 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20 tracking-wider">
            B
          </div>
          <span className="font-extrabold text-lg text-white tracking-wider">
            berry<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">wise</span>
          </span>
        </div>
        
        {holdings && (
          <div className="flex items-center gap-3">
            <button 
              onClick={runAIAnalysis}
              disabled={analysisLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-semibold tracking-wide transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Re-run AI Analysis
            </button>
          </div>
        )}
      </header>

      {holdings && stats ? (
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            {/* Dashboard area (left 2 cols) */}
            <div className="xl:col-span-2 space-y-6">
              <Dashboard 
                holdings={holdings} 
                stats={stats} 
                onBack={handleBack} 
              />
            </div>
            
            {/* AI intelligence panel (right col) */}
            <div className="space-y-6">
              <AIInsights 
                analysis={analysis} 
                loading={analysisLoading} 
                error={analysisError} 
                onRetry={runAIAnalysis}
                demoMode={analysis?.demoMode}
              />
              
              <AIChat 
                messages={chatMessages} 
                onSendMessage={handleSendMessage} 
                loading={chatLoading} 
              />
            </div>
          </div>
        </div>
      ) : (
        <Landing onPortfolioLoaded={handlePortfolioLoaded} />
      )}
    </main>
  );
}
