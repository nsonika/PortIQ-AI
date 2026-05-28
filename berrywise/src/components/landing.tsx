"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, AlertCircle, Play, Info } from "lucide-react";
import { Holding } from "@/types/portfolio";

interface LandingProps {
  onPortfolioLoaded: (holdings: Holding[]) => void;
}

const DEMO_BALANCED: Omit<Holding, "currentPrice" | "totalValue" | "costBasis" | "pnl" | "pnlPercent">[] = [
  { stock: "AAPL", quantity: 50, avgPrice: 175.5, sector: "Technology" },
  { stock: "MSFT", quantity: 30, avgPrice: 385.2, sector: "Technology" },
  { stock: "JPM", quantity: 45, avgPrice: 155.0, sector: "Financials" },
  { stock: "JNJ", quantity: 35, avgPrice: 162.4, sector: "Healthcare" },
  { stock: "XOM", quantity: 60, avgPrice: 102.8, sector: "Energy" },
  { stock: "PG", quantity: 40, avgPrice: 148.5, sector: "Consumer Staples" },
  { stock: "AMZN", quantity: 25, avgPrice: 145.2, sector: "Consumer Discretionary" },
];

const DEMO_CONCENTRATED: Omit<Holding, "currentPrice" | "totalValue" | "costBasis" | "pnl" | "pnlPercent">[] = [
  { stock: "NVDA", quantity: 120, avgPrice: 420.0, sector: "Technology" },
  { stock: "AMD", quantity: 80, avgPrice: 112.5, sector: "Technology" },
  { stock: "TSLA", quantity: 70, avgPrice: 235.8, sector: "Consumer Discretionary" },
  { stock: "MSFT", quantity: 15, avgPrice: 405.0, sector: "Technology" },
];

// Helper to simulate live market data relative to average purchase price
const generateLiveStats = (holdingsRaw: typeof DEMO_BALANCED): Holding[] => {
  return holdingsRaw.map((h) => {
    // Generate a current price that is realistic (some gains, some losses)
    // Seed using stock string length to make it semi-deterministic for same stocks
    const seed = h.stock.charCodeAt(0) + h.stock.charCodeAt(h.stock.length - 1);
    const priceChangePct = ((seed % 35) - 12) / 100; // between -12% and +22%
    const currentPrice = Number((h.avgPrice * (1 + priceChangePct)).toFixed(2));
    
    const costBasis = Number((h.quantity * h.avgPrice).toFixed(2));
    const totalValue = Number((h.quantity * currentPrice).toFixed(2));
    const pnl = Number((totalValue - costBasis).toFixed(2));
    const pnlPercent = costBasis > 0 ? Number(((pnl / costBasis) * 100).toFixed(2)) : 0;

    return {
      ...h,
      currentPrice,
      totalValue,
      costBasis,
      pnl,
      pnlPercent,
    };
  });
};

export default function Landing({ onPortfolioLoaded }: LandingProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const parseCSVText = (text: string) => {
    try {
      const lines = text.split(/\r?\n/);
      if (lines.length <= 1) {
        throw new Error("CSV file seems to be empty or lacks header fields.");
      }

      // Read headers
      const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
      
      const idxStock = headers.findIndex((h) => /stock|ticker|symbol/i.test(h));
      const idxQuantity = headers.findIndex((h) => /quantity|qty|shares/i.test(h));
      const idxAvgPrice = headers.findIndex((h) => /avgprice|avg price|average price|price/i.test(h));
      const idxSector = headers.findIndex((h) => /sector|industry/i.test(h));

      if (idxStock === -1 || idxQuantity === -1 || idxAvgPrice === -1 || idxSector === -1) {
        throw new Error(
          "Required columns missing. Please ensure your CSV includes headers for: Stock, Quantity, AvgPrice, Sector."
        );
      }

      const rawHoldings: Omit<Holding, "currentPrice" | "totalValue" | "costBasis" | "pnl" | "pnlPercent">[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV split (handles values without commas inside quotes)
        const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
        
        if (cols.length < Math.max(idxStock, idxQuantity, idxAvgPrice, idxSector) + 1) {
          continue; // skip incomplete rows
        }

        const stock = cols[idxStock].toUpperCase();
        const quantity = parseFloat(cols[idxQuantity]);
        const avgPrice = parseFloat(cols[idxAvgPrice]);
        const sector = cols[idxSector];

        if (!stock || isNaN(quantity) || isNaN(avgPrice) || !sector) {
          continue; // skip invalid data rows
        }

        rawHoldings.push({
          stock,
          quantity,
          avgPrice,
          sector,
        });
      }

      if (rawHoldings.length === 0) {
        throw new Error("No valid holdings records could be parsed from the CSV.");
      }

      const holdings = generateLiveStats(rawHoldings);
      onPortfolioLoaded(holdings);
    } catch (err: unknown) {
      setError((err as Error).message || "An unexpected error occurred parsing the CSV.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        setError("Only CSV file formats are supported.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseCSVText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseCSVText(text);
      };
      reader.readAsText(file);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -z-10 animate-pulse-glow" style={{ animationDelay: "1s" }} />

      <div className="max-w-3xl w-full text-center space-y-12">
        {/* Logo and Brand */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-white/5 bg-white/[0.02] text-indigo-400 text-sm font-medium mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            Introducing Berrywise Portfolio IQ
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl font-bold tracking-tight text-white leading-tight"
          >
            AI-Native Portfolio <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Intelligence Workspace
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-lg max-w-xl mx-auto"
          >
            Upload your portfolio to unlock instant institution-grade risk analysis, sector breakdowns, and custom AI-powered rebalancing strategies.
          </motion.p>
        </div>

        {/* Upload Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-xl mx-auto"
        >
          <div
            className={`glass-panel p-8 rounded-2xl relative transition-all duration-300 border-dashed ${
              dragActive ? "border-indigo-500 bg-indigo-950/20 scale-[1.01]" : "border-white/10"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/25">
                <Upload className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <p className="text-white font-medium text-lg">
                  Drag & drop your portfolio CSV file
                </p>
                <p className="text-slate-400 text-sm">
                  or <span onClick={onButtonClick} className="text-indigo-400 hover:text-indigo-300 underline cursor-pointer font-medium">browse your files</span>
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Stock, Quantity, AvgPrice, Sector</span>
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-lg text-sm text-left"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Demo Portfolios Panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4 max-w-xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="h-[1px] bg-white/10 w-16" />
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Or explore demo data
            </span>
            <span className="h-[1px] bg-white/10 w-16" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onPortfolioLoaded(generateLiveStats(DEMO_BALANCED))}
              className="flex items-center justify-between px-5 py-4 rounded-xl glass-panel glass-panel-hover text-left border-white/5 group bg-white/[0.01]"
            >
              <div className="space-y-0.5">
                <div className="text-white font-medium text-sm group-hover:text-indigo-300 transition-colors">
                  Balanced Core Portfolio
                </div>
                <div className="text-slate-500 text-xs">
                  7 holdings • 4 distinct sectors
                </div>
              </div>
              <Play className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onPortfolioLoaded(generateLiveStats(DEMO_CONCENTRATED))}
              className="flex items-center justify-between px-5 py-4 rounded-xl glass-panel glass-panel-hover text-left border-white/5 group bg-white/[0.01]"
            >
              <div className="space-y-0.5">
                <div className="text-white font-medium text-sm group-hover:text-violet-300 transition-colors">
                  Concentrated Tech Focus
                </div>
                <div className="text-slate-500 text-xs">
                  4 holdings • 2 sectors
                </div>
              </div>
              <Play className="w-4 h-4 text-violet-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Disclaimer footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-slate-600 text-xs max-w-lg mx-auto flex items-start gap-2 bg-white/[0.01] border border-white/[0.03] p-3 rounded-lg text-left"
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
          <span>
            <strong>Disclaimer:</strong> Berrywise is an educational software product. All analytics, insights, and AI suggestions generated are simulated and do not constitute financial, investment, legal, or tax advice. Past performance is not indicative of future returns.
          </span>
        </motion.div>
      </div>
    </div>
  );
}
