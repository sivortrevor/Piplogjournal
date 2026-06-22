import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Plus, ChevronRight, Inbox, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/trade-utils";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app/trades")({
  head: () => ({ meta: [{ title: "Trade History — PipLog" }] }),
  component: TradesListPage,
});

interface Trade {
  id: string;
  pair: string;
  side: string;
  pnl: number | null;
  pips: number | null;
  result: string | null;
  opened_at: string;
}

function TradesListPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "win" | "loss">("all");
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("trades")
        .select("id, pair, side, pnl, pips, result, opened_at")
        .order("opened_at", { ascending: false });
      setTrades((data as Trade[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const filtered = useMemo(() => {
    let list = [...trades];
    if (query) list = list.filter((t) => t.pair.toLowerCase().includes(query.toLowerCase()));
    if (filter !== "all") list = list.filter((t) => t.result === filter);
    list.sort((a, b) => {
      const da = new Date(a.opened_at).getTime();
      const db = new Date(b.opened_at).getTime();
      return sortDesc ? db - da : da - db;
    });
    return list;
  }, [trades, query, filter, sortDesc]);

  return (
    <div className="px-5 pt-8">
      <header className="flex items-center gap-3">
        <Link
          to="/app/calendar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-input text-muted-foreground transition hover:text-foreground"
          aria-label="Back to calendar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ letterSpacing: "-0.025em" }}>
            Trades
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">{filtered.length} of {trades.length}</p>
        </div>
        <Link
          to="/app/add"
          className="flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="h-4 w-4" /> New
        </Link>
      </header>

      <div className="mt-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by pair…"
            className="h-11 rounded-xl border-border bg-input pl-10"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {(["all", "win", "loss"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-surface text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
          <div className="ml-auto" />
          <button
            onClick={() => setSortDesc((s) => !s)}
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground"
          >
            <Filter className="h-3 w-3" /> {sortDesc ? "Newest" : "Oldest"}
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-2.5">
        {loading ? (
          <p className="py-12 text-center text-xs text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map((t) => <TradeCard key={t.id} trade={t} />)
        )}
      </div>
    </div>
  );
}

function TradeCard({ trade }: { trade: Trade }) {
  const isWin = trade.result === "win";
  const isLoss = trade.result === "loss";
  const isBuy = trade.side === "buy";
  const date = new Date(trade.opened_at);

  return (
    <Link
      to="/app/trades/$tradeId"
      params={{ tradeId: trade.id }}
      className="surface-card flex items-center gap-3 rounded-2xl p-3.5 transition active:scale-[0.99]"
    >
      <div
        className={`flex h-11 w-11 flex-col items-center justify-center rounded-xl text-[10px] font-bold ${
          isBuy
            ? "bg-profit/15 text-profit"
            : "bg-loss/15 text-loss"
        }`}
      >
        <span className="text-[9px] uppercase">{trade.side}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-bold">{trade.pair}</p>
          {trade.result && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                isWin
                  ? "bg-profit/15 text-profit"
                  : isLoss
                    ? "bg-loss/15 text-loss"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {trade.result}
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      <div className="text-right">
        <p
          className={`text-sm font-bold ${
            (trade.pnl ?? 0) > 0 ? "text-profit" : (trade.pnl ?? 0) < 0 ? "text-loss" : "text-muted-foreground"
          }`}
        >
          {trade.pnl !== null ? formatCurrency(Number(trade.pnl)) : "—"}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {trade.pips !== null ? `${Number(trade.pips) > 0 ? "+" : ""}${Number(trade.pips).toFixed(1)} pips` : "open"}
        </p>
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="surface-card mt-8 flex flex-col items-center rounded-2xl p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
        <Inbox className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-bold">No trades yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">Log your first trade to start building your edge.</p>
      <Link
        to="/app/add"
        className="mt-5 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]"
        style={{ background: "var(--gradient-primary)" }}
      >
        <Plus className="h-4 w-4" /> Add first trade
      </Link>
    </div>
  );
}
