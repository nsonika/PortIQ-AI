"use client";

import React from "react";
import { 
  Sparkles, 
  ShieldAlert, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Activity
} from "lucide-react";
import { AIAnalysis } from "@/types/portfolio";

interface AIInsightsProps {
  analysis: AIAnalysis | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  demoMode?: boolean;
}

export default function AIInsights({ analysis, loading, error, onRetry, demoMode }: AIInsightsProps) {
  if (loading) {
    return (
      <div className="glass-panel p-6 rounded-xl space-y-6 animate-pulse">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <div className="w-5 h-5 bg-indigo-500/20 rounded" />
          <div className="h-5 bg-slate-700 w-40 rounded" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-slate-800/40 rounded-xl" />
          <div className="h-32 bg-slate-800/40 rounded-xl" />
        </div>

        <div className="space-y-3">
          <div className="h-4 bg-slate-800/50 w-24 rounded" />
          <div className="h-10 bg-slate-800/30 rounded" />
          <div className="h-10 bg-slate-800/30 rounded" />
        </div>

        <div className="space-y-3">
          <div className="h-4 bg-slate-800/50 w-32 rounded" />
          <div className="h-12 bg-slate-800/30 rounded" />
          <div className="h-12 bg-slate-800/30 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6 rounded-xl text-center space-y-4">
        <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 mx-auto">
          <AlertCircle className="w-6 h-6 text-rose-400" />
        </div>
        <div className="space-y-1.5 max-w-sm mx-auto">
          <h3 className="text-white font-semibold">Failed to Generate Insights</h3>
          <p className="text-slate-400 text-xs">{error}</p>
        </div>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="glass-panel p-8 rounded-xl text-center space-y-4">
        <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 mx-auto">
          <Sparkles className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="space-y-1.5 max-w-sm mx-auto">
          <h3 className="text-white font-semibold">AI Intelligence Offline</h3>
          <p className="text-slate-400 text-xs">
            Generate quantitative risk reports, warnings, and rebalancing recommendations.
          </p>
        </div>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-indigo-500/10 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Run AI Analysis
        </button>
      </div>
    );
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Excellent": return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
      case "Good": return "text-indigo-400 border-indigo-500/20 bg-indigo-500/5";
      case "Fair": return "text-amber-400 border-amber-500/20 bg-amber-500/5";
      case "Poor": return "text-rose-400 border-rose-500/20 bg-rose-500/5";
      default: return "text-slate-400 border-slate-500/20 bg-slate-500/5";
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl space-y-6 animate-in fade-in duration-500 relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -z-10" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white tracking-tight">AI Portfolio Intelligence</h3>
        </div>
        
        {demoMode && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold tracking-wider uppercase">
            Demo Mode
          </span>
        )}
      </div>

      {/* Score Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Diversification Score */}
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Diversification Score</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center shrink-0">
              {/* Outer ring */}
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="24" className="stroke-white/5 fill-transparent" strokeWidth="4" />
                <circle 
                  cx="28" 
                  cy="28" 
                  r="24" 
                  className="stroke-indigo-500 fill-transparent transition-all duration-1000" 
                  strokeWidth="4" 
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={2 * Math.PI * 24 * (1 - analysis.diversificationScore / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-sm font-bold text-white font-mono">{analysis.diversificationScore}</span>
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed">{analysis.diversificationText}</p>
          </div>
        </div>

        {/* Sector Exposure Rating */}
        <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Sector Concentration</span>
            <HelpCircle className="w-4 h-4 text-slate-500" />
          </div>

          <div className="flex items-center gap-4">
            <span className={`px-3 py-2 rounded-lg text-sm font-bold border ${getRatingColor(analysis.sectorExposureRating)} shrink-0`}>
              {analysis.sectorExposureRating}
            </span>
            <p className="text-slate-400 text-xs leading-relaxed">{analysis.sectorExposureText}</p>
          </div>
        </div>
      </div>

      {/* Summary statement */}
      {analysis.summary && (
        <p className="text-slate-300 text-xs italic bg-white/[0.01] border border-white/5 p-3 rounded-lg leading-relaxed">
          &ldquo;{analysis.summary}&rdquo;
        </p>
      )}

      {/* Risk Warnings */}
      {analysis.riskWarnings && analysis.riskWarnings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Risk Alerts</span>
          </div>
          
          <div className="space-y-2">
            {analysis.riskWarnings.map((w, index) => (
              <div 
                key={index}
                className="flex items-start gap-2.5 text-xs text-slate-300 bg-rose-500/5 border border-rose-500/10 p-3 rounded-lg leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5 animate-pulse" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rebalancing Suggestions */}
      {analysis.rebalancingSuggestions && analysis.rebalancingSuggestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tactical Adjustments</span>
          </div>
          
          <div className="space-y-2">
            {analysis.rebalancingSuggestions.map((s, index) => (
              <div 
                key={index}
                className="flex items-start gap-2.5 text-xs text-slate-300 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic footer disclaimer */}
      <div className="text-[10px] text-slate-600 border-t border-white/5 pt-3 leading-relaxed">
        Calculated using current asset weights, holding counts, and standard industry concentration ceilings. Deployed models do not substitute for certified financial advisory.
      </div>
    </div>
  );
}
