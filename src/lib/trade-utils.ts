// Forex trade calculation utilities

const JPY_PAIRS = ["USDJPY", "EURJPY", "GBPJPY", "AUDJPY", "NZDJPY", "CADJPY", "CHFJPY"];

export function getPipSize(pair: string): number {
  const normalized = pair.replace(/[^A-Z]/g, "").toUpperCase();
  if (normalized === "XAUUSD" || normalized === "GOLD") return 0.1;
  if (normalized === "BTCUSD" || normalized === "ETHUSD") return 1;
  return JPY_PAIRS.includes(normalized) ? 0.01 : 0.0001;
}

/**
 * Approximate USD pip value per 1.0 standard lot.
 * Standard model — assumes USD account, ignores cross-rate fluctuations.
 * - Non-JPY USD-quoted majors (EURUSD, GBPUSD…): $10/pip per 1.0 lot
 * - JPY pairs: ~$9.30/pip per 1.0 lot (varies with USDJPY rate)
 * - XAUUSD: $10 per $1 move per 1.0 lot (so $1/pip at 0.1 increments)
 * - BTCUSD: $1/pip per 1.0 lot (rough)
 */
export function getPipValuePerLot(pair: string): number {
  const normalized = pair.replace(/[^A-Z]/g, "").toUpperCase();
  if (normalized === "XAUUSD" || normalized === "GOLD") return 10;
  if (normalized === "BTCUSD") return 1;
  if (normalized === "ETHUSD") return 1;
  if (JPY_PAIRS.includes(normalized)) return 9.3;
  return 10;
}

/**
 * Calculate dollar P/L from lot size + pip movement.
 * pnl = pips * lotSize * pipValuePerLot
 */
export function calculatePnl(params: {
  pair: string;
  side: "buy" | "sell";
  entry: number;
  exit: number;
  lotSize: number;
}): number {
  const { pair, side, entry, exit, lotSize } = params;
  if (!entry || !exit || !lotSize) return 0;
  const pips = calculatePips({ pair, side, entry, exit });
  const pipValue = getPipValuePerLot(pair);
  return Math.round(pips * lotSize * pipValue * 100) / 100;
}

/**
 * Auto-detect outcome from entry/exit/side without needing P/L typed.
 */
export function detectOutcome(params: {
  side: "buy" | "sell";
  entry: number;
  exit: number;
}): "profit" | "loss" | "breakeven" {
  const { side, entry, exit } = params;
  if (!entry || !exit) return "breakeven";
  const diff = side === "buy" ? exit - entry : entry - exit;
  if (Math.abs(diff) < 1e-9) return "breakeven";
  return diff > 0 ? "profit" : "loss";
}

export function calculatePips(params: {
  pair: string;
  side: "buy" | "sell";
  entry: number;
  exit: number;
}): number {
  const { pair, side, entry, exit } = params;
  if (!entry || !exit) return 0;
  const pipSize = getPipSize(pair);
  const diff = side === "buy" ? exit - entry : entry - exit;
  return Math.round((diff / pipSize) * 10) / 10;
}

export function calculateRR(params: {
  entry: number;
  stopLoss?: number | null;
  takeProfit?: number | null;
  side: "buy" | "sell";
}): number | null {
  const { entry, stopLoss, takeProfit, side } = params;
  if (!entry || !stopLoss || !takeProfit) return null;
  const risk = side === "buy" ? entry - stopLoss : stopLoss - entry;
  const reward = side === "buy" ? takeProfit - entry : entry - takeProfit;
  if (risk <= 0) return null;
  return Math.round((reward / risk) * 100) / 100;
}

export function determineResult(pnl: number | null | undefined): "win" | "loss" | "breakeven" | "open" {
  if (pnl === null || pnl === undefined) return "open";
  if (pnl > 0.01) return "win";
  if (pnl < -0.01) return "loss";
  return "breakeven";
}

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPips(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} pips`;
}

export const POPULAR_PAIRS = [
  "EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF", "NZDUSD",
  "EURJPY", "GBPJPY", "EURGBP", "AUDJPY", "EURAUD", "GBPAUD", "XAUUSD", "BTCUSD",
];

export const STRATEGIES = [
  "Breakout", "Trend Following", "Reversal", "Range", "News", "Scalp",
  "Swing", "Order Block", "Supply/Demand", "ICT", "SMC", "Other",
];

export const EMOTIONS = [
  "Calm", "Confident", "Excited", "Fearful", "Greedy", "Anxious",
  "Frustrated", "Patient", "Disciplined", "Impulsive", "Tired",
];

export const COMMON_MISTAKES = [
  "FOMO entry",
  "No stop loss",
  "Moved stop loss",
  "Risked too much",
  "Overtraded",
  "Revenge trade",
  "Ignored plan",
  "Closed too early",
  "Held too long",
  "No setup confirmation",
];
