import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { u as useAuth, s as supabase } from "./router-BjAoc50q.js";
import { f as formatCurrency } from "./trade-utils-DspPNmfQ.js";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import "@supabase/supabase-js";
import "sonner";
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
function startOfMonth(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(0, 0, 0, 0);
  return x;
}
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function compactCurrency(n) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(abs >= 1e4 ? 0 : 1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}
function CalendarPage() {
  const {
    user
  } = useAuth();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(() => /* @__PURE__ */ new Date());
  useEffect(() => {
    if (!user) return;
    (async () => {
      const {
        data
      } = await supabase.from("trades").select("id, pair, pnl, result, opened_at").order("opened_at", {
        ascending: true
      });
      setTrades(data ?? []);
      setLoading(false);
    })();
  }, [user]);
  const dayMap = useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    trades.forEach((t) => {
      const d = new Date(t.opened_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const cur = m.get(key) ?? {
        pnl: 0,
        count: 0,
        wins: 0,
        losses: 0
      };
      cur.pnl += Number(t.pnl) || 0;
      cur.count += 1;
      if (t.result === "win") cur.wins += 1;
      if (t.result === "loss") cur.losses += 1;
      m.set(key, cur);
    });
    return m;
  }, [trades]);
  function dayInfo(d) {
    return dayMap.get(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`) ?? {
      pnl: 0,
      count: 0,
      wins: 0,
      losses: 0
    };
  }
  const monthGrid = useMemo(() => {
    const first = startOfMonth(cursor);
    const gridStart = startOfWeek(first);
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(d.getDate() + i);
      cells.push({
        date: d,
        inMonth: d.getMonth() === cursor.getMonth()
      });
    }
    return cells;
  }, [cursor]);
  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({
      length: 7
    }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [cursor]);
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
    return {
      pnl,
      count,
      tradingDays,
      winDays
    };
  }, [view, monthGrid, weekDays, dayMap]);
  const headerLabel = useMemo(() => {
    if (view === "month") {
      return cursor.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
      });
    }
    const start = startOfWeek(cursor);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const sameMonth = start.getMonth() === end.getMonth();
    const startFmt = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
    const endFmt = end.toLocaleDateString("en-US", {
      month: sameMonth ? void 0 : "short",
      day: "numeric",
      year: "numeric"
    });
    return `${startFmt} – ${endFmt}`;
  }, [view, cursor]);
  const shift = (delta) => {
    const d = new Date(cursor);
    if (view === "month") {
      d.setMonth(d.getMonth() + delta);
    } else {
      d.setDate(d.getDate() + delta * 7);
    }
    setCursor(d);
  };
  return /* @__PURE__ */ jsxs("div", { className: "px-4 pt-6 sm:px-6 lg:px-8 lg:pt-10", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground", children: "Trading calendar" }),
        /* @__PURE__ */ jsx("h1", { className: "mt-1 truncate text-2xl font-extrabold tracking-tight", children: headerLabel })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 rounded-xl bg-input p-1", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setView("month"), className: `rounded-lg px-3 py-1.5 text-xs font-semibold transition ${view === "month" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`, children: "Month" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setView("week"), className: `rounded-lg px-3 py-1.5 text-xs font-semibold transition ${view === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`, children: "Week" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4", children: [
      /* @__PURE__ */ jsx(StatPill, { label: "Net P/L", value: formatCurrency(rangeStats.pnl), tone: rangeStats.pnl >= 0 ? "profit" : "loss" }),
      /* @__PURE__ */ jsx(StatPill, { label: "Trading days", value: String(rangeStats.tradingDays) }),
      /* @__PURE__ */ jsx(StatPill, { label: "Win days", value: String(rangeStats.winDays), tone: "profit" }),
      /* @__PURE__ */ jsx(StatPill, { label: "Trades", value: String(rangeStats.count) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => shift(-1), className: "flex h-9 w-9 items-center justify-center rounded-xl bg-input text-muted-foreground transition hover:text-foreground", "aria-label": "Previous", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setCursor(/* @__PURE__ */ new Date()), className: "rounded-xl bg-input px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground", children: "Today" }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => shift(1), className: "flex h-9 w-9 items-center justify-center rounded-xl bg-input text-muted-foreground transition hover:text-foreground", "aria-label": "Next", children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 grid grid-cols-7 gap-1.5", children: DAY_LABELS.map((l) => /* @__PURE__ */ jsx("div", { className: "text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: l }, l)) }),
    view === "month" ? /* @__PURE__ */ jsx("div", { className: "mt-2 grid grid-cols-7 gap-1.5", children: monthGrid.map((cell, idx) => {
      const info = dayInfo(cell.date);
      const isToday = sameDay(cell.date, /* @__PURE__ */ new Date());
      const isFuture = cell.date.getTime() > (/* @__PURE__ */ new Date()).setHours(23, 59, 59, 999);
      const tone = info.count === 0 ? "border-border bg-input/30" : info.pnl > 0 ? "border-profit/40 bg-profit/15" : info.pnl < 0 ? "border-loss/40 bg-loss/15" : "border-border bg-input/50";
      return /* @__PURE__ */ jsxs("div", { className: `relative aspect-square overflow-hidden rounded-xl border p-1.5 transition ${tone} ${!cell.inMonth ? "opacity-30" : ""} ${isFuture ? "opacity-50" : ""} ${isToday ? "ring-1 ring-primary/70" : ""}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold leading-none", children: cell.date.getDate() }),
          info.count > 0 && /* @__PURE__ */ jsx("span", { className: "text-[8px] font-semibold text-muted-foreground", children: info.count })
        ] }),
        info.count > 0 && /* @__PURE__ */ jsx("p", { className: `mt-1 truncate text-[10px] font-bold leading-tight ${info.pnl > 0 ? "text-profit" : info.pnl < 0 ? "text-loss" : "text-muted-foreground"}`, children: compactCurrency(info.pnl) })
      ] }, idx);
    }) }) : /* @__PURE__ */ jsx("div", { className: "mt-2 grid grid-cols-7 gap-1.5", children: weekDays.map((d) => {
      const info = dayInfo(d);
      const isToday = sameDay(d, /* @__PURE__ */ new Date());
      const isFuture = d.getTime() > (/* @__PURE__ */ new Date()).setHours(23, 59, 59, 999);
      const tone = info.count === 0 ? "border-border bg-input/30" : info.pnl > 0 ? "border-profit/40 bg-profit/15" : info.pnl < 0 ? "border-loss/40 bg-loss/15" : "border-border bg-input/50";
      return /* @__PURE__ */ jsxs("div", { className: `relative min-h-[88px] overflow-hidden rounded-xl border p-2 transition ${tone} ${isFuture ? "opacity-50" : ""} ${isToday ? "ring-1 ring-primary/70" : ""}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between gap-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-extrabold leading-none", children: d.getDate() }),
          info.count > 0 && /* @__PURE__ */ jsxs("span", { className: "text-[9px] font-semibold text-muted-foreground", children: [
            info.count,
            "t"
          ] })
        ] }),
        info.count > 0 && /* @__PURE__ */ jsx("p", { className: `mt-2 truncate text-xs font-bold leading-tight ${info.pnl > 0 ? "text-profit" : info.pnl < 0 ? "text-loss" : "text-muted-foreground"}`, children: compactCurrency(info.pnl) })
      ] }, d.toISOString());
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-sm border border-profit/40 bg-profit/30" }),
        "Profit"
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-sm border border-loss/40 bg-loss/30" }),
        "Loss"
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2.5 w-2.5 rounded-sm border border-border bg-input/50" }),
        "No trades"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 mb-4", children: /* @__PURE__ */ jsxs(Link, { to: "/app/trades", className: "surface-card flex items-center justify-between rounded-2xl p-4 transition hover:border-primary/40", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-accent", children: /* @__PURE__ */ jsx(CalendarDays, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "View trade history" }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: "Drill into individual trades" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-primary", children: "→" })
    ] }) }),
    loading && trades.length === 0 && /* @__PURE__ */ jsx("p", { className: "mt-4 text-center text-xs text-muted-foreground", children: "Loading…" })
  ] });
}
function StatPill({
  label,
  value,
  tone
}) {
  const color = tone === "profit" ? "text-profit" : tone === "loss" ? "text-loss" : "text-foreground";
  return /* @__PURE__ */ jsxs("div", { className: "surface-card rounded-2xl p-3", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("p", { className: `mt-1 truncate text-lg font-extrabold tracking-tight ${color}`, children: value })
  ] });
}
export {
  CalendarPage as component
};
