import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/trade-utils";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/app/calendar")({
  head: () => ({ meta: [{ title: "Calendar — PipLog" }] }),
  component: CalendarPage,
});

interface TradeRow {
  id: string;
  pair: string;
  pnl: number | null;
  result: string | null;
  opened_at: string;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfMonth(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function compactCurrency(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

function CalendarPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState<Date>(() => new Date());

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("trades")
        .select("id, pair, pnl, result, opened_at")
        .order("opened_at", { ascending: true });
      setTrades((data as TradeRow[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  // Aggregate trades by day key (YYYY-MM-DD)
  const dayMap = useMemo(() => {
    const m = new Map<string, { pnl: number; count: number; wins: number; losses: number }>();
    trades.forEach((t) => {
      const d = new Date(t.opened_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const cur = m.get(key) ?? { pnl: 0, count: 0, wins: 0, losses: 0 };
      cur.pnl += Number(t.pnl) || 0;
      cur.count += 1;
      if (t.result === "win") cur.wins += 1;
      if (t.result === "loss") cur.losses += 1;
      m.set(key, cur);
    });
    return m;
  }, [trades]);

  function dayInfo(d: Date) {
    return dayMap.get(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`) ?? {
      pnl: 0,
      count: 0,
      wins: 0,
      losses: 0,
    };
  }

  // Build month grid (always 6 rows × 7 cols, Mon-start)
  const monthGrid = useMemo(() => {
    const first = startOfMonth(cursor);
    const gridStart = startOfWeek(first);
    const cells: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(d.getDate() + i);
      cells.push({ date: d, inMonth: d.getMonth() === cursor.getMonth() });
    }
    return cells;
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [cursor]);

  // Stats for current view's range
  const rangeStats = useMemo(() => {
    const dates = view === "month" ? monthGrid.filter((c) => c.inMonth).map((c) => c.date) : weekDays;
    let pnl = 0;
    let count = 0;
    let tradingDays = 0;
    let winDays = 0;
    dates.forEach((d) => {
      const info = dayInfo(d);
      if (info.count > 0) {
        tradingDays += 1;
        pnl += info.pnl;
        count += info.count;
        if (info.pnl > 0) winDays += 1;
      }
    });
    return { pnl, count, tradingDays, winDays };
  }, [view, monthGrid, weekDays, dayMap]);

  const headerLabel = useMemo(() => {
    if (view === "month") {
      return cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    const start = startOfWeek(cursor);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const sameMonth = start.getMonth() === end.getMonth();
    const startFmt = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endFmt = end.toLocaleDateString("en-US", {
      month: sameMonth ? undefined : "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startFmt} – ${endFmt}`;
  }, [view, cursor]);

  const shift = (delta: number) => {
    const d = new Date(cursor);
    if (view === "month") {
      d.setMonth(d.getMonth() + delta);
    } else {
      d.setDate(d.getDate() + delta * 7);
    }
    setCursor(d);
  };

  return (
    <div className="px-4 pt-6 sm:px-6 lg:px-8 lg:pt-10">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Trading calendar
          </p>
          <h1 className="mt-1 truncate text-2xl font-extrabold tracking-tight">
            {headerLabel}
          </h1>
        </div>
        <div className="flex shrink-0 rounded-xl bg-input p-1">
          <button
            type="button"
            onClick={() => setView("month")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              view === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setView("week")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              view === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Week
          </button>
        </div>
      </header>

      {/* Range stats */}
      <section className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatPill
          label="Net P/L"
          value={formatCurrency(rangeStats.pnl)}
          tone={rangeStats.pnl >= 0 ? "profit" : "loss"}
        />
        <StatPill label="Trading days" value={String(rangeStats.tradingDays)} />
        <StatPill label="Win days" value={String(rangeStats.winDays)} tone="profit" />
        <StatPill label="Trades" value={String(rangeStats.count)} />
      </section>

      {/* Nav */}
      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-input text-muted-foreground transition hover:text-foreground"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setCursor(new Date())}
          className="rounded-xl bg-input px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => shift(1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-input text-muted-foreground transition hover:text-foreground"
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day labels */}
      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {DAY_LABELS.map((l) => (
          <div
            key={l}
            className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {l}
          </div>
        ))}
      </div>

      {/* Grid */}
      {view === "month" ? (
        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {monthGrid.map((cell, idx) => {
            const info = dayInfo(cell.date);
            const isToday = sameDay(cell.date, new Date());
            const isFuture = cell.date.getTime() > new Date().setHours(23, 59, 59, 999);
            const tone =
              info.count === 0
                ? "border-border bg-input/30"
                : info.pnl > 0
                  ? "border-profit/40 bg-profit/15"
                  : info.pnl < 0
                    ? "border-loss/40 bg-loss/15"
                    : "border-border bg-input/50";
            return (
              <div
                key={idx}
                className={`relative aspect-square overflow-hidden rounded-xl border p-1.5 transition ${tone} ${
                  !cell.inMonth ? "opacity-30" : ""
                } ${isFuture ? "opacity-50" : ""} ${
                  isToday ? "ring-1 ring-primary/70" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[11px] font-bold leading-none">
                    {cell.date.getDate()}
                  </span>
                  {info.count > 0 && (
                    <span className="text-[8px] font-semibold text-muted-foreground">
                      {info.count}
                    </span>
                  )}
                </div>
                {info.count > 0 && (
                  <p
                    className={`mt-1 truncate text-[10px] font-bold leading-tight ${
                      info.pnl > 0
                        ? "text-profit"
                        : info.pnl < 0
                          ? "text-loss"
                          : "text-muted-foreground"
                    }`}
                  >
                    {compactCurrency(info.pnl)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {weekDays.map((d) => {
            const info = dayInfo(d);
            const isToday = sameDay(d, new Date());
            const isFuture = d.getTime() > new Date().setHours(23, 59, 59, 999);
            const tone =
              info.count === 0
                ? "border-border bg-input/30"
                : info.pnl > 0
                  ? "border-profit/40 bg-profit/15"
                  : info.pnl < 0
                    ? "border-loss/40 bg-loss/15"
                    : "border-border bg-input/50";
            return (
              <div
                key={d.toISOString()}
                className={`relative min-h-[88px] overflow-hidden rounded-xl border p-2 transition ${tone} ${
                  isFuture ? "opacity-50" : ""
                } ${isToday ? "ring-1 ring-primary/70" : ""}`}
              >
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-sm font-extrabold leading-none">
                    {d.getDate()}
                  </span>
                  {info.count > 0 && (
                    <span className="text-[9px] font-semibold text-muted-foreground">
                      {info.count}t
                    </span>
                  )}
                </div>
                {info.count > 0 && (
                  <p
                    className={`mt-2 truncate text-xs font-bold leading-tight ${
                      info.pnl > 0
                        ? "text-profit"
                        : info.pnl < 0
                          ? "text-loss"
                          : "text-muted-foreground"
                    }`}
                  >
                    {compactCurrency(info.pnl)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-profit/40 bg-profit/30" />
          Profit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-loss/40 bg-loss/30" />
          Loss
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-border bg-input/50" />
          No trades
        </span>
      </div>

      <div className="mt-6 mb-4">
        <Link
          to="/app/trades"
          className="surface-card flex items-center justify-between rounded-2xl p-4 transition hover:border-primary/40"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">View trade history</p>
              <p className="text-[11px] text-muted-foreground">
                Drill into individual trades
              </p>
            </div>
          </div>
          <span className="text-primary">→</span>
        </Link>
      </div>

      {loading && trades.length === 0 && (
        <p className="mt-4 text-center text-xs text-muted-foreground">Loading…</p>
      )}
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
  tone?: "profit" | "loss";
}) {
  const color = tone === "profit" ? "text-profit" : tone === "loss" ? "text-loss" : "text-foreground";
  return (
    <div className="surface-card rounded-2xl p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 truncate text-lg font-extrabold tracking-tight ${color}`}>
        {value}
      </p>
    </div>
  );
}
