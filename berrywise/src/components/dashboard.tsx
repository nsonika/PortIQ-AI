"use client";

import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  Layers, 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Activity, 
  Search, 
  ArrowLeft,
  ArrowUpDown
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { Holding, PortfolioStats } from "@/types/portfolio";

interface DashboardProps {
  holdings: Holding[];
  stats: PortfolioStats;
  onBack: () => void;
}

const COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#ef4444", // Red
];

export default function Dashboard({ holdings, stats, onBack }: DashboardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"value" | "pnl" | "stock">("value");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Prevent hydration issues for Recharts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSort = (field: "value" | "pnl" | "stock") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Compute sector data for Pie Chart
  const sectorData = React.useMemo(() => {
    const sectors: Record<string, number> = {};
    holdings.forEach((h) => {
      sectors[h.sector] = (sectors[h.sector] || 0) + h.totalValue;
    });
    return Object.entries(sectors).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    }));
  }, [holdings]);

  // Compute holding values for Bar Chart
  const barChartData = React.useMemo(() => {
    return [...holdings]
      .sort((a, b) => b.totalValue - a.totalValue)
      .map((h) => ({
        name: h.stock,
        value: h.totalValue,
        pnl: h.pnl,
      }));
  }, [holdings]);

  // Filter and sort holdings
  const filteredHoldings = React.useMemo(() => {
    return holdings
      .filter(
        (h) =>
          h.stock.toLowerCase().includes(search.toLowerCase()) ||
          h.sector.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        let fieldA: string | number = a.totalValue;
        let fieldB: string | number = b.totalValue;

        if (sortBy === "pnl") {
          fieldA = a.pnlPercent;
          fieldB = b.pnlPercent;
        } else if (sortBy === "stock") {
          fieldA = a.stock;
          fieldB = b.stock;
        }

        if (fieldA < fieldB) return sortOrder === "asc" ? -1 : 1;
        if (fieldA > fieldB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [holdings, search, sortBy, sortOrder]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2 bg-white/5 px-2.5 py-1 rounded-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Upload
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight">Berrywise Workspace</h2>
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] uppercase font-bold tracking-wider">
              Live Feed
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Portfolio Value</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">
                ${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-sm font-semibold flex items-center ${
                stats.totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}>
                {stats.totalPnL >= 0 ? <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" />}
                {stats.totalPnL >= 0 ? "+" : ""}{stats.totalPnLPercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Cost */}
        <div className="glass-panel p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Cost Basis</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-white">
            ${stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-500">Total funds invested</p>
        </div>

        {/* Holdings Count */}
        <div className="glass-panel p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Holdings</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-white">{stats.holdingsCount}</p>
          <p className="text-[10px] text-slate-500">Distinct stock assets</p>
        </div>

        {/* Largest Holding */}
        <div className="glass-panel p-4 rounded-xl space-y-2 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Asset</span>
            <Percent className="w-4 h-4 text-violet-400" />
          </div>
          <p className="text-xl font-bold text-white truncate">{stats.largestHolding.stock}</p>
          <p className="text-[10px] text-slate-400">
            {stats.largestHolding.percentage.toFixed(1)}% of total portfolio
          </p>
        </div>

        {/* Concentration Risk */}
        <div className="glass-panel p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Risk Profile</span>
            <ShieldAlert className={`w-4 h-4 ${
              stats.concentrationRisk === "Low" ? "text-emerald-400" : stats.concentrationRisk === "Medium" ? "text-amber-400" : "text-rose-400"
            }`} />
          </div>
          <p className={`text-xl font-bold ${
            stats.concentrationRisk === "Low" ? "text-emerald-400" : stats.concentrationRisk === "Medium" ? "text-amber-400" : "text-rose-400"
          }`}>
            {stats.concentrationRisk}
          </p>
          <p className="text-[10px] text-slate-500">Based on sector weight bounds</p>
        </div>

        {/* Health Score */}
        <div className="glass-panel p-4 rounded-xl space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Health Score</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-white">{stats.healthScore}</p>
            <p className="text-xs text-slate-500">/100</p>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                stats.healthScore > 80 ? "bg-emerald-500" : stats.healthScore > 50 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${stats.healthScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Allocation Pie */}
        <div className="glass-panel p-5 rounded-xl flex flex-col h-[340px]">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Sector Allocation</h3>
          <div className="flex-1 w-full relative min-h-0">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.05)" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm">Loading Chart...</div>
            )}
            
            {/* Custom Legend inside HTML to save space */}
            <div className="absolute top-1/2 right-4 transform -translate-y-1/2 flex flex-col gap-1.5 max-h-[80%] overflow-y-auto pr-2">
              {sectorData.map((entry, index) => {
                const total = sectorData.reduce((sum, item) => sum + item.value, 0);
                const pct = ((entry.value / total) * 100).toFixed(1);
                return (
                  <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-slate-300 font-medium truncate max-w-[100px]">{entry.name}</span>
                    <span className="text-slate-500 font-mono">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Asset Value Distribution Bar */}
        <div className="glass-panel p-5 rounded-xl flex flex-col h-[340px]">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Holding Distribution ($ Value)</h3>
          <div className="flex-1 w-full min-h-0">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                  />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Bar dataKey="value" fill="url(#colorBarGradient)" radius={[4, 4, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} />
                    ))}
                    {/* SVG Linear Gradient for Bar Chart */}
                    <defs>
                      <linearGradient id="colorBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm">Loading Chart...</div>
            )}
          </div>
        </div>
      </div>

      {/* Holdings List Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Portfolio Assets</h3>
          
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets or sectors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5 cursor-pointer hover:text-white" onClick={() => handleSort("stock")}>
                  Stock <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="py-3 px-5">Sector</th>
                <th className="py-3 px-5 text-right">Qty</th>
                <th className="py-3 px-5 text-right">Avg Price</th>
                <th className="py-3 px-5 text-right">Current Price</th>
                <th className="py-3 px-5 text-right cursor-pointer hover:text-white" onClick={() => handleSort("value")}>
                  Total Value <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="py-3 px-5 text-right cursor-pointer hover:text-white" onClick={() => handleSort("pnl")}>
                  PnL (%) <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredHoldings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-sm">
                    No matching assets found in your portfolio.
                  </td>
                </tr>
              ) : (
                filteredHoldings.map((h) => (
                  <tr 
                    key={h.stock} 
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] text-sm transition-colors"
                  >
                    <td className="py-3.5 px-5 font-semibold text-white">{h.stock}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-slate-300">
                        {h.sector}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-slate-300">{h.quantity}</td>
                    <td className="py-3.5 px-5 text-right font-mono text-slate-300">${h.avgPrice.toFixed(2)}</td>
                    <td className="py-3.5 px-5 text-right font-mono text-slate-300">${h.currentPrice.toFixed(2)}</td>
                    <td className="py-3.5 px-5 text-right font-mono font-semibold text-white">
                      ${h.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3.5 px-5 text-right font-mono font-semibold ${
                      h.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      <span className="text-xs font-normal mr-1">
                        {h.pnl >= 0 ? "+" : ""}${h.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      ({h.pnl >= 0 ? "+" : ""}{h.pnlPercent.toFixed(1)}%)
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
