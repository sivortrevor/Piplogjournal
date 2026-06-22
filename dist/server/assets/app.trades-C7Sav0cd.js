import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Plus, Search, Filter, Inbox, ChevronRight } from "lucide-react";
import { u as useAuth, s as supabase } from "./router-BjAoc50q.js";
import { f as formatCurrency } from "./trade-utils-DspPNmfQ.js";
import { I as Input } from "./input-C0QjszdI.js";
import "@supabase/supabase-js";
import "sonner";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function TradesListPage() {
  const {
    user
  } = useAuth();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortDesc, setSortDesc] = useState(true);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const {
        data
      } = await supabase.from("trades").select("id, pair, side, pnl, pips, result, opened_at").order("opened_at", {
        ascending: false
      });
      setTrades(data ?? []);
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
  return /* @__PURE__ */ jsxs("div", { className: "px-5 pt-8", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(Link, { to: "/app/calendar", className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-input text-muted-foreground transition hover:text-foreground", "aria-label": "Back to calendar", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-extrabold tracking-tight", style: {
          letterSpacing: "-0.025em"
        }, children: "Trades" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
          filtered.length,
          " of ",
          trades.length
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/app/add", className: "flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]", style: {
        background: "var(--gradient-primary)"
      }, children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " New"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsx(Input, { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search by pair…", className: "h-11 rounded-xl border-border bg-input pl-10" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 overflow-x-auto scrollbar-none", children: [
        ["all", "win", "loss"].map((f) => /* @__PURE__ */ jsx("button", { onClick: () => setFilter(f), className: `rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ${filter === f ? "bg-primary text-primary-foreground" : "border border-border bg-surface text-muted-foreground"}`, children: f }, f)),
        /* @__PURE__ */ jsx("div", { className: "ml-auto" }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setSortDesc((s) => !s), className: "flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Filter, { className: "h-3 w-3" }),
          " ",
          sortDesc ? "Newest" : "Oldest"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-5 space-y-2.5", children: loading ? /* @__PURE__ */ jsx("p", { className: "py-12 text-center text-xs text-muted-foreground", children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {}) : filtered.map((t) => /* @__PURE__ */ jsx(TradeCard, { trade: t }, t.id)) })
  ] });
}
function TradeCard({
  trade
}) {
  const isWin = trade.result === "win";
  const isLoss = trade.result === "loss";
  const isBuy = trade.side === "buy";
  const date = new Date(trade.opened_at);
  return /* @__PURE__ */ jsxs(Link, { to: "/app/trades/$tradeId", params: {
    tradeId: trade.id
  }, className: "surface-card flex items-center gap-3 rounded-2xl p-3.5 transition active:scale-[0.99]", children: [
    /* @__PURE__ */ jsx("div", { className: `flex h-11 w-11 flex-col items-center justify-center rounded-xl text-[10px] font-bold ${isBuy ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`, children: /* @__PURE__ */ jsx("span", { className: "text-[9px] uppercase", children: trade.side }) }),
    /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("p", { className: "truncate font-bold", children: trade.pair }),
        trade.result && /* @__PURE__ */ jsx("span", { className: `rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${isWin ? "bg-profit/15 text-profit" : isLoss ? "bg-loss/15 text-loss" : "bg-muted text-muted-foreground"}`, children: trade.result })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
        date.toLocaleDateString(),
        " · ",
        date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
      /* @__PURE__ */ jsx("p", { className: `text-sm font-bold ${(trade.pnl ?? 0) > 0 ? "text-profit" : (trade.pnl ?? 0) < 0 ? "text-loss" : "text-muted-foreground"}`, children: trade.pnl !== null ? formatCurrency(Number(trade.pnl)) : "—" }),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: trade.pips !== null ? `${Number(trade.pips) > 0 ? "+" : ""}${Number(trade.pips).toFixed(1)} pips` : "open" })
    ] }),
    /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground" })
  ] });
}
function EmptyState() {
  return /* @__PURE__ */ jsxs("div", { className: "surface-card mt-8 flex flex-col items-center rounded-2xl p-8 text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-accent", children: /* @__PURE__ */ jsx(Inbox, { className: "h-7 w-7 text-muted-foreground" }) }),
    /* @__PURE__ */ jsx("h3", { className: "mt-4 font-bold", children: "No trades yet" }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Log your first trade to start building your edge." }),
    /* @__PURE__ */ jsxs(Link, { to: "/app/add", className: "mt-5 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]", style: {
      background: "var(--gradient-primary)"
    }, children: [
      /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
      " Add first trade"
    ] })
  ] });
}
export {
  TradesListPage as component
};
