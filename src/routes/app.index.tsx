import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/trade-utils";
import {
  TrendingUp,
  TrendingDown,
  Menu,
  Settings,
  LogOut,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Plus,
  History,
  BarChart3,
  BookOpen,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PipLogLogo } from "@/components/brand/PipLogLogo";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — PipLog" }] }),
  component: DashboardPage,
});

interface TradeRow {
  id: string;
  pair: string;
  pnl: number | null;
  rr_ratio: number | null;
  result: string | null;
  session: string | null;
  opened_at: string;
}

const STARTING_BALANCE = 10000;

const QUOTES = [
  "Protect capital first. Profits follow.",
  "Discipline beats conviction.",
  "The market rewards patience.",
  "Risk less, win more.",
  "Plan the trade, trade the plan.",
];

const RANGES = [
  { id: "1D", days: 1 },
  { id: "1W", days: 7 },
  { id: "1M", days: 30 },
  { id: "3M", days: 90 },
  { id: "1Y", days: 365 },
  { id: "ALL", days: Infinity },
] as const;

const MOCK_MARKET = [
  { pair: "GBPUSD", change: 0.25 },
  { pair: "EURUSD", change: -0.12 },
  { pair: "USDJPY", change: 0.08 },
  { pair: "XAUUSD", change: 1.1 },
];

type RangeId = (typeof RANGES)[number]["id"];

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function DashboardPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [displayName, setDisplayName] = useState("Trader");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [range, setRange] = useState<RangeId>("1M");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: trs }, { data: prof }] = await Promise.all([
        supabase
          .from("trades")
          .select("id, pair, pnl, rr_ratio, result, session, opened_at")
          .order("opened_at", { ascending: true }),
        supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle(),
      ]);
      setTrades((trs as TradeRow[]) ?? []);
      setDisplayName(prof?.display_name ?? user.email?.split("@")[0] ?? "Trader");
      setAvatarUrl(prof?.avatar_url ?? null);
    })();
  }, [user]);

  const quote = useMemo(
    () => QUOTES[new Date().getDate() % QUOTES.length],
    [],
  );

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const metrics = useMemo(() => {
    const closed = trades.filter((t) => t.result && t.result !== "open");
    const wins = closed.filter((t) => t.result === "win");
    const losses = closed.filter((t) => t.result === "loss");
    const netPnl = trades.reduce((s, t) => s + (Number(t.pnl) || 0), 0);
    const balance = STARTING_BALANCE + netPnl;
    const growth = (netPnl / STARTING_BALANCE) * 100;
    const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;

    const now = new Date();
    const todayPnl = trades
      .filter((t) => sameDay(new Date(t.opened_at), now))
      .reduce((s, t) => s + (Number(t.pnl) || 0), 0);

    let running = STARTING_BALANCE;
    let peak = STARTING_BALANCE;
    let maxDD = 0;
    const curve = trades.map((t) => {
      running += Number(t.pnl) || 0;
      peak = Math.max(peak, running);
      const dd = ((running - peak) / peak) * 100;
      if (dd < maxDD) maxDD = dd;
      return {
        t: new Date(t.opened_at).getTime(),
        equity: Math.round(running * 100) / 100,
      };
    });
    const currentDD = ((running - peak) / peak) * 100;

    const rrTrades = closed.filter((t) => t.rr_ratio);
    const avgRR = rrTrades.length
      ? rrTrades.reduce((s, t) => s + Number(t.rr_ratio), 0) / rrTrades.length
      : 0;

    // streaks
    let streak = 0;
    let streakType: "win" | "loss" | null = null;
    for (let i = closed.length - 1; i >= 0; i--) {
      const r = closed[i].result as "win" | "loss" | "breakeven";
      if (r === "breakeven") continue;
      if (streakType === null) streakType = r;
      if (r === streakType) streak++;
      else break;
    }

    // sessions for insights
    const sessions: Record<string, number> = {
      london: 0,
      "new-york": 0,
      asia: 0,
    };
    trades.forEach((t) => {
      const k = (t.session ?? "").toLowerCase();
      if (k in sessions) sessions[k] += Number(t.pnl) || 0;
    });

    // best pair
    const byPair = new Map<string, { wins: number; total: number }>();
    closed.forEach((t) => {
      const e = byPair.get(t.pair) ?? { wins: 0, total: 0 };
      e.total += 1;
      if (t.result === "win") e.wins += 1;
      byPair.set(t.pair, e);
    });
    const bestPair = [...byPair.entries()].sort(
      (a, b) => b[1].wins / b[1].total - a[1].wins / a[1].total,
    )[0];

    const wkStart = startOfWeek(now);
    const weekTrades = trades.filter(
      (t) => new Date(t.opened_at) >= wkStart,
    );
    const weekPnl = weekTrades.reduce(
      (s, t) => s + (Number(t.pnl) || 0),
      0,
    );
    const weekDays = new Set(
      weekTrades.map((t) => new Date(t.opened_at).toDateString()),
    ).size;

    return {
      netPnl,
      balance,
      growth,
      todayPnl,
      curve,
      currentDD,
      maxDD,
      avgRR,
      winRate,
      closedCount: closed.length,
      streak,
      streakType,
      sessions,
      bestPair,
      weekPnl,
      weekDays,
    };
  }, [trades]);

  const filteredCurve = useMemo(() => {
    const days = RANGES.find((r) => r.id === range)!.days;
    if (!isFinite(days)) return metrics.curve;
    const cutoff = Date.now() - days * 86400000;
    return metrics.curve.filter((p) => p.t >= cutoff);
  }, [metrics.curve, range]);

  const insights = useMemo(() => {
    const out: { tone: "good" | "warn"; text: string }[] = [];
    const best = Object.entries(metrics.sessions).sort(
      (a, b) => b[1] - a[1],
    )[0];
    if (best && best[1] > 0) {
      const name =
        best[0] === "new-york"
          ? "New York"
          : best[0][0].toUpperCase() + best[0].slice(1);
      out.push({ tone: "good", text: `${name} session performing best` });
    }
    if (metrics.bestPair && metrics.bestPair[1].total >= 2) {
      const wr = (metrics.bestPair[1].wins / metrics.bestPair[1].total) * 100;
      out.push({
        tone: "good",
        text: `${metrics.bestPair[0]} top win rate (${wr.toFixed(0)}%)`,
      });
    }
    if (metrics.avgRR >= 1.5) {
      out.push({
        tone: "good",
        text: `Strong avg R:R of 1:${metrics.avgRR.toFixed(2)}`,
      });
    }
    if (metrics.streakType === "loss" && metrics.streak >= 3) {
      out.push({
        tone: "warn",
        text: `Consecutive losses: ${metrics.streak}`,
      });
    }
    if (metrics.currentDD <= -5) {
      out.push({
        tone: "warn",
        text: `Drawdown ${metrics.currentDD.toFixed(1)}% — reduce size`,
      });
    }
    if (
      metrics.winRate >= 60 &&
      metrics.closedCount >= 5
    ) {
      out.push({
        tone: "good",
        text: `Win rate ${metrics.winRate.toFixed(0)}% — keep discipline`,
      });
    }
    if (out.length === 0) {
      out.push({
        tone: "good",
        text: "Log more trades to unlock personalised insights",
      });
    }
    return out.slice(0, 3);
  }, [metrics]);

  const weeklyGoal = 500;
  const weeklyProgress = Math.max(
    0,
    Math.min(100, (metrics.weekPnl / weeklyGoal) * 100),
  );

  const firstName = displayName.split(" ")[0];

  return (
    <div className="px-4 pt-5">
      {/* ===== HEADER (hamburger only) ===== */}
      <header className="flex items-center justify-between gap-3">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-2xl glass transition active:scale-95"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-r border-border bg-card p-0">
            <SheetHeader className="p-5 pb-3">
              <SheetTitle className="sr-only">Account menu</SheetTitle>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary/15 text-primary">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-base font-extrabold">
                      {displayName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-left text-sm font-extrabold tracking-tight">
                    {displayName}
                  </p>
                  <p className="truncate text-left text-[11px] text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
            </SheetHeader>
            <div className="px-3 pb-5">
              <Link
                to="/app/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition hover:bg-accent"
              >
                <Settings className="h-4 w-4 text-primary" />
                Settings
              </Link>
              <button
                type="button"
                onClick={async () => {
                  setMenuOpen(false);
                  await supabase.auth.signOut();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-muted-foreground transition hover:bg-accent"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
            <div className="absolute bottom-5 left-0 right-0 flex justify-center">
              <PipLogLogo size={56} />
            </div>
          </SheetContent>
        </Sheet>

        <PipLogLogo size={40} />
      </header>

      {/* ===== GREETING TILE ===== */}
      <section className="mt-4 rounded-3xl glass p-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {today}
        </p>
        <h1
          className="mt-1 text-2xl font-extrabold tracking-tight"
          style={{ letterSpacing: "-0.025em" }}
        >
          {greeting},{" "}
          <span className="gradient-text">{firstName.toUpperCase()}</span>
        </h1>
        <p className="mt-2 flex items-center gap-1.5 text-xs italic text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="truncate">{quote}</span>
        </p>
      </section>

      {/* ===== MARKET OVERVIEW ===== */}
      <section className="mt-4 rounded-3xl glass p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight">Market Overview</h2>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Live
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {MOCK_MARKET.map((m) => {
            const up = m.change >= 0;
            return (
              <div
                key={m.pair}
                className="flex items-center justify-between rounded-xl bg-input/50 px-3 py-2.5"
              >
                <span className="text-xs font-bold tracking-tight">{m.pair}</span>
                <span
                  className={`flex items-center gap-1 text-xs font-semibold ${
                    up ? "text-profit" : "text-loss"
                  }`}
                >
                  {up ? "▲" : "▼"} {Math.abs(m.change).toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== ACCOUNT OVERVIEW ===== */}
      <section className="mt-4 overflow-hidden rounded-3xl glass p-5 shadow-[var(--shadow-elevated)]">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Account Balance
          </p>
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              metrics.growth >= 0
                ? "bg-profit/15 text-profit"
                : "bg-loss/15 text-loss"
            }`}
          >
            {metrics.growth >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {metrics.growth >= 0 ? "+" : ""}
            {metrics.growth.toFixed(2)}%
          </span>
        </div>
        <p
          className="mt-1 text-4xl font-extrabold tracking-tight"
          style={{ letterSpacing: "-0.03em" }}
        >
          {formatCurrency(metrics.balance)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Equity {formatCurrency(metrics.balance)}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatPill
            label="Net P/L"
            value={formatCurrency(metrics.netPnl)}
            tone={metrics.netPnl >= 0 ? "good" : "bad"}
          />
          <StatPill
            label="Today"
            value={formatCurrency(metrics.todayPnl)}
            tone={
              metrics.todayPnl > 0
                ? "good"
                : metrics.todayPnl < 0
                  ? "bad"
                  : "neutral"
            }
          />
          <StatPill
            label="Drawdown"
            value={`${metrics.currentDD.toFixed(1)}%`}
            tone={metrics.currentDD <= -5 ? "bad" : "neutral"}
          />
        </div>

        <div className="mt-5 flex gap-1 rounded-2xl bg-input/60 p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={`flex-1 rounded-xl px-2 py-1.5 text-[11px] font-bold transition ${
                range === r.id
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow-primary)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.id}
            </button>
          ))}
        </div>

        <div className="mt-4 h-40">
          {filteredCurve.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={filteredCurve}
                margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="eq-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="oklch(0.65 0.18 256)"
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="100%"
                      stopColor="oklch(0.65 0.18 256)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.22 0.035 258)",
                    border: "1px solid oklch(0.3 0.025 258)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "oklch(0.72 0.02 256)" }}
                  formatter={(v) => [formatCurrency(Number(v)), "Equity"]}
                  labelFormatter={(l) =>
                    new Date(Number(l)).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="oklch(0.65 0.18 256)"
                  strokeWidth={2.5}
                  fill="url(#eq-grad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center text-xs text-muted-foreground">
              Log trades to see your equity curve
            </div>
          )}
        </div>
      </section>

      {/* ===== QUICK ACTIONS ===== */}
      <section className="mt-4 grid grid-cols-4 gap-2">
        <QuickAction to="/app/add" icon={Plus} label="Add" primary />
        <QuickAction to="/app/trades" icon={History} label="History" />
        <QuickAction to="/app/calendar" icon={BarChart3} label="Calendar" />
        <QuickAction to="/app/journal" icon={BookOpen} label="Journal" />
      </section>

      {/* ===== WEEKLY GOAL + INSIGHTS (merged) ===== */}
      <section className="mt-4 mb-4 rounded-3xl glass p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Weekly Goal
            </p>
            <p className="mt-0.5 text-lg font-extrabold tracking-tight">
              <span
                className={
                  metrics.weekPnl >= 0 ? "text-profit" : "text-loss"
                }
              >
                {formatCurrency(metrics.weekPnl)}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {" "}
                / {formatCurrency(weeklyGoal)}
              </span>
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Days
            </p>
            <p className="text-lg font-extrabold">{metrics.weekDays}/7</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-input">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${weeklyProgress}%`,
              background: "var(--gradient-primary)",
              boxShadow: "var(--shadow-glow-primary)",
            }}
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {weeklyProgress.toFixed(0)}% to weekly target
        </p>

        {/* Insights merged */}
        <div className="mt-4 border-t border-border pt-4">
          <div className="mb-2.5 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Trading Insights
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.map((i, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                  i.tone === "good"
                    ? "border-profit/30 bg-profit/10 text-profit"
                    : "border-warning/30 bg-warning/10 text-warning"
                }`}
              >
                {i.tone === "good" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )}
                {i.text}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "bad" | "neutral";
}) {
  const color =
    tone === "good"
      ? "text-profit"
      : tone === "bad"
        ? "text-loss"
        : "text-foreground";
  return (
    <div className="min-w-0 rounded-2xl bg-input/50 p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-0.5 truncate text-sm font-extrabold ${color}`}>
        {value}
      </p>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
  primary,
}: {
  to: string;
  icon: typeof Plus;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      to={to as "/app/add"}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl p-3 text-[11px] font-bold transition active:scale-95 ${
        primary
          ? "text-primary-foreground shadow-[var(--shadow-glow-primary)]"
          : "glass text-foreground hover:bg-accent"
      }`}
      style={primary ? { background: "var(--gradient-primary)" } : undefined}
    >
      <Icon className="h-5 w-5" strokeWidth={2.5} />
      {label}
    </Link>
  );
}
