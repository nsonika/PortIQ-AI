export interface Holding {
  stock: string;
  quantity: number;
  avgPrice: number;
  sector: string;
  currentPrice: number;
  totalValue: number;
  costBasis: number;
  pnl: number;
  pnlPercent: number;
}

export interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPercent: number;
  holdingsCount: number;
  largestHolding: {
    stock: string;
    value: number;
    percentage: number;
  };
  concentrationRisk: 'Low' | 'Medium' | 'High';
  healthScore: number;
}

export interface AIAnalysis {
  diversificationScore: number; // 0-100
  diversificationText: string;
  sectorExposureRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  sectorExposureText: string;
  riskWarnings: string[];
  rebalancingSuggestions: string[];
  summary: string;
  demoMode?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
