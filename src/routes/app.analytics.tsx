import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/trade-utils";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Flame,
  BookOpen,
  Activity,
  Percent,
  Scale,
  Target,
  Sparkles,
  ArrowDownRight,
  Award,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { format, parseISO, startOfMonth, startOfYear, subDays } from "date-fns";

type RangeKey = "7d" | "30d" | "90d" | "ytd" | "all";

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
  { key: "ytd", label: "YTD" },
  { key: "all", label: "All" },
];

function getRangeStart(range: RangeKey): Date | null {
  const now = new Date();
  switch (range) {
    case "7d": return subDays(now, 7);
    case "30d": return subDays(now, 30);
    case "90d": return subDays(now, 90);
    case "ytd": return startOfYear(now);
    case "all": return null;
  }
}

export const Route = createFileRoute("/app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — PipLog" }] }),
  component: AnalyticsPage,
});

interface TradeRow {
  id: string;
  pair: string;
  pnl: number | null;
  pips: number | null;
  rr_ratio: number | null;
  result: string | null;
  session: string | null;
  mistakes: string[] | null;
  opened_at: string;
  side?: string | null;
}

interface JournalRow {
  id: string;
  title: string;
  content: string;
  entry_date: string;
}

const STARTING_BALANCE = 10000;


function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

const PROFIT = "oklch(0.72 0.18 152)";
const LOSS = "oklch(0.65 0.22 25)";
const PRIMARY = "oklch(0.65 0.18 256)";
const MUTED_GRID = "oklch(0.3 0.025 258)";
const TOOLTIP_BG = "oklch(0.22 0.035 258)";
const TEXT_MUTED = "oklch(0.72 0.02 256)";

const SESSION_COLORS: Record<string, string> = {
  asia: "oklch(0.7 0.15 50)",
  london: "oklch(0.65 0.18 256)",
  "new york": "oklch(0.7 0.18 320)",
  newyork: "oklch(0.7 0.18 320)",
  other: "oklch(0.55 0.04 258)",
};

function AnalyticsPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [latestNote, setLatestNote] = useState<JournalRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeKey>("30d");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data }, { data: notes }] = await Promise.all([
        supabase
          .from("trades")
          .select(
            "id, pair, pnl, pips, rr_ratio, result, session, mistakes, opened_at, side",
          )
          .order("opened_at", { ascending: true }),
        supabase
          .from("journal_entries")
          .select("id, title, content, entry_date")
          .order("entry_date", { ascending: false })
          .limit(1),
      ]);
      setTrades((data as TradeRow[]) ?? []);
      setLatestNote((notes?.[0] as JournalRow) ?? null);
      setLoading(false);
    })();
  }, [user]);

  const filteredTrades = useMemo(() => {
    const start = getRangeStart(range);
    if (!start) return trades;
    const startMs = start.getTime();
    return trades.filter((t) => new Date(t.opened_at).getTime() >= startMs);
  }, [trades, range]);

  const analytics = useMemo(() => {
    const closed = filteredTrades.filter((t) => t.result && t.result !== "open");

    // Monthly P&L
    const monthlyMap = new Map<string, number>();
    filteredTrades.forEach((t) => {
      const key = format(startOfMonth(parseISO(t.opened_at)), "yyyy-MM");
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + (Number(t.pnl) || 0));
    });
    const monthly = [...monthlyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({
        month: format(parseISO(`${k}-01`), "MMM yy"),
        pnl: Math.round(v * 100) / 100,
      }));

    // Win rate by pair
    const pairMap = new Map<string, { wins: number; total: number; pnl: number }>();
    closed.forEach((t) => {
      const cur = pairMap.get(t.pair) ?? { wins: 0, total: 0, pnl: 0 };
      cur.total += 1;
      if (t.result === "win") cur.wins += 1;
      cur.pnl += Number(t.pnl) || 0;
      pairMap.set(t.pair, cur);
    });
    const pairStats = [...pairMap.entries()]
      .map(([pair, v]) => ({
        pair,
        winRate: Math.round((v.wins / v.total) * 100),
        total: v.total,
        pnl: Math.round(v.pnl * 100) / 100,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);

    // Session performance
    const sessionMap = new Map<string, { pnl: number; count: number }>();
    filteredTrades.forEach((t) => {
      const k = (t.session ?? "other").toLowerCase();
      const cur = sessionMap.get(k) ?? { pnl: 0, count: 0 };
      cur.pnl += Number(t.pnl) || 0;
      cur.count += 1;
      sessionMap.set(k, cur);
    });
    const sessions = [...sessionMap.entries()].map(([name, v]) => ({
      name: name.replace("_", " "),
      pnl: Math.round(v.pnl * 100) / 100,
      count: v.count,
    }));

    // RR distribution
    const rrBuckets = [
      { label: "<1", min: -Infinity, max: 1, count: 0 },
      { label: "1-2", min: 1, max: 2, count: 0 },
      { label: "2-3", min: 2, max: 3, count: 0 },
      { label: "3-5", min: 3, max: 5, count: 0 },
      { label: "5+", min: 5, max: Infinity, count: 0 },
    ];
    filteredTrades.forEach((t) => {
      const rr = Number(t.rr_ratio);
      if (!rr) return;
      const b = rrBuckets.find((x) => rr >= x.min && rr < x.max);
      if (b) b.count += 1;
    });
    const rrDist = rrBuckets.map((b) => ({ range: b.label, count: b.count }));

    // Wins vs losses (pie)
    const wins = closed.filter((t) => t.result === "win").length;
    const losses = closed.filter((t) => t.result === "loss").length;
    const breakeven = closed.filter((t) => t.result === "breakeven").length;
    const wlPie = [
      { name: "Wins", value: wins, color: PROFIT },
      { name: "Losses", value: losses, color: LOSS },
      ...(breakeven ? [{ name: "BE", value: breakeven, color: TEXT_MUTED }] : []),
    ];

    // Mistake frequency
    const mistakeMap = new Map<string, number>();
    filteredTrades.forEach((t) => {
      (t.mistakes ?? []).forEach((m) => {
        if (!m) return;
        mistakeMap.set(m, (mistakeMap.get(m) ?? 0) + 1);
      });
    });
    const mistakes = [...mistakeMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Streak history — sequential streaks with sign
    const streaks: { idx: number; length: number; type: "win" | "loss" }[] = [];
    let cur: { type: "win" | "loss"; length: number } | null = null;
    closed.forEach((t) => {
      if (t.result === "breakeven") return;
      const r = t.result as "win" | "loss";
      if (!cur || cur.type !== r) {
        if (cur) streaks.push({ idx: streaks.length + 1, length: cur.length, type: cur.type });
        cur = { type: r, length: 1 };
      } else {
        cur.length += 1;
      }
    });
    if (cur) streaks.push({ idx: streaks.length + 1, length: (cur as { type: "win" | "loss"; length: number }).length, type: (cur as { type: "win" | "loss"; length: number }).type });
    const streakChart = streaks.map((s) => ({
      idx: s.idx,
      value: s.type === "win" ? s.length : -s.length,
    }));

    // Insights
    const bestPair = pairStats.slice().sort((a, b) => b.pnl - a.pnl)[0];
    const worstMistake = mistakes[0];
    const bestSession = sessions.slice().sort((a, b) => b.pnl - a.pnl)[0];

    return {
      monthly,
      pairStats,
      sessions,
      rrDist,
      wlPie,
      mistakes,
      streakChart,
      bestPair,
      worstMistake,
      bestSession,
      hasData: filteredTrades.length > 0,
      totalAll: trades.length,
    };
  }, [filteredTrades, trades.length]);

  // Overview-only metrics (moved from home page) — based on ALL trades
  const summary = useMemo(() => {
    const closed = trades.filter((t) => t.result && t.result !== "open");
    const wins = closed.filter((t) => t.result === "win");
    const losses = closed.filter((t) => t.result === "loss");
    const netPnl = trades.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
    const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;
    const rrTrades = closed.filter((t) => t.rr_ratio);
    const avgRR = rrTrades.length
      ? rrTrades.reduce((s, t) => s + Number(t.rr_ratio), 0) / rrTrades.length
      : 0;
    const avgWin = wins.length
      ? wins.reduce((s, t) => s + Number(t.pnl || 0), 0) / wins.length
      : 0;
    const avgLoss = losses.length
      ? losses.reduce((s, t) => s + Number(t.pnl || 0), 0) / losses.length
      : 0;
    const grossProfit = wins.reduce((s, t) => s + Number(t.pnl || 0), 0);
    const grossLoss = Math.abs(
      losses.reduce((s, t) => s + Number(t.pnl || 0), 0),
    );
    const profitFactor =
      grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    const expectancy =
      (winRate / 100) * avgWin + ((100 - winRate) / 100) * avgLoss;

    let running = STARTING_BALANCE;
    let peak = STARTING_BALANCE;
    let maxDD = 0;
    trades.forEach((t) => {
      running += Number(t.pnl) || 0;
      peak = Math.max(peak, running);
      const dd = ((running - peak) / peak) * 100;
      if (dd < maxDD) maxDD = dd;
    });

    let streak = 0;
    let streakType: "win" | "loss" | null = null;
    for (let i = closed.length - 1; i >= 0; i--) {
      const r = closed[i].result as "win" | "loss" | "breakeven";
      if (r === "breakeven") continue;
      if (streakType === null) streakType = r;
      if (r === streakType) streak++;
      else break;
    }

    const recent = [...trades]
      .filter((t) => t.result && t.result !== "open")
      .sort(
        (a, b) =>
          new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime(),
      )
      .slice(0, 4);

    // Achievements
    const dayPnl = new Map<string, number>();
    trades.forEach((t) => {
      const k = new Date(t.opened_at).toDateString();
      dayPnl.set(k, (dayPnl.get(k) ?? 0) + (Number(t.pnl) || 0));
    });
    const winningDays = [...dayPnl.values()].filter((v) => v > 0).length;
    const weekMap = new Map<string, number>();
    trades.forEach((t) => {
      const w = startOfWeek(new Date(t.opened_at)).toDateString();
      weekMap.set(w, (weekMap.get(w) ?? 0) + (Number(t.pnl) || 0));
    });
    const bestWeek = Math.max(0, ...weekMap.values());
    const achievements = [
      {
        icon: "🔥",
        label: `${winningDays} Winning Days`,
        unlocked: winningDays >= 1,
      },
      {
        icon: "🏆",
        label: `Best Week ${formatCurrency(bestWeek)}`,
        unlocked: bestWeek > 0,
      },
      {
        icon: "🎯",
        label: `${winRate.toFixed(0)}% Win Rate`,
        unlocked: winRate >= 60 && closed.length >= 5,
      },
      {
        icon: "⭐",
        label: `${trades.length} Trades Logged`,
        unlocked: trades.length >= 10,
      },
    ];

    return {
      total: trades.length,
      netPnl,
      winRate,
      avgRR,
      avgWin,
      avgLoss,
      profitFactor,
      expectancy,
      maxDD,
      streak,
      streakType,
      recent,
      achievements,
    };
  }, [trades]);

  if (loading) {
    return (
      <div className="px-5 pt-8">
        <p className="text-sm text-muted-foreground">Loading analytics…</p>
      </div>
    );
  }

  if (analytics.totalAll === 0) {
    return (
      <div className="px-5 pt-8">
        <header>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ letterSpacing: "-0.025em" }}>
            Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Deep performance insights.</p>
        </header>
        <div className="surface-card mt-8 flex flex-col items-center rounded-3xl p-8 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-primary-foreground shadow-[var(--shadow-glow-primary)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <BarChart3 className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-xl font-extrabold tracking-tight">No data yet</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Log a few trades to unlock charts: monthly P&L, win rate by pair, session performance, RR distribution,
            mistakes & streaks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-4">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ letterSpacing: "-0.025em" }}>
          Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Deep performance insights from your trade data.</p>
      </header>

      {/* Quick Actions & Market Overview now live on the Home tab */}

      {/* ===== RECENT TRADES ===== */}
      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight">Recent Trades</h2>
          <Link to="/app/trades" className="text-xs font-semibold text-primary">
            See all →
          </Link>
        </div>
        {summary.recent.length === 0 ? (
          <div className="rounded-2xl glass p-6 text-center text-sm text-muted-foreground">
            No closed trades yet.
          </div>
        ) : (
          <div className="space-y-2">
            {summary.recent.map((t) => {
              const win = (Number(t.pnl) || 0) >= 0;
              return (
                <Link
                  key={t.id}
                  to="/app/trades/$tradeId"
                  params={{ tradeId: t.id }}
                  className="flex items-center gap-3 rounded-2xl border border-border p-3 transition active:scale-[0.98]"
                  style={{
                    background: win
                      ? "linear-gradient(135deg, oklch(0.72 0.18 145 / 0.08), oklch(0.22 0.035 258 / 0.6))"
                      : "linear-gradient(135deg, oklch(0.65 0.22 25 / 0.08), oklch(0.22 0.035 258 / 0.6))",
                  }}
                >
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[10px] font-extrabold ${
                      (t.side ?? "").toLowerCase() === "sell"
                        ? "bg-loss/20 text-loss"
                        : "bg-profit/20 text-profit"
                    }`}
                  >
                    {(t.side ?? "BUY").toUpperCase().slice(0, 4)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-extrabold tracking-tight">
                        {t.pair}
                      </p>
                      <p
                        className={`shrink-0 text-sm font-extrabold ${
                          win ? "text-profit" : "text-loss"
                        }`}
                      >
                        {formatCurrency(Number(t.pnl) || 0)}
                      </p>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <span className="truncate">
                        {new Date(t.opened_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        {t.pips != null
                          ? ` · ${t.pips > 0 ? "+" : ""}${Number(t.pips).toFixed(1)} pips`
                          : ""}
                      </span>
                      {t.rr_ratio ? (
                        <span className="shrink-0 font-semibold">
                          RR 1:{Number(t.rr_ratio).toFixed(2)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== PERFORMANCE METRICS ===== */}
      <section className="mt-5">
        <h2 className="mb-2 text-sm font-bold tracking-tight">
          Performance Metrics
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <MetricTile icon={Activity} label="Trades" value={String(summary.total)} />
          <MetricTile icon={Percent} label="Win Rate" value={`${summary.winRate.toFixed(0)}%`} />
          <MetricTile icon={Scale} label="Avg RR" value={summary.avgRR ? `1:${summary.avgRR.toFixed(2)}` : "—"} />
          <MetricTile icon={Target} label="Profit Factor" value={isFinite(summary.profitFactor) ? summary.profitFactor.toFixed(2) : "∞"} />
          <MetricTile icon={Sparkles} label="Expectancy" value={formatCurrency(summary.expectancy || 0)} />
          <MetricTile icon={TrendingUp} label="Avg Win" value={formatCurrency(summary.avgWin || 0)} tone="good" />
          <MetricTile icon={TrendingDown} label="Avg Loss" value={formatCurrency(summary.avgLoss || 0)} tone="bad" />
          <MetricTile icon={ArrowDownRight} label="Max DD" value={`${summary.maxDD.toFixed(1)}%`} tone="bad" />
          <MetricTile icon={Flame} label={summary.streakType === "loss" ? "Loss Streak" : "Win Streak"} value={String(summary.streak)} tone={summary.streakType === "loss" ? "bad" : "good"} />
        </div>
      </section>

      {/* ===== JOURNAL PREVIEW ===== */}
      <section className="mt-5 rounded-3xl glass p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold tracking-tight">
            <BookOpen className="h-4 w-4 text-primary" />
            Latest Note
          </h2>
          <Link to="/app/journal" className="text-xs font-semibold text-primary">
            View all →
          </Link>
        </div>
        {latestNote ? (
          <>
            <p className="text-sm font-semibold tracking-tight">{latestNote.title}</p>
            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              {latestNote.content || "No content yet."}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              {new Date(latestNote.entry_date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">No journal entries yet.</p>
        )}
      </section>

      {/* ===== ACHIEVEMENTS ===== */}
      <section className="mt-5">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold tracking-tight">
          <Award className="h-4 w-4 text-primary" />
          Achievements
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {summary.achievements.map((a, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-2xl border p-3 transition ${
                a.unlocked
                  ? "border-primary/30 bg-primary/5 shadow-[0_0_24px_-12px_oklch(0.65_0.18_256/0.6)]"
                  : "border-border bg-input/30 opacity-60"
              }`}
            >
              <span className="text-xl">{a.icon}</span>
              <span className="text-[11px] font-semibold leading-tight">{a.label}</span>
            </div>
          ))}
        </div>
      </section>

      <h2 className="mt-7 mb-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Deep Insights
      </h2>

      {/* Range filter */}
      <div className="scrollbar-none mt-5 -mx-5 flex gap-2 overflow-x-auto px-5">
        {RANGE_OPTIONS.map((opt) => {
          const active = range === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setRange(opt.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                active
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow-primary)]"
                  : "surface-card text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={active}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {!analytics.hasData && (
        <div className="surface-card mt-4 rounded-2xl p-5 text-center">
          <p className="text-sm font-medium">No trades in this range</p>
          <p className="mt-1 text-xs text-muted-foreground">Try a longer window to see your stats.</p>
        </div>
      )}
      {/* Insights */}
      <section className="mt-6 grid grid-cols-3 gap-2">
        <InsightCard
          icon={TrendingUp}
          label="Top Pair"
          value={analytics.bestPair?.pair ?? "—"}
          sub={analytics.bestPair ? formatCurrency(analytics.bestPair.pnl) : undefined}
          tone={analytics.bestPair && analytics.bestPair.pnl >= 0 ? "success" : "muted"}
        />
        <InsightCard
          icon={Flame}
          label="Best Session"
          value={analytics.bestSession ? analytics.bestSession.name : "—"}
          sub={analytics.bestSession ? formatCurrency(analytics.bestSession.pnl) : undefined}
          tone={analytics.bestSession && analytics.bestSession.pnl >= 0 ? "success" : "muted"}
          capitalize
        />
        <InsightCard
          icon={AlertTriangle}
          label="Top Mistake"
          value={analytics.worstMistake?.name ?? "None"}
          sub={analytics.worstMistake ? `${analytics.worstMistake.count}×` : undefined}
          tone={analytics.worstMistake ? "danger" : "muted"}
        />
      </section>

      {/* Monthly P&L */}
      <ChartCard title="Monthly P&L" subtitle="Profit and loss per calendar month">
        {analytics.monthly.length > 0 ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.monthly} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid stroke={MUTED_GRID} strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "oklch(0.3 0.025 258 / 0.3)" }}
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: TEXT_MUTED }}
                  formatter={(v) => [formatCurrency(Number(v)), "P&L"]}
                />
                <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                  {analytics.monthly.map((d, i) => (
                    <Cell key={i} fill={d.pnl >= 0 ? PROFIT : LOSS} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart text="No monthly data yet" />
        )}
      </ChartCard>

      {/* Win rate by pair */}
      <ChartCard title="Win Rate by Pair" subtitle="Top traded pairs">
        {analytics.pairStats.length > 0 ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.pairStats}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke={MUTED_GRID} strokeDasharray="2 4" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="pair"
                  tick={{ fill: TEXT_MUTED, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                />
                <Tooltip
                  cursor={{ fill: "oklch(0.3 0.025 258 / 0.3)" }}
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: TEXT_MUTED }}
                  formatter={(v, _n, p) => [`${v}% (${p.payload.total} trades)`, "Win rate"]}
                />
                <Bar dataKey="winRate" radius={[0, 6, 6, 0]}>
                  {analytics.pairStats.map((d, i) => (
                    <Cell key={i} fill={d.winRate >= 50 ? PROFIT : d.winRate >= 35 ? PRIMARY : LOSS} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart text="No closed trades yet" />
        )}
      </ChartCard>

      {/* Session performance + Wins vs Losses */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <ChartCard title="Session Performance" subtitle="Net P&L by session" inline>
          {analytics.sessions.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.sessions} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke={MUTED_GRID} strokeDasharray="2 4" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: TEXT_MUTED, fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => String(v).charAt(0).toUpperCase() + String(v).slice(1)}
                  />
                  <YAxis tick={{ fill: TEXT_MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "oklch(0.3 0.025 258 / 0.3)" }}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: TEXT_MUTED, textTransform: "capitalize" }}
                    formatter={(v) => [formatCurrency(Number(v)), "P&L"]}
                  />
                  <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                    {analytics.sessions.map((d, i) => (
                      <Cell key={i} fill={SESSION_COLORS[d.name] ?? PRIMARY} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart text="No session data" />
          )}
        </ChartCard>

        <ChartCard title="Wins vs Losses" subtitle="Outcome distribution" inline>
          {analytics.wlPie.some((s) => s.value > 0) ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.wlPie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={36}
                    outerRadius={64}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {analytics.wlPie.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 11, color: TEXT_MUTED }}
                  />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: TEXT_MUTED }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart text="No closed trades" />
          )}
        </ChartCard>
      </div>

      {/* RR distribution */}
      <ChartCard title="RR Distribution" subtitle="How often each risk-reward range occurs">
        {analytics.rrDist.some((d) => d.count > 0) ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.rrDist} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={MUTED_GRID} strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="range" tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "oklch(0.3 0.025 258 / 0.3)" }}
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: TEXT_MUTED }}
                  formatter={(v) => [`${v} trades`, "Count"]}
                />
                <Bar dataKey="count" fill={PRIMARY} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart text="Add SL/TP to trades to see RR distribution" />
        )}
      </ChartCard>

      {/* Streak history */}
      <ChartCard title="Streak History" subtitle="Consecutive wins (up) vs losses (down)">
        {analytics.streakChart.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.streakChart} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={MUTED_GRID} strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="idx" tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: TEXT_MUTED, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "oklch(0.3 0.025 258 / 0.3)" }}
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: TEXT_MUTED }}
                  formatter={(v) => [`${Math.abs(Number(v))} ${Number(v) >= 0 ? "wins" : "losses"}`, "Streak"]}
                  labelFormatter={(l) => `Streak #${l}`}
                />
                <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                  {analytics.streakChart.map((d, i) => (
                    <Cell key={i} fill={d.value >= 0 ? PROFIT : LOSS} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart text="No streak history yet" />
        )}
      </ChartCard>

      {/* Mistake frequency */}
      <ChartCard title="Mistake Frequency" subtitle="Most common mistakes you've logged">
        {analytics.mistakes.length > 0 ? (
          <div className="space-y-2">
            {analytics.mistakes.map((m) => {
              const max = analytics.mistakes[0].count;
              const pct = Math.round((m.count / max) * 100);
              return (
                <div key={m.name}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{m.name}</span>
                    <span className="text-muted-foreground">{m.count}×</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-accent/40">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: "var(--gradient-primary)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyChart text="No mistakes logged — keep it up!" />
        )}
      </ChartCard>
    </div>
  );
}

const tooltipStyle = {
  background: TOOLTIP_BG,
  border: `1px solid ${MUTED_GRID}`,
  borderRadius: 12,
  fontSize: 12,
} as const;

function ChartCard({
  title,
  subtitle,
  children,
  inline,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  inline?: boolean;
}) {
  return (
    <section className={`surface-card rounded-3xl p-4 ${inline ? "" : "mt-4"}`}>
      <div className="mb-3">
        <h2 className="text-sm font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">{text}</div>
  );
}

function InsightCard({
  icon: Icon,
  label,
  value,
  sub,
  tone = "muted",
  capitalize,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  sub?: string;
  tone?: "success" | "danger" | "muted";
  capitalize?: boolean;
}) {
  const subColor =
    tone === "success" ? "text-profit" : tone === "danger" ? "text-loss" : "text-muted-foreground";
  return (
    <div className="surface-card rounded-2xl p-3">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-muted-foreground" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <p className={`mt-1.5 truncate text-sm font-bold ${capitalize ? "capitalize" : ""}`}>{value}</p>
      {sub && <p className={`text-[11px] font-medium ${subColor}`}>{sub}</p>}
    </div>
  );
}


function MetricTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  tone?: "good" | "bad";
}) {
  const color =
    tone === "good" ? "text-profit" : tone === "bad" ? "text-loss" : "text-foreground";
  return (
    <div className="rounded-2xl glass p-3 transition hover:border-primary/40">
      <Icon className={`h-4 w-4 ${color}`} strokeWidth={2.2} />
      <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-0.5 truncate text-sm font-extrabold ${color}`}>{value}</p>
    </div>
  );
}
