const JPY_PAIRS = ["USDJPY", "EURJPY", "GBPJPY", "AUDJPY", "NZDJPY", "CADJPY", "CHFJPY"];
function getPipSize(pair) {
  const normalized = pair.replace(/[^A-Z]/g, "").toUpperCase();
  if (normalized === "XAUUSD" || normalized === "GOLD") return 0.1;
  if (normalized === "BTCUSD" || normalized === "ETHUSD") return 1;
  return JPY_PAIRS.includes(normalized) ? 0.01 : 1e-4;
}
function getPipValuePerLot(pair) {
  const normalized = pair.replace(/[^A-Z]/g, "").toUpperCase();
  if (normalized === "XAUUSD" || normalized === "GOLD") return 10;
  if (normalized === "BTCUSD") return 1;
  if (normalized === "ETHUSD") return 1;
  if (JPY_PAIRS.includes(normalized)) return 9.3;
  return 10;
}
function calculatePnl(params) {
  const { pair, side, entry, exit, lotSize } = params;
  if (!entry || !exit || !lotSize) return 0;
  const pips = calculatePips({ pair, side, entry, exit });
  const pipValue = getPipValuePerLot(pair);
  return Math.round(pips * lotSize * pipValue * 100) / 100;
}
function detectOutcome(params) {
  const { side, entry, exit } = params;
  if (!entry || !exit) return "breakeven";
  const diff = side === "buy" ? exit - entry : entry - exit;
  if (Math.abs(diff) < 1e-9) return "breakeven";
  return diff > 0 ? "profit" : "loss";
}
function calculatePips(params) {
  const { pair, side, entry, exit } = params;
  if (!entry || !exit) return 0;
  const pipSize = getPipSize(pair);
  const diff = side === "buy" ? exit - entry : entry - exit;
  return Math.round(diff / pipSize * 10) / 10;
}
function calculateRR(params) {
  const { entry, stopLoss, takeProfit, side } = params;
  if (!entry || !stopLoss || !takeProfit) return null;
  const risk = side === "buy" ? entry - stopLoss : stopLoss - entry;
  const reward = side === "buy" ? takeProfit - entry : entry - takeProfit;
  if (risk <= 0) return null;
  return Math.round(reward / risk * 100) / 100;
}
function determineResult(pnl) {
  if (pnl === null || pnl === void 0) return "open";
  if (pnl > 0.01) return "win";
  if (pnl < -0.01) return "loss";
  return "breakeven";
}
function formatCurrency(value, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}
const POPULAR_PAIRS = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "AUDUSD",
  "USDCAD",
  "USDCHF",
  "NZDUSD",
  "EURJPY",
  "GBPJPY",
  "EURGBP",
  "AUDJPY",
  "EURAUD",
  "GBPAUD",
  "XAUUSD",
  "BTCUSD"
];
const STRATEGIES = [
  "Breakout",
  "Trend Following",
  "Reversal",
  "Range",
  "News",
  "Scalp",
  "Swing",
  "Order Block",
  "Supply/Demand",
  "ICT",
  "SMC",
  "Other"
];
const EMOTIONS = [
  "Calm",
  "Confident",
  "Excited",
  "Fearful",
  "Greedy",
  "Anxious",
  "Frustrated",
  "Patient",
  "Disciplined",
  "Impulsive",
  "Tired"
];
const COMMON_MISTAKES = [
  "FOMO entry",
  "No stop loss",
  "Moved stop loss",
  "Risked too much",
  "Overtraded",
  "Revenge trade",
  "Ignored plan",
  "Closed too early",
  "Held too long",
  "No setup confirmation"
];
export {
  COMMON_MISTAKES as C,
  EMOTIONS as E,
  POPULAR_PAIRS as P,
  STRATEGIES as S,
  calculatePips as a,
  detectOutcome as b,
  calculatePnl as c,
  determineResult as d,
  calculateRR as e,
  formatCurrency as f
};
